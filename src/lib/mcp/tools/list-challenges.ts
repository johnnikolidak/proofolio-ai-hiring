import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { errorResult, supabaseForUser, textResult } from "../supabase";

export default defineTool({
  name: "list_challenges",
  title: "List challenges",
  description: "List published skill challenges on Proofolio, optionally filtered by role, industry or difficulty.",
  inputSchema: {
    role: z.string().optional().describe("Filter by the role a challenge targets, e.g. 'Product Designer'."),
    industry: z.string().optional().describe("Filter by industry."),
    difficulty: z.string().optional().describe("Filter by difficulty label, e.g. 'easy', 'medium', 'hard'."),
    limit: z.number().int().optional().describe("Maximum number of challenges to return (default 20, max 50)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ role, industry, difficulty, limit }, ctx) => {
    if (!ctx.isAuthenticated()) return errorResult("Not authenticated");
    const take = Math.min(Math.max(limit ?? 20, 1), 50);
    let query = supabaseForUser(ctx)
      .from("challenges")
      .select("id,title,role,industry,difficulty,duration_hours,evidence_dimensions,created_at")
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(take);

    if (role?.trim()) query = query.ilike("role", `%${role.trim()}%`);
    if (industry?.trim()) query = query.ilike("industry", `%${industry.trim()}%`);
    if (difficulty?.trim()) query = query.ilike("difficulty", difficulty.trim());

    const { data, error } = await query;
    if (error) return errorResult(error.message);
    return { ...textResult(data ?? []), structuredContent: { challenges: data ?? [] } };
  },
});
