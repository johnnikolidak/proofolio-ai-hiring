import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/DashboardShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Mail } from "lucide-react";

export const Route = createFileRoute("/company/billing")({
  component: Billing,
  head: () => ({ meta: [{ title: "Billing — Proofolio" }] }),
});

function Billing() {
  return (
    <>
      <PageHeader title="Billing & plan" description="Company pricing at Proofolio is custom to your hiring volume and use case." />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-border bg-card p-6">
            <Badge className="rounded-full">Current plan</Badge>
            <h3 className="mt-2 text-2xl font-semibold">Trial</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              You're on a free trial of the Proofolio company workspace. Contact us to enable a full plan for your team.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Button asChild>
                <a href="/book-demo"><Mail className="mr-1.5 h-4 w-4" /> Contact sales</a>
              </Button>
              <Button variant="outline" asChild>
                <a href="mailto:johnnikolidakis@gmail.com?subject=Proofolio%20plan%20upgrade">Request upgrade</a>
              </Button>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="font-semibold">Invoices</h3>
            <div className="mt-4 rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              You have no invoices yet. Invoices will appear here once your plan is activated.
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <div className="font-semibold">Custom pricing</div>
              <div className="text-xs text-muted-foreground">Scoped to your team</div>
            </div>
          </div>
          <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
            <li>• Unlimited candidates</li>
            <li>• Custom challenge library</li>
            <li>• AI reports & structured interviews</li>
            <li>• SSO/SAML on Enterprise</li>
            <li>• Dedicated success manager</li>
          </ul>
        </div>
      </div>
    </>
  );
}
