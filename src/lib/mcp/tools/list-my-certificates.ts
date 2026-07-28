import { defineTool } from "@lovable.dev/mcp-js";
import { defineTool as _unused } from "@lovable.dev/mcp-js";
import { errorResult, supabaseForUser, textResult } from "../supabase";

void _unused;

export default defineTool({
  name: "list_my_certificates",
  title: "List my certificates",
  description: "List the proof certificates earned by the signed-in user, with score and public verification code.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated()) return errorResult("Not authenticated");
    const { data, error } = await supabaseForUser(ctx)
      .from("certificates")
      .select("id,title,issuer,score,issued_at,verification_code,challenge_id")
      .eq("candidate_id", ctx.getUserId()!)
      .order("issued_at", { ascending: false });
    if (error) return errorResult(error.message);
    return { ...textResult(data ?? []), structuredContent: { certificates: data ?? [] } };
  },
});
