"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Download, LogOut, RotateCcw, Trash2, AlertTriangle, ClipboardList, Network } from "lucide-react";
import type { Session } from "@/lib/schemas";
import type { ConceptMapRow } from "@/lib/db";

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

type Tab = "sessions" | "conceptmap";

export default function AdminPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<Record<string, Session>>({});
  const [conceptMaps, setConceptMaps] = useState<ConceptMapRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [tab, setTab] = useState<Tab>("sessions");

  async function loadAll() {
    const [sessRes, cmRes] = await Promise.all([
      fetch("/api/session-list"),
      fetch("/api/admin?resource=concept-maps")
    ]);
    if (sessRes.status === 401) { router.replace("/admin/login"); return; }
    setSessions(await sessRes.json());
    if (cmRes.ok) setConceptMaps(await cmRes.json());
    setLoading(false);
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadAll(); }, []);

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
    if (ok) await loadAll();
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
    if (ok) { setSessions({}); setConceptMaps([]); }
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

  const paperLabel = (paperSet: string) =>
    paperSet === "vision" ? "비전 (I-JEPA)"
      : paperSet === "timeseries" ? "시계열 (TimesFM)"
      : paperSet === "optical" ? "광통신 (FSO)"
      : "선형계획법";

  return (
    <main className="min-h-screen bg-paper py-8">
      <div className="mx-auto max-w-5xl px-4 space-y-6">

        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-ink">관리자 패널</h1>
          <div className="flex items-center gap-2 flex-wrap">
            {(["filtering", "survey", "sessions", "concept-map"] as const).map((sheet) => (
              <button key={sheet} onClick={() => download(sheet)}
                className="flex items-center gap-1 rounded-md border border-stone-300 bg-white px-3 py-2 text-sm hover:bg-stone-50">
                <Download size={14} />
                {sheet === "filtering" ? "필터링"
                  : sheet === "survey" ? "설문"
                  : sheet === "sessions" ? "세션"
                  : "개념도"} CSV
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
                <p className="mt-0.5 text-sm text-stone-600">모든 세션·응답·개념도 데이터를 삭제합니다. 되돌릴 수 없습니다.</p>
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

        {/* 탭 */}
        <div className="flex gap-1 border-b border-stone-200">
          {([
            { key: "sessions", label: "참가자 세션", icon: <ClipboardList size={14} /> },
            { key: "conceptmap", label: "개념도 지표", icon: <Network size={14} /> }
          ] as { key: Tab; label: string; icon: React.ReactNode }[]).map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-1.5 border-b-2 px-4 py-2 text-sm font-semibold transition-colors ${
                tab === key ? "border-ink text-ink" : "border-transparent text-stone-500 hover:text-stone-700"
              }`}
            >
              {icon} {label}
            </button>
          ))}
        </div>

        {/* ── 세션 탭 ── */}
        {tab === "sessions" && (
          <div className="rounded-xl border border-stone-200 bg-white shadow-panel overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50 text-left text-xs text-stone-500">
                  <th className="px-4 py-3">참가자</th>
                  <th className="px-4 py-3">집단</th>
                  <th className="px-4 py-3">논문 세트</th>
                  <th className="px-4 py-3">현재 단계</th>
                  <th className="px-4 py-3">단계 변경</th>
                  <th className="px-4 py-3">응답 삭제</th>
                  <th className="px-4 py-3">시작 시각</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {loading ? (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-stone-400">불러오는 중...</td></tr>
                ) : sessionList.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-stone-400">등록된 참가자가 없습니다.</td></tr>
                ) : (
                  sessionList.map((s) => (
                    <tr key={s.participantId} className="hover:bg-stone-50">
                      <td className="px-4 py-3 font-semibold">{s.participantId}</td>
                      <td className="px-4 py-3 text-xs text-stone-500">
                        {s.groupNum === 1 ? "집단 1 (구조도↑)" : "집단 2 (요약문↑)"}
                      </td>
                      <td className="px-4 py-3 text-stone-600 text-xs">
                        {paperLabel(s.paperSet)}
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
        )}

        {/* ── 개념도 탭 ── */}
        {tab === "conceptmap" && (
          <div className="rounded-xl border border-stone-200 bg-white shadow-panel overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50 text-left text-xs text-stone-500">
                  <th className="px-4 py-3">참가자</th>
                  <th className="px-4 py-3">논문 세트</th>
                  <th className="px-4 py-3 text-right">노드 수</th>
                  <th className="px-4 py-3 text-right">연결 수</th>
                  <th className="px-4 py-3 text-right">수정 횟수</th>
                  <th className="px-4 py-3 text-right">소요 시간</th>
                  <th className="px-4 py-3">저장 시각</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {loading ? (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-stone-400">불러오는 중...</td></tr>
                ) : conceptMaps.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-stone-400">개념도 데이터가 없습니다.</td></tr>
                ) : (
                  conceptMaps.map((cm) => (
                    <tr key={cm.participantId} className="hover:bg-stone-50">
                      <td className="px-4 py-3 font-semibold">{cm.participantId}</td>
                      <td className="px-4 py-3 text-xs text-stone-500">{cm.paperSet}</td>
                      <td className="px-4 py-3 text-right">{cm.nodeCount}</td>
                      <td className="px-4 py-3 text-right">{cm.edgeCount}</td>
                      <td className="px-4 py-3 text-right">{cm.editCount}</td>
                      <td className="px-4 py-3 text-right">{Math.floor(cm.durationSec / 60)}분 {cm.durationSec % 60}초</td>
                      <td className="px-4 py-3 text-xs text-stone-500">{new Date(cm.createdAt).toLocaleString("ko-KR")}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </main>
  );
}
