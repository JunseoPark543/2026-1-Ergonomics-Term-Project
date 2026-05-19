import type { SentenceSet } from "./schemas";

// ─────────────────────────────────────────────────────────────
// I-JEPA  (비전 그룹 사전 테스트 + 개입)
// ─────────────────────────────────────────────────────────────
const ijepaPre: SentenceSet = {
  phase: "pre",
  paperSet: "vision",
  paper: "I-JEPA",
  sentences: [
    {
      id: "ijepa-pre-1",
      statement:
        "I-JEPA는 마스킹된 목표 블록의 픽셀 값이 아닌 잠재 표현 공간에서의 표현을 예측하는 방식으로 시각적 표현을 학습한다.",
      isNoise: false,
      errorType: "none",
      evidenceQuote:
        "The goal of I-JEPA is to predict the representations of target blocks given a context block, rather than reconstructing pixels.",
      evidencePage: 2
    },
    {
      id: "ijepa-pre-2",
      statement:
        "I-JEPA의 타깃 인코더는 컨텍스트 인코더의 지수 이동 평균(EMA)으로 업데이트되며, 직접적인 역전파를 받지 않는다.",
      isNoise: false,
      errorType: "none",
      evidenceQuote:
        "The target encoder is parameterized as an exponential moving average of the context encoder and is not updated via gradient descent directly.",
      evidencePage: 3
    },
    {
      id: "ijepa-pre-3",
      statement:
        "I-JEPA는 동일한 ViT-H 백본을 사용할 때 MAE와 같은 픽셀 복원 방식보다 ImageNet-1K 선형 프로빙 정확도가 낮다.",
      isNoise: true,
      errorType: "direction",
      evidenceQuote:
        "I-JEPA (ViT-H/16) achieves 77.9% top-1 accuracy on ImageNet-1K linear probing, outperforming MAE (73.5%) with the same architecture.",
      evidencePage: 5,
      correctedStatement:
        "I-JEPA는 동일한 ViT-H 백본을 사용할 때 MAE보다 ImageNet-1K 선형 프로빙 정확도가 높다.",
      explanation:
        "논문은 I-JEPA(77.9%)가 MAE(73.5%)보다 선형 프로빙 정확도가 높다고 보고한다. 방향이 반전된 오류다."
    },
    {
      id: "ijepa-pre-4",
      statement:
        "I-JEPA의 예측기(predictor)는 컨텍스트 인코더의 출력과 목표 블록의 위치 정보를 입력으로 받아 목표 표현을 예측한다.",
      isNoise: false,
      errorType: "none",
      evidenceQuote:
        "The predictor takes as input the output of the context encoder and the positions of the target blocks to generate target block predictions.",
      evidencePage: 3
    },
    {
      id: "ijepa-pre-5",
      statement:
        "I-JEPA는 모든 자기지도 학습 접근 방식에서 수작업으로 설계된 데이터 증강을 완전히 제거한다.",
      isNoise: true,
      errorType: "scope",
      evidenceQuote:
        "I-JEPA does not rely on hand-crafted view augmentations within its own framework; this property is specific to the joint-embedding predictive architecture.",
      evidencePage: 2,
      correctedStatement:
        "I-JEPA는 자체 프레임워크 내에서 수작업 증강에 의존하지 않지만, 이는 모든 SSL 방식에 해당하는 것은 아니다.",
      explanation:
        "논문은 I-JEPA 자체가 증강이 불필요하다고 주장하지만, 다른 SSL 방식 전체에서 증강을 제거한다고 주장하지는 않는다."
    },
    {
      id: "ijepa-pre-6",
      statement:
        "I-JEPA는 여러 공간적으로 분산된 목표 블록의 표현을 단일 컨텍스트 영역에서 동시에 예측하는 멀티 블록 마스킹 전략을 사용한다.",
      isNoise: false,
      errorType: "none",
      evidenceQuote:
        "We sample a set of target blocks distributed across the image; I-JEPA predicts the representations of each target block from a single context region.",
      evidencePage: 3
    },
    {
      id: "ijepa-pre-7",
      statement:
        "I-JEPA의 우수한 다운스트림 성능은 EMA 타깃 인코더에 의해 직접적으로 유발되며, 이 단일 요인이 대조 방법 대비 모든 이점의 원인임이 증명되었다.",
      isNoise: true,
      errorType: "causality",
      evidenceQuote:
        "We find that predicting in representation space with an EMA target encoder correlates with strong downstream performance; ablations support its importance.",
      evidencePage: 5,
      correctedStatement:
        "I-JEPA의 성능은 EMA 타깃 인코더 및 표현 공간 예측과 상관관계가 있으나, 단일 요인의 인과성이 증명된 것은 아니다.",
      explanation:
        "논문은 상관관계와 제거 실험 결과를 보고하지만, EMA가 유일한 원인이라고 증명하지는 않는다."
    },
    {
      id: "ijepa-pre-8",
      statement:
        "I-JEPA는 사전 학습 중 픽셀 수준 주석 없이도 의미론적 분할 및 객체 탐지 다운스트림 작업에서 경쟁력 있는 성능을 보인다.",
      isNoise: false,
      errorType: "none",
      evidenceQuote:
        "I-JEPA achieves competitive results on ADE20K semantic segmentation and COCO object detection when used as a pretrained backbone.",
      evidencePage: 6
    }
  ]
};

