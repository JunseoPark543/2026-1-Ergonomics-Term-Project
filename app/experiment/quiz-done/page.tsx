"use client";

import { CheckCircle } from "lucide-react";

export default function QuizDonePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-paper px-4">
      <div className="w-full max-w-md text-center space-y-5">
        <CheckCircle size={52} className="mx-auto text-moss" />
        <h1 className="text-2xl font-bold text-ink">퀴즈가 완료되었습니다</h1>
        <p className="text-sm text-stone-600">
          지연 퀴즈에 참여해 주셔서 감사합니다.
          서술형 문항은 연구자가 루브릭 기준으로 채점하며,
          결과는 실험 종료 후 안내드릴 예정입니다.
        </p>
        <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-panel text-sm text-stone-600 text-left space-y-2">
          <p className="font-semibold text-ink">채점 안내</p>
          <ul className="space-y-1 text-xs">
            <li>• 재인 문항(선다형): 자동 채점</li>
            <li>• 회상·응용 문항(서술형): 2인 독립 채점 후 합산</li>
            <li>• 결과는 연구 완료 후 공유됩니다</li>
          </ul>
        </div>
        <p className="text-xs text-stone-400">화면을 닫아도 됩니다. 연구자에게 완료 사실을 알려주세요.</p>
      </div>
    </main>
  );
}
