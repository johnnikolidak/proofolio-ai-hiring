import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { errorResult, supabaseForUser, textResult } from "../supabase";

export default defineTool({
  name: "apply_to_job",
  title: "Apply to a job",
  description: "Submit an application to a published Proofolio job on behalf of the signed-in candidate.",
  inputSchema: {
    job_id: z.string().describe("The job id to apply to."),
    cover_note: z.string().optional().describe("Optional short cover note sent with the application."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
  handler: async ({ job_id, cover_note }, ctx) => {
    if (!ctx.isAuthenticated()) return errorResult("Not authenticated");
    const supabase = supabaseForUser(ctx);
    const candidateId = ctx.getUserId()!;

    const { data: existing } = await supabase
      .from("applications")
      .select("id,status")
      .eq("job_id", job_id)
      .eq("candidate_id", candidateId)
      .maybeSingle();
    if (existing) return errorResult(`You already applied to this job (status: ${existing.status}).`);

    const { data, error } = await supabase
      .from("applications")
      .insert({ job_id, candidate_id: candidateId, cover_note: cover_note?.trim() || null })
      .select("id,job_id,status,created_at")
      .maybeSingle();
    if (error) return errorResult(error.message);
    return { ...textResult(data), structuredContent: { application: data } };
  },
});
