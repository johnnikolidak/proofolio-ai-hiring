import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { errorResult, supabaseForUser, textResult } from "../supabase";

export default defineTool({
  name: "get_job",
  title: "Get job details",
  description: "Fetch the full description, requirements and metadata for one Proofolio job by its id.",
  inputSchema: { job_id: z.string().describe("The job id returned by list_jobs.") },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ job_id }, ctx) => {
    if (!ctx.isAuthenticated()) return errorResult("Not authenticated");
    const { data, error } = await supabaseForUser(ctx).from("jobs").select("*").eq("id", job_id).maybeSingle();
    if (error) return errorResult(error.message);
    if (!data) return errorResult("Job not found or not visible to you.");
    return { ...textResult(data), structuredContent: { job: data } };
  },
});
