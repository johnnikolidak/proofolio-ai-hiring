import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Award, CheckCircle2, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { verifyCertificate } from "@/lib/verify.functions";

export const Route = createFileRoute("/verify/$code")({
  component: Verify,
  head: ({ params }) => ({ meta: [{ title: `Verify certificate ${params.code} — Proofolio` }] }),
});

function Verify() {
  const { code } = Route.useParams();
  const q = useQuery({
    queryKey: ["verify", code],
    queryFn: async () => {
      const row = await verifyCertificate({ data: { code } });
      if (!row) return null;
      return {
        id: row.id, title: row.title, issuer: row.issuer, score: row.score,
        verification_code: row.verification_code, issued_at: row.issued_at,
        candidate_id: row.candidate_id,
        holder: row.holder_name ? { id: row.candidate_id, full_name: row.holder_name, is_public: !!row.holder_is_public } : null,
      };
    },
  });

  if (q.isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary/40 to-background p-6">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-8 shadow-elev">
        {q.data ? (
          <>
            <div className="flex items-center gap-2 text-success"><CheckCircle2 className="h-5 w-5" /> <span className="text-sm font-medium">Verified certificate</span></div>
            <div className="mt-4 grid h-12 w-12 place-items-center rounded-xl bg-primary text-primary-foreground"><Award className="h-6 w-6" /></div>
            <h1 className="mt-4 text-2xl font-semibold">{q.data.title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">Issued by {q.data.issuer} on {format(new Date(q.data.issued_at), "MMMM d, yyyy")}</p>
            {q.data.holder?.full_name && (
              <div className="mt-6 rounded-lg border border-border p-4">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Awarded to</div>
                <div className="mt-1 font-semibold">{q.data.holder.full_name}</div>
                {q.data.holder.is_public && (
                  <Button asChild size="sm" variant="link" className="mt-1 px-0">
                    <Link to="/p/$id" params={{ id: q.data.holder.id }}>View public profile →</Link>
                  </Button>
                )}
              </div>
            )}
            {q.data.score != null && (
              <div className="mt-6"><div className="text-xs text-muted-foreground">Score achieved</div><div className="mt-1 text-4xl font-semibold text-primary">{q.data.score}</div></div>
            )}
            <div className="mt-6 font-mono text-[11px] text-muted-foreground">Code: {q.data.verification_code}</div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2 text-destructive"><XCircle className="h-5 w-5" /> <span className="text-sm font-medium">Not verified</span></div>
            <p className="mt-4 text-sm text-muted-foreground">We couldn't find a certificate with the code <span className="font-mono">{code}</span>.</p>
          </>
        )}
        <div className="mt-8"><Button asChild variant="outline" size="sm"><Link to="/">Back to Proofolio</Link></Button></div>
      </div>
    </div>
  );
}
