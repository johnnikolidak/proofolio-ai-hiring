import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/DashboardShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/company/settings")({ component: Settings });

function Row({ title, desc, control }: { title: string; desc: string; control: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <div>
        <div className="text-sm font-medium">{title}</div>
        <div className="text-xs text-muted-foreground">{desc}</div>
      </div>
      {control}
    </div>
  );
}

function Settings() {
  return (
    <>
      <PageHeader title="Settings" description="Workspace, team, and integrations." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Workspace">
          <div className="space-y-4">
            <div className="space-y-1.5"><Label>Company</Label><Input defaultValue="Northwind Labs" /></div>
            <div className="space-y-1.5"><Label>Website</Label><Input defaultValue="https://northwind.io" /></div>
            <Button>Save</Button>
          </div>
        </Card>
        <Card title="Team">
          <div className="divide-y divide-border">
            {[
              ["Amelia Chen", "amelia@northwind.io", "Owner"],
              ["Ravi Kumar", "ravi@northwind.io", "Admin"],
              ["Ines Martins", "ines@northwind.io", "Recruiter"],
            ].map(([n, e, r]) => (
              <div key={e} className="flex items-center justify-between py-3">
                <div>
                  <div className="text-sm font-medium">{n}</div>
                  <div className="text-xs text-muted-foreground">{e}</div>
                </div>
                <Badge variant="secondary" className="rounded-full">{r}</Badge>
              </div>
            ))}
          </div>
          <Button variant="outline" className="mt-3">Invite teammate</Button>
        </Card>
        <Card title="Integrations">
          <div className="divide-y divide-border">
            <Row title="Greenhouse" desc="Sync candidates to your ATS" control={<Switch defaultChecked />} />
            <Row title="Slack" desc="Notifications in #hiring channel" control={<Switch defaultChecked />} />
            <Row title="Google Calendar" desc="Interview scheduling" control={<Switch defaultChecked />} />
            <Row title="Zapier" desc="Custom automations" control={<Switch />} />
          </div>
        </Card>
        <Card title="Security">
          <div className="divide-y divide-border">
            <Row title="SSO / SAML" desc="Enforce SSO across the workspace" control={<Switch />} />
            <Row title="Two-factor auth" desc="Required for admins" control={<Switch defaultChecked />} />
            <Row title="Audit log" desc="30-day retention" control={<Switch defaultChecked />} />
          </div>
        </Card>
      </div>
    </>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h3 className="font-semibold">{title}</h3>
      <div className="mt-4">{children}</div>
    </div>
  );
}
