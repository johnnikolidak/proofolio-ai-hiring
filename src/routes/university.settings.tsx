import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/DashboardShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/university/settings")({ component: Settings });

function Settings() {
  const { user, profile, refreshProfile } = useAuth();
  const [name, setName] = useState(profile?.full_name ?? "");
  const [org, setOrg] = useState(profile?.company_name ?? "");
  const [saving, setSaving] = useState(false);

  useEffect(() => { setName(profile?.full_name ?? ""); setOrg(profile?.company_name ?? ""); }, [profile]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({ full_name: name, company_name: org }).eq("id", user.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    await refreshProfile();
    toast.success("Saved");
  };

  return (
    <>
      <PageHeader title="Settings" description="Manage your university profile." />
      <form onSubmit={save} className="max-w-xl space-y-4 rounded-xl border border-border bg-card p-6">
        <div className="space-y-1.5"><Label>Email</Label><Input value={profile?.email ?? ""} disabled /></div>
        <div className="space-y-1.5"><Label>Contact name</Label><Input value={name} onChange={(e) => setName(e.target.value)} required /></div>
        <div className="space-y-1.5"><Label>University</Label><Input value={org} onChange={(e) => setOrg(e.target.value)} required /></div>
        <Button type="submit" disabled={saving}>{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Save changes</Button>
      </form>
    </>
  );
}
