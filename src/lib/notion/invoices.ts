import "server-only";

import { cacheLife } from "next/cache";
import { cache } from "react";
import {
  APIErrorCode,
  isFullDataSource,
  isFullPage,
  isNotionClientError,
  type Client,
  type PageObjectResponse,
} from "@notionhq/client";

import { notionPageIdSchema } from "@/lib/invoice-schema";
import { logger } from "@/lib/logger";
import type { Invoice } from "@/types/invoices";

import { getNotionClient } from "./client";
import { getNotionEnv } from "./env";
import {
  mapInvoice,
  mapInvoiceItem,
  normalizeNotionId,
  readRelation,
} from "./mappers";
import {
  NOTION_INVOICE_PROPERTIES,
  NOTION_ITEM_PROPERTIES,
} from "./properties";

// 노션 목록 API의 최대 page_size
const NOTION_PAGE_SIZE = 100;

// 화면·PDF API에 넘기는 오류. 노션 오류 메시지·응답 본문은 담지 않고 코드와 HTTP 상태만 남긴다
class NotionRequestError extends Error {
  constructor(
    readonly code: string,
    readonly status: number | null,
  ) {
    super(
      `노션 견적서 조회에 실패했습니다 (code=${code}, status=${status ?? "-"})`,
    );
    this.name = "NotionRequestError";
  }
}

// Invoices 데이터 소스 ID → Items 데이터 소스 ID
// 스키마 정보라 요청 사이에 재사용한다 (견적서 데이터 캐시는 getCachedInvoice가 따로 맡는다, D8)
// `항목` relation의 대상 DB를 바꾸면 서버를 재시작해야 반영된다
const itemsDataSourceIds = new Map<string, string>();

// 노션 SDK 오류와 내부 응답 검사 오류를 코드·상태만 담은 오류로 맞추고 서버 로그에 남긴다
function toRequestError(error: unknown): unknown {
  const requestError =
    error instanceof NotionRequestError
      ? error
      : isNotionClientError(error)
        ? new NotionRequestError(
            error.code,
            "status" in error ? error.status : null,
          )
        : null;
  // 환경 변수 오류 등 그 밖의 오류는 그대로 넘긴다 (메시지에 값이 없음)
  if (!requestError) return error;

  logger.error("notion.invoice_fetch_failed", {
    code: requestError.code,
    status: requestError.status ?? undefined,
  });
  return requestError;
}

// 견적서 페이지 조회. 없는 페이지면 null (형식은 맞지만 페이지가 아닌 ID도 포함)
async function retrieveInvoicePage(
  notion: Client,
  invoiceId: string,
): Promise<PageObjectResponse | null> {
  try {
    const page = await notion.pages.retrieve({ page_id: invoiceId });
    if (!isFullPage(page)) {
      throw new NotionRequestError("partial_page_response", null);
    }
    return page;
  } catch (error) {
    if (
      isNotionClientError(error) &&
      (error.code === APIErrorCode.ObjectNotFound ||
        error.code === APIErrorCode.ValidationError)
    ) {
      return null;
    }
    throw error;
  }
}

// relation이 25개를 넘어 잘렸을 때 속성 항목 API로 전체 ID를 순서대로 받는다
async function retrieveAllRelationIds(
  notion: Client,
  pageId: string,
  propertyId: string,
): Promise<string[]> {
  const ids: string[] = [];
  let cursor: string | undefined;

  do {
    const response = await notion.pages.properties.retrieve({
      page_id: pageId,
      property_id: propertyId,
      start_cursor: cursor,
      page_size: NOTION_PAGE_SIZE,
    });
    if (response.object !== "list") {
      throw new NotionRequestError("unexpected_property_response", null);
    }
    for (const item of response.results) {
      if (item.type === "relation")
        ids.push(normalizeNotionId(item.relation.id));
    }
    cursor = response.has_more
      ? (response.next_cursor ?? undefined)
      : undefined;
  } while (cursor);

  return ids;
}

// Invoices 데이터 소스 스키마의 `항목` relation 설정에서 Items 데이터 소스 ID를 읽는다
// (D9: Items ID 환경 변수를 두지 않는다)
async function getItemsDataSourceId(
  notion: Client,
  invoicesDataSourceId: string,
): Promise<string> {
  const cached = itemsDataSourceIds.get(invoicesDataSourceId);
  if (cached) return cached;

  const dataSource = await notion.dataSources.retrieve({
    data_source_id: invoicesDataSourceId,
  });
  if (!isFullDataSource(dataSource)) {
    throw new NotionRequestError("partial_data_source_response", null);
  }

  const relation = dataSource.properties[NOTION_INVOICE_PROPERTIES.items];
  if (relation?.type !== "relation") {
    throw new NotionRequestError("items_relation_not_found", null);
  }

  const itemsDataSourceId = relation.relation.data_source_id;
  itemsDataSourceIds.set(invoicesDataSourceId, itemsDataSourceId);
  return itemsDataSourceId;
}

// 견적서에 연결된 항목을 Items 데이터 소스에서 한 번에 조회한다 (역방향 relation 필터)
async function queryInvoiceItemPages(
  notion: Client,
  itemsDataSourceId: string,
  invoiceId: string,
): Promise<PageObjectResponse[]> {
  const pages: PageObjectResponse[] = [];
  let cursor: string | undefined;

  do {
    const response = await notion.dataSources.query({
      data_source_id: itemsDataSourceId,
      filter: {
        property: NOTION_ITEM_PROPERTIES.invoices,
        relation: { contains: invoiceId },
      },
      start_cursor: cursor,
      page_size: NOTION_PAGE_SIZE,
    });
    // 노션이 결과 상한으로 일부만 돌려주면 항목이 빠진 견적서를 보여 주지 않도록 실패로 처리한다
    if (response.request_status?.type === "incomplete") {
      throw new NotionRequestError("incomplete_query_result", null);
    }
    for (const result of response.results) {
      if (isFullPage(result)) pages.push(result);
    }
    cursor = response.has_more
      ? (response.next_cursor ?? undefined)
      : undefined;
  } while (cursor);

  return pages;
}

