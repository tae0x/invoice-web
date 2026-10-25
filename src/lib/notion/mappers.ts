import "server-only";

import type { PageObjectResponse } from "@notionhq/client";

import { TIME_ZONE, isInvoiceStatus } from "@/lib/constants";
import type {
  Invoice,
  InvoiceItem,
  InvoiceListItem,
  InvoiceStatus,
} from "@/types/invoices";
import type { NotionPageProperty, NotionPropertyOf } from "@/types/notion";

import {
  NOTION_INVOICE_PROPERTIES,
  NOTION_ITEM_PROPERTIES,
} from "./properties";

// 노션 속성 → 도메인 값 변환 (서버 전용)
// 필수 속성이 없거나 타입이 다르면 오류 대신 빈 값으로 둔다 (Task 008 규칙)

type NotionProperties = PageObjectResponse["properties"];
type NotionPropertyType = NotionPageProperty["type"];

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

// 시간이 있는 날짜를 서울 달력 날짜(`YYYY-MM-DD`)로 바꾼다
const seoulDateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

// 노션 ID를 하이픈 없는 소문자로 맞춘다 (도메인 ID 형식)
export function normalizeNotionId(id: string): string {
  return id.replaceAll("-", "").toLowerCase();
}

function isPropertyOfType<T extends NotionPropertyType>(
  property: NotionPageProperty | undefined,
  type: T,
): property is NotionPropertyOf<T> {
  return property?.type === type;
}

// 이름으로 속성을 찾고 기대한 타입일 때만 돌려준다 (단언 없이 런타임에 좁힘)
function getProperty<T extends NotionPropertyType>(
  properties: NotionProperties,
  name: string,
  type: T,
): NotionPropertyOf<T> | null {
  const property = properties[name];
  return isPropertyOfType(property, type) ? property : null;
}

function joinPlainText(parts: ReadonlyArray<{ plain_text: string }>): string {
  return parts.map((part) => part.plain_text).join("");
}

function toFiniteNumber(value: number | null): number | null {
  return value !== null && Number.isFinite(value) ? value : null;
}

// 날짜 문자열 → `YYYY-MM-DD` (시간 없는 값은 그대로, 시간 있는 값은 서울 기준 날짜, `end`는 무시)
export function toSeoulDate(start: string): string | null {
  if (DATE_ONLY_PATTERN.test(start)) return start;

  const date = new Date(start);
  if (Number.isNaN(date.getTime())) return null;

  const parts = seoulDateFormatter.formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;
  return year && month && day ? `${year}-${month}-${day}` : null;
}

export function readTitle(properties: NotionProperties, name: string): string {
  const property = getProperty(properties, name, "title");
  return property ? joinPlainText(property.title) : "";
}

export function readRichText(
  properties: NotionProperties,
  name: string,
): string {
  const property = getProperty(properties, name, "rich_text");
  return property ? joinPlainText(property.rich_text) : "";
}

export function readDate(
  properties: NotionProperties,
  name: string,
): string | null {
  const property = getProperty(properties, name, "date");
  const start = property?.date?.start;
  return start ? toSeoulDate(start) : null;
}

// 상태: 알려진 옵션만 사용하고 빈 값·알 수 없는 값은 null (D4)
// 실제 DB는 노션 Status 타입이다. 속성을 Select로 바꿔도 동작하도록 두 타입을 모두 읽는다
export function readStatus(
  properties: NotionProperties,
  name: string,
): InvoiceStatus | null {
  const value =
    getProperty(properties, name, "status")?.status?.name ??
    getProperty(properties, name, "select")?.select?.name;
  return isInvoiceStatus(value) ? value : null;
}

export function readNumber(
  properties: NotionProperties,
  name: string,
): number | null {
  const property = getProperty(properties, name, "number");
  return property ? toFiniteNumber(property.number) : null;
}

// 수식 결과가 number일 때만 값을 쓴다
export function readFormulaNumber(
  properties: NotionProperties,
  name: string,
): number | null {
  const formula = getProperty(properties, name, "formula")?.formula;
  return formula?.type === "number" ? toFiniteNumber(formula.number) : null;
}

// relation 값과 잘림 여부 (페이지 응답은 최대 25개만 담고 `has_more`로 알린다)
// `has_more`는 SDK 타입에 없어 런타임에 확인한다. propertyId는 잘린 값을 이어 받을 때 쓴다
export function readRelation(
  properties: NotionProperties,
  name: string,
): { propertyId: string | null; ids: string[]; hasMore: boolean } {
  const property = getProperty(properties, name, "relation");
  if (!property) return { propertyId: null, ids: [], hasMore: false };

  const hasMore = "has_more" in property && property.has_more === true;
  return {
    propertyId: property.id,
    ids: property.relation.map((item) => normalizeNotionId(item.id)),
    hasMore,
  };
}

// Items 페이지 → 견적 항목
export function mapInvoiceItem(page: PageObjectResponse): InvoiceItem {
  const { properties } = page;
  return {
    id: normalizeNotionId(page.id),
    description: readTitle(properties, NOTION_ITEM_PROPERTIES.description),
    quantity: readNumber(properties, NOTION_ITEM_PROPERTIES.quantity),
    unitPrice: readNumber(properties, NOTION_ITEM_PROPERTIES.unitPrice),
    amount: readFormulaNumber(properties, NOTION_ITEM_PROPERTIES.amount),
  };
}

// Invoices 페이지 → 목록 행 (`항목` relation은 읽지 않는다, D16)
// 총 금액은 노션 `총 금액` 값을 그대로 쓴다 (D6)
export function mapInvoiceListItem(page: PageObjectResponse): InvoiceListItem {
  const { properties } = page;
  return {
    id: normalizeNotionId(page.id),
    invoiceNumber: readTitle(
      properties,
      NOTION_INVOICE_PROPERTIES.invoiceNumber,
    ),
    clientName: readRichText(properties, NOTION_INVOICE_PROPERTIES.clientName),
    issueDate: readDate(properties, NOTION_INVOICE_PROPERTIES.issueDate),
    validUntil: readDate(properties, NOTION_INVOICE_PROPERTIES.validUntil),
    status: readStatus(properties, NOTION_INVOICE_PROPERTIES.status),
    totalAmount: readNumber(properties, NOTION_INVOICE_PROPERTIES.totalAmount),
  };
}

// Invoices 페이지 + 항목 → 견적서 (목록 행 매핑에 항목만 더한다)
export function mapInvoice(
  page: PageObjectResponse,
  items: InvoiceItem[],
): Invoice {
  return { ...mapInvoiceListItem(page), items };
}
