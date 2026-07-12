import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/DashboardShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export const Route = createFileRoute("/candidate/profile")({ component: Profile });

function Profile() {
  return (
    <>
      <PageHeader title="Profile" description="Your public portfolio, seen by hiring teams." actions={<Button>Preview public profile</Button>} />
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="rounded-xl border border-border bg-card p-6 text-center">
          <Avatar className="mx-auto h-24 w-24"><AvatarFallback className="bg-primary text-primary-foreground text-xl">SA</AvatarFallback></Avatar>
          <div className="mt-4 font-semibold">Sofía Alvarez</div>
          <div className="text-xs text-muted-foreground">Aspiring Product Analyst · Madrid</div>
          <div className="mt-4 flex flex-wrap justify-center gap-1.5">
            <Badge variant="secondary" className="rounded-full">Open to roles</Badge>
            <Badge variant="secondary" className="rounded-full">Remote OK</Badge>
          </div>
          <Button variant="outline" size="sm" className="mt-4 w-full">Change photo</Button>
        </div>
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="font-semibold">About</h3>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5"><Label>Headline</Label><Input defaultValue="Aspiring Product Analyst · ex-Vela intern" /></div>
              <div className="space-y-1.5"><Label>Location</Label><Input defaultValue="Madrid, Spain" /></div>
              <div className="md:col-span-2 space-y-1.5"><Label>Bio</Label>
                <Textarea rows={4} defaultValue="Business student turned data enthusiast. Built cohort analyses at Vela and Kinetic that shifted product priorities. Looking for a junior analyst or associate PM role." />
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="font-semibold">Skills</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {["SQL", "Excel", "Python", "Growth", "Product", "A/B testing", "Communication", "SaaS", "Analytics"].map((s) => (
                <Badge key={s} variant="outline" className="rounded-full">{s}</Badge>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="font-semibold">Featured work</h3>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {[
                { t: "Vela cohort retention teardown", s: 94 },
                { t: "Kinetic pricing experiment", s: 88 },
                { t: "Northwind SQL analytics", s: 91 },
              ].map((w) => (
                <div key={w.t} className="rounded-lg border border-border p-4">
                  <div className="font-medium">{w.t}</div>
                  <div className="mt-1 text-xs text-muted-foreground">Score {w.s}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
