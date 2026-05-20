"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Brain, ChevronRight, CheckCircle, FileText, Lightbulb } from "lucide-react";
import { useParticipant } from "@/components/use-participant";
import { getQuizSet, QUIZ_TOTAL_POINTS } from "@/lib/quiz-sets";
import type { RecognitionQ, OpenQ } from "@/lib/quiz-sets";

type Phase = "metacognition" | "quiz";

export default function QuizPage() {
  const router = useRouter();
  const { me, ready } = useParticipant("quiz");
  const [phase, setPhase] = useState<Phase>("metacognition");
  const [memoryPercent, setMemoryPercent] = useState(50);
  const [expectedScore, setExpectedScore] = useState(7);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <p className="text-stone-500">불러오는 중...</p>
      </div>
    );
  }

  const quiz = getQuizSet(me!.paperSet);

  const allAnswered = quiz.questions.every((q) => {
    const ans = answers[q.id];
    return ans !== undefined && ans.trim() !== "";
  });

  async function handleSubmit() {
    if (!allAnswered) return;
    setSubmitting(true);
    await fetch("/api/quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        paperSet: me!.paperSet,
        memoryPercent,
        expectedScore,
        answers
      })
    });
    await fetch("/api/session", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ step: "quiz-done" })
    });
    router.push("/experiment/quiz-done");
  }

  if (phase === "metacognition") {
    return (
      <main className="min-h-screen bg-paper py-10">
        <div className="mx-auto max-w-lg px-4 space-y-6">
          <div className="text-center space-y-1">
            <Brain size={36} className="mx-auto text-moss" />
            <h1 className="text-2xl font-bold text-ink">지연 퀴즈 시작 전</h1>
            <p className="text-sm text-stone-500">
              퀴즈를 시작하기 전, 현재 논문 내용을 얼마나 기억하는지 솔직하게 답해주세요.
            </p>
          </div>

          <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-panel space-y-6">
            {/* 기억 비율 */}
            <div>
              <p className="text-sm font-semibold text-ink mb-1">
                지금 이 논문의 내용을 몇 % 정도 기억하고 있다고 생각하십니까?
              </p>
              <div className="flex items-center gap-3">
                <input
                  type="range" min={0} max={100} step={5}
                  value={memoryPercent}
                  onChange={(e) => setMemoryPercent(Number(e.target.value))}
                  className="flex-1 accent-signal"
                />
                <span className="w-12 text-right font-bold text-ink">{memoryPercent}%</span>
              </div>
              <div className="flex justify-between text-[10px] text-stone-400 mt-1">
                <span>0% — 전혀 기억 안 남</span>
                <span>100% — 완벽히 기억</span>
              </div>
            </div>

            {/* 예상 점수 */}
            <div>
              <p className="text-sm font-semibold text-ink mb-1">
                방금 퀴즈를 응답한다면 {QUIZ_TOTAL_POINTS}점 만점 기준 몇 점을 받을 것 같습니까?
              </p>
              <div className="flex items-center gap-3">
                <input
                  type="range" min={0} max={QUIZ_TOTAL_POINTS} step={1}
                  value={expectedScore}
                  onChange={(e) => setExpectedScore(Number(e.target.value))}
                  className="flex-1 accent-signal"
                />
                <span className="w-12 text-right font-bold text-ink">{expectedScore}점</span>
              </div>
              <div className="flex justify-between text-[10px] text-stone-400 mt-1">
                <span>0점</span>
                <span>{QUIZ_TOTAL_POINTS}점 만점</span>
              </div>
            </div>
          </div>

          <p className="text-xs text-center text-stone-400">
            정답과 무관하게 솔직하게 답해주세요. 메타인지 측정에 사용됩니다.
          </p>

          <button
            onClick={() => setPhase("quiz")}
            className="w-full flex items-center justify-center gap-2 rounded-md bg-ink px-4 py-3 font-semibold text-white"
          >
            퀴즈 시작 <ChevronRight size={16} />
          </button>
        </div>
      </main>
    );
  }

  // Phase: quiz
  return (
    <main className="min-h-screen bg-paper py-8">
      <div className="mx-auto max-w-2xl px-4 space-y-5">
        <div className="text-center space-y-1 pb-2">
          <h1 className="text-2xl font-bold text-ink">지연 퀴즈</h1>
          <p className="text-stone-500 text-sm">
            {quiz.paper} · {QUIZ_TOTAL_POINTS}점 만점 (재인 4점 + 회상 6점 + 응용 3점)
          </p>
        </div>

        {quiz.questions.map((q, i) => (
          <div
            key={q.id}
            className="rounded-xl border border-stone-200 bg-white p-5 shadow-panel space-y-3"
          >
            {/* 문항 유형 배지 */}
            <div className="flex items-center gap-2">
              {q.type === "recognition" && (
                <span className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-800">
                  <CheckCircle size={10} /> 재인 (1점)
                </span>
              )}
              {q.type === "recall" && (
                <span className="flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-800">
                  <FileText size={10} /> 회상 (0~3점)
                </span>
              )}
              {q.type === "application" && (
                <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                  <Lightbulb size={10} /> 응용 (0~3점)
                </span>
              )}
              <span className="text-xs text-stone-400">문항 {i + 1}</span>
            </div>

            <p className="text-sm font-medium text-ink">{q.text}</p>

            {q.type === "recognition" && (
              <div className="space-y-2">
                {(q as RecognitionQ).options.map((opt, oi) => (
                  <label
                    key={oi}
                    className={`flex cursor-pointer items-start gap-2.5 rounded-md border px-3 py-2 text-sm transition-colors ${
                      answers[q.id] === String(oi)
                        ? "border-signal bg-blue-50 font-semibold text-signal"
                        : "border-stone-200 text-stone-700 hover:bg-stone-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name={q.id}
                      value={String(oi)}
                      checked={answers[q.id] === String(oi)}
                      onChange={() => setAnswers((a) => ({ ...a, [q.id]: String(oi) }))}
                      className="mt-0.5 accent-signal"
                    />
                    <span>
                      {["①", "②", "③", "④"][oi]} {opt}
                    </span>
                  </label>
                ))}
              </div>
            )}

            {(q.type === "recall" || q.type === "application") && (
              <div>
                <textarea
                  rows={q.type === "application" ? 5 : 4}
                  placeholder={
                    q.type === "recall"
                      ? "논문 내용을 바탕으로 서술해 주세요."
                      : "논문 내용을 다른 맥락에 적용하여 논해 주세요."
                  }
                  value={answers[q.id] ?? ""}
                  onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                  className="w-full rounded-md border border-stone-300 p-3 text-sm leading-6 resize-none"
                />
                <p className="mt-1 text-right text-[10px] text-stone-400">
                  {(q as OpenQ).maxScore}점 만점 · 루브릭 채점 (연구자)
                </p>
              </div>
            )}
          </div>
        ))}

        <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
          모든 문항에 응답한 후 제출해 주세요. 서술형 문항은 논문 내용에 근거하여 답해주세요.
        </div>

        <button
          onClick={handleSubmit}
          disabled={!allAnswered || submitting}
          className="w-full rounded-md bg-ink px-4 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:bg-stone-300"
        >
          {submitting ? "제출 중..." : "퀴즈 제출"}
        </button>
      </div>
    </main>
  );
}
