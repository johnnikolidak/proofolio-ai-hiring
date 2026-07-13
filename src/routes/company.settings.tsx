import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Upload } from "lucide-react";
import { PageHeader } from "@/components/DashboardShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/company/settings")({
  component: Settings,
  head: () => ({ meta: [{ title: "Settings — Proofolio" }] }),
});

function Settings() {
  const { user, refreshProfile } = useAuth();
  const qc = useQueryClient();
  const profileQ = useQuery({
    enabled: !!user?.id,
    queryKey: ["company", "profile-full", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("id,email,full_name,company_name,headline,bio,avatar_url").eq("id", user!.id).single();
      if (error) throw error;
      return data;
    },
  });
  const profile = profileQ.data;
  const [company, setCompany] = useState("");
  const [fullName, setFullName] = useState("");
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profile) {
      setCompany(profile.company_name ?? "");
      setFullName(profile.full_name ?? "");
      setHeadline(profile.headline ?? "");
      setBio(profile.bio ?? "");
      setAvatarUrl(profile.avatar_url ?? null);
    }
  }, [profile]);

  const save = useMutation({
    mutationFn: async () => {
      if (!company.trim()) throw new Error("Company name is required");
      const { error } = await supabase.from("profiles").update({
        company_name: company.trim(),
        full_name: fullName.trim() || null,
        headline: headline.trim() || null,
        bio: bio.trim() || null,
      }).eq("id", user!.id);
      if (error) throw error;
    },
    onSuccess: async () => { toast.success("Saved"); await refreshProfile(); await profileQ.refetch(); qc.invalidateQueries(); },
    onError: (e: Error) => toast.error(e.message),
  });

  const uploadLogo = useMutation({
    mutationFn: async (file: File) => {
      if (!file.type.startsWith("image/")) throw new Error("Choose an image file");
      if (file.size > 5 * 1024 * 1024) throw new Error("Max 5MB");
      const ext = file.name.split(".").pop() ?? "png";
      const path = `${user!.id}/logo-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      const url = data.publicUrl;
      const { error } = await supabase.from("profiles").update({ avatar_url: url }).eq("id", user!.id);
      if (error) throw error;
      setAvatarUrl(url);
    },
    onSuccess: async () => { toast.success("Logo updated"); await refreshProfile(); await profileQ.refetch(); },
    onError: (e: Error) => toast.error(e.message),
  });

  const emailChange = useMutation({
    mutationFn: async (newEmail: string) => {
      const { error } = await supabase.auth.updateUser({ email: newEmail });
      if (error) throw error;
    },
    onSuccess: () => toast.success("Confirmation email sent to new address"),
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <>
      <PageHeader title="Settings" description="Your workspace profile — visible to candidates on job posts and messages." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Workspace">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              {avatarUrl && <AvatarImage src={avatarUrl} alt="Logo" />}
              <AvatarFallback className="bg-primary-soft text-primary text-lg font-semibold">{(company || "?")[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadLogo.mutate(f); }} />
              <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()} disabled={uploadLogo.isPending}>
                {uploadLogo.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />} Upload logo
              </Button>
              <p className="mt-1 text-[11px] text-muted-foreground">PNG or JPG, up to 5MB.</p>
            </div>
          </div>
          <div className="mt-4 space-y-3">
            <F label="Company *"><Input value={company} onChange={(e) => setCompany(e.target.value)} /></F>
            <F label="Your name"><Input value={fullName} onChange={(e) => setFullName(e.target.value)} /></F>
            <F label="Tagline / headline"><Input value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="Building the future of…" /></F>
            <F label="About"><Textarea rows={4} value={bio} onChange={(e) => setBio(e.target.value)} /></F>
            <Button onClick={() => save.mutate()} disabled={save.isPending}>{save.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Save</Button>
          </div>
        </Card>
        <Card title="Account">
          <EmailBlock currentEmail={profile?.email ?? ""} onSubmit={(v) => emailChange.mutate(v)} pending={emailChange.isPending} />
          <hr className="my-6 border-border" />
          <p className="text-sm text-muted-foreground">Team invitations, integrations, and SSO are not enabled on this plan yet. <a href="/book-demo" className="text-primary underline">Contact us</a> to enable them.</p>
        </Card>
      </div>
    </>
  );
}

function EmailBlock({ currentEmail, onSubmit, pending }: { currentEmail: string; onSubmit: (v: string) => void; pending: boolean }) {
  const [v, setV] = useState(currentEmail);
  useEffect(() => setV(currentEmail), [currentEmail]);
  return (
    <div className="space-y-3">
      <F label="Sign-in email"><Input type="email" value={v} onChange={(e) => setV(e.target.value)} /></F>
      <Button variant="outline" onClick={() => onSubmit(v)} disabled={pending || v === currentEmail || !v}>
        {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Change email
      </Button>
    </div>
  );
}
function F({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label className="text-xs">{label}</Label>{children}</div>;
}
function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="rounded-xl border border-border bg-card p-6"><h3 className="font-semibold">{title}</h3><div className="mt-4">{children}</div></div>;
}
