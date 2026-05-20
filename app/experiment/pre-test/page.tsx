"use client";

import { useRouter } from "next/navigation";
import FilteringSession from "@/components/filtering-session";
import { useParticipant } from "@/components/use-participant";

export default function PreTestPage() {
  const router = useRouter();
  const { me, ready } = useParticipant("pre-test");

  if (!ready) return <LoadingScreen />;

  async function handleComplete() {
    await fetch("/api/session", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ step: "filtering" })
    });
    router.push("/experiment/filtering");
  }

  return (
    <FilteringSession
      participantId={me!.participantId}
      paperSet={me!.paperSet}
      phase="pre"
      title="1차 판단"
      description="왼쪽 원문 근거를 확인하면서 AI 요약 문장이 올바른지 판단해 주세요. 이 단계에서는 정답 여부를 알려드리지 않습니다."
      showScore={false}
      onComplete={handleComplete}
    />
  );
}

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-paper">
      <p className="text-stone-500">불러오는 중...</p>
    </div>
  );
}
