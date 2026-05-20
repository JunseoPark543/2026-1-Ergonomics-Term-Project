"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, CheckCircle, XCircle, AlertCircle, HelpCircle, ChevronRight, ClipboardList } from "lucide-react";
import { useParticipant } from "@/components/use-participant";

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-panel">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-moss">{icon}</span>
        <h2 className="font-bold text-ink">{title}</h2>
      </div>
      {children}
    </div>
  );
}

export default function GuidePage() {
  const router = useRouter();
  const { ready } = useParticipant("guide");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <p className="text-stone-500">불러오는 중...</p>
      </div>
    );
  }

  async function handleStart() {
    if (!agreed) return;
    setLoading(true);
    await fetch("/api/session", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ step: "reading" })
    });
    router.push("/experiment/reading");
  }

  return (
    <main className="min-h-screen bg-paper py-8">
      <div className="mx-auto max-w-2xl px-4 space-y-5">

        {/* 제목 */}
        <div className="text-center space-y-1 pb-2">
          <h1 className="text-2xl font-bold text-ink">실험 참여 안내</h1>
          <p className="text-stone-500 text-sm">시작 전에 아래 내용을 꼼꼼히 읽어주세요.</p>
        </div>

        {/* 실험 개요 */}
        <Section icon={<ClipboardList size={18} />} title="이 실험은 무엇인가요?">
          <p className="text-sm text-stone-700 leading-6">
            이 실험은 AI가 생성한 논문 요약문을 읽고, 원문과 비교하여 정확성을 판단하는 능력을 측정합니다.
            AI 요약문에는 <strong>정확한 내용</strong>과 <strong>의도적으로 오류가 삽입된 내용</strong>이 섞여 있습니다.
            원문 근거를 잘 확인하여 오류를 찾아내 주세요.
          </p>
        </Section>

        {/* 진행 순서 */}
        <Section icon={<ChevronRight size={18} />} title="진행 순서">
          <ol className="space-y-3">
            {[
              { step: "1", label: "논문 읽기", desc: "배정된 논문을 충분히 읽습니다. (약 30~40분)", icon: <BookOpen size={15} /> },
              { step: "2", label: "1차 판단", desc: "AI 요약 문장을 원문과 비교하여 판단합니다. 피드백은 제공되지 않습니다.", icon: <ClipboardList size={15} /> },
              { step: "3", label: "AI 요약 검토", desc: "피드백을 받으면서 AI 요약문을 검토합니다. 오류를 찾으면 점수가 올라갑니다.", icon: <CheckCircle size={15} /> },
              { step: "4", label: "2차 판단", desc: "새로운 요약 문장 세트를 다시 판단합니다. 피드백은 제공되지 않습니다.", icon: <ClipboardList size={15} /> },
              { step: "5", label: "설문", desc: "사용 경험에 대한 솔직한 의견을 응답합니다.", icon: <ClipboardList size={15} /> },
            ].map(({ step, label, desc, icon }) => (
              <li key={step} className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-moss text-white text-xs font-bold">{step}</span>
                <div>
                  <div className="flex items-center gap-1.5 font-semibold text-sm text-ink">{icon}{label}</div>
                  <p className="text-xs text-stone-500 mt-0.5">{desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </Section>

        {/* 판단 방법 */}
        <Section icon={<CheckCircle size={18} />} title="판단 방법 — 4가지 선택지">
          <p className="text-xs text-stone-500 mb-3">각 AI 요약 문장과 왼쪽의 원문 근거를 비교한 후 아래 중 하나를 선택합니다.</p>
          <div className="space-y-2.5">
            {[
              {
                icon: <CheckCircle size={16} className="text-green-600" />,
                label: "원문과 일치",
                desc: "요약 문장이 원문 내용과 의미상 정확하게 일치한다고 판단될 때"
              },
              {
                icon: <XCircle size={16} className="text-rust" />,
                label: "오류 있음",
                desc: "요약 문장이 원문과 다르거나 잘못된 내용이 포함되어 있다고 판단될 때"
              },
              {
                icon: <AlertCircle size={16} className="text-amber-600" />,
                label: "직접 수정",
                desc: "오류가 있다고 판단되며, 올바른 내용으로 직접 고쳐 작성하고 싶을 때"
              },
              {
                icon: <HelpCircle size={16} className="text-signal" />,
                label: "근거 부족",
                desc: "원문에서 해당 요약을 뒷받침하는 근거를 찾기 어렵다고 판단될 때"
              },
            ].map(({ icon, label, desc }) => (
              <div key={label} className="flex items-start gap-2.5 rounded-md border border-stone-100 bg-stone-50 p-3">
                <span className="mt-0.5 shrink-0">{icon}</span>
                <div>
                  <span className="text-sm font-semibold text-ink">{label}</span>
                  <p className="text-xs text-stone-500 mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* 판단 확신도 */}
        <Section icon={<ClipboardList size={18} />} title="판단 확신도란?">
          <p className="text-sm text-stone-700 leading-6">
            각 문장을 판단한 후 <strong>얼마나 확신을 가지고 판단했는지</strong>를 1~5점으로 표시합니다.
          </p>
          <div className="mt-3 flex justify-between text-xs text-stone-500 border border-stone-200 rounded-md px-4 py-2 bg-stone-50">
            <span>1점 — 전혀 확신 없음</span>
            <span>3점 — 보통</span>
            <span>5점 — 매우 확신</span>
          </div>
          <p className="text-xs text-stone-400 mt-2">정답과 무관하게 솔직하게 체크해 주세요.</p>
        </Section>

        {/* 설문 안내 */}
        <Section icon={<ClipboardList size={18} />} title="설문에 임하는 태도">
          <ul className="space-y-2 text-sm text-stone-700">
            {[
              "설문에는 정답이 없습니다. 실제로 느낀 점을 솔직하게 응답해 주세요.",
              "다른 참가자나 연구자를 의식하지 말고 본인의 경험을 그대로 표현해 주세요.",
              "AI 도구가 도움이 되지 않았다고 느꼈다면 그렇게 응답해도 됩니다.",
              "응답에는 시간 제한이 없습니다. 충분히 생각한 후 선택해 주세요.",
            ].map((text, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-moss" />
                {text}
              </li>
            ))}
          </ul>
        </Section>

        {/* 주의사항 */}
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-semibold mb-1">⚠ 주의사항</p>
          <ul className="space-y-1 text-xs">
            <li>• 논문을 충분히 읽은 후 판단에 임해주세요.</li>
            <li>• 판단 시 반드시 왼쪽 <strong>원문 근거</strong>를 확인해주세요.</li>
            <li>• 중간에 창을 닫아도 같은 번호로 로그인하면 이어서 진행됩니다.</li>
            <li>• 모든 단계를 완료해야 실험이 종료됩니다.</li>
          </ul>
        </div>

        {/* 동의 및 시작 */}
        <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-panel">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 accent-signal"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
            />
            <span className="text-sm text-stone-700">
              위 안내를 모두 읽었으며, 내용을 이해하고 실험에 성실히 참여하겠습니다.
            </span>
          </label>
          <button
            onClick={handleStart}
            disabled={!agreed || loading}
            className="mt-4 w-full flex items-center justify-center gap-2 rounded-md bg-ink px-4 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:bg-stone-300"
          >
            {loading ? "이동 중..." : "논문 읽기 시작"} <ChevronRight size={16} />
          </button>
        </div>

      </div>
    </main>
  );
}
