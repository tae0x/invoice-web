---
description: '코드 성능을 분석하고 개선안을 제시·적용합니다'
argument-hint: '[파일 또는 디렉터리 경로]'
allowed-tools:
  [
    'Read',
    'Grep',
    'Glob',
    'Edit',
    'Bash(git diff:*)',
    'Bash(git status:*)',
    'Bash(npm run lint:*)',
    'Bash(npx tsc --noEmit:*)',
    'Bash(npm run build:*)',
  ]
---

# Claude 명령어: Optimize

코드의 성능 병목을 분석하고, 우선순위별 개선안을 제시한 뒤 안전한 항목만 적용합니다.

## 사용법

```
/optimize [파일 또는 디렉터리 경로]
```

## 대상

- 분석 대상: $ARGUMENTS
- 인자가 없으면 `git diff`로 확인되는 변경된 파일을 대상으로 합니다.

## 분석 관점

이 프로젝트(Next.js 16 / React 19.3)에 맞춰 아래 항목을 확인합니다.

1. **서버/클라이언트 경계**
   - 불필요하게 넓은 `"use client"`가 없는지 확인하고, 가능하면 말단 컴포넌트로 내립니다.
   - 서버 컴포넌트를 기본으로 유지합니다.
2. **Next.js 캐싱 (`cacheComponents`)**
   - 동적 API(`cookies`, `headers`, `Date.now` 등) 사용 시 Suspense 경계나 `use cache` 처리가 되어 있는지 확인합니다.
   - 코드를 작성하기 전에 `node_modules/next/dist/docs/`의 해당 가이드를 먼저 읽습니다.
3. **리렌더링**
   - 불필요한 상태, 무거운 계산, 매 렌더마다 새로 만들어지는 객체/함수를 찾습니다.
   - `memo`·`useMemo`·`useCallback`은 효과가 확인될 때만 제안합니다.
4. **번들 크기**
   - 큰 의존성, 동적 import(`next/dynamic`)로 분리 가능한 코드, 이미지·폰트 최적화 여부를 확인합니다.
5. **Hydration 안정성**
   - `usehooks-ts`의 `useLocalStorage`, `useMediaQuery` 등은 `initializeWithValue: false`를 사용하는지 확인합니다.

## 진행 순서

1. 대상 코드를 읽고 위 관점으로 분석합니다.
2. 발견한 항목을 **영향도 / 난이도**와 함께 우선순위별로 정리해 보여줍니다.
3. 동작이 바뀌지 않는 안전한 항목만 적용합니다. 동작 변경이 있는 최적화는 적용 전에 확인을 받습니다.
4. 적용 후 `npx tsc --noEmit`과 `npm run lint`로 검증하고, 필요하면 `npm run build`로 prerender 오류를 확인합니다.
5. 변경 내용과 기대 효과를 요약합니다.

## 규칙

- 요청 범위 밖의 코드는 수정하지 않고 제안만 합니다.
- 확실하지 않으면 추측하지 말고 코드를 확인하거나 질문합니다.
- `cn`은 `"cn"` 패키지에서 import하고, 경로 별칭 `@/*`(`src/`)를 유지합니다.
- `src/components/ui`(shadcn 원본)는 직접 수정을 최소화합니다.
- 코드 주석은 한국어로 작성합니다.
- **커밋과 푸시는 하지 않습니다** (사용자가 요청할 때만).