const ijepaFiltering: SentenceSet = {
  phase: "filtering",
  paperSet: "vision",
  paper: "I-JEPA",
  sentences: [
    {
      id: "ijepa-fil-1",
      statement:
        "I-JEPA는 컨텍스트 인코더와 타깃 인코더 모두에 Vision Transformer(ViT) 구조를 사용한다.",
      isNoise: false,
      errorType: "none",
      evidenceQuote:
        "Both the context encoder and target encoder are implemented as Vision Transformers (ViT).",
      evidencePage: 3
    },
    {
      id: "ijepa-fil-2",
      statement:
        "저자들은 I-JEPA의 학습 방식이 아무런 아키텍처 수정 없이도 비디오 및 오디오 모달리티로 효과적으로 일반화됨을 입증한다.",
      isNoise: true,
      errorType: "limitation",
      evidenceQuote:
        "We leave the extension of I-JEPA to video and other modalities for future work.",
      evidencePage: 7,
      correctedStatement:
        "비디오 및 다른 모달리티로의 확장은 향후 연구 과제로 남겨져 있으며, 현 논문에서 입증된 결과가 아니다.",
      explanation:
        "논문은 다른 모달리티로의 확장을 향후 과제로 명시하고 있다. 현재 논문에서 입증된 결과가 아닌 한계점을 삭제한 오류다."
    },
    {
      id: "ijepa-fil-3",
      statement:
        "I-JEPA의 마스킹 비율과 목표 블록의 공간 분포는 예측 과업이 너무 쉽지도 너무 어렵지도 않도록 설계된 알고리즘으로 제어된다.",
      isNoise: false,
      errorType: "none",
      evidenceQuote:
        "We design the masking strategy to create a challenging yet solvable prediction problem, balancing the difficulty through block size and distribution.",
      evidencePage: 3
    },
    {
      id: "ijepa-fil-4",
      statement:
        "I-JEPA는 1% 및 10% 레이블 데이터 환경의 준지도 학습 벤치마크에서도 픽셀 수준 복원 방법보다 우수한 성능을 보인다.",
      isNoise: false,
      errorType: "none",
      evidenceQuote:
        "On semi-supervised benchmarks with 1% and 10% labeled data, I-JEPA outperforms MAE and other pixel-level reconstruction baselines.",
      evidencePage: 5
    },
    {
      id: "ijepa-fil-5",
      statement:
        "I-JEPA는 논문에서 평가된 모든 벤치마크에서 최고 성능을 달성하여 모든 기존 자기지도 학습 방법을 능가한다.",
      isNoise: true,
      errorType: "scope",
      evidenceQuote:
        "I-JEPA achieves competitive performance on several benchmarks; methods such as DINO achieve higher linear probing accuracy on certain evaluations.",
      evidencePage: 5,
      correctedStatement:
        "I-JEPA는 일부 벤치마크에서 경쟁력 있는 성능을 보이지만, 모든 평가에서 기존 방법을 능가하지는 않는다.",
      explanation:
        "DINO 등 일부 방법은 특정 작업에서 I-JEPA보다 높은 성능을 달성한다. '모든 벤치마크'라는 범위 과장 오류다."
    },
    {
      id: "ijepa-fil-6",
      statement:
        "조인트 임베딩 예측 아키텍처는 타깃 인코더에 직접적인 그래디언트 업데이트를 주지 않는 비대칭 설계를 통해 표현 붕괴를 방지한다.",
      isNoise: false,
      errorType: "none",
      evidenceQuote:
        "The asymmetric design with a stop-gradient on the target encoder prevents representational collapse.",
      evidencePage: 3
    }
  ]
};

