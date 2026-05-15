"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  addEdge,
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Connection,
  type Edge,
  type Node
} from "@xyflow/react";
import {
  AlertTriangle,
  FileUp,
  Lightbulb,
  Link2,
  MousePointer2,
  Search,
  ZoomIn,
  ZoomOut
} from "lucide-react";
import { sampleAnalysis } from "@/lib/sample-analysis";
import type { Evidence, GatewayItem, KnowledgeFragment, SummarySentence } from "@/lib/schemas";
import {
  calculateEngagementScore,
  coachingQuestions,
  getEngagementLevel,
  shouldShowCoachingQuestion
} from "@/lib/engagement";

const relationLabels = ["정의한다", "뒷받침한다", "반박한다", "원인이다", "결과이다", "방법이다", "한계이다", "예시이다"];
const tabs = ["지식 파편", "구조화 캔버스", "검증 게이트웨이", "조건부 요약", "메모"] as const;

type Tab = (typeof tabs)[number];
type SummaryVerification = SummarySentence["userVerification"];

function typeLabel(type: KnowledgeFragment["type"]) {
  return {
    concept: "개념",
    claim: "주장",
    method: "방법",
    result: "결과",
    limitation: "한계",
    implication: "시사점"
  }[type];
}

function DashboardMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-[104px] border-l border-stone-200 px-3">
      <div className="text-[11px] text-stone-500">{label}</div>
      <div className="mt-1 text-sm font-semibold text-ink">{value}</div>
    </div>
  );
}

function EvidencePanel({ evidence, onClear }: { evidence?: Evidence; onClear: () => void }) {
  if (!evidence) {
    return (
      <div className="rounded-md border border-dashed border-stone-300 bg-white/70 p-4 text-sm text-stone-600">
        카드나 요약 문장을 클릭하면 이곳에 원문 근거가 표시됩니다. PDF bbox 데이터는 유지되며, 1차 프로토타입에서는 근거 문장 패널로 대체합니다.
      </div>
    );
  }

  return (
    <div className="rounded-md border-2 border-signal bg-blue-50 p-4 shadow-panel">
      <div className="flex items-center justify-between gap-3">
        <div className="text-xs font-semibold text-signal">
          {evidence.id} · {evidence.page}쪽 · {evidence.sectionTitle ?? "섹션 미상"}
        </div>
        <button className="text-xs text-stone-500 hover:text-ink" onClick={onClear}>
          닫기
        </button>
      </div>
      <p className="mt-2 text-sm leading-6 text-ink">“{evidence.quote}”</p>
      {evidence.bbox ? (
        <div className="mt-2 text-xs text-stone-500">
          bbox x:{evidence.bbox.x}, y:{evidence.bbox.y}, w:{evidence.bbox.width}, h:{evidence.bbox.height}
        </div>
      ) : null}
    </div>
  );
}

function KnowledgeCard({
  fragment,
  evidence,
  onEvidence,
  onAdd
}: {
  fragment: KnowledgeFragment;
  evidence?: Evidence;
  onEvidence: (id: string) => void;
  onAdd: (fragment: KnowledgeFragment) => void;
}) {
  return (
    <article
      draggable
      onDragStart={(event) => {
        event.dataTransfer.setData("application/reactflow", fragment.id);
        event.dataTransfer.effectAllowed = "move";
      }}
      className="rounded-md border border-stone-200 bg-white p-3 shadow-panel"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-ink">{fragment.label}</h3>
          <p className="mt-1 text-xs text-stone-600">{fragment.description}</p>
        </div>
        <span className="rounded border border-stone-200 bg-stone-50 px-2 py-1 text-[11px] text-stone-700">
          {typeLabel(fragment.type)}
        </span>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-stone-600">
        <span>{evidence?.page ?? "-"}쪽</span>
        <span>신뢰도 {Math.round(fragment.confidence * 100)}%</span>
        <span>난이도 {fragment.difficulty}</span>
      </div>
      <div className="mt-3 flex gap-2">
        <button
          className="inline-flex items-center gap-1 rounded-md border border-stone-300 px-2 py-1 text-xs hover:bg-stone-50"
          onClick={() => onEvidence(fragment.evidenceIds[0])}
        >
          <Search size={14} /> 근거 보기
        </button>
        <button
          className="inline-flex items-center gap-1 rounded-md bg-ink px-2 py-1 text-xs text-white hover:bg-stone-700"
          onClick={() => onAdd(fragment)}
        >
          <MousePointer2 size={14} /> 캔버스 추가
        </button>
      </div>
    </article>
  );
}

