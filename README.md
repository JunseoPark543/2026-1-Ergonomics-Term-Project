# 논문 독해 헬퍼

AI가 논문 독해를 대신하지 않고, 사용자가 원문 대조와 오류 탐지, 지식 구조화를 직접 수행하도록 돕는 웹 프로토타입입니다.

## 설치

```bash
pnpm install
pnpm dev
```

## 환경변수

`.env.local`에 서버 전용 키를 둡니다.

```bash
OPENAI_API_KEY=...
OPENAI_MODEL=gpt-4.1-mini
```

클라이언트에 노출되는 `NEXT_PUBLIC_OPENAI_API_KEY`는 사용하지 않습니다.

## 데모 플로우

1. PDF를 업로드하면 왼쪽 원문 뷰어에 표시됩니다.
2. 오른쪽의 지식 파편 카드를 근거와 대조합니다.
3. 지식 구조화 캔버스에 노드 5개 이상을 추가하고 관계 edge 3개 이상을 만듭니다.
4. 조건부 요약 문장의 evidence를 확인해 원문 대조율을 올립니다.
5. 검증 게이트웨이에서 3개 사실 문장과 1개 오류 문장 중 오류를 찾습니다.
6. 정답이면 조건부 요약이 공개됩니다.

## 구현 상태

- Next.js App Router, TypeScript, Tailwind CSS 기반입니다.
- React Flow로 지식 구조화 캔버스를 구현했습니다.
- Zod로 evidence, 지식 파편, 검증 문항, 요약 문장 스키마를 정의했습니다.
- OpenAI 호출은 `/api/analyze` 서버 라우트에만 있습니다.
- API 키가 없거나 텍스트가 부족하면 샘플 분석 데이터로 동작합니다.
- PDF 하이라이트는 1차 프로토타입에서 근거 문장 패널로 대체하며, 데이터에는 `page`와 `bbox`를 유지합니다.

## 검증

```bash
pnpm lint
pnpm test
pnpm build
```

## 한계점

- 실제 PDF 텍스트 추출과 섹션 chunking은 API 구조만 마련되어 있고, 현재 데모는 샘플 분석 fallback을 사용합니다.
- PDF 내부 bbox 하이라이트 대신 근거 문장 패널을 제공합니다.
- e2e 테스트는 아직 추가하지 않았습니다.

## 향후 개선점

- PDF.js 기반 텍스트 레이어 추출, 섹션 chunking, chunk 캐싱 추가
- evidence bbox 하이라이트와 페이지 자동 이동 구현
- Playwright 기반 업로드, 드래그, 검증 게이트 e2e 테스트 추가
- 사용자별 독해 로그 저장과 장기 인지 참여도 추세 분석
