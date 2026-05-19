"use client";

import { useEffect, useState } from "react";
import { CheckCircle } from "lucide-react";
import { aggregatePhaseResult, errorTypeLabel } from "@/lib/scoring";
import type { FilteringResponse, PhaseResult } from "@/lib/schemas";

export default function DonePage() {
  const [results, setResults] = useState<{ pre: PhaseResult; filtering: PhaseResult; post: PhaseResult } | null>(null);

  useEffect(() => {
    fetch("/api/responses")
      .then((r) => r.json())
      .then((responses: FilteringResponse[]) => {
        setResults({
          pre: aggregatePhaseResult("pre", responses),
          filtering: aggregatePhaseResult("filtering", responses),
          post: aggregatePhaseResult("post", responses)
        });
      });
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-paper px-4 py-10">
      <div className="w-full max-w-lg space-y-6">
        <div className="flex flex-col items-center text-center">
          <CheckCircle size={48} className="text-moss" />
          <h1 className="mt-4 text-2xl font-bold text-ink">실험이 완료되었습니다</h1>
          <p className="mt-2 text-sm text-stone-600">참여해 주셔서 감사합니다.</p>
        </div>

        {results && (
          <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-panel">
            <h2 className="mb-4 font-semibold text-ink">오류 탐지 성과 요약</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-200 text-left text-xs text-stone-500">
                  <th className="pb-2">단계</th>
                  <th className="pb-2 text-right">점수</th>
                  <th className="pb-2 text-right">오류 탐지</th>
                  <th className="pb-2 text-right">정상 수용</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {(["pre", "filtering", "post"] as const).map((p) => {
                  const r = results[p];
                  const label = { pre: "사전 테스트", filtering: "필터링 개입", post: "사후 테스트" }[p];
                  return (
                    <tr key={p}>
                      <td className="py-2">{label}</td>
                      <td className="py-2 text-right font-semibold">{r.totalScore} / {r.maxScore}</td>
                      <td className="py-2 text-right">{r.errorDetected}개</td>
                      <td className="py-2 text-right">{r.correctAccepted}개</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {results.pre.weakErrorType && (
              <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                사전 테스트 취약 유형: <strong>{errorTypeLabel[results.pre.weakErrorType]}</strong>
              </div>
            )}

            {(() => {
              const preRate = results.pre.maxScore > 0 ? results.pre.totalScore / results.pre.maxScore : 0;
              const postRate = results.post.maxScore > 0 ? results.post.totalScore / results.post.maxScore : 0;
              const diff = Math.round((postRate - preRate) * 100);
              return (
                <div className={`mt-3 rounded-md border p-3 text-sm ${diff >= 0 ? "border-green-200 bg-green-50 text-green-900" : "border-stone-200 bg-stone-50 text-stone-700"}`}>
                  사후 점수율이 사전 대비 <strong>{diff >= 0 ? `+${diff}%p` : `${diff}%p`}</strong> 변화했습니다.
                </div>
              );
            })()}
          </div>
        )}

        <p className="text-center text-xs text-stone-400">화면을 닫아도 됩니다. 연구자에게 완료 사실을 알려주세요.</p>
      </div>
    </main>
  );
}
