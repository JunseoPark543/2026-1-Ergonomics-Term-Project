"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CheckCircle, XCircle, AlertCircle, HelpCircle, BookOpen, ChevronRight } from "lucide-react";
import type { Phase, Sentence, UserResponse } from "@/lib/schemas";
import { errorTypeLabel } from "@/lib/scoring";

type Props = {
  participantId: string;
  paperSet: "vision" | "timeseries";
  phase: Phase;
  title: string;
  description: string;
  showScore: boolean;
  onComplete: () => void;
};

type FeedbackState = {
  isCorrect: boolean;
  score: number;
  explanation?: string;
};

const responseOptions: { value: UserResponse; label: string; icon: React.ReactNode }[] = [
  { value: "accept",      label: "수용",      icon: <CheckCircle size={16} /> },
  { value: "reject",      label: "기각",      icon: <XCircle size={16} /> },
  { value: "revise",      label: "수정",      icon: <AlertCircle size={16} /> },
  { value: "insufficient", label: "근거 부족", icon: <HelpCircle size={16} /> }
];

export default function FilteringSession({ participantId, paperSet, phase, title, description, showScore, onComplete }: Props) {
  const [sentences, setSentences] = useState<Sentence[]>([]);
  const [paper, setPaper] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedResponse, setSelectedResponse] = useState<UserResponse | null>(null);
  const [revision, setRevision] = useState("");
  const [confidence, setConfidence] = useState(3);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [totalScore, setTotalScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    fetch(`/api/sentence-set?paperSet=${paperSet}&phase=${phase}`)
      .then((r) => r.json())
      .then((data) => {
        setSentences(data.sentences);
        setPaper(data.paper);
        setLoading(false);
      });
  }, [paperSet, phase]);

  const currentSentence = sentences[currentIndex];
  const isLast = currentIndex === sentences.length - 1;

  const resetForNext = useCallback(() => {
    setSelectedResponse(null);
    setRevision("");
    setConfidence(3);
    setFeedback(null);
    startTimeRef.current = Date.now();
  }, []);

  async function handleSubmit() {
    if (!selectedResponse || !currentSentence) return;
    setSubmitting(true);
    const responseTimeMs = Date.now() - startTimeRef.current;

    const res = await fetch("/api/responses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "filtering",
        paperSet,
        phase,
        sentenceId: currentSentence.id,
        userResponse: selectedResponse,
        userRevision: selectedResponse === "revise" ? revision : undefined,
        confidence,
        responseTimeMs
      })
    });
    const result = await res.json() as { isCorrect: boolean; score: number; explanation?: string };
    setTotalScore((s) => s + result.score);

    if (showScore) {
      setFeedback(result);
    } else {
      advance(result.score);
    }
    setSubmitting(false);
  }

  function advance(score?: number) {
    void score;
    if (isLast) { onComplete(); return; }
    setCurrentIndex((i) => i + 1);
    resetForNext();
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <p className="text-stone-500">불러오는 중...</p>
      </div>
    );
  }

  if (!currentSentence) return null;

  const maxScore = sentences.reduce((s, sent) => s + (sent.isNoise ? 2 : 1), 0);

  return (
    <main className="min-h-screen bg-paper">
      <header className="sticky top-0 z-20 border-b border-stone-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-3">
          <div>
            <h1 className="text-lg font-bold text-ink">{title}</h1>
            <p className="text-xs text-stone-500">
              {paper} · 문장 {currentIndex + 1} / {sentences.length}
            </p>
          </div>
          {showScore && (
            <div className="rounded-md border border-stone-200 bg-paper px-4 py-2 text-center">
              <div className="text-[11px] text-stone-500">경계 점수</div>
              <div className="text-xl font-bold text-ink">
                {totalScore} <span className="text-sm font-normal text-stone-500">/ {maxScore}</span>
              </div>
            </div>
          )}
          <div className="text-right text-sm text-stone-500">참가자 {participantId}</div>
        </div>
        <div className="mx-auto max-w-5xl px-5 pb-2">
          <div className="h-1.5 w-full rounded-full bg-stone-200">
            <div
              className="h-1.5 rounded-full bg-moss transition-all"
              style={{ width: `${((currentIndex) / sentences.length) * 100}%` }}
            />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-6">
        <p className="mb-6 text-sm text-stone-600">{description}</p>

        <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          {/* 원문 근거 패널 */}
          <section className="rounded-xl border border-stone-200 bg-white p-5 shadow-panel">
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-stone-500">
              <BookOpen size={14} /> 원문 근거
            </div>
            <blockquote className="rounded-md border-l-4 border-signal bg-blue-50 px-4 py-3 text-sm leading-6 text-ink">
              "{currentSentence.evidenceQuote}"
            </blockquote>
            <p className="mt-2 text-right text-xs text-stone-400">p. {currentSentence.evidencePage}</p>
          </section>

          {/* 판단 패널 */}
          <section className="rounded-xl border border-stone-200 bg-white p-5 shadow-panel">
            <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-stone-500">
              AI 요약 문장
            </div>
            <p className="rounded-md border border-stone-200 bg-stone-50 p-4 text-sm leading-6 text-ink">
              {currentSentence.statement}
            </p>

            {!feedback ? (
              <>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {responseOptions.map(({ value, label, icon }) => (
                    <button
                      key={value}
                      onClick={() => { setSelectedResponse(value); setRevision(""); }}
                      className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors ${
                        selectedResponse === value
                          ? "border-signal bg-blue-50 font-semibold text-signal"
                          : "border-stone-300 text-stone-700 hover:bg-stone-50"
                      }`}
                    >
                      {icon} {label}
                    </button>
                  ))}
                </div>

                {selectedResponse === "revise" && (
                  <textarea
                    className="mt-3 w-full rounded-md border border-stone-300 p-2 text-sm"
                    rows={3}
                    placeholder="올바른 내용으로 직접 수정해 주세요."
                    value={revision}
                    onChange={(e) => setRevision(e.target.value)}
                  />
                )}

                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs text-stone-500">
                    <span>판단 확신도</span>
                    <span className="font-semibold text-ink">{confidence}점</span>
                  </div>
                  <input
                    type="range" min={1} max={5} value={confidence}
                    onChange={(e) => setConfidence(Number(e.target.value))}
                    className="mt-1 w-full accent-signal"
                  />
                  <div className="flex justify-between text-[10px] text-stone-400">
                    <span>전혀 확신 없음</span><span>매우 확신</span>
                  </div>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={!selectedResponse || submitting || (selectedResponse === "revise" && !revision.trim())}
                  className="mt-4 w-full rounded-md bg-ink px-4 py-2.5 font-semibold text-white disabled:cursor-not-allowed disabled:bg-stone-300"
                >
                  {submitting ? "제출 중..." : "확인"}
                </button>
              </>
            ) : (
              <div className="mt-4 space-y-3">
                <div className={`rounded-md border p-3 ${
                  feedback.isCorrect
                    ? "border-green-300 bg-green-50 text-green-900"
                    : "border-amber-300 bg-amber-50 text-amber-900"
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">
                      {feedback.isCorrect ? "정답" : "오답"} · +{feedback.score}점
                    </span>
                    {currentSentence.isNoise && (
                      <span className="text-xs">
                        오류 유형: {errorTypeLabel[currentSentence.errorType]}
                      </span>
                    )}
                  </div>
                  {feedback.explanation && (
                    <p className="mt-2 text-sm">{feedback.explanation}</p>
                  )}
                  {!feedback.isCorrect && currentSentence.correctedStatement && (
                    <p className="mt-2 text-sm">
                      <strong>정정:</strong> {currentSentence.correctedStatement}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => advance()}
                  className="flex w-full items-center justify-center gap-2 rounded-md bg-ink px-4 py-2.5 font-semibold text-white"
                >
                  {isLast ? "다음 단계로" : "다음 문장"} <ChevronRight size={16} />
                </button>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
