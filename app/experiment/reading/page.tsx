"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, ExternalLink, ChevronRight, Network } from "lucide-react";
import { useParticipant } from "@/components/use-participant";
import ConceptMap, { type ConceptMapHandle } from "@/components/concept-map";

const PAPER_INFO: Record<"vision" | "timeseries" | "optical", { title: string; pdfUrl: string }> = {
  vision: {
    title: "Self-Supervised Learning from Images with a Joint-Embedding Predictive Architecture (I-JEPA)",
    pdfUrl: "https://arxiv.org/pdf/2301.08243"
  },
  timeseries: {
    title: "A Decoder-Only Foundation Model for Time-Series Forecasting (TimesFM)",
    pdfUrl: "https://arxiv.org/pdf/2310.10688"
  },
  optical: {
    title: "Link Budget Analysis for Free-Space Optical Satellite Networks",
    pdfUrl: "https://arxiv.org/pdf/2204.13177"
  }
};

export default function ReadingPage() {
  const router = useRouter();
  const { me, ready } = useParticipant("reading");
  const [confirmed, setConfirmed] = useState(false);
  const [advancing, setAdvancing] = useState(false);
  const mapRef = useRef<ConceptMapHandle>(null);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <p className="text-stone-500">불러오는 중...</p>
      </div>
    );
  }

  const paper = PAPER_INFO[me!.paperSet];
  const showConceptMap = me!.groupNum === 1;

  async function handleComplete() {
    if (!confirmed) return;
    setAdvancing(true);

    // Group 1: save concept map before advancing
    if (showConceptMap && mapRef.current) {
      const data = mapRef.current.getData();
      await fetch("/api/concept-map", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paperSet: me!.paperSet,
          nodes: data.nodes,
          edges: data.edges,
          nodeCount: data.nodes.length,
          edgeCount: data.edges.length,
          editCount: data.editCount,
          durationSec: data.durationSec
        })
      }).catch(() => null);
    }

    await fetch("/api/session", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ step: "pre-test" })
    });
    router.push("/experiment/pre-test");
  }

  return (
    <main className="flex h-screen flex-col bg-paper">
      {/* 상단 헤더 */}
      <header className="flex shrink-0 items-center justify-between gap-4 border-b border-stone-200 bg-white px-5 py-3 shadow-panel">
        <div className="flex items-center gap-3 min-w-0">
          <BookOpen size={20} className="shrink-0 text-moss" />
          <div className="min-w-0">
            <p className="text-xs text-stone-500">논문 읽기 · 참가자 {me!.participantId}</p>
            <h1 className="truncate text-sm font-semibold text-ink">{paper.title}</h1>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <a
            href={paper.pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 rounded-md border border-stone-300 px-3 py-1.5 text-xs text-stone-600 hover:bg-stone-50"
          >
            <ExternalLink size={13} /> 새 탭에서 열기
          </a>

          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="h-4 w-4 accent-signal"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
            />
            <span className="text-stone-700">논문을 충분히 읽었습니다</span>
          </label>

          <button
            onClick={handleComplete}
            disabled={!confirmed || advancing}
            className="flex items-center gap-1.5 rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-stone-300"
          >
            {advancing ? "저장 중..." : "테스트 시작"} <ChevronRight size={15} />
          </button>
        </div>
      </header>

      {/* 본문 — 개념도 여부에 따라 분할 또는 전체 */}
      <div className="flex flex-1 overflow-hidden">
        {/* PDF 뷰어 */}
        <div className={`relative ${showConceptMap ? "w-[60%]" : "flex-1"} overflow-hidden bg-stone-200`}>
          <iframe
            src={paper.pdfUrl}
            title={paper.title}
            className="h-full w-full border-0 bg-white"
            allowFullScreen
          />
        </div>

        {/* 개념도 패널 (Group 1만) */}
        {showConceptMap && (
          <aside className="flex w-[40%] flex-col gap-0 border-l border-stone-200 bg-white">
            <div className="flex items-center gap-2 border-b border-stone-100 px-4 py-2.5">
              <Network size={16} className="text-moss" />
              <h2 className="text-sm font-bold text-ink">개념도 구성하기</h2>
              <span className="ml-auto text-[10px] text-stone-400">구조도 조건</span>
            </div>
            <div className="flex-1 overflow-hidden px-4 pb-4 pt-3">
              <p className="mb-2 text-xs text-stone-500">
                논문에서 중요한 개념어를 추가하고 관계를 연결해 보세요.
                읽으면서 구성하고, 완료 후 &lsquo;테스트 시작&rsquo;을 클릭하면 자동 저장됩니다.
              </p>
              <div style={{ height: "calc(100% - 36px)" }}>
                <ConceptMap ref={mapRef} />
              </div>
            </div>
          </aside>
        )}
      </div>

      {/* 하단 안내 */}
      <footer className="shrink-0 border-t border-stone-200 bg-white px-5 py-2 text-center text-xs text-stone-400">
        논문을 충분히 읽은 후 체크박스에 표시하고 &lsquo;테스트 시작&rsquo;을 클릭하세요.
        PDF가 로드되지 않으면 &lsquo;새 탭에서 열기&rsquo;를 이용해 주세요.
      </footer>
    </main>
  );
}