// ─────────────────────────────────────────────────────────────
// MAE  (비전 그룹 사후 테스트)
// ─────────────────────────────────────────────────────────────
const maePost: SentenceSet = {
  phase: "post",
  paperSet: "vision",
  paper: "MAE",
  sentences: [
    {
      id: "mae-post-1",
      statement:
        "MAE는 입력 이미지 패치의 높은 비율(75%)을 마스킹하고 누락된 픽셀을 복원하도록 모델을 학습시킨다.",
      isNoise: false,
      errorType: "none",
      evidenceQuote:
        "We find that masking a high proportion (75%) of the input image yields a nontrivial and meaningful self-supervisory task.",
      evidencePage: 2
    },
    {
      id: "mae-post-2",
      statement:
        "MAE의 인코더는 가시(마스킹되지 않은) 패치만을 처리하는 비대칭 인코더-디코더 구조를 사용한다.",
      isNoise: false,
      errorType: "none",
      evidenceQuote:
        "Our encoder operates on only the visible subset of patches, which allows training very large models efficiently.",
      evidencePage: 2
    },
    {
      id: "mae-post-3",
      statement:
        "MAE의 디코더는 고품질 복원을 위해 인코더와 비슷한 크기의 대형 네트워크로 구성된다.",
      isNoise: true,
      errorType: "direction",
      evidenceQuote:
        "The decoder is lightweight and is only used during pre-training, not during fine-tuning.",
      evidencePage: 3,
      correctedStatement:
        "MAE의 디코더는 경량 네트워크로, 인코더보다 훨씬 작으며 사전 학습 단계에서만 사용된다.",
      explanation:
        "논문은 디코더를 명시적으로 경량(lightweight)이라고 설명한다. 인코더와 비슷한 크기라는 방향성 오류다."
    },
    {
      id: "mae-post-4",
      statement:
        "MAE의 무작위 마스킹 전략은 인근 패치의 단순한 보간으로 작업을 해결하지 못하도록 설계된다.",
      isNoise: false,
      errorType: "none",
      evidenceQuote:
        "Random masking largely eliminates redundancy, creating a task that cannot be easily solved by simple spatial interpolation.",
      evidencePage: 2
    },
    {
      id: "mae-post-5",
      statement:
        "75% 마스킹 비율이 MAE에서 의미론적으로 일관된 표현을 직접적으로 유발하며, 이는 제거 실험을 통해 유일한 원인 요소로 증명되었다.",
      isNoise: true,
      errorType: "causality",
      evidenceQuote:
        "Ablation studies show the masking ratio is an important hyperparameter; higher ratios encourage global reasoning, though direct causality with semantic learning is not claimed.",
      evidencePage: 4,
      correctedStatement:
        "높은 마스킹 비율은 전역적 추론을 장려하며 제거 실험에서 중요한 요소로 나타났지만, 의미론적 학습의 유일한 원인으로 증명된 것은 아니다.",
      explanation:
        "제거 실험은 마스킹 비율의 중요성을 보여주지만, '유일한 원인으로 증명'되었다는 것은 인과관계를 과장한 오류다."
    },
    {
      id: "mae-post-6",
      statement:
        "MAE로 미세 조정된 ViT 모델은 ImageNet 분류, 객체 탐지, 인스턴스 분할 작업에서 우수한 성능을 달성한다.",
      isNoise: false,
      errorType: "none",
      evidenceQuote:
        "Our fine-tuned models achieve strong performance on ImageNet classification, COCO object detection, and instance segmentation.",
      evidencePage: 5
    },
    {
      id: "mae-post-7",
      statement:
        "MAE의 마스크 자동 인코딩 방식은 이미지, 텍스트, 오디오 등 모든 데이터 유형에서 도메인별 수정 없이 동등하게 작동한다.",
      isNoise: true,
      errorType: "scope",
      evidenceQuote:
        "We focus on images in this work and leave applications to other modalities for future exploration.",
      evidencePage: 1,
      correctedStatement:
        "MAE는 이미지를 대상으로 실증되었으며, 다른 모달리티로의 확장은 향후 과제로 제시된다.",
      explanation:
        "논문은 이미지만을 평가 대상으로 한다. 오디오·텍스트 등에 동등하게 적용된다는 주장은 범위 과장 오류다."
    },
    {
      id: "mae-post-8",
      statement:
        "MAE의 사전 학습은 인코더가 마스킹되지 않은 25% 패치만 처리하므로 계산 효율이 높다.",
      isNoise: false,
      errorType: "none",
      evidenceQuote:
        "This design allows efficient training of large models by reducing the compute and memory required, as the encoder only processes the visible patches.",
      evidencePage: 2
    }
  ]
};

// ─────────────────────────────────────────────────────────────
// TimesFM  (시계열 그룹 사전 테스트 + 개입)
// ─────────────────────────────────────────────────────────────
const timesfmPre: SentenceSet = {
  phase: "pre",
  paperSet: "timeseries",
  paper: "TimesFM",
  sentences: [
    {
      id: "tfm-pre-1",
      statement:
        "TimesFM은 약 1000억 개의 실제 시계열 데이터 포인트로 구성된 대규모 코퍼스에서 사전 학습된 디코더 전용 파운데이션 모델이다.",
      isNoise: false,
      errorType: "none",
      evidenceQuote:
        "We pre-train TimesFM on a large time-series corpus of approximately 100 billion real-world time-points.",
      evidencePage: 2
    },
    {
      id: "tfm-pre-2",
      statement:
        "TimesFM은 연속적인 시간 단계들을 패치로 묶어 트랜스포머에 입력 토큰으로 제공하는 패치 기반 표현을 사용한다.",
      isNoise: false,
      errorType: "none",
      evidenceQuote:
        "We encode time series using non-overlapping patches as input tokens to the transformer.",
      evidencePage: 3
    },
    {
      id: "tfm-pre-3",
      statement:
        "TimesFM은 논문에서 평가된 대부분의 제로샷 예측 벤치마크에서 작업별 지도 모델보다 성능이 낮다.",
      isNoise: true,
      errorType: "direction",
      evidenceQuote:
        "TimesFM achieves performance close to or better than supervised models in zero-shot settings across multiple benchmarks.",
      evidencePage: 5,
      correctedStatement:
        "TimesFM은 제로샷 환경에서 여러 벤치마크에 걸쳐 지도 모델에 근접하거나 이를 능가하는 성능을 달성한다.",
      explanation:
        "논문의 핵심 결과는 TimesFM이 지도 모델과 견줄 만하거나 이를 능가한다는 것이다. 방향을 반전한 오류다."
    },
    {
      id: "tfm-pre-4",
      statement:
        "TimesFM은 디코더 전용 아키텍처를 사용하여 한 번에 하나의 패치씩 자기회귀적으로 예측을 생성한다.",
      isNoise: false,
      errorType: "none",
      evidenceQuote:
        "The decoder generates output patches auto-regressively to produce forecasts of arbitrary horizon.",
      evidencePage: 3
    },
    {
      id: "tfm-pre-5",
      statement:
        "TimesFM은 새로운 도메인에 적용할 때 어떠한 미세 조정도 필요 없으며, 추가 학습 없이 모든 실제 예측 응용에서 최적 성능을 달성한다.",
      isNoise: true,
      errorType: "scope",
      evidenceQuote:
        "TimesFM shows strong zero-shot performance; fine-tuning on domain-specific data can further improve results in some settings.",
      evidencePage: 5,
      correctedStatement:
        "TimesFM은 강력한 제로샷 성능을 달성하지만, 도메인별 미세 조정을 통해 성능을 추가로 향상시킬 수 있다.",
      explanation:
        "논문은 제로샷 능력을 입증하면서도 미세 조정이 도움이 될 수 있음을 인정한다. '어떠한 미세 조정도 불필요'는 범위 과장 오류다."
    },
    {
      id: "tfm-pre-6",
      statement:
        "TimesFM은 소매, 금융, 교통 등 다양한 도메인을 아우르는 여러 데이터셋에서 평가되어 폭넓은 일반화 능력을 보인다.",
      isNoise: false,
      errorType: "none",
      evidenceQuote:
        "We evaluate TimesFM on diverse benchmarks including M4, ETT, and other datasets spanning retail, finance, and transportation domains.",
      evidencePage: 4
    },
    {
      id: "tfm-pre-7",
      statement:
        "1000억 개의 시계열 데이터 포인트 학습이 TimesFM의 제로샷 일반화를 직접적으로 유발하며, 데이터 규모만이 예측 성능을 결정한다는 것이 증명되었다.",
      isNoise: true,
      errorType: "causality",
      evidenceQuote:
        "Large-scale pre-training contributes to TimesFM's zero-shot ability alongside architectural choices and training procedures.",
      evidencePage: 2,
      correctedStatement:
        "대규모 사전 학습은 TimesFM의 제로샷 일반화에 기여하는 요인 중 하나이며, 아키텍처 설계와 학습 방식도 함께 중요하다.",
      explanation:
        "논문은 성능을 데이터 규모, 아키텍처, 학습 방식 모두에 귀속시킨다. 데이터 규모만이 원인이라는 인과관계 오류다."
    },
    {
      id: "tfm-pre-8",
      statement:
        "TimesFM은 아키텍처 변경 없이 다양한 컨텍스트 길이 및 예측 구간에 적용 가능한 유연성을 지원한다.",
      isNoise: false,
      errorType: "none",
      evidenceQuote:
        "TimesFM can handle variable context lengths and forecast horizons without architectural changes.",
      evidencePage: 3
    }
  ]
};

