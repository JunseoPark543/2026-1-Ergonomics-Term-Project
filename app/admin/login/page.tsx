"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ResearcherLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/researcher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "로그인 실패"); return; }
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
        <h1 className="text-2xl font-bold text-ink">연구자 로그인</h1>
        <p className="mt-2 text-sm text-stone-600">관리자 계정으로 로그인하세요.</p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink" htmlFor="username">아이디</label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setError(""); }}
              className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-signal"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink" htmlFor="password">비밀번호</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
              className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-signal"
            />
          </div>
          {error && <p className="text-sm text-rust">{error}</p>}
          <button
            type="submit"
            disabled={loading || !username || !password}
            className="w-full rounded-md bg-ink px-4 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:bg-stone-300"
          >
            {loading ? "확인 중..." : "로그인"}
          </button>
        </form>
      </div>
    </main>
  );
}
