# 실험 설계 및 구현 명세서

> 생성일: 2026-05-24  
> 목적: 실험 결과의 정확한 해석을 위한 구현 기준 문서

---

## 1. 실험 개요

**연구 주제:** AI가 생성한 논문 요약문의 오류를 탐지하는 능력에 대해,  
(A) 피드백이 있는 AI 요약 검토 인터페이스와  
(B) 논문 읽기 중 개념도 구성 도구가  
각각 어떤 효과를 미치는지 측정한다.

**독립변인:**
- 필터링 인터페이스 (AI 요약 검토 + 즉각 피드백): 전원 적용
- 개념도 구성 도구: 집단 1만 적용

**종속변인:**
- 오류 탐지율 (1차 → 2차 판단 점수 변화)
- 판단 확신도 (1–5점 리커트)
- 응답 시간 (ms)
- 사용 경험 만족도 설문 (리커트 1–5)
- 개념도 복잡도 지표 (집단 1 한정)

---

## 2. 참가자 및 집단 배정

| 이름 | 논문 그룹 | 집단 | 개념도 여부 | 설문 문항 수 |
|------|-----------|------|-------------|-------------|
| 추승준 | vision | 1 | O | 10문항 |
| 유선호 | timeseries | 2 | X | 5문항 |
| 홍성민 | optical | 1 | O | 10문항 |

- **집단 1 (구조도 조건):** 논문 읽기 화면 좌 60% PDF, 우 40% 개념도 패널
- **집단 2 (요약문 조건):** 논문 읽기 화면 전체 PDF, 개념도 없음

---

## 3. 실험 진행 단계 (플로우)

```
로그인 → 안내 → 논문 읽기 → 1차 판단 → AI 요약 검토 → 2차 판단 → 설문 → 완료
 (/)    (guide)  (reading)  (pre-test) (filtering)   (post-test) (survey)  (done)
```

세션이 특정 단계에 있는 참가자가 다른 URL로 접근하면 자동으로 현재 단계로 리다이렉트된다.  
세션은 Supabase `sessions` 테이블에 유지되어 중단 후 재접속 시 이어서 진행된다.

---

## 4. 논문 및 문장 세트 구성

### 4.1 논문 배정

| 논문 그룹 | 1차 판단 / AI 요약 검토 논문 | 2차 판단 논문 |
|-----------|------------------------------|---------------|
| vision | I-JEPA (Self-Supervised Learning) | MAE (Masked Autoencoders) |
| timeseries | TimesFM (Decoder-Only Foundation Model) | Chronos |
| optical | FSO Link Budget Analysis | FSO Performance Analysis |

> 1차 판단과 AI 요약 검토(필터링)은 **동일 논문**에서 출제된 다른 문장 세트.  
> 2차 판단은 **같은 도메인의 다른 논문**에서 출제되어 학습 전이(transfer)를 측정.

### 4.2 단계별 문장 수 및 구성

| 단계 | 총 문장 수 | 오류 문장(noise) | 정상 문장 |
|------|-----------|-----------------|-----------|
| 1차 판단 (pre) | 8 | 3 | 5 |
| AI 요약 검토 (filtering) | 6 | 2 | 4 |
| 2차 판단 (post) | 8 | 3 | 5 |

**모든 논문 그룹에서 동일한 구성 비율 적용.**

### 4.3 삽입 오류 유형 (4종)

| 오류 유형 | 코드 | 설명 | 포함 단계 |
|-----------|------|------|-----------|
| 방향성 오류 | `direction` | 수치·방향이 원문과 반대 | pre, post |
| 인과관계 오류 | `causality` | 상관관계를 인과로 과장 | pre, post |
| 범위 과장 | `scope` | "모든", "항상" 등 범위 확대 | pre, filtering, post |
| 한계점 삭제 | `limitation` | 논문이 명시한 한계를 생략 | filtering |

> filtering 단계에는 direction·causality 오류가 없고 limitation·scope만 포함.

---

## 5. 판단 인터페이스 및 응답 선택지

참가자는 각 AI 요약 문장에 대해 다음 중 하나를 선택한다.