const timesfmFiltering: SentenceSet = {
  phase: "filtering",
  paperSet: "timeseries",
  paper: "TimesFM",
  sentences: [
    {
      id: "tfm-fil-1",
      statement:
        "TimesFM은 대규모 언어 모델과 유사한 디코더 전용 트랜스포머 아키텍처를 기반으로 하며, 연속값 시계열 입력을 위해 조정되었다.",
      isNoise: false,
      errorType: "none",
      evidenceQuote:
        "We adopt a decoder-only transformer architecture, adapting the LLM paradigm for time series with continuous-valued inputs.",
      evidencePage: 2
    },
    {
      id: "tfm-fil-2",
      statement:
        "저자들은 TimesFM이 평가된 모든 벤치마크에서 최고 성능을 달성하여 특화된 예측 모델을 불필요하게 만든다고 결론짓는다.",
      isNoise: true,
      errorType: "limitation",
      evidenceQuote:
        "TimesFM achieves competitive performance on most benchmarks, though specialized models occasionally outperform it on certain tasks.",
      evidencePage: 5,
      correctedStatement:
        "TimesFM은 대부분의 벤치마크에서 강력한 성능을 보이지만, 일부 작업에서는 특화된 모델이 우수한 성능을 낼 수 있다.",
      explanation:
        "논문은 특화 모델이 일부 작업에서 더 나을 수 있음을 인정한다. '모든 벤치마크에서 최고'이며 '특화 모델이 불필요'하다는 것은 한계점을 삭제한 오류다."
    },
    {
      id: "tfm-fil-3",
      statement:
        "TimesFM은 실제 수집 데이터와 합성 시계열 데이터를 모두 활용하여 사전 학습되었다.",
      isNoise: false,
      errorType: "none",
      evidenceQuote:
        "Pre-training data includes both real-world collected time series and synthetic data to improve data coverage.",
      evidencePage: 2
    },
    {
      id: "tfm-fil-4",
      statement:
        "TimesFM은 단일 사전 학습 모델이 작업별 학습 없이 다양한 시계열 예측 작업에 일반화될 수 있음을 보여준다.",
      isNoise: false,
      errorType: "none",
      evidenceQuote:
        "A single TimesFM model applied zero-shot generalizes across forecasting benchmarks from different domains.",
      evidencePage: 4
    },
    {
      id: "tfm-fil-5",
      statement:
        "TimesFM의 패치 방식은 모든 규모에서 모든 시간적 패턴을 완벽하게 보존하여 다중 규모 시계열 분석의 과제를 완전히 해결한다.",
      isNoise: true,
      errorType: "scope",
      evidenceQuote:
        "Patching allows efficient processing and captures temporal patterns effectively, though the paper does not claim to fully resolve all multi-scale challenges.",
      evidencePage: 3,
      correctedStatement:
        "TimesFM의 패치 방식은 시간적 패턴을 효율적으로 처리하는 데 기여하지만, 모든 다중 규모 분석 과제를 완전히 해결한다고 주장하지는 않는다.",
      explanation:
        "논문은 패치 방식의 효율성을 설명하지만 '완벽하게 보존'하고 '완전히 해결'한다는 것은 지나친 범위 과장이다."
    },
    {
      id: "tfm-fil-6",
      statement:
        "TimesFM의 자기회귀적 디코딩은 다양한 예측 구간 길이를 지원하면서도 일관된 예측 품질을 유지한다.",
      isNoise: false,
      errorType: "none",
      evidenceQuote:
        "The auto-regressive decoding mechanism supports arbitrary forecast horizons while maintaining consistent prediction quality.",
      evidencePage: 3
    }
  ]
};

