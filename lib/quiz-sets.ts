export type RecognitionQ = {
  id: string;
  type: "recognition";
  text: string;
  options: string[];
  answerIndex: number;
};

export type OpenQ = {
  id: string;
  type: "recall" | "application";
  text: string;
  maxScore: 3;
  rubric: string;
};

export type QuizQuestion = RecognitionQ | OpenQ;

export type QuizSet = {
  paperSet: "vision" | "timeseries" | "optical";
  paper: string;
  totalAutoPoints: number;
  totalManualPoints: number;
  questions: QuizQuestion[];
};

// ── I-JEPA (vision) ──────────────────────────────────────
const ijepQuiz: QuizSet = {
  paperSet: "vision",
  paper: "I-JEPA",
  totalAutoPoints: 4,
  totalManualPoints: 9,
  questions: [
    {
      id: "ij-r1",
      type: "recognition",
      text: "I-JEPA의 사전 학습 방식은 무엇인가?",
      options: [
        "마스킹된 픽셀 값을 복원한다",
        "잠재 표현 공간에서 목표 블록의 표현을 예측한다",
        "이미지 쌍 간 대조 학습을 수행한다",
        "이미지를 무작위 레이블로 분류한다"
      ],
      answerIndex: 1
    },
    {
      id: "ij-r2",
      type: "recognition",
      text: "I-JEPA의 타깃 인코더는 어떻게 업데이트되는가?",
      options: [
        "레이블이 있는 데이터로 역전파",
        "컨텍스트 인코더의 지수 이동 평균(EMA)으로 업데이트",
        "컨텍스트 인코더와 동일하게 역전파",
        "학습 중 파라미터가 고정되어 업데이트되지 않는다"
      ],
      answerIndex: 1
    },
    {
      id: "ij-r3",
      type: "recognition",
      text: "I-JEPA(ViT-H/16)와 MAE의 ImageNet-1K 선형 프로빙 정확도 비교로 올바른 것은?",
      options: [
        "I-JEPA 73.5%, MAE 77.9% — MAE가 우수",
        "I-JEPA 77.9%, MAE 73.5% — I-JEPA가 우수",
        "두 모델 모두 75.0%로 동일",
        "논문에서 두 모델을 직접 비교하지 않음"
      ],
      answerIndex: 1
    },
    {
      id: "ij-r4",
      type: "recognition",
      text: "I-JEPA의 멀티 블록 마스킹 전략의 특징은?",
      options: [
        "하나의 연속된 큰 블록을 마스킹한다",
        "여러 공간적으로 분산된 목표 블록을 동시에 마스킹한다",
        "전체 패치의 75%를 완전 무작위로 마스킹한다",
        "동일 크기 패치를 격자 형태로 규칙적으로 마스킹한다"
      ],
      answerIndex: 1
    },
    {
      id: "ij-c1",
      type: "recall",
      text: "I-JEPA의 컨텍스트 인코더와 타깃 인코더 각각의 역할과, 두 인코더 간의 구조적·학습적 관계를 설명하시오.",
      maxScore: 3,
      rubric: "0: 무관하거나 무응답 | 1: 핵심어 나열(컨텍스트/타깃/EMA) | 2: 역할+EMA 관계 설명 | 3: 역할+EMA+stop-gradient로 표현 붕괴 방지까지 언급"
    },
    {
      id: "ij-c2",
      type: "recall",
      text: "I-JEPA가 MAE와 같은 픽셀 복원 방식 대비 갖는 핵심 차이점과, 그로 인한 성능 이점을 설명하시오.",
      maxScore: 3,
      rubric: "0: 무관 | 1: 차이점(표현 예측 vs 픽셀 복원) 언급 | 2: 차이+선형 프로빙 성능 이점 설명 | 3: 위 + 의미론적 특성 획득 이유까지 논함"
    },
    {
      id: "ij-a1",
      type: "application",
      text: "I-JEPA의 표현 공간 예측 방식이 의료 영상(예: MRI 이상 탐지)에 적용될 경우, 픽셀 복원 방식 대비 어떤 이점과 한계가 예상되는지 구체적으로 논하시오.",
      maxScore: 3,
      rubric: "0: 무관 | 1: 이점 또는 한계 중 하나만 단순 언급 | 2: 이점+한계 모두 논문 근거로 설명 | 3: 위 + 의료 도메인 특수성(레이블 희소성, 해석 가능성 등) 고려"
    }
  ]
};

