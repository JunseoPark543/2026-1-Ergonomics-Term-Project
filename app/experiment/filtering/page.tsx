"use client";

import { useRouter } from "next/navigation";
import FilteringSession from "@/components/filtering-session";
import { useParticipant } from "@/components/use-participant";

export default function FilteringPage() {
  const router = useRouter();
  const { me, ready } = useParticipant("filtering");

  if (!ready) return <LoadingScreen />;

  async function handleComplete() {
    await fetch("/api/session", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ step: "post-test" })
    });
    router.push("/experiment/post-test");
  }

  return (
    <FilteringSession
      participantId={me!.participantId}
      paperSet={me!.paperSet}
      phase="filtering"
      title="필터링 인터페이스"
      description="요약 문장을 판단한 후 즉시 정답 피드백과 경계 점수를 확인할 수 있습니다."
      showScore={true}
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