// ─────────────────────────────────────────────────────────────
// Chronos  (시계열 그룹 사후 테스트)
// ─────────────────────────────────────────────────────────────
const chronosPost: SentenceSet = {
  phase: "post",
  paperSet: "timeseries",
  paper: "Chronos",
  sentences: [
    {
      id: "chron-post-1",
      statement:
        "Chronos는 시계열 값을 평균 절댓값으로 스케일링한 후 고정 크기의 이산 어휘로 양자화하여 토큰화한다.",
      isNoise: false,
      errorType: "none",
      evidenceQuote:
        "We scale each time series by its mean absolute value and quantize the scaled values into bins to obtain discrete tokens.",
      evidencePage: 2
    },
    {
      id: "chron-post-2",
      statement:
        "Chronos는 시계열 예측에 적합하도록 조정된 T5 계열 아키텍처를 기반으로 구축된다.",
      isNoise: false,
      errorType: "none",
      evidenceQuote:
        "We use the T5 architecture family as the backbone for Chronos models, ranging from 20M to 710M parameters.",
      evidencePage: 3
    },
    {
      id: "chron-post-3",
      statement:
        "Chronos는 학습 코퍼스에 포함된 데이터셋에서 평가할 때 해당 데이터셋에 특화되어 학습된 방법보다 성능이 현저히 낮다.",
      isNoise: true,
      errorType: "direction",
      evidenceQuote:
        "On in-distribution benchmarks, Chronos significantly outperforms methods trained specifically on those datasets.",
      evidencePage: 5,
      correctedStatement:
        "Chronos는 학습 코퍼스에 포함된 벤치마크에서 특화 학습 방법을 현저하게 능가하는 성능을 보인다.",
      explanation:
        "논문은 인-디스트리뷰션 벤치마크에서 Chronos가 특화 방법을 크게 능가한다고 보고한다. 방향이 반전된 오류다."
    },
    {
      id: "chron-post-4",
      statement:
        "Chronos는 언어 모델과 동일한 방식으로 토큰화된 시계열에 대해 교차 엔트로피 손실을 사용하여 학습된다.",
      isNoise: false,
      errorType: "none",
      evidenceQuote:
        "We train Chronos using cross-entropy loss on tokenized time series, treating it as a next-token prediction task.",
      evidencePage: 3
    },
    {
      id: "chron-post-5",
      statement:
        "Chronos는 연속 시계열 값을 토큰화하는 방식이 우수한 성능의 유일한 원인임을 증명하며, 동일한 방식을 사용하는 모든 모델이 동일한 결과를 달성한다.",
      isNoise: true,
      errorType: "causality",
      evidenceQuote:
        "Tokenization is one design choice; performance also depends on pre-training data scale, model size, and training procedure.",
      evidencePage: 2,
      correctedStatement:
        "토큰화는 Chronos의 핵심 설계 선택 중 하나이며, 사전 학습 데이터 규모와 모델 아키텍처도 성능에 기여한다.",
      explanation:
        "논문은 성능을 토큰화 외에도 여러 요인에 귀속시킨다. '유일한 원인'이며 '모든 모델이 동일한 결과'라는 것은 인과관계 오류다."
    },
    {
      id: "chron-post-6",
      statement:
        "Chronos는 일반화를 향상시키기 위해 실제 데이터와 가우시안 프로세스로 생성된 합성 시계열 데이터를 사전 학습에 함께 활용한다.",
      isNoise: false,
      errorType: "none",
      evidenceQuote:
        "We augment the pre-training corpus with synthetic data generated via Gaussian processes to improve generalization.",
      evidencePage: 2
    },
    {
      id: "chron-post-7",
      statement:
        "Chronos의 토큰화 방식은 불규칙, 이벤트 기반, 다변량 시계열을 포함한 모든 유형의 시계열에서 성능 저하 없이 동등하게 작동한다.",
      isNoise: true,
      errorType: "scope",
      evidenceQuote:
        "Chronos is primarily evaluated on univariate time series; its effectiveness on irregular or multivariate series is not fully explored in this paper.",
      evidencePage: 4,
      correctedStatement:
        "Chronos는 주로 단변량 시계열에서 평가되었으며, 논문은 모든 시계열 유형에 대한 보편적 적용 가능성을 주장하지 않는다.",
      explanation:
        "논문은 단변량 예측에 초점을 맞춘다. 다변량·불규칙 시계열에서도 성능 저하 없이 동등하다는 것은 범위 과장 오류다."
    },
    {
      id: "chron-post-8",
      statement:
        "Chronos는 42개 벤치마크 데이터셋에서 평가되어 인-디스트리뷰션에서의 강력한 성능과 아웃-오브-디스트리뷰션에서의 경쟁력 있는 제로샷 성능을 모두 보인다.",
      isNoise: false,
      errorType: "none",
      evidenceQuote:
        "We benchmark Chronos on 42 datasets; Chronos significantly outperforms on in-distribution datasets and achieves comparable zero-shot performance on out-of-distribution ones.",
      evidencePage: 4
    }
  ]
};

