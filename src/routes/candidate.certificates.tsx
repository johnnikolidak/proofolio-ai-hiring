import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";
import { Award, Download, Loader2, Share2 } from "lucide-react";
import { PageHeader } from "@/components/DashboardShell";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/candidate/certificates")({
  component: Certificates,
  head: () => ({ meta: [{ title: "Certificates — Proofolio" }] }),
});

type Cert = {
  id: string;
  title: string;
  issuer: string;
  score: number | null;
  verification_code: string;
  issued_at: string;
};

function Certificates() {
  const { user, profile } = useAuth();
  const q = useQuery({
    enabled: !!user?.id,
    queryKey: ["candidate", "certificates", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("certificates")
        .select("id,title,issuer,score,verification_code,issued_at")
        .eq("candidate_id", user!.id)
        .order("issued_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Cert[];
    },
  });

  const share = async (c: Cert) => {
    const url = `${window.location.origin}/verify/${c.verification_code}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Verification link copied");
    } catch {
      toast.error("Copy failed — link: " + url);
    }
  };

  const downloadPdf = (c: Cert) => {
    const win = window.open("", "_blank");
    if (!win) return;
    const url = `${window.location.origin}/verify/${c.verification_code}`;
    const html = certificateHtml({ ...c, holder: profile?.full_name || profile?.email || "Proofolio user", url });
    win.document.write(html);
    win.document.close();
    setTimeout(() => win.print(), 400);
  };

  if (q.isLoading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  const certs = q.data ?? [];

  return (
    <>
      <PageHeader
        title="Certificates"
        description="Verifiable proof of skill, issued automatically when you score 70+ on a scored challenge."
      />
      {certs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
          <Award className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">No certificates yet. Complete and pass a challenge to earn one.</p>
          <Button asChild className="mt-4"><Link to="/candidate/challenges">Browse challenges</Link></Button>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {certs.map((c) => (
            <div key={c.id} className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-soft transition-all hover:shadow-elev">
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary-soft opacity-60 blur-2xl" />
              <div className="relative">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary text-primary-foreground shadow-soft"><Award className="h-5 w-5" /></div>
                <h3 className="mt-4 text-lg font-semibold">{c.title}</h3>
                <div className="text-xs text-muted-foreground">{c.issuer} · issued {format(new Date(c.issued_at), "MMM d, yyyy")}</div>
                <div className="mt-1 text-[11px] font-mono text-muted-foreground">Verification: {c.verification_code}</div>
                <div className="mt-6 flex items-end justify-between">
                  <div>
                    <div className="text-xs text-muted-foreground">Score</div>
                    <div className="text-3xl font-semibold text-primary">{c.score ?? "—"}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => share(c)}><Share2 className="h-4 w-4" /></Button>
                    <Button size="sm" variant="outline" onClick={() => downloadPdf(c)}><Download className="h-4 w-4" /></Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function certificateHtml(c: { title: string; issuer: string; score: number | null; verification_code: string; issued_at: string; holder: string; url: string }) {
  return `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(c.title)} — Certificate</title><style>
  @page{size:A4 landscape;margin:0}
  body{margin:0;font-family:Georgia,serif;color:#0f172a;background:#fff}
  .cert{width:100vw;height:100vh;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#f8fafc 0%,#eef2ff 100%)}
  .card{width:900px;padding:60px;border:2px solid #6366f1;border-radius:16px;text-align:center;background:#fff;box-shadow:0 30px 60px rgba(15,23,42,.08)}
  .brand{letter-spacing:.3em;color:#6366f1;text-transform:uppercase;font-size:12px;font-weight:700}
  h1{margin:24px 0 8px;font-size:38px}
  .sub{color:#64748b}
  .holder{margin-top:36px;font-size:32px;font-family:'Great Vibes',cursive;border-bottom:1px dashed #cbd5e1;display:inline-block;padding:0 40px 8px}
  .body{margin-top:32px;font-size:18px;line-height:1.5}
  .meta{margin-top:40px;display:flex;justify-content:space-between;font-size:12px;color:#475569}
  .score{font-size:64px;font-weight:800;color:#4f46e5;margin-top:12px}
  .footer{margin-top:24px;font-size:10px;color:#94a3b8;font-family:monospace}
  </style></head><body onload="window.focus()"><div class="cert"><div class="card">
    <div class="brand">${escapeHtml(c.issuer)} · Certificate of Achievement</div>
    <h1>${escapeHtml(c.title)}</h1>
    <div class="sub">This certifies that</div>
    <div class="holder">${escapeHtml(c.holder)}</div>
    <div class="body">has successfully demonstrated the required skills, evaluated on a real-world challenge brief.</div>
    <div class="score">${c.score ?? ""}</div>
    <div class="meta"><div>Issued ${escapeHtml(format(new Date(c.issued_at), "MMMM d, yyyy"))}</div><div>Verify at ${escapeHtml(c.url)}</div></div>
    <div class="footer">Verification code: ${escapeHtml(c.verification_code)}</div>
  </div></div></body></html>`;
}
function escapeHtml(s: string) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