type CanvasProps = {
  fragments: KnowledgeFragment[];
  evidences: Evidence[];
  onEvidence: (id: string) => void;
  onAction: () => void;
  onStatsChange: (nodes: number, edges: number) => void;
};

function GatewayModal({
  items,
  selectedEvidence,
  onEvidence,
  onClose,
  onResult
}: {
  items: GatewayItem[];
  selectedEvidence?: Evidence;
  onEvidence: (id: string) => void;
  onClose: () => void;
  onResult: (correct: boolean) => void;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);
  const noise = items.find((item) => item.isNoise);

  function submit() {
    const correct = selectedId === noise?.id;
    setResult(correct ? "correct" : "wrong");
    onResult(correct);
    const target = correct ? noise : items.find((item) => item.id === selectedId);
    if (target?.evidenceIds[0]) onEvidence(target.evidenceIds[0]);
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/45 p-4">
      <section className="w-full max-w-3xl rounded-lg bg-paper p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-ink">검증 게이트웨이</h2>
            <p className="mt-1 text-sm text-stone-600">4개 문장 중 원문과 상치되는 미세한 오류를 고르세요.</p>
          </div>
          <button className="rounded-md border border-stone-300 px-3 py-1 text-sm" onClick={onClose}>
            닫기
          </button>
        </div>
        <div className="mt-4 grid gap-3">
          {items.map((item) => (
            <label
              key={item.id}
              className={`rounded-md border bg-white p-3 text-sm ${
                selectedId === item.id ? "border-signal ring-2 ring-blue-100" : "border-stone-200"
              }`}
            >
              <input
                className="mr-2"
                type="radio"
                name="gateway"
                checked={selectedId === item.id}
                onChange={() => setSelectedId(item.id)}
              />
              {item.statement}
            </label>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between gap-3">
          <button
            className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-stone-300"
            disabled={!selectedId}
            onClick={submit}
          >
            확인
          </button>
          {selectedEvidence ? <span className="text-xs text-stone-500">현재 근거: {selectedEvidence.id}</span> : null}
        </div>
        {result === "correct" && noise ? (
          <div className="mt-4 rounded-md border border-green-300 bg-green-50 p-3 text-sm text-green-900">
            <strong>검증 성공: 이제 요약을 볼 수 있습니다.</strong>
            <p className="mt-2">{noise.explanation}</p>
            <p className="mt-1">정정 문장: {noise.correctedStatement}</p>
          </div>
        ) : null}
        {result === "wrong" ? (
          <div className="mt-4 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
            <strong>다시 원문 근거를 확인해보세요.</strong>
            <p className="mt-1">선택한 문장의 evidence를 왼쪽 근거 패널에 표시했습니다.</p>
          </div>
        ) : null}
      </section>
    </div>
  );
}

function PaperLoopApp() {
  const [activeTab, setActiveTab] = useState<Tab>("지식 파편");
  const [documentName, setDocumentName] = useState("데모 논문");
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [zoom, setZoom] = useState(100);
  const [analysis, setAnalysis] = useState(sampleAnalysis);
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<string | null>("ev-1");
  const [gatewayOpen, setGatewayOpen] = useState(false);
  const [summaryUnlocked, setSummaryUnlocked] = useState(false);
  const [summaryVerification, setSummaryVerification] = useState<Record<string, SummaryVerification>>({});
  const [mismatchNotes, setMismatchNotes] = useState<Record<string, string>>({});
  const [memo, setMemo] = useState("");
  const [stats, setStats] = useState({
    actionsInLast5Minutes: 0,
    gatewayAttempts: 0,
    correctGatewayAnswers: 0,
    placedNodes: 0,
    createdEdges: 0,
    checkedEvidenceCount: 0
  });

  const section = analysis.sections[0];
  const selectedEvidence = section.evidences.find((item) => item.id === selectedEvidenceId);
  const checkedEvidenceCount = new Set(
    Object.entries(summaryVerification)
      .filter(([, value]) => Boolean(value))
      .flatMap(([summaryId]) => section.summary.find((sentence) => sentence.id === summaryId)?.evidenceIds ?? [])
  ).size;
  const engagementScore = calculateEngagementScore({
    ...stats,
    checkedEvidenceCount,
    summarySentenceCount: section.summary.length
  });
  const structureReady = stats.placedNodes >= 5 && stats.createdEdges >= 3 && checkedEvidenceCount >= 3;
  const coachingQuestion = coachingQuestions[engagementScore % coachingQuestions.length];

  const registerAction = useCallback(() => {
    setStats((current) => ({
      ...current,
      actionsInLast5Minutes: Math.min(99, current.actionsInLast5Minutes + 1)
    }));
  }, []);

  const selectEvidence = useCallback(
    (id: string) => {
      setSelectedEvidenceId(id);
      registerAction();
    },
    [registerAction]
  );

  const updateCanvasStats = useCallback((placedNodes: number, createdEdges: number) => {
    setStats((current) => {
      if (current.placedNodes === placedNodes && current.createdEdges === createdEdges) return current;
      return { ...current, placedNodes, createdEdges };
    });
  }, []);

  const evidenceById = useMemo(() => new Map(section.evidences.map((item) => [item.id, item])), [section.evidences]);

  async function handlePdfUpload(file?: File) {
    if (!file) return;
    setDocumentName(file.name);
    setPdfUrl(URL.createObjectURL(file));
    registerAction();

    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: `${file.name}\nPDF 텍스트 추출은 다음 단계에서 PDF.js chunking으로 확장됩니다.` })
    });
    setAnalysis(await response.json());
  }

  function updateSummaryVerification(id: string, value: SummaryVerification) {
    setSummaryVerification((current) => ({ ...current, [id]: value }));
    const evidenceId = section.summary.find((sentence) => sentence.id === id)?.evidenceIds[0];
    if (evidenceId) setSelectedEvidenceId(evidenceId);
    registerAction();
  }

  return (
    <main className="min-h-screen bg-paper">
      <header className="sticky top-0 z-30 border-b border-stone-200 bg-white/95 backdrop-blur">
        <div className="flex min-h-20 flex-wrap items-center justify-between gap-3 px-5 py-3">
          <div>
            <h1 className="text-xl font-bold text-ink">논문 독해 헬퍼</h1>
            <p className="mt-1 text-sm text-stone-600">{documentName}</p>
          </div>
          <div className="flex flex-wrap items-center gap-1">
            <div className="mr-2 rounded-md border border-stone-200 bg-paper px-3 py-2">
              <div className="text-[11px] text-stone-500">인지 참여도</div>
              <div className="text-lg font-bold text-ink">
                {engagementScore} <span className="text-sm text-moss">{getEngagementLevel(engagementScore)}</span>
              </div>
            </div>
            <DashboardMetric label="상호작용 빈도" value={`${stats.actionsInLast5Minutes}/12`} />
            <DashboardMetric
              label="오류 탐지 정확도"
              value={`${stats.correctGatewayAnswers}/${Math.max(1, stats.gatewayAttempts)}`}
            />
            <DashboardMetric label="구조화 진행률" value={`${stats.placedNodes}N ${stats.createdEdges}E`} />
            <DashboardMetric label="원문 대조율" value={`${checkedEvidenceCount}/${section.summary.length}`} />
          </div>
        </div>
        {shouldShowCoachingQuestion(engagementScore) ? (
          <div className="flex items-center gap-2 border-t border-amber-200 bg-amber-50 px-5 py-2 text-sm text-amber-900">
            <Lightbulb size={16} /> {coachingQuestion}
          </div>
        ) : null}
      </header>

      <div className="grid min-h-[calc(100vh-92px)] grid-cols-1 gap-4 p-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <section className="grid min-h-[720px] grid-rows-[auto_1fr_auto] gap-3">
          <div className="rounded-md border border-stone-200 bg-white p-3 shadow-panel">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-ink px-3 py-2 text-sm font-semibold text-white">
                <FileUp size={16} /> PDF 업로드
                <input
                  className="sr-only"
                  type="file"
                  accept="application/pdf"
                  onChange={(event) => handlePdfUpload(event.target.files?.[0])}
                />
              </label>
              <div className="flex items-center gap-2">
                <button
                  className="rounded-md border border-stone-300 p-2"
                  aria-label="축소"
                  onClick={() => setZoom((value) => Math.max(75, value - 10))}
                >
                  <ZoomOut size={16} />
                </button>
                <span className="w-12 text-center text-sm">{zoom}%</span>
                <button
                  className="rounded-md border border-stone-300 p-2"
                  aria-label="확대"
                  onClick={() => setZoom((value) => Math.min(140, value + 10))}
                >
                  <ZoomIn size={16} />
                </button>
              </div>
            </div>
          </div>
          <div className="overflow-hidden rounded-md border border-stone-300 bg-stone-100">
            {pdfUrl ? (
              <iframe className="pdf-frame" title="PDF 원문" src={`${pdfUrl}#zoom=${zoom}`} />
            ) : (
              <div className="grid h-full place-items-center p-8 text-center">
                <div>
                  <FileUp className="mx-auto text-stone-400" size={48} />
                  <p className="mt-3 text-lg font-semibold">PDF를 업로드하면 원문 뷰어가 표시됩니다.</p>
                  <p className="mt-2 text-sm text-stone-600">
                    데모 분석 데이터는 즉시 사용할 수 있으며, 실제 PDF 텍스트 chunking은 API 구조에 맞춰 확장됩니다.
                  </p>
                </div>
              </div>
            )}
          </div>
          <EvidencePanel evidence={selectedEvidence} onClear={() => setSelectedEvidenceId(null)} />
        </section>

        <section className="grid min-h-[720px] grid-rows-[auto_1fr] gap-3">
          <nav className="flex flex-wrap gap-2 rounded-md border border-stone-200 bg-white p-2 shadow-panel">
            {tabs.map((tab) => (
              <button
                key={tab}
                className={`rounded-md px-3 py-2 text-sm ${
                  activeTab === tab ? "bg-ink text-white" : "text-stone-700 hover:bg-stone-100"
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </nav>

          <div className="min-h-0 overflow-auto rounded-md border border-stone-200 bg-white p-4 shadow-panel">
            {activeTab === "지식 파편" ? (
              <div className="grid gap-3 md:grid-cols-2">
                {section.fragments.map((fragment) => (
                  <KnowledgeCard
                    key={fragment.id}
                    fragment={fragment}
                    evidence={evidenceById.get(fragment.evidenceIds[0])}
                    onEvidence={selectEvidence}
                    onAdd={(item) => {
                      setActiveTab("구조화 캔버스");
                      window.setTimeout(() => {
                        const event = new CustomEvent("paperloop:add-node", { detail: item.id });
                        window.dispatchEvent(event);
                      }, 0);
                    }}
                  />
                ))}
              </div>
            ) : null}

            {activeTab === "구조화 캔버스" ? (
              <ReactFlowProvider>
                <CanvasWithExternalAdd
                  fragments={section.fragments}
                  evidences={section.evidences}
                  onEvidence={selectEvidence}
                  onAction={registerAction}
                  onStatsChange={updateCanvasStats}
                />
              </ReactFlowProvider>
            ) : null}

            {activeTab === "검증 게이트웨이" ? (
              <div className="space-y-4">
                <div className="rounded-md border border-stone-200 bg-stone-50 p-4">
                  <h2 className="font-semibold">요약 공개 조건</h2>
                  <p className="mt-2 text-sm text-stone-600">
                    노드 5개, 관계 3개, 근거 확인 3개 이상을 완료한 뒤 오류 문장을 찾아야 합니다.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2 text-sm">
                    <span className={stats.placedNodes >= 5 ? "text-green-700" : "text-rust"}>노드 {stats.placedNodes}/5</span>
                    <span className={stats.createdEdges >= 3 ? "text-green-700" : "text-rust"}>관계 {stats.createdEdges}/3</span>
                    <span className={checkedEvidenceCount >= 3 ? "text-green-700" : "text-rust"}>
                      근거 확인 {checkedEvidenceCount}/3
                    </span>
                  </div>
                </div>
                <button
                  className="inline-flex items-center gap-2 rounded-md bg-ink px-4 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:bg-stone-300"
                  disabled={!structureReady}
                  onClick={() => setGatewayOpen(true)}
                >
                  <AlertTriangle size={16} /> 검증 게이트웨이 열기
                </button>
                {summaryUnlocked ? (
                  <p className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-900">
                    검증 성공: 이제 조건부 요약 탭에서 정답 요약을 볼 수 있습니다.
                  </p>
                ) : null}
              </div>
            ) : null}

            {activeTab === "조건부 요약" ? (
              <div className={summaryUnlocked ? "space-y-3" : "pointer-events-none space-y-3 opacity-35 blur-[1px]"}>
                {section.summary.map((sentence) => (
                  <article key={sentence.id} className="rounded-md border border-stone-200 bg-white p-4">
                    <button
                      className="text-left text-sm leading-6 text-ink"
                      onClick={() => selectEvidence(sentence.evidenceIds[0])}
                    >
                      {sentence.sentence}
                    </button>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {sentence.evidenceIds.map((id) => (
                        <button
                          key={id}
                          className="inline-flex items-center gap-1 rounded-md border border-stone-300 px-2 py-1 text-xs"
                          onClick={() => selectEvidence(id)}
                        >
                          <Link2 size={13} /> {id}
                        </button>
                      ))}
                      {(["matched", "uncertain", "mismatched"] as const).map((value) => (
                        <button
                          key={value}
                          className={`rounded-md border px-2 py-1 text-xs ${
                            summaryVerification[sentence.id] === value
                              ? "border-signal bg-blue-50 text-signal"
                              : "border-stone-300"
                          }`}
                          onClick={() => updateSummaryVerification(sentence.id, value)}
                        >
                          {value === "matched" ? "원문과 일치" : value === "uncertain" ? "불확실" : "원문과 불일치"}
                        </button>
                      ))}
                    </div>
                    {summaryVerification[sentence.id] === "mismatched" ? (
                      <textarea
                        className="mt-3 min-h-20 w-full rounded-md border border-stone-300 p-2 text-sm"
                        placeholder="수정 메모를 작성하세요."
                        value={mismatchNotes[sentence.id] ?? ""}
                        onChange={(event) => setMismatchNotes((current) => ({ ...current, [sentence.id]: event.target.value }))}
                      />
                    ) : null}
                  </article>
                ))}
              </div>
            ) : null}

            {activeTab === "메모" ? (
              <textarea
                className="h-full min-h-[560px] w-full rounded-md border border-stone-300 p-3 text-sm"
                placeholder="원문 대조 중 떠오른 질문, 반례, 연결 아이디어를 적어두세요."
                value={memo}
                onChange={(event) => {
                  setMemo(event.target.value);
                  registerAction();
                }}
              />
            ) : null}
          </div>
        </section>
      </div>

      {!summaryUnlocked && activeTab === "조건부 요약" ? (
        <div className="fixed bottom-5 right-5 rounded-md border border-stone-300 bg-white p-4 shadow-xl">
          <div className="flex items-center gap-2 font-semibold">
            <AlertTriangle size={16} /> 요약은 아직 잠겨 있습니다
          </div>
          <p className="mt-1 text-sm text-stone-600">구조화 조건과 검증 게이트웨이를 통과해야 공개됩니다.</p>
        </div>
      ) : null}

      {gatewayOpen ? (
        <GatewayModal
          items={section.gatewayItems}
          selectedEvidence={selectedEvidence}
          onEvidence={selectEvidence}
          onClose={() => setGatewayOpen(false)}
          onResult={(correct) => {
            setStats((current) => ({
              ...current,
              gatewayAttempts: current.gatewayAttempts + 1,
              correctGatewayAnswers: current.correctGatewayAnswers + (correct ? 1 : 0)
            }));
            if (correct) setSummaryUnlocked(true);
          }}
        />
      ) : null}
    </main>
  );
}

function CanvasWithExternalAdd({ fragments, evidences, onEvidence, onAction, onStatsChange }: CanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const { screenToFlowPosition } = useReactFlow();

  const addFragmentNode = useCallback(
    (fragment: KnowledgeFragment, position?: { x: number; y: number }) => {
      setNodes((current) => {
        if (current.some((node) => node.id === fragment.id)) return current;
        const evidence = evidences.find((item) => item.id === fragment.evidenceIds[0]);
        return [
          ...current,
          {
            id: fragment.id,
            position: position ?? { x: 60 + current.length * 24, y: 70 + current.length * 28 },
            data: {
              label: (
                <button
                  className="w-[190px] text-left"
                  onClick={() => onEvidence(fragment.evidenceIds[0])}
                  title="원문 근거 보기"
                >
                  <span className="block text-sm font-semibold">{fragment.label}</span>
                  <span className="mt-1 block text-[11px] text-stone-500">
                    {typeLabel(fragment.type)} · {evidence?.page ?? "-"}쪽
                  </span>
                </button>
              )
            },
            style: { border: "1px solid #c9d5cc", background: "#ffffff", padding: 10, width: 210 }
          }
        ];
      });
      onAction();
    },
    [evidences, onAction, onEvidence, setNodes]
  );

  useEffect(() => {
    onStatsChange(nodes.length, edges.length);
  }, [edges.length, nodes.length, onStatsChange]);

  useEffect(() => {
    function handleExternalAdd(event: Event) {
      const fragmentId = (event as CustomEvent<string>).detail;
      const fragment = fragments.find((item) => item.id === fragmentId);
      if (fragment) addFragmentNode(fragment);
    }
    window.addEventListener("paperloop:add-node", handleExternalAdd);
    return () => window.removeEventListener("paperloop:add-node", handleExternalAdd);
  }, [addFragmentNode, fragments]);

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((current) =>
        addEdge(
          {
            ...connection,
            label: "뒷받침한다",
            type: "smoothstep",
            style: { stroke: "#4d6f5a" },
            labelStyle: { fill: "#17211f", fontWeight: 600 }
          },
          current
        )
      );
      onAction();
    },
    [onAction, setEdges]
  );

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const fragmentId = event.dataTransfer.getData("application/reactflow");
      const fragment = fragments.find((item) => item.id === fragmentId);
      if (!fragment) return;
      addFragmentNode(fragment, screenToFlowPosition({ x: event.clientX, y: event.clientY }));
    },
    [addFragmentNode, fragments, screenToFlowPosition]
  );

  const selectedEdge = edges.find((edge) => edge.id === selectedEdgeId);

  return (
    <div className="grid h-full min-h-[560px] grid-rows-[auto_1fr] gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-stone-200 bg-white p-3">
        <div className="text-sm text-stone-700">
          노드 {nodes.length}/5 · 관계 {edges.length}/3
        </div>
        <div className="flex flex-wrap gap-2">
          {fragments.map((fragment) => (
            <button
              key={fragment.id}
              className="rounded-md border border-stone-300 px-2 py-1 text-xs hover:bg-stone-50"
              onClick={() => addFragmentNode(fragment)}
            >
              {fragment.label}
            </button>
          ))}
        </div>
      </div>
      <div className="relative overflow-hidden rounded-md border border-stone-300 bg-white">
        {selectedEdge ? (
          <div className="absolute right-3 top-3 z-10 rounded-md border border-stone-200 bg-white p-2 shadow-panel">
            <label className="text-xs font-semibold text-stone-600" htmlFor="relation-select">
              관계 라벨
            </label>
            <select
              id="relation-select"
              className="mt-1 block rounded-md border border-stone-300 bg-white px-2 py-1 text-sm"
              value={String(selectedEdge.label)}
              onChange={(event) => {
                setEdges((current) =>
                  current.map((edge) => (edge.id === selectedEdge.id ? { ...edge, label: event.target.value } : edge))
                );
                onAction();
              }}
            >
              {relationLabels.map((label) => (
                <option key={label}>{label}</option>
              ))}
            </select>
          </div>
        ) : null}
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={(event) => {
            event.preventDefault();
            event.dataTransfer.dropEffect = "move";
          }}
          onEdgeClick={(_, edge) => setSelectedEdgeId(edge.id)}
          onPaneClick={() => setSelectedEdgeId(null)}
          fitView
        >
          <Background />
          <Controls />
          <MiniMap pannable zoomable />
        </ReactFlow>
      </div>
    </div>
  );
}

export default function Home() {
  return <PaperLoopApp />;
}