async function fetchInvoice(invoiceId: string): Promise<Invoice | null> {
  const notion = getNotionClient();
  const { databaseId } = getNotionEnv();

  const page = await retrieveInvoicePage(notion, invoiceId);
  if (!page) return null;

  // 보관·휴지통 페이지는 없는 견적서로 본다 (`archived`는 이전 API 버전 호환 필드)
  if (page.in_trash || page.archived || page.is_archived) return null;

  // D9: 부모 DB가 `NOTION_DATABASE_ID`와 같을 때만 표시한다
  const { parent } = page;
  if (parent.type !== "data_source_id") return null;
  if (normalizeNotionId(parent.database_id) !== databaseId) {
    // 환경 변수에 DB ID 대신 데이터 소스 ID를 넣으면 모든 견적서가 404가 되므로 원인을 로그로 알린다 (ID 값은 남기지 않음)
    if (normalizeNotionId(parent.data_source_id) === databaseId) {
      logger.warn("notion.database_id_looks_like_data_source_id", {
        hint: "NOTION_DATABASE_ID에 데이터 소스 ID가 설정된 것 같습니다. 데이터베이스 ID로 바꿔 주세요",
      });
    }
    return null;
  }

  // relation 순서가 화면의 항목 순서다. 25개를 넘으면 잘려 오므로 이어 받는다
  const relation = readRelation(
    page.properties,
    NOTION_INVOICE_PROPERTIES.items,
  );
  const itemIds =
    relation.hasMore && relation.propertyId
      ? await retrieveAllRelationIds(notion, page.id, relation.propertyId)
      : relation.ids;

  if (itemIds.length === 0) return mapInvoice(page, []);

  const itemsDataSourceId = await getItemsDataSourceId(
    notion,
    parent.data_source_id,
  );
  const itemPages = await queryInvoiceItemPages(
    notion,
    itemsDataSourceId,
    invoiceId,
  );

  // 쿼리 결과를 relation 순서로 다시 정렬한다 (휴지통 등으로 조회되지 않은 항목은 빠진다)
  const itemsById = new Map(
    itemPages.map((itemPage) => [normalizeNotionId(itemPage.id), itemPage]),
  );
  const items = itemIds.flatMap((id) => {
    const itemPage = itemsById.get(id);
    return itemPage ? [mapInvoiceItem(itemPage)] : [];
  });

  return mapInvoice(page, items);
}

// 견적서 1건 조회 (서버 전용)
// - null: 잘못된 ID 형식, 없는 페이지, 다른 DB의 페이지, 보관·휴지통 페이지 → 호출부에서 notFound()
// - throw: 인증 오류, 요청 제한(재시도 소진), 타임아웃·네트워크, 항목 조회 실패 → 에러 바운더리
// - React.cache로 같은 요청 안의 중복 호출만 합친다 (요청 간 캐시 없음, D8)
export const getInvoice = cache(
  async (pageId: string): Promise<Invoice | null> => {
    const parsed = notionPageIdSchema.safeParse(pageId);
    if (!parsed.success) return null;

    try {
      return await fetchInvoice(parsed.data);
    } catch (error) {
      throw toRequestError(error);
    }
  },
);

// 화면용 캐시 수명 (D8). 노션 수정이 최대 60초 늦게 반영된다
// - revalidate 60: 60초 동안은 캐시를 그대로 쓰고 노션을 부르지 않는다
// - expire 61: revalidate보다 길어야 하는 규칙을 지키는 최소값. 이 값이 없으면(기본 never)
//   60초가 지난 뒤 첫 요청이 오래된 값을 그대로 받는다. 61초부터는 새로 조회해 기다린다
// - stale 30: 브라우저 라우터 캐시를 30초(Next.js 최소값)로 줄인다. 기본 5분이면 클라이언트 이동에서 더 오래 묵는다
const INVOICE_CACHE_LIFE = { stale: 30, revalidate: 60, expire: 61 } as const;

// 캐시 키는 정규화된 ID 문자열 하나뿐이다. 반환값은 도메인 객체(Invoice) 또는 null이며 비밀 값은 없다
// throw한 호출은 캐시에 저장되지 않아 다음 요청이 다시 조회한다. null(없는 견적서)은 값이라 같은 60초 동안 저장된다
async function readInvoiceWithCache(
  invoiceId: string,
): Promise<Invoice | null> {
  "use cache";
  cacheLife(INVOICE_CACHE_LIFE);

  return getInvoice(invoiceId);
}

// 견적서 페이지·generateMetadata용 60초 캐시 조회 (서버 전용)
// - ID를 캐시 밖에서 정규화해 하이픈·대문자만 다른 URL이 같은 항목을 쓰게 한다
// - React.cache로 같은 요청 안의 중복 호출(페이지 본문 + 메타데이터)은 하나로 합친다
// - PDF API는 D2(최신 금액 보장)에 따라 이 함수가 아니라 getInvoice를 쓴다
export const getCachedInvoice = cache(
  async (pageId: string): Promise<Invoice | null> => {
    const parsed = notionPageIdSchema.safeParse(pageId);
    if (!parsed.success) return null;

    return readInvoiceWithCache(parsed.data);
  },
);
