import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/DashboardShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/company/settings")({ component: Settings });

function Settings() {
  const { user, profile, refreshProfile, signOut } = useAuth();
  const [name, setName] = useState(profile?.full_name ?? "");
  const [company, setCompany] = useState(profile?.company_name ?? "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(profile?.full_name ?? "");
    setCompany(profile?.company_name ?? "");
  }, [profile]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({ full_name: name, company_name: company }).eq("id", user.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    await refreshProfile();
    toast.success("Saved");
  };

  return (
    <>
      <PageHeader title="Settings" description="Manage your workspace." />
      <form onSubmit={save} className="max-w-xl space-y-4 rounded-xl border border-border bg-card p-6">
        <div className="space-y-1.5"><Label>Email</Label><Input value={profile?.email ?? user?.email ?? ""} disabled /></div>
        <div className="space-y-1.5"><Label>Contact name</Label><Input value={name} onChange={(e) => setName(e.target.value)} required /></div>
        <div className="space-y-1.5"><Label>Company name</Label><Input value={company} onChange={(e) => setCompany(e.target.value)} required /></div>
        <div className="flex gap-2">
          <Button type="submit" disabled={saving}>{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Save changes</Button>
          <Button type="button" variant="ghost" onClick={() => signOut()}>Sign out</Button>
        </div>
      </form>
    </>
  );
}