// ── TimesFM (timeseries) ─────────────────────────────────
const timesfmQuiz: QuizSet = {
  paperSet: "timeseries",
  paper: "TimesFM",
  totalAutoPoints: 4,
  totalManualPoints: 9,
  questions: [
    {
      id: "tfm-r1",
      type: "recognition",
      text: "TimesFM의 아키텍처 유형은?",
      options: [
        "인코더-디코더 트랜스포머",
        "디코더 전용 트랜스포머",
        "인코더 전용 트랜스포머",
        "CNN 기반 시계열 모델"
      ],
      answerIndex: 1
    },
    {
      id: "tfm-r2",
      type: "recognition",
      text: "TimesFM의 사전 학습 데이터 규모는?",
      options: [
        "약 10억 개의 시계열 데이터 포인트",
        "약 100억 개의 파라미터",
        "약 1000억 개의 시계열 데이터 포인트",
        "약 1조 개의 토큰"
      ],
      answerIndex: 2
    },
    {
      id: "tfm-r3",
      type: "recognition",
      text: "TimesFM의 제로샷 성능에 대한 올바른 설명은?",
      options: [
        "모든 벤치마크에서 작업별 지도 모델보다 우수하다",
        "모든 벤치마크에서 작업별 지도 모델보다 낮다",
        "지도 모델에 근접하거나 능가하는 경우가 있다",
        "파인튜닝 없이는 의미 있는 예측이 불가하다"
      ],
      answerIndex: 2
    },
    {
      id: "tfm-r4",
      type: "recognition",
      text: "TimesFM의 입력 처리 방식은?",
      options: [
        "시계열을 개별 시간 단계로 처리한다",
        "연속 시간 단계를 패치로 묶어 토큰으로 입력한다",
        "시계열을 이미지로 변환하여 처리한다",
        "슬라이딩 윈도우로 고정 길이 시퀀스만 처리한다"
      ],
      answerIndex: 1
    },
    {
      id: "tfm-c1",
      type: "recall",
      text: "TimesFM의 패치 기반 표현 방식이 무엇인지 설명하고, 이 방식이 시계열 예측에 가져오는 이점을 서술하시오.",
      maxScore: 3,
      rubric: "0: 무관 | 1: 패치 개념 단순 언급 | 2: 비중첩 패치→토큰 + 가변 컨텍스트 길이 지원 설명 | 3: 위 + 자기회귀 디코딩과의 연계까지 설명"
    },
    {
      id: "tfm-c2",
      type: "recall",
      text: "TimesFM이 다양한 도메인에서 제로샷 일반화가 가능한 근거와, 논문이 명시한 한계점을 설명하시오.",
      maxScore: 3,
      rubric: "0: 무관 | 1: 대규모 사전 학습 언급 | 2: 데이터 규모+아키텍처+파인튜닝 가능 언급 | 3: 위 + 특화 모델이 일부 작업에서 더 나을 수 있다는 한계 포함"
    },
    {
      id: "tfm-a1",
      type: "application",
      text: "TimesFM과 같은 시계열 파운데이션 모델을 실제 기업 판매량 예측 시스템에 적용한다고 할 때, 기대되는 이점과 도입 시 주의해야 할 한계를 구체적으로 논하시오.",
      maxScore: 3,
      rubric: "0: 무관 | 1: 이점 또는 한계 하나만 단순 언급 | 2: 이점(제로샷)+한계(도메인 특화 모델과 비교) 모두 설명 | 3: 위 + 기업 실무 맥락(데이터 프라이버시, 파인튜닝 비용 등) 고려"
    }
  ]
};

