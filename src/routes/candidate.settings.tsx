import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/DashboardShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/candidate/settings")({ component: Settings });

function Settings() {
  const { user, profile, signOut } = useAuth();
  return (
    <>
      <PageHeader title="Settings" description="Manage your account." />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="font-semibold">Account</h3>
          <div className="mt-4 space-y-4">
            <div className="space-y-1.5"><Label>Email</Label><Input value={profile?.email ?? user?.email ?? ""} disabled /></div>
            <div className="space-y-1.5"><Label>Name</Label><Input value={profile?.full_name ?? ""} disabled /></div>
            <p className="text-xs text-muted-foreground">Edit profile fields (name, headline, bio, skills, avatar) from your Proof Profile.</p>
            <div className="flex gap-2">
              <Button asChild variant="outline"><Link to="/candidate/profile">Edit Proof Profile</Link></Button>
              <Button variant="ghost" onClick={() => signOut()}>Sign out</Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
