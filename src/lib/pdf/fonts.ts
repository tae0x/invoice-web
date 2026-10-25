// PDF용 한글 폰트 등록 (서버 전용 코드, D1)
import "server-only";

import path from "node:path";
import { Font } from "@react-pdf/renderer";

// PDF 문서에서 사용하는 폰트 패밀리 이름
export const PDF_FONT_FAMILY = "NotoSansKR";

const FONT_DIR = path.join(process.cwd(), "src/lib/pdf/fonts");

// 한글(자모·음절·호환 자모) 포함 여부
const HANGUL_PATTERN = /[ᄀ-ᇿ㄰-㆏가-힯]/;

// 줄바꿈만 허용하는 너비 0 문자 (String.trim이 공백으로 취급하는 U+FEFF)
const ZERO_WIDTH_BREAK = "\uFEFF";

let isRegistered = false;

// 폰트와 줄바꿈 규칙을 한 번만 등록한다 (모듈이 여러 번 평가돼도 중복 등록하지 않는다)
export function registerPdfFonts(): void {
  if (isRegistered) return;

  // Noto Sans KR 정적 TTF (Regular 400, Bold 700). 가변 폰트는 react-pdf에서 쓰지 않는다
  Font.register({
    family: PDF_FONT_FAMILY,
    fonts: [
      { src: path.join(FONT_DIR, "NotoSansKR-Regular.ttf") },
      { src: path.join(FONT_DIR, "NotoSansKR-Bold.ttf"), fontWeight: "bold" },
    ],
  });

  // 한글은 띄어쓰기가 없는 긴 단어도 글자 단위로 줄바꿈하고,
  // 그 외 단어는 기본 하이픈 분할을 막아 그대로 둔다.
  // react-pdf(textkit)는 음절 사이를 하이픈 후보(penalty)로 보고, 거기서 줄이 나뉘면 항상 '-'를 붙인다.
  // 음절 사이에 공백으로 취급되는 U+FEFF(너비 0)를 끼우면 그 자리는 하이픈 후보가 아닌
  // 일반 줄바꿈 후보(glue)가 되어 '-' 없이 줄이 나뉜다. 글리프는 그려지지 않는다
  Font.registerHyphenationCallback((word) =>
    HANGUL_PATTERN.test(word)
      ? Array.from(word).flatMap((char, index, chars) =>
          index < chars.length - 1 ? [char, ZERO_WIDTH_BREAK] : [char],
        )
      : [word],
  );

  isRegistered = true;
}

registerPdfFonts();