// ── FSO Link Budget (optical) ────────────────────────────
const fsoQuiz: QuizSet = {
  paperSet: "optical",
  paper: "FSO Link Budget",
  totalAutoPoints: 4,
  totalManualPoints: 9,
  questions: [
    {
      id: "fso-r1",
      type: "recognition",
      text: "FSO에서 1550 nm 파장이 선호되는 주요 이유가 아닌 것은?",
      options: [
        "대기 흡수가 상대적으로 낮다",
        "빔 발산각이 자동으로 최적화된다",
        "눈 안전 규정을 충족한다",
        "성숙한 광통신 부품이 풍부하다"
      ],
      answerIndex: 1
    },
    {
      id: "fso-r2",
      type: "recognition",
      text: "FSO 시스템에서 빔 발산각이 커질 경우 나타나는 현상은?",
      options: [
        "수신기에서의 전력 밀도가 증가한다",
        "수신기에서의 전력 밀도가 감소한다",
        "기하학적 손실이 감소한다",
        "대기 감쇠 효과가 줄어든다"
      ],
      answerIndex: 1
    },
    {
      id: "fso-r3",
      type: "recognition",
      text: "FSO 링크 마진의 정의로 가장 올바른 것은?",
      options: [
        "송신 전력의 최대 가능값",
        "수신 전력의 시간 평균값",
        "수신기 최소 감도 임계값 대비 초과 수신 전력",
        "자유 공간 기하학적 손실의 역수"
      ],
      answerIndex: 2
    },
    {
      id: "fso-r4",
      type: "recognition",
      text: "맑은 날씨 조건에서 FSO 대기 손실에 대한 올바른 설명은?",
      options: [
        "맑은 날씨에서는 대기 손실이 완전히 제거된다",
        "잔류 분자 흡수와 레일리 산란으로 인한 손실이 여전히 존재한다",
        "맑은 날씨에서는 링크 마진이 불필요하다",
        "맑은 날씨에서는 빔 발산만 링크 성능에 영향을 미친다"
      ],
      answerIndex: 1
    },
    {
      id: "fso-c1",
      type: "recall",
      text: "FSO 링크 버짓을 구성하는 주요 이득 및 손실 요소를 열거하고, 각 요소의 물리적 의미를 설명하시오.",
      maxScore: 3,
      rubric: "0: 무관 | 1: 2~3개 요소 나열(예: 기하 손실, 대기 감쇠) | 2: 4개 이상 요소를 의미와 함께 설명 | 3: 위 + 각 요소가 링크 버짓 방정식에서 어떻게 결합되는지까지 설명"
    },
    {
      id: "fso-c2",
      type: "recall",
      text: "FSO 위성 링크에서 지향 오차(pointing error)가 발생하는 원인과 시스템 성능에 미치는 영향을 설명하시오.",
      maxScore: 3,
      rubric: "0: 무관 | 1: 지향 오차 원인 단순 언급(진동 등) | 2: 원인(자세 불확실성, 기계 진동, 추적 오류)+수신 전력 감소 영향 설명 | 3: 위 + 지향 오차 손실 모델링 방법 또는 완화 전략까지 언급"
    },
    {
      id: "fso-a1",
      type: "application",
      text: "LEO 위성과 지상국 간 FSO 통신 링크를 설계할 때, 기상 조건 변화(안개, 강우 등)에 대응하기 위한 구체적인 설계 전략을 제시하고, 각 전략의 트레이드오프를 논하시오.",
      maxScore: 3,
      rubric: "0: 무관 | 1: 전략 하나만 언급(예: 전력 증가) | 2: 복수 전략(전력 제어, 사이트 다양성 등)+각 트레이드오프 설명 | 3: 위 + 비용/복잡도/잔류 아웃티지와의 균형까지 논함"
    }
  ]
};

export const quizSets: Record<"vision" | "timeseries" | "optical", QuizSet> = {
  vision: ijepQuiz,
  timeseries: timesfmQuiz,
  optical: fsoQuiz
};

export function getQuizSet(paperSet: "vision" | "timeseries" | "optical"): QuizSet {
  return quizSets[paperSet];
}

export const QUIZ_TOTAL_POINTS = 13; // 4 recognition + 3+3+3 open