// ─────────────────────────────────────────────────────────────
// FSO Link Budget  (광통신 그룹 사전 테스트 + 개입)
// ─────────────────────────────────────────────────────────────
const fsoPre: SentenceSet = {
  phase: "pre",
  paperSet: "optical",
  paper: "FSO Link Budget",
  sentences: [
    {
      id: "fso-pre-1",
      statement:
        "FSO 링크 버짓은 송신 광학 이득, 자유 공간 기하학적 손실, 대기 감쇠, 지향 오차 손실, 수신 광학 이득을 모두 포함하여 수신 전력을 계산한다.",
      isNoise: false,
      errorType: "none",
      evidenceQuote:
        "The link budget accounts for transmitted power, transmit optics gain, free-space geometric loss, atmospheric attenuation, pointing error loss, and receive aperture gain.",
      evidencePage: 2
    },
    {
      id: "fso-pre-2",
      statement:
        "1550 nm 파장은 대기 흡수가 상대적으로 낮고 성숙한 광통신 부품이 풍부하며 눈 안전 규정을 만족하여 FSO 위성 통신에서 널리 사용된다.",
      isNoise: false,
      errorType: "none",
      evidenceQuote:
        "1550 nm is a preferred wavelength for FSO due to low atmospheric absorption, availability of mature telecom components, and compliance with eye safety standards.",
      evidencePage: 2
    },
    {
      id: "fso-pre-3",
      statement:
        "FSO 시스템에서 빔 발산각을 크게 하면 수신기에서 더 넓은 면적에 걸쳐 에너지가 집중되어 수신 신호 전력이 향상된다.",
      isNoise: true,
      errorType: "direction",
      evidenceQuote:
        "Increasing beam divergence spreads the transmitted energy over a larger area, reducing the power density at the receiver and thus decreasing received signal power.",
      evidencePage: 3,
      correctedStatement:
        "FSO 시스템에서 빔 발산각을 크게 하면 에너지가 넓은 면적에 분산되어 수신기에서의 신호 전력 밀도가 감소한다.",
      explanation:
        "빔 발산각이 클수록 에너지가 더 넓은 면적으로 퍼지므로 수신기에서 포착하는 전력이 줄어든다. 방향성이 반전된 오류다."
    },
    {
      id: "fso-pre-4",
      statement:
        "FSO 위성 링크의 기하학적 손실은 전송 거리, 빔 발산각, 수신 구경 크기에 의해 결정된다.",
      isNoise: false,
      errorType: "none",
      evidenceQuote:
        "Geometric loss depends on the transmission distance, beam divergence angle, and receiver aperture diameter.",
      evidencePage: 3
    },
    {
      id: "fso-pre-5",
      statement:
        "FSO 위성 링크는 맑은 날씨 조건에서 대기 손실이 완전히 제거되므로 링크 마진을 따로 설정할 필요가 없다.",
      isNoise: true,
      errorType: "scope",
      evidenceQuote:
        "Even under clear sky, residual molecular absorption and Rayleigh scattering contribute atmospheric loss; link margin must account for these and for unexpected weather variations.",
      evidencePage: 4,
      correctedStatement:
        "맑은 날씨에서도 분자 흡수와 레일리 산란 등의 잔류 대기 손실이 존재하며, 링크 마진은 이를 포함한 다양한 운용 변동성을 고려해야 한다.",
      explanation:
        "맑은 날씨가 대기 손실을 최소화하지만 완전히 제거하지는 않는다. 또한 갑작스러운 기상 변화를 대비한 마진이 항상 필요하다."
    },
    {
      id: "fso-pre-6",
      statement:
        "FSO 위성 링크의 지향 오차 손실은 위성 자세 불확실성, 기계적 진동, 송수신기 간 각도 추적 오류에 의해 발생한다.",
      isNoise: false,
      errorType: "none",
      evidenceQuote:
        "Pointing loss arises from satellite attitude uncertainty, structural vibrations, and angular tracking errors between the transmitter and receiver.",
      evidencePage: 3
    },
    {
      id: "fso-pre-7",
      statement:
        "대형 수신 구경을 사용하면 대기 난류 효과가 직접적으로 억제되며, 이것이 지상국에서 대형 망원경을 사용하는 유일한 이유임이 증명되었다.",
      isNoise: true,
      errorType: "causality",
      evidenceQuote:
        "Larger receive apertures collect more optical power and provide aperture averaging to partially mitigate turbulence-induced intensity fluctuations, but they also improve SNR through increased collection area.",
      evidencePage: 4,
      correctedStatement:
        "대형 수신 구경은 더 많은 광 전력을 수집하고 구경 평균화를 통해 난류 유발 강도 변동을 부분적으로 완화하며, 이는 SNR 향상의 여러 이유 중 하나다.",
      explanation:
        "대형 구경은 전력 수집 증가와 구경 평균화 두 가지 이점을 제공한다. '직접적으로 억제'하고 '유일한 이유'라는 표현은 인과관계를 과장한 오류다."
    },
    {
      id: "fso-pre-8",
      statement:
        "링크 마진은 수신기 최소 감도 임계값 대비 초과 수신 전력으로 정의되며, 환경 및 시스템 변동성을 흡수하는 설계 여유를 나타낸다.",
      isNoise: false,
      errorType: "none",
      evidenceQuote:
        "Link margin represents the excess received power above the minimum detector sensitivity threshold, providing design margin to absorb environmental and system variations.",
      evidencePage: 4
    }
  ]
};

