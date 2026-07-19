import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const verifyCertificate = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => z.object({ code: z.string().min(1).max(200) }).parse(raw))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin
      .from("certificates")
      .select("id,title,issuer,score,verification_code,issued_at,candidate_id")
      .eq("verification_code", data.code)
      .limit(1);
    if (error) throw error;
    const cert = rows?.[0];
    if (!cert) return null;
    const { data: prof } = await supabaseAdmin
      .from("profiles")
      .select("full_name,is_public")
      .eq("id", cert.candidate_id)
      .maybeSingle();
    return {
      id: cert.id,
      title: cert.title,
      issuer: cert.issuer,
      score: cert.score,
      verification_code: cert.verification_code,
      issued_at: cert.issued_at,
      candidate_id: cert.candidate_id,
      holder_name: prof?.full_name ?? null,
      holder_is_public: !!prof?.is_public,
    };
  });
