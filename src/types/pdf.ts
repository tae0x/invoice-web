// PDF 생성 API(`/api/generate-pdf`) 요청·응답 타입 골격
// 나머지 타입은 Task 006·010에서 필요할 때 추가한다

// 요청 본문 (D2: 견적서 ID만 받고 서버가 노션을 다시 조회한다)
export type GeneratePdfRequest = {
  notionPageId: string;
};

// 실패 응답 본문 (내부 오류 메시지는 담지 않는다)
export type GeneratePdfErrorResponse = {
  error: string;
};
