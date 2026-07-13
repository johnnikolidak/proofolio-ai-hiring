import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/DashboardShell";
import { Button } from "@/components/ui/button";
import { Award, Download, Share2 } from "lucide-react";

export const Route = createFileRoute("/candidate/certificates")({ component: Certificates });

const certs = [
  { name: "SQL Analytics I", issued: "Aug 2, 2025", score: 91, org: "Proofolio × Northwind" },
  { name: "Growth Marketing Fundamentals", issued: "Jul 18, 2025", score: 88, org: "Proofolio × Vela" },
  { name: "Product Sense", issued: "Jun 27, 2025", score: 94, org: "Proofolio × Kinetic" },
  { name: "Data Storytelling", issued: "May 12, 2025", score: 85, org: "Proofolio" },
];

function Certificates() {
  return (
    <>
      <PageHeader title="Certificates" description="Shareable proof of skill. All verifiable on-chain." />
      <div className="grid gap-5 md:grid-cols-2">
        {certs.map((c) => (
          <div key={c.name} className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-soft transition-all hover:shadow-elev">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary-soft opacity-60 blur-2xl" />
            <div className="relative">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary text-primary-foreground shadow-soft">
                <Award className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">{c.name}</h3>
              <div className="text-xs text-muted-foreground">{c.org} · issued {c.issued}</div>
              <div className="mt-6 flex items-end justify-between">
                <div>
                  <div className="text-xs text-muted-foreground">Score</div>
                  <div className="text-3xl font-semibold text-primary">{c.score}</div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline"><Share2 className="h-4 w-4" /></Button>
                  <Button size="sm" variant="outline"><Download className="h-4 w-4" /></Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