| 선택지 | 코드 | 정답 조건 | 점수 |
|--------|------|-----------|------|
| 원문과 일치 | `accept` | 정상 문장(isNoise=false) | +1점 |
| 오류 있음 | `reject` | 오류 문장(isNoise=true) | +2점 |
| 직접 수정 | `revise` | 오류 문장 + 수정 텍스트 입력 | +3점 |
| 근거 부족 | `insufficient` | (정답 없음, 항상 오답) | 0점 |

**오류 문장을 `accept`하거나 정상 문장을 `reject`/`revise`하면 0점.**

### 5.1 단계별 최대 점수

| 단계 | 정상(×1) | 오류(×2) | 최대 점수 |
|------|----------|----------|-----------|
| 1차 판단 | 5 × 1 = 5 | 3 × 2 = 6 | **11점** |
| AI 요약 검토 | 4 × 1 = 4 | 2 × 2 = 4 | **8점** |
| 2차 판단 | 5 × 1 = 5 | 3 × 2 = 6 | **11점** |

> `revise` 선택 시 최대 3점이지만, 최대 점수 계산 기준은 `reject`(2점) 기준.  
> 즉, 수정까지 올바르게 작성하면 최대 점수를 초과할 수 있음.

### 5.2 피드백 제공 여부

| 단계 | 즉각 피드백 | 검토 점수 표시 | 오류 유형 공개 | 정정 문장 공개 |
|------|-------------|----------------|----------------|----------------|
| 1차 판단 | X | X | X | X |
| AI 요약 검토 | O | O (누적) | O | O |
| 2차 판단 | X | X | X | X |

### 5.3 판단 확신도

모든 단계에서 각 문장 판단 후 1–5점 슬라이더로 입력 (기본값 3).  
DB에 `confidence` 컬럼으로 저장.

---

## 6. 응답 시간 측정

- 측정 단위: 밀리초(ms)
- 측정 구간: 문장 화면 표시 시점 ~ 확인 버튼 클릭 시점
- `response_time_ms` 컬럼으로 저장
- 피드백 확인 후 다음 문장으로 넘어갈 때 타이머 리셋

---

## 7. 개념도 도구 (집단 1 한정)

논문 읽기 단계에서 우측 40% 패널에 인터랙티브 개념도 작성 도구 제공.

### 7.1 측정 지표

| 지표 | 설명 | DB 컬럼 |
|------|------|---------|
| 노드 수 | 최종 개념어 개수 | `node_count` |
| 연결 수 | 최종 관계선 개수 | `edge_count` |
| 수정 횟수 | 노드 추가/삭제/연결 총 횟수 | `edit_count` |
| 소요 시간 | 개념도 패널 최초 렌더 ~ 완료 버튼 클릭 (초) | `duration_sec` |
| 그래프 원본 | 노드·엣지 전체 JSON | `graph_data` |

### 7.2 저장 시점

집단 1 참가자가 "테스트 시작" 버튼을 클릭할 때 `/api/concept-map`으로 POST 저장.  
집단 2는 해당 API를 호출하지 않음 (DB에 행 없음).

---

## 8. 설문 문항

### 8.1 AI 요약 검토 기능 (전원, fq1–fq5)

| 문항 ID | 내용 | 측정 목적 |
|---------|------|-----------|
| fq1 | 이 기능이 AI 요약문을 더 신중하게 보게 만들었다. | 자동화 편향 완화 체감 |
| fq2 | 오류 찾기 과정이 논문 이해에 도움이 되었다. | 기능 유용성 |
| fq3 | 검토 점수가 집중하는 데 도움이 되었다. | 점수 시스템 효과 |
| fq4 | AI 요약문 검토 기능 사용이 번거로웠다. | 사용 부담 |
| fq5 | 앞으로 논문을 읽을 때 AI 요약문 검토 기능을 사용할 의향이 있다. | 실제 적용 가능성 |

### 8.2 개념도 구성 기능 (집단 1 한정, cq1–cq5)

| 문항 ID | 내용 | 측정 목적 |
|---------|------|-----------|
| cq1 | 개념도를 직접 구성하는 과정이 논문 이해에 도움이 됐다. | 기능 유용성 체감 |
| cq2 | 키워드를 연결하면서 개념 간 관계가 명확해졌다. | 내재화 체감 |
| cq3 | 요약문만 읽는 것보다 더 깊이 생각하게 만들었다. | 능동적 조작 효과 체감 |
| cq4 | 개념도 구성 과정이 번거로웠다. | 사용 부담감 |
| cq5 | 앞으로 논문을 읽을 때 이 방식을 계속 사용할 의향이 있다. | 실제 적용 가능성 |

