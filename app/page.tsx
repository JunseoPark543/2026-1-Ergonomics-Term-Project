"use client";

import { useState } from "react";

export default function ParticipantLoginPage() {
  const [participantId, setParticipantId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/participant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participantId })
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "오류가 발생했습니다."); return; }
      window.location.href = data.redirectTo;
    } catch {
      setError("서버에 연결할 수 없습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-paper px-4">
      <div className="w-full max-w-sm rounded-xl border border-stone-200 bg-white p-8 shadow-panel">
        <h1 className="text-2xl font-bold text-ink">실험 시작</h1>
        <p className="mt-2 text-sm text-stone-600">
          연구자에게 배정받은 참가자 번호를 입력하세요.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink" htmlFor="pid">
              참가자 번호 (01~06)
            </label>
            <input
              id="pid"
              type="text"
              inputMode="numeric"
              maxLength={2}
              value={participantId}
              onChange={(e) => { setParticipantId(e.target.value); setError(""); }}
              className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-center text-2xl font-semibold tracking-widest focus:outline-none focus:ring-2 focus:ring-signal"
              placeholder="01"
              autoFocus
            />
          </div>
          {error && <p className="text-sm text-rust">{error}</p>}
          <button
            type="submit"
            disabled={loading || !participantId.trim()}
            className="w-full rounded-md bg-ink px-4 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:bg-stone-300"
          >
            {loading ? "확인 중..." : "시작"}
          </button>
        </form>
        <p className="mt-6 text-center text-xs text-stone-400">
          이미 진행 중이라면 같은 번호로 이어서 진행됩니다.
        </p>
      </div>
    </main>
  );
}
