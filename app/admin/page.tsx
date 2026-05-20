"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Download, LogOut, RotateCcw, Trash2, AlertTriangle } from "lucide-react";
import type { Session } from "@/lib/schemas";

const STEP_LABEL: Record<string, string> = {
  guide: "실험 안내",
  reading: "논문 읽기",
  "pre-test": "1차 판단",
  filtering: "AI 요약 검토",
  "post-test": "2차 판단",
  survey: "설문",
  done: "완료"
};

const STEPS = ["guide", "reading", "pre-test", "filtering", "post-test", "survey", "done"] as const;

export default function AdminPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<Record<string, Session>>({});
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  async function loadSessions() {
    const res = await fetch("/api/session-list");
    if (res.status === 401) { router.replace("/admin/login"); return; }
    setSessions(await res.json());
    setLoading(false);
  }

  useEffect(() => { loadSessions(); }, []);

  async function adminAction(body: object) {
    const res = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    if (!res.ok) { alert("오류가 발생했습니다."); return false; }
    return true;
  }

  async function handleResetStep(participantId: string, step: string) {
    setActionId(participantId + "-step");
    const ok = await adminAction({ action: "reset-step", participantId, step });
    if (ok) await loadSessions();
    setActionId(null);
  }

  async function handleDeleteResponses(participantId: string) {
    if (!confirm(`참가자 ${participantId}의 응답 데이터를 삭제하시겠습니까?`)) return;
    setActionId(participantId + "-del");
    await adminAction({ action: "delete-responses", participantId });
    setActionId(null);
  }

  async function handleResetAll() {
    setConfirmReset(false);
    setActionId("all");
    const ok = await adminAction({ action: "reset-all" });
    if (ok) { setSessions({}); }
    setActionId(null);
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

  function download(sheet: string) {
    const a = document.createElement("a");
    a.href = `/api/export?sheet=${sheet}`;
    a.download = `${sheet}.csv`;
    a.click();
  }

  const sessionList = Object.values(sessions).sort((a, b) =>
    a.participantId.localeCompare(b.participantId)
  );

  return (
    <main className="min-h-screen bg-paper py-8">
      <div className="mx-auto max-w-5xl px-4 space-y-6">

        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-ink">관리자 패널</h1>
          <div className="flex items-center gap-2">
            {(["filtering", "survey", "sessions"] as const).map((sheet) => (
              <button key={sheet} onClick={() => download(sheet)}
                className="flex items-center gap-1 rounded-md border border-stone-300 bg-white px-3 py-2 text-sm hover:bg-stone-50">
                <Download size={14} />
                {sheet === "filtering" ? "필터링" : sheet === "survey" ? "설문" : "세션"} CSV
              </button>
            ))}
            <button onClick={handleLogout}
              className="flex items-center gap-1 rounded-md border border-stone-300 bg-white px-3 py-2 text-sm hover:bg-stone-50">
              <LogOut size={14} /> 로그아웃
            </button>
          </div>
        </div>

        {/* 전체 초기화 */}
        <div className="rounded-xl border border-rust/30 bg-red-50 p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-start gap-2">
              <AlertTriangle size={18} className="mt-0.5 shrink-0 text-rust" />
              <div>
                <p className="font-semibold text-rust">전체 초기화</p>
                <p className="mt-0.5 text-sm text-stone-600">모든 세션·응답 데이터를 삭제합니다. 되돌릴 수 없습니다.</p>
              </div>
            </div>
            {!confirmReset ? (
              <button onClick={() => setConfirmReset(true)}
                className="shrink-0 rounded-md border border-rust px-4 py-2 text-sm font-semibold text-rust hover:bg-red-100">
                전체 초기화
              </button>
            ) : (
              <div className="flex shrink-0 items-center gap-2">
                <span className="text-sm font-semibold text-rust">정말 삭제하시겠습니까?</span>
                <button onClick={handleResetAll} disabled={actionId === "all"}
                  className="rounded-md bg-rust px-4 py-2 text-sm font-semibold text-white disabled:bg-stone-300">
                  {actionId === "all" ? "삭제 중..." : "삭제"}
                </button>
                <button onClick={() => setConfirmReset(false)}
                  className="rounded-md border border-stone-300 px-4 py-2 text-sm">
                  취소
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 참가자 목록 */}
        <div className="rounded-xl border border-stone-200 bg-white shadow-panel overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50 text-left text-xs text-stone-500">
                <th className="px-4 py-3">참가자</th>
                <th className="px-4 py-3">논문 세트</th>
                <th className="px-4 py-3">현재 단계</th>
                <th className="px-4 py-3">단계 변경</th>
                <th className="px-4 py-3">응답 삭제</th>
                <th className="px-4 py-3">시작 시각</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-stone-400">불러오는 중...</td>
                </tr>
              ) : sessionList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-stone-400">
                    등록된 참가자가 없습니다.
                  </td>
                </tr>
              ) : (
                sessionList.map((s) => (
                  <tr key={s.participantId} className="hover:bg-stone-50">
                    <td className="px-4 py-3 font-semibold">{s.participantId}</td>
                    <td className="px-4 py-3 text-stone-600 text-xs">
                      {s.paperSet === "vision" ? "비전 (I-JEPA + MAE)"
                        : s.paperSet === "timeseries" ? "시계열 (TimesFM + Chronos)"
                        : "광통신 (FSO + FSO-Perf)"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                        s.currentStep === "done" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
                      }`}>
                        {STEP_LABEL[s.currentStep] ?? s.currentStep}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <select
                          id={`step-${s.participantId}`}
                          defaultValue={s.currentStep}
                          className="rounded border border-stone-300 bg-white px-2 py-1 text-xs"
                        >
                          {STEPS.map((step) => (
                            <option key={step} value={step}>{STEP_LABEL[step]}</option>
                          ))}
                        </select>
                        <button
                          onClick={() => {
                            const sel = document.getElementById(`step-${s.participantId}`) as HTMLSelectElement;
                            handleResetStep(s.participantId, sel.value);
                          }}
                          disabled={actionId === s.participantId + "-step"}
                          className="flex items-center gap-1 rounded border border-stone-300 bg-white px-2 py-1 text-xs hover:bg-stone-50 disabled:text-stone-300"
                        >
                          <RotateCcw size={11} />
                          {actionId === s.participantId + "-step" ? "적용 중..." : "적용"}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDeleteResponses(s.participantId)}
                        disabled={actionId === s.participantId + "-del"}
                        className="flex items-center gap-1 rounded border border-stone-300 bg-white px-2 py-1 text-xs text-rust hover:bg-red-50 disabled:text-stone-300"
                      >
                        <Trash2 size={11} />
                        {actionId === s.participantId + "-del" ? "삭제 중..." : "응답 삭제"}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-stone-500 text-xs">
                      {new Date(s.createdAt).toLocaleString("ko-KR")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-stone-400">
          단계 변경: 선택한 단계로 참가자를 이동합니다 (응답은 유지됩니다). |
          응답 삭제: 해당 참가자의 필터링·설문 응답만 삭제합니다.
        </p>
      </div>
    </main>
  );
}
