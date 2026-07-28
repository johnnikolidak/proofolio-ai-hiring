import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { errorResult, supabaseForUser, textResult } from "../supabase";

export default defineTool({
  name: "list_jobs",
  title: "List jobs",
  description:
    "List published jobs on Proofolio. Optionally filter by a search term matching title, company or location, and by remote-only.",
  inputSchema: {
    search: z.string().optional().describe("Free-text filter on job title, company name or location."),
    remote_only: z.boolean().optional().describe("Only return remote jobs."),
    limit: z.number().int().optional().describe("Maximum number of jobs to return (default 20, max 50)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ search, remote_only, limit }, ctx) => {
    if (!ctx.isAuthenticated()) return errorResult("Not authenticated");
    const take = Math.min(Math.max(limit ?? 20, 1), 50);
    let query = supabaseForUser(ctx)
      .from("jobs")
      .select("id,title,company_name,location,remote,salary_range,tags,created_at")
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(take);

    if (remote_only) query = query.eq("remote", true);
    if (search?.trim()) {
      const term = search.trim().replace(/[%,()]/g, " ");
      query = query.or(`title.ilike.%${term}%,company_name.ilike.%${term}%,location.ilike.%${term}%`);
    }

    const { data, error } = await query;
    if (error) return errorResult(error.message);
    return { ...textResult(data ?? []), structuredContent: { jobs: data ?? [] } };
  },
});
