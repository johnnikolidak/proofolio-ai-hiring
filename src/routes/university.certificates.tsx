import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/DashboardShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Award, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/university/certificates")({ component: Certificates });

const certs = [
  { student: "Sofía Alvarez", cert: "Growth Analyst — Verified", issued: "3 days ago", code: "PRF-8Q2M-14X" },
  { student: "Kenji Watanabe", cert: "Data Analytics — Verified", issued: "1 week ago", code: "PRF-Z4V1-08K" },
  { student: "Amara Okafor", cert: "Product Thinking — Verified", issued: "2 weeks ago", code: "PRF-6H3P-22L" },
];

function Certificates() {
  return (
    <>
      <PageHeader title="Certificates" description="Every verified certificate issued from your challenges. Public verification URL included." />
      <div className="rounded-xl border border-border bg-card">
        {certs.map((c) => (
          <div key={c.code} className="flex flex-wrap items-center gap-4 border-b border-border p-4 last:border-0">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary-soft text-primary"><Award className="h-5 w-5" /></div>
            <div className="min-w-0 flex-1">
              <div className="font-medium">{c.cert}</div>
              <div className="text-xs text-muted-foreground">{c.student} · Issued {c.issued}</div>
            </div>
            <Badge variant="outline" className="rounded-full font-mono">{c.code}</Badge>
            <Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(`https://proofolio.app/verify/${c.code}`); toast.success("Verification link copied"); }}>
              <ExternalLink className="mr-1 h-3 w-3" /> Copy link
            </Button>
          </div>
        ))}
      </div>
    </>
  );
}
