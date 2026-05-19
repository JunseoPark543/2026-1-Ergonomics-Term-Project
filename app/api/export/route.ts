import { NextResponse } from "next/server";
import { getFilteringResponses, getSurveyResponses, getAllSessions } from "@/lib/db";
import { errorTypeLabel } from "@/lib/scoring";

function toCsv(rows: string[][]): string {
  return rows
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sheet = searchParams.get("sheet") ?? "filtering";

  if (sheet === "filtering") {
    const headers = [
      "사용자번호", "단계", "문장번호", "오류유형", "실제오류여부",
      "사용자응답", "정답여부", "점수", "판단확신도", "응답시간(ms)", "타임스탬프"
    ];
    const responseLabel: Record<string, string> = {
      accept: "수용", reject: "기각", revise: "수정", insufficient: "근거부족"
    };
    const phaseLabel: Record<string, string> = { pre: "사전", filtering: "개입", post: "사후" };
    const data = await getFilteringResponses();
    const rows = data.map((r) => [
      r.participantId, phaseLabel[r.phase] ?? r.phase, r.sentenceId,
      errorTypeLabel[r.errorType], r.isNoise ? "예" : "아니오",
      responseLabel[r.userResponse] ?? r.userResponse,
      r.isCorrect ? "정답" : "오답", String(r.score), String(r.confidence),
      String(r.responseTimeMs ?? ""), r.timestamp
    ]);
    return csv(toCsv([headers, ...rows]), "filtering_responses.csv");
  }

  if (sheet === "survey") {
    const headers = ["사용자번호", "문항번호", "리커트점수", "타임스탬프"];
    const data = await getSurveyResponses();
    const rows = data.map((r) => [r.participantId, r.questionId, String(r.likertScore), r.timestamp]);
    return csv(toCsv([headers, ...rows]), "survey_responses.csv");
  }

  if (sheet === "sessions") {
    const headers = ["사용자번호", "집단", "논문세트", "현재단계", "시작시간"];
    const data = await getAllSessions();
    const rows = data.map((s) => [
      s.participantId,
      `집단${s.groupNum}`,
      s.paperSet === "vision" ? "비전(I-JEPA+MAE)" : s.paperSet === "timeseries" ? "시계열(TimesFM+Chronos)" : "광통신(FSO+FSO-Perf)",
      s.currentStep, s.createdAt
    ]);
    return csv(toCsv([headers, ...rows]), "sessions.csv");
  }

  return NextResponse.json({ error: "unknown sheet" }, { status: 400 });
}

function csv(content: string, filename: string) {
  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`
    }
  });
}
