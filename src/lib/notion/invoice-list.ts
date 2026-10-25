import "server-only";

import { cache } from "react";
import {
  isFullDatabase,
  isFullPage,
  type Client,
  type PageObjectResponse,
} from "@notionhq/client";

import type { InvoiceListResult } from "@/types/invoices";

import { getNotionClient } from "./client";
import { getNotionEnv } from "./env";
import { NotionRequestError, toRequestError } from "./errors";
import { mapInvoiceListItem } from "./mappers";
import { NOTION_INVOICE_PROPERTIES } from "./properties";

// 관리자 견적서 목록 조회 (서버 전용, D16·D17)
// 이 모듈은 인증 검사를 하지 않는다. 호출부는 Task 108의 인증된 진입점(getAdminInvoiceList) 하나뿐이어야 하며,
// 페이지·Route Handler·Server Action에서 listInvoices를 직접 부르지 않는다

// 노션 목록 API의 최대 page_size
const NOTION_PAGE_SIZE = 100;

// 목록 행 상한 (D16). 이 수에 도달하면 더 조회하지 않고 truncated: true로 알린다
export const INVOICE_LIST_MAX_ROWS = 500;

// 목록에 필요한 속성만 응답에 담는다 (`항목` relation은 제외, D16)
// filter_properties는 속성 이름을 받으므로 매핑 상수를 그대로 쓴다 (D3)
const LIST_PROPERTY_NAMES: string[] = [
  NOTION_INVOICE_PROPERTIES.invoiceNumber,
  NOTION_INVOICE_PROPERTIES.clientName,
  NOTION_INVOICE_PROPERTIES.issueDate,
  NOTION_INVOICE_PROPERTIES.validUntil,
  NOTION_INVOICE_PROPERTIES.status,
  NOTION_INVOICE_PROPERTIES.totalAmount,
];

// 정렬: 발행일 내림차순 → 같은 날(또는 발행일 없음)이면 생성 시각 내림차순
const LIST_SORTS = [
  { property: NOTION_INVOICE_PROPERTIES.issueDate, direction: "descending" },
  { timestamp: "created_time", direction: "descending" },
] as const;

// 데이터베이스 ID → Invoices 데이터 소스 ID
// 스키마 정보라 요청 사이에 재사용한다 (목록 데이터는 캐시하지 않는다, D17)
// 노션에서 데이터 소스를 추가·교체하면 서버를 재시작해야 반영된다
const invoicesDataSourceIds = new Map<string, string>();

// NOTION_DATABASE_ID(데이터베이스 ID)의 데이터 소스 ID를 얻는다
// 데이터 소스가 정확히 1개가 아니면 어느 것을 목록으로 볼지 정할 수 없으므로 오류로 처리한다
async function getInvoicesDataSourceId(): Promise<string> {
  const { databaseId } = getNotionEnv();
  const cached = invoicesDataSourceIds.get(databaseId);
  if (cached) return cached;

  const notion = getNotionClient();
  const database = await notion.databases.retrieve({
    database_id: databaseId,
  });
  if (!isFullDatabase(database)) {
    throw new NotionRequestError("partial_database_response", null);
  }
  if (database.data_sources.length !== 1) {
    throw new NotionRequestError("unexpected_data_source_count", null);
  }

  const dataSourceId = database.data_sources[0].id;
  invoicesDataSourceIds.set(databaseId, dataSourceId);
  return dataSourceId;
}

// 보관·휴지통 페이지인지 (`archived`는 이전 API 버전 호환 필드)
// 쿼리 기본값이 이미 제외하지만, 단건 조회(getInvoice)와 기준을 맞추려고 한 번 더 거른다
function isRemovedPage(page: PageObjectResponse): boolean {
  return page.in_trash || page.archived || page.is_archived;
}

// 데이터 소스를 100건씩 이어 조회한다. 상한에 도달하면 멈추고 잘림 여부를 돌려준다
async function queryInvoicePages(
  notion: Client,
  dataSourceId: string,
): Promise<{ pages: PageObjectResponse[]; truncated: boolean }> {
  const pages: PageObjectResponse[] = [];
  let cursor: string | undefined;

  do {
    const response = await notion.dataSources.query({
      data_source_id: dataSourceId,
      filter_properties: LIST_PROPERTY_NAMES,
      sorts: [...LIST_SORTS],
      start_cursor: cursor,
      // 남은 상한만큼만 요청한다 (상한이 100의 배수가 아니어도 넘치지 않게)
      page_size: Math.min(
        NOTION_PAGE_SIZE,
        INVOICE_LIST_MAX_ROWS - pages.length,
      ),
    });
    // 노션이 결과 상한으로 일부만 돌려주면 목록이 조용히 빠지지 않도록 실패로 처리한다
    if (response.request_status?.type === "incomplete") {
      throw new NotionRequestError("incomplete_query_result", null);
    }
    for (const result of response.results) {
      if (isFullPage(result) && !isRemovedPage(result)) pages.push(result);
    }
    cursor = response.has_more
      ? (response.next_cursor ?? undefined)
      : undefined;

    if (pages.length >= INVOICE_LIST_MAX_ROWS) {
      // 상한에 딱 맞게 끝났다면(다음 페이지 없음) 잘린 것이 아니다
      return {
        pages: pages.slice(0, INVOICE_LIST_MAX_ROWS),
        truncated: cursor !== undefined,
      };
    }
  } while (cursor);

  return { pages, truncated: false };
}

// 견적서 목록 조회 (서버 전용, 인증 검사 없음 — 위 모듈 주석 참고)
// - 정렬: 발행일 내림차순 → 생성 시각 내림차순. 보관·휴지통 제외
// - 최대 INVOICE_LIST_MAX_ROWS건. 넘으면 truncated: true
// - 0건이면 빈 배열
// - throw: 인증 오류, 잘못된 DB ID, 데이터 소스 수 이상, 결과 불완전, 타임아웃·네트워크 → 코드·상태만 담은 NotionRequestError
// - React.cache로 같은 요청 안의 중복 호출만 합친다 (요청 간 캐시 없음, D17)
export const listInvoices = cache(async (): Promise<InvoiceListResult> => {
  try {
    const notion = getNotionClient();
    const dataSourceId = await getInvoicesDataSourceId();
    const { pages, truncated } = await queryInvoicePages(notion, dataSourceId);
    return { invoices: pages.map(mapInvoiceListItem), truncated };
  } catch (error) {
    throw toRequestError(error, "notion.invoice_list_failed");
  }
});
