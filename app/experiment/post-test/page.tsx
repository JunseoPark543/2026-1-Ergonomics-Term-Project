"use client";

import { useRouter } from "next/navigation";
import FilteringSession from "@/components/filtering-session";
import { useParticipant } from "@/components/use-participant";

export default function PostTestPage() {
  const router = useRouter();
  const { me, ready } = useParticipant("post-test");

  if (!ready) return <LoadingScreen />;

  async function handleComplete() {
    await fetch("/api/session", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ step: "survey" })
    });
    router.push("/experiment/survey");
  }

  return (
    <FilteringSession
      participantId={me!.participantId}
      paperSet={me!.paperSet}
      phase="post"
      title="2차 판단"
      description="새로운 요약 문장 세트를 동일한 방식으로 판단해 주세요. 이 단계에서는 정답 여부를 알려드리지 않습니다."
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