const fsoFiltering: SentenceSet = {
  phase: "filtering",
  paperSet: "optical",
  paper: "FSO Link Budget",
  sentences: [
    {
      id: "fso-fil-1",
      statement:
        "FSO 시스템의 대기 감쇠는 분자 흡수, 에어로졸 산란, 안개와 강우 같은 기상 현상을 포함하는 복합적인 요인으로 구성된다.",
      isNoise: false,
      errorType: "none",
      evidenceQuote:
        "Atmospheric attenuation in FSO systems includes contributions from molecular absorption, aerosol scattering, and weather-dependent phenomena such as fog and rain.",
      evidencePage: 3
    },
    {
      id: "fso-fil-2",
      statement:
        "이 논문에서 제시한 링크 버짓 분석은 동적 기상 전이를 포함한 모든 대기 현상을 완전히 반영하여 모든 운용 조건에서 완벽한 시스템 설계를 가능하게 한다.",
      isNoise: true,
      errorType: "limitation",
      evidenceQuote:
        "The link budget framework is based on representative atmospheric conditions; modeling of time-varying weather transitions involves simplifications and acknowledged limitations.",
      evidencePage: 5,
      correctedStatement:
        "제시된 링크 버짓 분석은 대표적인 대기 조건을 기반으로 하며, 동적 기상 전이 모델링에는 단순화와 한계가 수반된다고 논문에서 명시한다.",
      explanation:
        "논문은 시간 변화 대기 조건 모델링의 한계를 명시적으로 인정한다. '완전히 반영'하고 '완벽한 설계를 가능하게 한다'는 한계점을 삭제한 오류다."
    },
    {
      id: "fso-fil-3",
      statement:
        "LEO 위성 FSO 하향 링크에서 기하학적 경로 손실은 위성 궤도 고도와 작은 수신 구경으로 인해 수십 데시벨 수준에 이른다.",
      isNoise: false,
      errorType: "none",
      evidenceQuote:
        "For LEO satellite FSO downlinks, geometric path loss is typically on the order of tens of decibels due to orbital altitude and small receiver aperture.",
      evidencePage: 3
    },
    {
      id: "fso-fil-4",
      statement:
        "FSO 링크의 수신 전력은 송신 전력에 송신 광학계, 자유 공간 전파, 대기 효과, 수신 광학계의 이득과 손실을 모두 곱하여 계산한다.",
      isNoise: false,
      errorType: "none",
      evidenceQuote:
        "Received power is calculated by multiplying transmitted power by the gains and losses of transmit optics, free-space propagation, atmospheric effects, and receive optics.",
      evidencePage: 2
    },
    {
      id: "fso-fil-5",
      statement:
        "이 논문의 링크 버짓 분석은 FSO 위성 통신 시스템이 모든 대기 및 운용 조건에서 RF 시스템보다 항상 우수한 데이터 전송률과 신뢰성을 달성함을 증명한다.",
      isNoise: true,
      errorType: "scope",
      evidenceQuote:
        "FSO offers higher bandwidth potential under favorable conditions but is susceptible to severe weather; direct comparison with RF depends on the specific scenario and is not the focus of this analysis.",
      evidencePage: 1,
      correctedStatement:
        "FSO는 유리한 대기 조건에서 높은 대역폭 잠재력을 제공하지만 악천후에 취약하며, RF와의 성능 비교는 특정 시나리오에 따라 달라진다.",
      explanation:
        "논문은 RF 대비 FSO의 절대적 우위를 주장하지 않는다. 안개·강우 등 악천후에서 FSO 성능이 크게 저하된다는 점을 무시한 범위 과장 오류다."
    },
    {
      id: "fso-fil-6",
      statement:
        "FSO 시스템의 파장 선택은 대기 투과 창, 부품 가용성, 눈 안전 규정, 검출기 감도 사이의 상충 관계를 포함한다.",
      isNoise: false,
      errorType: "none",
      evidenceQuote:
        "Wavelength selection involves trade-offs between atmospheric transmission windows, component availability, eye safety regulations, and detector sensitivity.",
      evidencePage: 2
    }
  ]
};

