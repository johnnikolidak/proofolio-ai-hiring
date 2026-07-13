import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const MODEL = "google/gemini-2.5-flash";
const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

async function callAI(messages: ChatMessage[]): Promise<string> {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) throw new Error("AI is not configured on the server.");
  const res = await fetch(GATEWAY, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model: MODEL, messages, temperature: 0.6 }),
  });
  if (!res.ok) {
    const t = await res.text();
    if (res.status === 429) throw new Error("AI is rate-limited. Try again in a moment.");
    if (res.status === 402) throw new Error("AI credits exhausted. Please add credits.");
    throw new Error(`AI error ${res.status}: ${t.slice(0, 200)}`);
  }
  const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  return json.choices?.[0]?.message?.content?.trim() ?? "";
}

/** Start a new interview session and return the AI's opening question. */
export const startInterview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => z.object({ role_target: z.string().trim().min(2).max(120) }).parse(raw))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: session, error } = await supabase
      .from("interview_sessions")
      .insert({ candidate_id: userId, role_target: data.role_target, status: "active" })
      .select("id")
      .single();
    if (error || !session) throw new Error(error?.message ?? "Could not start session");
    const system = `You are an experienced interviewer conducting a behavioural and technical interview for a "${data.role_target}" role. Ask ONE focused question at a time. Keep questions concise. After 5-7 exchanges, be ready to wrap up. Never break character.`;
    const opener = await callAI([
      { role: "system", content: system },
      { role: "user", content: "Please start the interview with your first question." },
    ]);
    await supabase.from("interview_turns").insert([
      { session_id: session.id, role: "system", content: system },
      { session_id: session.id, role: "ai", content: opener },
    ]);
    return { session_id: session.id, question: opener };
  });

/** Post a candidate answer and get the AI's next question. */
export const answerInterview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) =>
    z.object({ session_id: z.string().uuid(), answer: z.string().trim().min(1).max(4000) }).parse(raw),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: sess } = await supabase
      .from("interview_sessions")
      .select("id,candidate_id,status,role_target")
      .eq("id", data.session_id)
      .single();
    if (!sess || sess.candidate_id !== userId) throw new Error("Session not found");
    if (sess.status !== "active") throw new Error("Session already completed");

    const { data: turns } = await supabase
      .from("interview_turns")
      .select("role,content")
      .eq("session_id", data.session_id)
      .order("created_at", { ascending: true });

    await supabase.from("interview_turns").insert({ session_id: data.session_id, role: "user", content: data.answer });

    const messages: ChatMessage[] = (turns ?? []).map((t) => ({
      role: t.role === "ai" ? "assistant" : t.role === "system" ? "system" : "user",
      content: t.content,
    }));
    messages.push({ role: "user", content: data.answer });
    const next = await callAI(messages);
    await supabase.from("interview_turns").insert({ session_id: data.session_id, role: "ai", content: next });
    return { question: next };
  });

/** Ends a session and generates a summary + score. */
export const endInterview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => z.object({ session_id: z.string().uuid() }).parse(raw))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: sess } = await supabase
      .from("interview_sessions")
      .select("id,candidate_id,role_target,status")
      .eq("id", data.session_id)
      .single();
    if (!sess || sess.candidate_id !== userId) throw new Error("Session not found");
    if (sess.status === "completed") return { ok: true };

    const { data: turns } = await supabase
      .from("interview_turns")
      .select("role,content")
      .eq("session_id", data.session_id)
      .order("created_at", { ascending: true });

    const transcript = (turns ?? [])
      .filter((t) => t.role !== "system")
      .map((t) => `${t.role === "ai" ? "Interviewer" : "Candidate"}: ${t.content}`)
      .join("\n\n");

    const summaryText = await callAI([
      {
        role: "system",
        content: `You evaluate mock interview transcripts for a "${sess.role_target}" role. Reply with strict JSON: {"score": <0-100 integer>, "summary": "<2-3 sentence feedback covering strengths and things to improve>"}`,
      },
      { role: "user", content: transcript },
    ]);

    let score: number | null = null;
    let summary = summaryText;
    try {
      const cleaned = summaryText.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(cleaned) as { score?: number; summary?: string };
      if (typeof parsed.score === "number") score = Math.max(0, Math.min(100, Math.round(parsed.score)));
      if (parsed.summary) summary = parsed.summary;
    } catch {
      /* fallback: keep raw text as summary */
    }

    await supabase
      .from("interview_sessions")
      .update({ status: "completed", ai_summary: summary, score, ended_at: new Date().toISOString() })
      .eq("id", data.session_id);
    return { ok: true, score, summary };
  });
