"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { filteringSurveyQuestions, conceptMapSurveyQuestions } from "@/lib/schemas";
import { useParticipant } from "@/components/use-participant";

export default function SurveyPage() {
  const router = useRouter();
  const { me, ready } = useParticipant("survey");
  const [scores, setScores] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);

  if (!ready) return <LoadingScreen />;

  const questions = [
    ...filteringSurveyQuestions,
    ...(me!.groupNum === 1 ? conceptMapSurveyQuestions : [])
  ];

  const allAnswered = questions.every((q) => scores[q.id] !== undefined);

  async function handleSubmit() {
    if (!allAnswered) return;
    setSubmitting(true);
    for (const q of questions) {
      await fetch("/api/responses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "survey", questionId: q.id, likertScore: scores[q.id] })
      });
    }
    await fetch("/api/session", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ step: "done" })
    });
    router.push("/experiment/done");
  }

  return (
    <main className="min-h-screen bg-paper py-10">
      <div className="mx-auto max-w-xl px-4">
        <h1 className="text-2xl font-bold text-ink">사용 경험 설문</h1>
        <p className="mt-2 text-sm text-stone-600">
          각 문항에 대해 1(전혀 그렇지 않다)~5(매우 그렇다)로 응답해 주세요.
        </p>

        {/* 필터링 인터페이스 설문 */}
        <p className="mt-6 mb-3 text-xs font-semibold uppercase tracking-wide text-stone-400">
          AI 요약문 검토 기능
        </p>
        <div className="space-y-4">
          {filteringSurveyQuestions.map((q, i) => (
            <SurveyItem
              key={q.id}
              index={i + 1}
              text={q.text}
              value={scores[q.id]}
              onChange={(v) => setScores((s) => ({ ...s, [q.id]: v }))}
            />
          ))}
        </div>

        {/* 개념도 설문 (Group 1만) */}
        {me!.groupNum === 1 && (
          <>
            <p className="mt-8 mb-3 text-xs font-semibold uppercase tracking-wide text-stone-400">
              개념도 구성 기능
            </p>
            <div className="space-y-4">
              {conceptMapSurveyQuestions.map((q, i) => (
                <SurveyItem
                  key={q.id}
                  index={filteringSurveyQuestions.length + i + 1}
                  text={q.text}
                  value={scores[q.id]}
                  onChange={(v) => setScores((s) => ({ ...s, [q.id]: v }))}
                />
              ))}
            </div>
          </>
        )}

        <button
          onClick={handleSubmit}
          disabled={!allAnswered || submitting}
          className="mt-8 w-full rounded-md bg-ink px-4 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:bg-stone-300"
        >
          {submitting ? "제출 중..." : "제출 완료"}
        </button>
      </div>
    </main>
  );
}

function SurveyItem({
  index,
  text,
  value,
  onChange
}: {
  index: number;
  text: string;
  value: number | undefined;
  onChange: (v: number) => void;
}) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-panel">
      <p className="text-sm font-medium text-ink">{index}. {text}</p>
      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="text-xs text-stone-400">전혀 아님</span>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((v) => (
            <button
              key={v}
              onClick={() => onChange(v)}
              className={`h-10 w-10 rounded-full border text-sm font-semibold transition-colors ${
                value === v
                  ? "border-signal bg-signal text-white"
                  : "border-stone-300 bg-white text-stone-700 hover:bg-stone-50"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
        <span className="text-xs text-stone-400">매우 그럼</span>
      </div>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-paper">
      <p className="text-stone-500">불러오는 중...</p>
    </div>
  );
}
