import { CURRENCY, LOCALE } from "@/lib/constants";

// 시간 없는 날짜 문자열 (D3)
const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const currencyFormatter = new Intl.NumberFormat(LOCALE, {
  style: "currency",
  currency: CURRENCY,
});

const numberFormatter = new Intl.NumberFormat(LOCALE);

// 시간 없는 날짜는 시간대와 무관한 달력 값이므로 UTC 자정으로 만들고 UTC로 표시한다
// (서울 기준 표시와 같은 날짜가 나온다, D3)
const dateFormatter = new Intl.DateTimeFormat(LOCALE, {
  timeZone: "UTC",
  dateStyle: "long",
});

// 원화 금액 표시 (값이 없으면 "-")
export function formatCurrency(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return "-";
  return currencyFormatter.format(value);
}

// 수량 등 일반 숫자 표시 (값이 없으면 "-")
export function formatNumber(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return "-";
  return numberFormatter.format(value);
}

// `YYYY-MM-DD`를 한국어 날짜로 표시 (값이 없거나 형식이 다르면 "-")
export function formatDate(value: string | null): string {
  if (value === null || !DATE_ONLY_PATTERN.test(value)) return "-";
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  // 넘친 월·일(2026-13-01, 2026-02-31)과 0~99년의 1900년대 보정을 모두 거른다
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return "-";
  }
  return dateFormatter.format(date);
}

// 문자열 표시 (앞뒤 공백을 지우고, 비어 있으면 "-"). 웹과 PDF가 같은 표기를 쓰도록 모아 둔다
export function formatText(value: string): string {
  return value.trim() || "-";
}
