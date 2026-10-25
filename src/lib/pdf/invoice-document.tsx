// A4 견적서 PDF 문서 (D1). 웹 화면과 별도의 PDF 전용 레이아웃이며 서버에서만 렌더링한다.
// Route Handler(Task 010)가 이 컴포넌트를 재사용한다.
import "server-only";

import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

import { siteConfig } from "@/config/site";
import { INVOICE_STATUS_LABELS } from "@/lib/constants";
import {
  formatCurrency,
  formatDate,
  formatNumber,
  formatText,
} from "@/lib/format";
import { PDF_FONT_FAMILY } from "@/lib/pdf/fonts";
import type { Invoice } from "@/types/invoices";

// PDF는 웹의 시맨틱 토큰(다크 모드)이 적용되지 않으므로 고정 색을 쓴다
const COLORS = {
  text: "#18181b",
  muted: "#71717a",
  border: "#e4e4e7",
  surface: "#f4f4f5",
};

const styles = StyleSheet.create({
  page: {
    fontFamily: PDF_FONT_FAMILY,
    fontSize: 10,
    color: COLORS.text,
    paddingTop: 48,
    paddingBottom: 56,
    paddingHorizontal: 40,
    // 주의: Page에 lineHeight를 주면 fixed + render 요소(페이지 번호)가 그려지지 않는다
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  headerMain: { flex: 1, minWidth: 0 },
  title: { fontSize: 24, fontWeight: "bold", lineHeight: 1.5 },
  invoiceNumber: { marginTop: 2, fontSize: 11, color: COLORS.muted },
  status: {
    marginLeft: 16,
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    fontSize: 10,
    fontWeight: "bold",
  },
  meta: {
    flexDirection: "row",
    marginTop: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  metaCell: { flex: 1, minWidth: 0, paddingRight: 8 },
  label: { fontSize: 9, color: COLORS.muted, marginBottom: 2 },
  value: { fontSize: 11, fontWeight: "bold" },
  valueSub: { fontSize: 10, color: COLORS.muted },
  section: { marginTop: 20 },
  clientName: { fontSize: 14, fontWeight: "bold" },
  tableHeader: {
    flexDirection: "row",
    paddingVertical: 6,
    paddingHorizontal: 6,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    fontSize: 9,
    fontWeight: "bold",
    color: COLORS.muted,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 7,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  colDescription: { flex: 1, minWidth: 0, paddingRight: 8 },
  colQuantity: { width: 48, textAlign: "right" },
  colUnitPrice: { width: 92, textAlign: "right" },
  colAmount: { width: 100, textAlign: "right" },
  emptyBox: {
    marginTop: 4,
    paddingVertical: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 4,
    textAlign: "center",
    color: COLORS.muted,
  },
  total: {
    marginTop: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    backgroundColor: COLORS.surface,
    borderRadius: 4,
  },
  totalLabel: { fontSize: 11, color: COLORS.muted },
  totalValue: { fontSize: 16, fontWeight: "bold" },
  pageNumber: {
    position: "absolute",
    bottom: 24,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 9,
    color: COLORS.muted,
  },
});

// 항목 표 머리글 행 (render prop 안에서도 쓰므로 컴포넌트가 아닌 함수로 호출한다)
function renderTableHeaderRow() {
  return (
    <View style={styles.tableHeader}>
      <Text style={styles.colDescription}>항목명</Text>
      <Text style={styles.colQuantity}>수량</Text>
      <Text style={styles.colUnitPrice}>단가</Text>
      <Text style={styles.colAmount}>금액</Text>
    </View>
  );
}

// 항목 표 행 (행이 두 페이지에 걸쳐 잘리지 않게 한다)
function renderItemRow(item: Invoice["items"][number]) {
  return (
    <View key={item.id} style={styles.tableRow} wrap={false}>
      <Text style={styles.colDescription}>{formatText(item.description)}</Text>
      <Text style={styles.colQuantity}>{formatNumber(item.quantity)}</Text>
      <Text style={styles.colUnitPrice}>{formatCurrency(item.unitPrice)}</Text>
      <Text style={styles.colAmount}>{formatCurrency(item.amount)}</Text>
    </View>
  );
}

// 견적서 PDF 문서: 헤더·발행자, 클라이언트, 항목 표, 총 금액, 페이지 번호
export function InvoiceDocument({ invoice }: { invoice: Invoice }) {
  const { issuer } = siteConfig;
  const lastItem = invoice.items.at(-1);

  return (
    <Document
      title={`견적서 ${invoice.invoiceNumber}`}
      author={issuer.name}
      language="ko"
    >
      <Page size="A4" style={styles.page}>
        {/* 페이지 번호: 모든 페이지 하단에 반복.
            react-pdf 4.9에서 render가 공백이 든 문자열('1 / 3')을 반환하면 텍스트가 그려지지 않는 것을
            확인해(원인 미규명) 공백 없는 '1/3' 형식을 쓴다 */}
        <Text
          style={styles.pageNumber}
          fixed
          render={({ pageNumber, totalPages }) => `${pageNumber}/${totalPages}`}
        />

        {/* 2페이지부터 항목 표 머리글을 맨 위에 반복한다. fixed는 Page의 직계 자식이어야 동작하며,
            첫 페이지에서는 null을 돌려줘 자리를 차지하지 않는다 */}
        {invoice.items.length > 0 && (
          <View
            fixed
            render={({ pageNumber }) =>
              pageNumber > 1 ? renderTableHeaderRow() : null
            }
          />
        )}

        <View style={styles.header}>
          <View style={styles.headerMain}>
            <Text style={styles.title}>견적서</Text>
            <Text style={styles.invoiceNumber}>
              {formatText(invoice.invoiceNumber)}
            </Text>
          </View>
          {/* 상태가 비어 있으면 웹 화면과 같이 숨긴다 */}
          {invoice.status && (
            <Text style={styles.status}>
              {INVOICE_STATUS_LABELS[invoice.status]}
            </Text>
          )}
        </View>

        <View style={styles.meta}>
          <View style={styles.metaCell}>
            <Text style={styles.label}>발행일</Text>
            <Text style={styles.value}>{formatDate(invoice.issueDate)}</Text>
          </View>
          <View style={styles.metaCell}>
            <Text style={styles.label}>유효기간</Text>
            <Text style={styles.value}>{formatDate(invoice.validUntil)}</Text>
          </View>
          <View style={styles.metaCell}>
            <Text style={styles.label}>발행자</Text>
            <Text style={styles.value}>{issuer.name}</Text>
            <Text style={styles.valueSub}>{issuer.email}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>수신</Text>
          <Text style={styles.clientName}>
            {formatText(invoice.clientName)}
          </Text>
        </View>

        <View style={styles.section}>
          {invoice.items.length === 0 ? (
            <Text style={styles.emptyBox}>등록된 견적 항목이 없습니다.</Text>
          ) : (
            <>
              {/* 첫 페이지의 머리글 */}
              {renderTableHeaderRow()}
              {/* 마지막 행은 총 금액과 함께 아래에서 그린다 */}
              {invoice.items.slice(0, -1).map(renderItemRow)}
            </>
          )}
        </View>

        {/* 마지막 행과 총 금액을 한 덩어리로 묶어, 총 금액만 다음 페이지로 밀려 머리글과 함께 홀로 남지 않게 한다 */}
        <View wrap={false}>
          {lastItem && renderItemRow(lastItem)}
          <View style={styles.total}>
            <Text style={styles.totalLabel}>총 금액</Text>
            <Text style={styles.totalValue}>
              {formatCurrency(invoice.totalAmount)}
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
