"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, ExternalLink, ChevronRight } from "lucide-react";
import { useParticipant } from "@/components/use-participant";

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

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <p className="text-stone-500">불러오는 중...</p>
      </div>
    );
  }

  const paper = PAPER_INFO[me!.paperSet];

  async function handleComplete() {
    if (!confirmed) return;
    setAdvancing(true);
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
            {advancing ? "이동 중..." : "테스트 시작"} <ChevronRight size={15} />
          </button>
        </div>
      </header>

      {/* PDF 뷰어 */}
      <div className="relative flex-1 overflow-hidden bg-stone-200">
        <iframe
          src={paper.pdfUrl}
          title={paper.title}
          className="h-full w-full border-0 bg-white"
          allowFullScreen
        />
        {/* iframe 차단 시 fallback */}
        <noscript>
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-stone-100 p-8 text-center">
            <p className="text-stone-600">PDF를 이 창에서 표시할 수 없습니다.</p>
            <a
              href={paper.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md bg-ink px-4 py-2 text-white"
            >
              새 탭에서 논문 열기
            </a>
          </div>
        </noscript>
      </div>

      {/* 하단 안내 */}
      <footer className="shrink-0 border-t border-stone-200 bg-white px-5 py-2 text-center text-xs text-stone-400">
        논문을 충분히 읽은 후 체크박스에 표시하고 &lsquo;테스트 시작&rsquo;을 클릭하세요.
        PDF가 로드되지 않으면 &lsquo;새 탭에서 열기&rsquo;를 이용해 주세요.
      </footer>
    </main>
  );
}
