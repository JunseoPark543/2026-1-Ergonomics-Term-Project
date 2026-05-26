import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getFilteringResponses, getSurveyResponses, getAllSessions, getConceptMaps } from "@/lib/db";
import { errorTypeLabel } from "@/lib/scoring";
import { getResearcherUser } from "@/lib/api-auth";

function toCsv(rows: string[][]): string {
  return rows
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");
}

function csv(content: string, filename: string) {
  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`
    }
  });
}

export async function GET(request: NextRequest) {
  const researcher = await getResearcherUser(request);
  if (!researcher) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const sheet = new URL(request.url).searchParams.get("sheet") ?? "filtering";

  if (sheet === "filtering") {
    const headers = [
      "사용자번호", "단계", "문장번호", "오류유형", "실제오류여부",
      "사용자응답", "정답여부", "점수", "판단확신도", "응답시간(ms)", "타임스탬프"
    ];
    const rl: Record<string, string> = { accept:"수용", reject:"기각", revise:"수정", insufficient:"근거부족" };
    const pl: Record<string, string> = { pre:"사전", filtering:"개입", post:"사후" };
    const data = await getFilteringResponses();
    const rows = data.map((r) => [
      r.participantId, pl[r.phase]??r.phase, r.sentenceId, errorTypeLabel[r.errorType],
      r.isNoise?"예":"아니오", rl[r.userResponse]??r.userResponse,
      r.isCorrect?"정답":"오답", String(r.score), String(r.confidence),
      String(r.responseTimeMs??""), r.timestamp
    ]);
    return csv(toCsv([headers, ...rows]), "filtering_responses.csv");
  }

  if (sheet === "survey") {
    const headers = ["사용자번호", "문항번호", "리커트점수", "타임스탬프"];
    const data = await getSurveyResponses();
    return csv(toCsv([headers, ...data.map((r) => [r.participantId, r.questionId, String(r.likertScore), r.timestamp])]), "survey_responses.csv");
  }

  if (sheet === "sessions") {
    const headers = ["사용자번호", "집단", "논문세트", "현재단계", "시작시간"];
    const data = await getAllSessions();
    const rows = data.map((s) => [
      s.participantId, `집단${s.groupNum}`,
      s.paperSet==="vision"?"비전(I-JEPA)":s.paperSet==="timeseries"?"시계열(TimesFM)":s.paperSet==="optical"?"광통신(FSO)":"선형계획법",
      s.currentStep, s.createdAt
    ]);
    return csv(toCsv([headers, ...rows]), "sessions.csv");
  }

  if (sheet === "concept-map") {
    const headers = ["사용자번호", "논문세트", "노드수", "연결수", "수정횟수", "소요시간(초)", "저장시각"];
    const data = await getConceptMaps();
    const rows = data.map((c) => [
      c.participantId, c.paperSet, String(c.nodeCount), String(c.edgeCount),
      String(c.editCount), String(c.durationSec), c.createdAt
    ]);
    return csv(toCsv([headers, ...rows]), "concept_maps.csv");
  }

  return NextResponse.json({ error: "unknown sheet" }, { status: 400 });
}