---

## 9. 저장 데이터 구조 (Supabase 테이블)

### sessions
```
participant_id     TEXT  (참가자 이름)
group_num          INT   (1 또는 2)
paper_set          TEXT  (vision / timeseries / optical)
current_step       TEXT  (현재 진행 단계)
reading_completed_at TIMESTAMPTZ (논문 읽기 완료 시각)
created_at         TIMESTAMPTZ
```

### filtering_responses
```
participant_id   TEXT
phase            TEXT  (pre / filtering / post)
sentence_id      TEXT
error_type       TEXT  (none / direction / causality / scope / limitation)
is_noise         BOOLEAN
user_response    TEXT  (accept / reject / revise / insufficient)
user_revision    TEXT  (직접 수정 시 입력 텍스트)
is_correct       BOOLEAN
score            INT
confidence       INT   (1–5)
response_time_ms INT
timestamp        TIMESTAMPTZ
```

### survey_responses
```
participant_id  TEXT
question_id     TEXT  (fq1–fq5 / cq1–cq5)
likert_score    INT   (1–5)
timestamp       TIMESTAMPTZ
```

### concept_maps
```
participant_id  TEXT  (집단 1만 존재)
paper_set       TEXT
node_count      INT
edge_count      INT
edit_count      INT
duration_sec    INT
graph_data      JSONB
created_at      TIMESTAMPTZ
```

---

## 10. 점수 계산 로직 (`lib/scoring.ts`)

```
scoreResponse(sentence, userResponse, userRevision):
  if sentence.isNoise:
    reject   → isCorrect=true,  score=2
    revise + 텍스트 있음 → isCorrect=true,  score=3
    나머지  → isCorrect=false, score=0
  else:
    accept   → isCorrect=true,  score=1
    나머지  → isCorrect=false, score=0
```

**취약 오류 유형(weakErrorType):** 각 단계에서 오답 처리된 오류 문장 중 가장 많이 틀린 유형.  
완료 화면에서 사전 취약 유형을 참가자에게 표시.

---

## 11. 결과 해석 시 주의사항

1. **사전·사후 논문이 다름:** 1차 판단(I-JEPA/TimesFM/FSO)과 2차 판단(MAE/Chronos/FSO-Perf)은 같은 도메인이지만 다른 논문. 오류 유형도 일부 다르므로 raw 점수 비교 시 문항 동질성을 확인할 것.

2. **오류 유형 구성 차이:** filtering 단계에는 `direction`·`causality`가 없음. filtering 점수를 pre/post와 직접 비교하지 말 것.

3. **`revise`로 최대 점수 초과 가능:** 참가자가 오류 문장을 올바르게 수정하면 3점으로, 최대 점수(2점 기준) 초과. 점수율 계산 시 `score / maxScore > 1`이 발생할 수 있음.

4. **집단 간 논문이 다름:** 추승준(vision) / 유선호(timeseries) / 홍성민(optical)은 서로 다른 논문을 읽음. 집단 간 점수 직접 비교는 논문 난이도 차이를 통제해야 의미 있음.

5. **집단 내 비교가 핵심:** 동일 참가자의 1차 → 2차 점수 변화(Δ)가 주요 분석 단위.

6. **개념도 미사용 집단 DB 행 없음:** 집단 2(유선호)는 `concept_maps` 테이블에 행이 없음. JOIN 시 LEFT JOIN 사용.

---

## 12. 데이터 내보내기 (관리자 패널)

`/api/export?sheet=<시트명>`

| 시트명 | 내용 | 파일명 |
|--------|------|--------|
| `filtering` | 전체 판단 응답 (phase / score / confidence / responseTime 포함) | filtering_responses.csv |
| `survey` | 설문 리커트 응답 | survey_responses.csv |
| `sessions` | 참가자별 세션 정보 | sessions.csv |
| `concept-map` | 개념도 지표 (집단 1 행만 존재) | concept_maps.csv |
| `quiz` | 지연 퀴즈 + 메타인지 (현재 미사용) | quiz_responses.csv |
