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
      title="사전 테스트"
      description="아래 요약 문장을 원문 근거와 비교하여 판단해 주세요. 이 단계에서는 정답 피드백이 제공되지 않습니다."
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
