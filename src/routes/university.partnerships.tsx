import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/DashboardShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Handshake } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/university/partnerships")({ component: Partnerships });

const partners = [
  { name: "Northwind Labs", industry: "SaaS", challenges: 3, hires: 4, status: "Active" },
  { name: "Vela", industry: "Fintech", challenges: 2, hires: 1, status: "Active" },
  { name: "Lumen", industry: "AI", challenges: 1, hires: 0, status: "Pilot" },
  { name: "Foundry", industry: "Deep tech", challenges: 1, hires: 2, status: "Active" },
];

function Partnerships() {
  return (
    <>
      <PageHeader
        title="Employer Partnerships"
        description="Companies sponsoring challenges and hiring from your student community."
        actions={<Button onClick={() => toast.success("Partnership request sent to Proofolio partnerships team.")}>Invite an employer</Button>}
      />
      <div className="grid gap-4 md:grid-cols-2">
        {partners.map((p) => (
          <div key={p.name} className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary-soft text-primary"><Handshake className="h-5 w-5" /></div>
              <div>
                <div className="font-semibold">{p.name}</div>
                <div className="text-xs text-muted-foreground">{p.industry}</div>
              </div>
              <Badge className="ml-auto rounded-full" variant={p.status === "Active" ? "default" : "outline"}>{p.status}</Badge>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-border p-3">
                <div className="text-xs text-muted-foreground">Sponsored challenges</div>
                <div className="mt-1 text-lg font-semibold">{p.challenges}</div>
              </div>
              <div className="rounded-lg border border-border p-3">
                <div className="text-xs text-muted-foreground">Hires this year</div>
                <div className="mt-1 text-lg font-semibold">{p.hires}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
