import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/DashboardShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute("/candidate/settings")({ component: Settings });

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
      <PageHeader title="Settings" description="Manage your account, notifications, and privacy." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Account">
          <div className="space-y-4">
            <div className="space-y-1.5"><Label>Email</Label><Input defaultValue="sofia@proofolio.app" /></div>
            <div className="space-y-1.5"><Label>Password</Label><Input type="password" defaultValue="password" /></div>
            <Button>Save changes</Button>
          </div>
        </Section>
        <Section title="Notifications">
          <div className="divide-y divide-border">
            <Row title="New matched jobs" desc="Email me weekly job matches" control={<Switch defaultChecked />} />
            <Row title="Challenge feedback" desc="Ping me when AI feedback is ready" control={<Switch defaultChecked />} />
            <Row title="Interview reminders" desc="24h before scheduled sessions" control={<Switch defaultChecked />} />
            <Row title="Product updates" desc="Occasional product news" control={<Switch />} />
          </div>
        </Section>
        <Section title="Privacy">
          <div className="divide-y divide-border">
            <Row title="Public profile" desc="Discoverable by hiring teams" control={<Switch defaultChecked />} />
            <Row title="Anonymized benchmarking" desc="Include my scores in aggregate benchmarks" control={<Switch defaultChecked />} />
          </div>
          <Separator className="my-4" />
          <Button variant="destructive">Delete account</Button>
        </Section>
      </div>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h3 className="font-semibold">{title}</h3>
      <div className="mt-4">{children}</div>
    </div>
  );
}
