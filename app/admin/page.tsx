"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Download, LogOut } from "lucide-react";
import type { Session } from "@/lib/schemas";

const STEP_LABEL: Record<string, string> = {
  "pre-test": "사전 테스트",
  filtering: "필터링 개입",
  "post-test": "사후 테스트",
  survey: "설문",
  done: "완료"
};

export default function AdminPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<Record<string, Session>>({});

  useEffect(() => {
    fetch("/api/session-list")
      .then((r) => { if (r.status === 401) { router.replace("/admin/login"); return null; } return r.json(); })
      .then((data) => { if (data) setSessions(data); })
      .catch(() => {});
  }, [router]);

  function download(sheet: string) {
    const a = document.createElement("a");
    a.href = `/api/export?sheet=${sheet}`;
    a.download = `${sheet}.csv`;
    a.click();
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
  }

  const sessionList = Object.values(sessions).sort((a, b) =>
    a.participantId.localeCompare(b.participantId)
  );

  return (
    <main className="min-h-screen bg-paper py-10">
      <div className="mx-auto max-w-4xl px-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-ink">관리자 패널</h1>
          <div className="flex items-center gap-2">
            {(["filtering", "survey", "sessions"] as const).map((sheet) => (
              <button
                key={sheet}
                onClick={() => download(sheet)}
                className="flex items-center gap-1 rounded-md border border-stone-300 bg-white px-3 py-2 text-sm hover:bg-stone-50"
              >
                <Download size={14} />
                {sheet === "filtering" ? "필터링" : sheet === "survey" ? "설문" : "세션"} CSV
              </button>
            ))}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 rounded-md border border-stone-300 bg-white px-3 py-2 text-sm hover:bg-stone-50"
            >
              <LogOut size={14} /> 로그아웃
            </button>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-stone-200 bg-white shadow-panel overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50 text-left text-xs text-stone-500">
                <th className="px-4 py-3">참가자</th>
                <th className="px-4 py-3">집단</th>
                <th className="px-4 py-3">논문 세트</th>
                <th className="px-4 py-3">진행 단계</th>
                <th className="px-4 py-3">시작 시각</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {sessionList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-stone-400">
                    아직 실험에 접속한 참가자가 없습니다.
                  </td>
                </tr>
              ) : (
                sessionList.map((s) => (
                  <tr key={s.participantId} className="hover:bg-stone-50">
                    <td className="px-4 py-3 font-semibold">{s.participantId}</td>
                    <td className="px-4 py-3 text-stone-600">집단 {s.groupNum}</td>
                    <td className="px-4 py-3 text-stone-600">
                      {s.paperSet === "vision" ? "비전 (I-JEPA + MAE)" : "시계열 (TimesFM + Chronos)"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                        s.currentStep === "done"
                          ? "bg-green-100 text-green-800"
                          : "bg-amber-100 text-amber-800"
                      }`}>
                        {STEP_LABEL[s.currentStep] ?? s.currentStep}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-stone-500">
                      {new Date(s.createdAt).toLocaleString("ko-KR")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-xs text-stone-400">
          참가자 계정 발급: 연구자가 참가자 번호(01~06)를 구두로 안내합니다.
        </p>
      </div>
    </main>
  );
}
