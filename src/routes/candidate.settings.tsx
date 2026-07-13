import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { PageHeader } from "@/components/DashboardShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

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
  const { user, profile, signOut, refreshProfile } = useAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();

  const settingsQ = useQuery({
    enabled: !!user?.id,
    queryKey: ["settings", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("user_settings").select("*").eq("user_id", user!.id).maybeSingle();
      if (error) throw error;
      if (!data) {
        const { data: created, error: cErr } = await supabase.from("user_settings").insert({ user_id: user!.id }).select("*").single();
        if (cErr) throw cErr;
        return created;
      }
      return data;
    },
  });

  const [prefs, setPrefs] = useState({
    notify_new_jobs: true,
    notify_challenge_feedback: true,
    notify_interview_reminders: true,
    notify_product_updates: false,
    anonymized_benchmarking: true,
  });
  const [publicProfile, setPublicProfile] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (settingsQ.data) setPrefs({
      notify_new_jobs: settingsQ.data.notify_new_jobs,
      notify_challenge_feedback: settingsQ.data.notify_challenge_feedback,
      notify_interview_reminders: settingsQ.data.notify_interview_reminders,
      notify_product_updates: settingsQ.data.notify_product_updates,
      anonymized_benchmarking: settingsQ.data.anonymized_benchmarking,
    });
  }, [settingsQ.data]);
  useEffect(() => { if (profile) setEmail(profile.email); }, [profile]);
  useEffect(() => {
    if (!user?.id) return;
    supabase.from("profiles").select("is_public").eq("id", user.id).single().then(({ data }) => {
      if (data) setPublicProfile(data.is_public ?? false);
    });
  }, [user?.id]);

  const saveAccount = useMutation({
    mutationFn: async () => {
      const parsed = z.object({ email: z.string().email(), password: z.string().min(0).max(200).optional() }).parse({ email, password: password || undefined });
      if (parsed.email !== profile?.email) {
        const { error } = await supabase.auth.updateUser({ email: parsed.email });
        if (error) throw error;
      }
      if (parsed.password && parsed.password.length > 0) {
        if (parsed.password.length < 8) throw new Error("Password must be at least 8 characters");
        const { error } = await supabase.auth.updateUser({ password: parsed.password });
        if (error) throw error;
      }
      setPassword("");
    },
    onSuccess: () => toast.success("Account updated"),
    onError: (e: Error) => toast.error(e.message),
  });

  const savePrefs = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("user_settings").update(prefs).eq("user_id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Notification preferences saved"); qc.invalidateQueries({ queryKey: ["settings"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const savePrivacy = useMutation({
    mutationFn: async () => {
      const [{ error: e1 }, { error: e2 }] = await Promise.all([
        supabase.from("profiles").update({ is_public: publicProfile }).eq("id", user!.id),
        supabase.from("user_settings").update({ anonymized_benchmarking: prefs.anonymized_benchmarking }).eq("user_id", user!.id),
      ]);
      if (e1) throw e1;
      if (e2) throw e2;
    },
    onSuccess: async () => { toast.success("Privacy updated"); await refreshProfile(); qc.invalidateQueries({ queryKey: ["settings"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteAccount = async () => {
    if (!confirm("Delete your account? This will permanently remove your profile, submissions and certificates. This cannot be undone.")) return;
    // Cascade-delete owned rows via RLS
    await supabase.from("profiles").delete().eq("id", user!.id);
    await signOut();
    navigate({ to: "/", replace: true });
    toast.success("Account deleted");
  };

  if (settingsQ.isLoading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <>
      <PageHeader title="Settings" description="Manage your account, notifications, and privacy." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Account">
          <div className="space-y-4">
            <div className="space-y-1.5"><Label>Email</Label><Input value={email} onChange={(e) => setEmail(e.target.value)} /></div>
            <div className="space-y-1.5"><Label>New password</Label><Input type="password" placeholder="Leave blank to keep current" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
            <Button onClick={() => saveAccount.mutate()} disabled={saveAccount.isPending}>{saveAccount.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Save changes</Button>
          </div>
        </Section>
        <Section title="Notifications">
          <div className="divide-y divide-border">
            <Row title="New matched jobs" desc="Email me weekly job matches" control={<Switch checked={prefs.notify_new_jobs} onCheckedChange={(v) => setPrefs({ ...prefs, notify_new_jobs: v })} />} />
            <Row title="Challenge feedback" desc="Ping me when feedback is ready" control={<Switch checked={prefs.notify_challenge_feedback} onCheckedChange={(v) => setPrefs({ ...prefs, notify_challenge_feedback: v })} />} />
            <Row title="Interview reminders" desc="24h before scheduled sessions" control={<Switch checked={prefs.notify_interview_reminders} onCheckedChange={(v) => setPrefs({ ...prefs, notify_interview_reminders: v })} />} />
            <Row title="Product updates" desc="Occasional product news" control={<Switch checked={prefs.notify_product_updates} onCheckedChange={(v) => setPrefs({ ...prefs, notify_product_updates: v })} />} />
          </div>
          <Button className="mt-4" onClick={() => savePrefs.mutate()} disabled={savePrefs.isPending}>{savePrefs.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Save preferences</Button>
        </Section>
        <Section title="Privacy">
          <div className="divide-y divide-border">
            <Row title="Public profile" desc="Discoverable by hiring teams" control={<Switch checked={publicProfile} onCheckedChange={setPublicProfile} />} />
            <Row title="Anonymized benchmarking" desc="Include my scores in aggregate benchmarks" control={<Switch checked={prefs.anonymized_benchmarking} onCheckedChange={(v) => setPrefs({ ...prefs, anonymized_benchmarking: v })} />} />
          </div>
          <Button className="mt-4" onClick={() => savePrivacy.mutate()} disabled={savePrivacy.isPending}>{savePrivacy.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Save privacy</Button>
          <Separator className="my-4" />
          <Button variant="destructive" onClick={deleteAccount}>Delete account</Button>
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
