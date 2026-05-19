"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Session } from "@/lib/schemas";

type Me = {
  role: "participant";
  participantId: string;
  currentStep: Session["currentStep"];
  paperSet: "vision" | "timeseries" | "optical";
  groupNum: 1 | 2;
};

export function useParticipant(expectedStep: Session["currentStep"]) {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    fetch("/api/me")
      .then((r) => {
        if (!r.ok) { router.replace("/"); return null; }
        return r.json() as Promise<Me>;
      })
      .then((data) => {
        if (!data) return;
        if (data.currentStep !== expectedStep) {
          router.replace(`/experiment/${data.currentStep}`);
          return;
        }
        setMe(data);
        setReady(true);
      })
      .catch(() => router.replace("/"));
  }, [expectedStep, router]);

  return { me, ready };
}