// ─────────────────────────────────────────────────────────────
// FSO Performance Analysis  (광통신 그룹 사후 테스트)
// 짝 논문: FSO Satellite Networks Performance Analysis
//         (Transmission Power, Latency, Outage Probability)
// ─────────────────────────────────────────────────────────────
const fsoPerfPost: SentenceSet = {
  phase: "post",
  paperSet: "optical",
  paper: "FSO Performance Analysis",
  sentences: [
    {
      id: "fsop-post-1",
      statement:
        "FSO 위성 네트워크에서 아웃티지 확률은 순간 SNR이 요구 임계값 이하로 떨어지는 확률로 정의되며, 링크 불가용성을 나타낸다.",
      isNoise: false,
      errorType: "none",
      evidenceQuote:
        "Outage probability is defined as the probability that the instantaneous SNR falls below a required threshold, representing link unavailability.",
      evidencePage: 2
    },
    {
      id: "fsop-post-2",
      statement:
        "대기 난류는 수신 광신호에 강도 변동(신틸레이션)을 유발하며, 약한 난류에는 로그 정규 분포, 중간에서 강한 난류에는 감마-감마 분포로 모델링할 수 있다.",
      isNoise: false,
      errorType: "none",
      evidenceQuote:
        "Atmospheric turbulence causes intensity fluctuations modeled by lognormal distributions for weak turbulence and Gamma-Gamma distributions for moderate-to-strong turbulence.",
      evidencePage: 3
    },
    {
      id: "fsop-post-3",
      statement:
        "리토프 분산이 높을수록 신호 변동이 여러 간섭 시간에 걸쳐 평균화되므로 FSO 링크의 아웃티지 확률이 감소한다.",
      isNoise: true,
      errorType: "direction",
      evidenceQuote:
        "Stronger atmospheric turbulence (higher Rytov variance) leads to deeper fading events and higher outage probability in FSO links.",
      evidencePage: 4,
      correctedStatement:
        "리토프 분산이 높을수록 FSO 링크에서 더 깊은 페이딩 이벤트가 발생하여 아웃티지 확률이 증가한다.",
      explanation:
        "강한 난류(높은 리토프 분산)는 더 깊고 빈번한 신호 감쇠를 유발해 아웃티지 확률을 높인다. 방향이 반전된 오류다."
    },
    {
      id: "fsop-post-4",
      statement:
        "FSO 위성 네트워크에서 전력 제어는 변화하는 대기 감쇠 조건에서 요구 링크 마진을 유지하기 위해 활용될 수 있다.",
      isNoise: false,
      errorType: "none",
      evidenceQuote:
        "Transmission power control can be used to maintain the required link margin under varying atmospheric attenuation conditions.",
      evidencePage: 4
    },
    {
      id: "fsop-post-5",
      statement:
        "감마-감마 난류 모델을 사용한다는 것은 모든 강한 난류 조건에서 FSO 링크가 신뢰할 수 없음을 직접적으로 증명하며, FSO가 위성 통신에 부적합함을 의미한다.",
      isNoise: true,
      errorType: "causality",
      evidenceQuote:
        "The Gamma-Gamma model characterizes intensity fluctuation statistics under moderate-to-strong turbulence and enables statistical performance analysis for system design; reliability depends on system parameters and design margins.",
      evidencePage: 3,
      correctedStatement:
        "감마-감마 모델은 중간에서 강한 난류 하에서의 강도 변동 통계를 정확히 묘사하며, 실제 신뢰성은 시스템 설계 마진과 파라미터에 따라 달라진다.",
      explanation:
        "통계 모델의 채택이 시스템 부적합성을 증명하지는 않는다. 설계 여유를 충분히 확보하면 FSO 위성 링크도 신뢰할 수 있다. 인과관계 오류다."
    },
    {
      id: "fsop-post-6",
      statement:
        "FSO 위성 네트워크의 지연은 빛의 속도로 나눈 거리에 해당하는 전파 지연과 지상국 및 위성에서의 처리 지연을 포함한다.",
      isNoise: false,
      errorType: "none",
      evidenceQuote:
        "Latency includes propagation delay (distance divided by the speed of light) and processing delays at ground stations and on-board the satellite.",
      evidencePage: 5
    },
    {
      id: "fsop-post-7",
      statement:
        "이 논문의 아웃티지 확률 분석은 충분한 송신 전력을 적용하면 난류 조건과 무관하게 FSO 위성 네트워크의 아웃티지 확률을 0으로 만들 수 있음을 보여준다.",
      isNoise: true,
      errorType: "scope",
      evidenceQuote:
        "Increasing transmission power reduces outage probability; however, stochastic turbulence ensures residual outage probability remains non-zero under strong turbulence conditions.",
      evidencePage: 4,
      correctedStatement:
        "송신 전력 증가는 아웃티지 확률을 감소시키지만, 확률론적 난류 특성으로 인해 강한 난류 조건에서는 잔류 아웃티지 확률이 항상 0보다 크다.",
      explanation:
        "아웃티지 확률은 줄일 수 있지만 확률적 난류 특성상 완전히 0으로 만들 수 없다. '0으로 만들 수 있다'는 것은 범위 과장 오류다."
    },
    {
      id: "fsop-post-8",
      statement:
        "FSO 위성 네트워크의 커버리지 확률은 링크 품질이 최소 성능 요구사항을 충족하는 시간 또는 지리적 면적의 비율을 나타낸다.",
      isNoise: false,
      errorType: "none",
      evidenceQuote:
        "Coverage probability represents the fraction of time or geographical area over which link quality meets minimum performance requirements.",
      evidencePage: 5
    }
  ]
};

// ─────────────────────────────────────────────────────────────
// 인덱스
// ─────────────────────────────────────────────────────────────
export const sentenceSets: SentenceSet[] = [
  ijepaPre,
  ijepaFiltering,
  maePost,
  timesfmPre,
  timesfmFiltering,
  chronosPost,
  fsoPre,
  fsoFiltering,
  fsoPerfPost
];

export function getSentenceSet(
  paperSet: "vision" | "timeseries" | "optical",
  phase: "pre" | "filtering" | "post"
): SentenceSet {
  const set = sentenceSets.find((s) => s.paperSet === paperSet && s.phase === phase);
  if (!set) throw new Error(`SentenceSet not found: ${paperSet}/${phase}`);
  return set;
}
