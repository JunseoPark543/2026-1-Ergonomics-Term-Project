import type { AnalysisResponse } from "./schemas";

export const sampleAnalysis: AnalysisResponse = {
  sections: [
    {
      sectionId: "sec-1",
      title: "초기 분석 섹션",
      pageStart: 1,
      pageEnd: 3,
      evidences: [
        {
          id: "ev-1",
          page: 1,
          sectionTitle: "Introduction",
          quote:
            "학습자는 생성형 AI가 제공한 설명을 그대로 수용하기보다 원문 근거와 대조할 때 이해 정확도가 높아진다.",
          bbox: { x: 72, y: 168, width: 390, height: 38 }
        },
        {
          id: "ev-2",
          page: 1,
          sectionTitle: "Related Work",
          quote:
            "자동 요약은 읽기 시간을 줄일 수 있지만 개념 간 관계를 직접 구성하는 활동을 약화시킬 수 있다.",
          bbox: { x: 72, y: 256, width: 410, height: 42 }
        },
        {
          id: "ev-3",
          page: 2,
          sectionTitle: "Method",
          quote:
            "실험 조건에서는 참가자가 핵심 주장 카드를 배치하고, 각 카드에 최소 하나 이상의 원문 근거를 연결했다.",
          bbox: { x: 70, y: 122, width: 430, height: 45 }
        },
        {
          id: "ev-4",
          page: 2,
          sectionTitle: "Method",
          quote:
            "검증 게이트웨이는 세 개의 사실 문장과 하나의 미세한 오류 문장으로 구성되었다.",
          bbox: { x: 70, y: 214, width: 392, height: 34 }
        },
        {
          id: "ev-5",
          page: 3,
          sectionTitle: "Results",
          quote:
            "구조화 과업을 수행한 집단은 단순 요약을 읽은 집단보다 지연 회상 점수가 높았다.",
          bbox: { x: 78, y: 176, width: 405, height: 34 }
        },
        {
          id: "ev-6",
          page: 3,
          sectionTitle: "Limitations",
          quote:
            "본 연구는 짧은 논문과 제한된 표본을 사용했으므로 장기 학습 효과를 일반화하기 어렵다.",
          bbox: { x: 78, y: 298, width: 420, height: 35 }
        }
      ],
      fragments: [
        {
          id: "fr-1",
          label: "원문 대조",
          description: "AI 설명을 원문 evidence와 비교해 이해 정확도를 높이는 활동",
          type: "concept",
          evidenceIds: ["ev-1"],
          confidence: 0.92,
          difficulty: "easy"
        },
        {
          id: "fr-2",
          label: "자동 요약의 위험",
          description: "요약 편의성이 관계 구성 활동을 약화시킬 수 있다는 주장",
          type: "claim",
          evidenceIds: ["ev-2"],
          confidence: 0.86,
          difficulty: "medium"
        },
        {
          id: "fr-3",
          label: "카드 배치 과업",
          description: "핵심 주장 카드를 배치하고 근거를 연결하는 연구 절차",
          type: "method",
          evidenceIds: ["ev-3"],
          confidence: 0.9,
          difficulty: "easy"
        },
        {
          id: "fr-4",
          label: "검증 게이트웨이",
          description: "사실 문장과 미세 오류 문장을 구분하게 하는 검증 장치",
          type: "method",
          evidenceIds: ["ev-4"],
          confidence: 0.94,
          difficulty: "medium"
        },
        {
          id: "fr-5",
          label: "지연 회상 향상",
          description: "구조화 과업 집단에서 지연 회상 점수가 더 높게 나타난 결과",
          type: "result",
          evidenceIds: ["ev-5"],
          confidence: 0.88,
          difficulty: "medium"
        },
        {
          id: "fr-6",
          label: "일반화 한계",
          description: "짧은 논문과 제한 표본 때문에 장기 효과 일반화가 어렵다는 한계",
          type: "limitation",
          evidenceIds: ["ev-6"],
          confidence: 0.91,
          difficulty: "easy"
        }
      ],
      gatewayItems: [
        {
          id: "gw-1",
          statement: "원문 대조 활동은 AI 설명을 그대로 수용하는 것보다 이해 정확도를 높이는 데 기여한다.",
          isNoise: false,
          evidenceIds: ["ev-1"]
        },
        {
          id: "gw-2",
          statement: "검증 게이트웨이는 세 개의 사실 문장과 하나의 미세한 오류 문장으로 구성된다.",
          isNoise: false,
          evidenceIds: ["ev-4"]
        },
        {
          id: "gw-3",
          statement: "구조화 과업을 수행한 집단은 단순 요약 집단보다 지연 회상 점수가 높았다.",
          isNoise: false,
          evidenceIds: ["ev-5"]
        },
        {
          id: "gw-4",
          statement: "이 연구는 긴 논문과 대규모 표본을 사용했기 때문에 장기 학습 효과를 일반화할 수 있다.",
          isNoise: true,
          distortionType: "exaggeration",
          evidenceIds: ["ev-6"],
          correctedStatement:
            "이 연구는 짧은 논문과 제한된 표본을 사용했으므로 장기 학습 효과를 일반화하기 어렵다.",
          explanation: "원문은 일반화 가능성을 주장하지 않고, 오히려 표본과 자료 길이의 한계를 밝힌다."
        }
      ],
      summary: [
        {
          id: "sum-1",
          sentence:
            "이 섹션은 AI 설명을 원문 근거와 대조하는 활동이 이해 정확도를 높이는 핵심 절차임을 제시한다.",
          evidenceIds: ["ev-1"],
          confidence: 0.9
        },
        {
          id: "sum-2",
          sentence:
            "자동 요약은 효율적이지만, 학습자가 개념 간 관계를 직접 구성하는 인지 활동을 약화시킬 위험이 있다.",
          evidenceIds: ["ev-2"],
          confidence: 0.84
        },
        {
          id: "sum-3",
          sentence:
            "연구 절차는 지식 카드 배치와 근거 연결, 그리고 오류 탐지를 포함하는 검증 게이트웨이로 구성된다.",
          evidenceIds: ["ev-3", "ev-4"],
          confidence: 0.88
        },
        {
          id: "sum-4",
          sentence:
            "구조화 과업은 지연 회상 향상과 관련되지만, 제한된 표본과 짧은 논문 조건 때문에 일반화에는 주의가 필요하다.",
          evidenceIds: ["ev-5", "ev-6"],
          confidence: 0.86
        }
      ]
    }
  ]
};
