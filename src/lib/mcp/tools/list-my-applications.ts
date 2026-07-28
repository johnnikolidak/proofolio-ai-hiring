import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { errorResult, supabaseForUser, textResult } from "../supabase";

export default defineTool({
  name: "list_my_applications",
  title: "List my applications",
  description: "List the signed-in user's job applications on Proofolio, including the current pipeline status.",
  inputSchema: {
    status: z.string().optional().describe("Filter by application status, e.g. 'applied', 'shortlisted'."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ status }, ctx) => {
    if (!ctx.isAuthenticated()) return errorResult("Not authenticated");
    let query = supabaseForUser(ctx)
      .from("applications")
      .select("id,status,cover_note,created_at,updated_at,jobs(id,title,company_name,location,remote)")
      .eq("candidate_id", ctx.getUserId()!)
      .order("created_at", { ascending: false });

    if (status?.trim()) query = query.eq("status", status.trim());

    const { data, error } = await query;
    if (error) return errorResult(error.message);
    return { ...textResult(data ?? []), structuredContent: { applications: data ?? [] } };
  },
});
