import type { PageObjectResponse } from "@notionhq/client";

import type {
  NOTION_INVOICE_PROPERTIES,
  NOTION_ITEM_PROPERTIES,
} from "@/lib/notion/properties";

// 노션 페이지 속성 값 (SDK `PageObjectResponse`의 속성 union)
export type NotionPageProperty = PageObjectResponse["properties"][string];

// 속성 타입명으로 SDK 속성 값 타입을 고른다 (예: NotionPropertyOf<"title">)
export type NotionPropertyOf<T extends NotionPageProperty["type"]> = Extract<
  NotionPageProperty,
  { type: T }
>;

export type NotionTitleProperty = NotionPropertyOf<"title">;
export type NotionRichTextProperty = NotionPropertyOf<"rich_text">;
export type NotionDateProperty = NotionPropertyOf<"date">;
export type NotionSelectProperty = NotionPropertyOf<"select">;
export type NotionNumberProperty = NotionPropertyOf<"number">;
export type NotionRelationProperty = NotionPropertyOf<"relation">;
export type NotionFormulaProperty = NotionPropertyOf<"formula">;

// 도메인 필드 → 노션 속성명 매핑을 노션 속성명 → 속성 값 타입으로 바꾼다
// 속성명은 `src/lib/notion/properties.ts`에서만 가져오므로 이름을 바꿔도 이 파일은 고치지 않는다 (D3)
type PropertiesByNotionName<
  Names extends Record<string, string>,
  Types extends Record<keyof Names, NotionPageProperty>,
> = { [K in keyof Names as Names[K]]: Types[K] };

// Invoices DB 페이지 속성
export type InvoicePageProperties = PropertiesByNotionName<
  typeof NOTION_INVOICE_PROPERTIES,
  {
    invoiceNumber: NotionTitleProperty;
    clientName: NotionRichTextProperty;
    issueDate: NotionDateProperty;
    validUntil: NotionDateProperty;
    status: NotionSelectProperty;
    totalAmount: NotionNumberProperty;
    items: NotionRelationProperty;
  }
>;

// Items DB 페이지 속성 (역방향 Relation `Invoices`는 읽지 않아 제외)
export type ItemPageProperties = PropertiesByNotionName<
  typeof NOTION_ITEM_PROPERTIES,
  {
    description: NotionTitleProperty;
    quantity: NotionNumberProperty;
    unitPrice: NotionNumberProperty;
    amount: NotionFormulaProperty;
  }
>;

// TODO(Task 008): SDK 응답의 `properties`는 Record<string, 속성 union>이므로
// 위 타입으로 단언하지 말고 매퍼에서 속성 존재와 `type`을 런타임에 확인해 좁힌다
