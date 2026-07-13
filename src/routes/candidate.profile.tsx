import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import { FileText, Loader2, Upload, X, Plus, ExternalLink, Trash2, Download } from "lucide-react";
import { PageHeader } from "@/components/DashboardShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/candidate/profile")({ component: Profile });

type Experience = { title: string; company: string; from: string; to: string; description?: string };
type Education = { school: string; degree: string; year: string };
type Language = { name: string; level: string };
type PortfolioItem = { title: string; url: string; description?: string };
type Links = { website?: string; linkedin?: string; github?: string; twitter?: string };

const AVATAR_MAX_BYTES = 3 * 1024 * 1024;
const AVATAR_MIME = ["image/png", "image/jpeg", "image/webp"];
const CV_MAX_BYTES = 10 * 1024 * 1024;
const CV_MIME = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const LANGUAGE_LEVELS = ["Basic", "Conversational", "Fluent", "Native"];

function Profile() {
  const { user, refreshProfile } = useAuth();
  const qc = useQueryClient();
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [cvUploading, setCvUploading] = useState(false);
  const [signedAvatar, setSignedAvatar] = useState<string | null>(null);
  const [signedCv, setSignedCv] = useState<string | null>(null);
  const avatarRef = useRef<HTMLInputElement>(null);
  const cvRef = useRef<HTMLInputElement>(null);

  const profileQ = useQuery({
    enabled: !!user?.id,
    queryKey: ["candidate", "profile", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", user!.id).single();
      if (error) throw error;
      return data;
    },
  });

  const [form, setForm] = useState({
    full_name: "",
    headline: "",
    bio: "",
    location: "",
    availability: "",
    is_public: false,
    skills: [] as string[],
    preferred_roles: [] as string[],
    education: [] as Education[],
    experience: [] as Experience[],
    languages: [] as Language[],
    portfolio: [] as PortfolioItem[],
    links: {} as Links,
  });
  const [skillDraft, setSkillDraft] = useState("");
  const [roleDraft, setRoleDraft] = useState("");

  useEffect(() => {
    const p = profileQ.data;
    if (!p) return;
    setForm({
      full_name: p.full_name ?? "",
      headline: p.headline ?? "",
      bio: p.bio ?? "",
      location: p.location ?? "",
      availability: p.availability ?? "",
      is_public: p.is_public ?? false,
      skills: (p.skills as string[]) ?? [],
      preferred_roles: (p.preferred_roles as string[]) ?? [],
      education: (p.education as unknown as Education[]) ?? [],
      experience: (p.experience as unknown as Experience[]) ?? [],
      languages: (p.languages as unknown as Language[]) ?? [],
      portfolio: (p.portfolio as unknown as PortfolioItem[]) ?? [],
      links: (p.links as unknown as Links) ?? {},
    });
  }, [profileQ.data]);

  useEffect(() => {
    const path = profileQ.data?.avatar_url;
    if (!path) { setSignedAvatar(null); return; }
    let cancelled = false;
    supabase.storage.from("avatars").createSignedUrl(path, 60 * 60).then(({ data }) => {
      if (!cancelled) setSignedAvatar(data?.signedUrl ?? null);
    });
    return () => { cancelled = true; };
  }, [profileQ.data?.avatar_url]);

  useEffect(() => {
    const path = profileQ.data?.cv_url;
    if (!path) { setSignedCv(null); return; }
    let cancelled = false;
    supabase.storage.from("cvs").createSignedUrl(path, 60 * 60).then(({ data }) => {
      if (!cancelled) setSignedCv(data?.signedUrl ?? null);
    });
    return () => { cancelled = true; };
  }, [profileQ.data?.cv_url]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const validated = z.object({
        full_name: z.string().trim().max(120),
        headline: z.string().trim().max(160),
        bio: z.string().trim().max(2000),
        location: z.string().trim().max(120),
        availability: z.string().trim().max(60),
        is_public: z.boolean(),
        skills: z.array(z.string().trim().min(1).max(40)).max(50),
        preferred_roles: z.array(z.string().trim().min(1).max(60)).max(20),
        education: z.array(z.object({ school: z.string().max(120), degree: z.string().max(120), year: z.string().max(20) })),
        experience: z.array(z.object({ title: z.string().max(120), company: z.string().max(120), from: z.string().max(30), to: z.string().max(30), description: z.string().max(1000).optional() })),
        languages: z.array(z.object({ name: z.string().min(1).max(60), level: z.string().min(1).max(30) })).max(20),
        portfolio: z.array(z.object({ title: z.string().min(1).max(120), url: z.string().url(), description: z.string().max(400).optional() })).max(20),
        links: z.object({
          website: z.string().url().optional().or(z.literal("")),
          linkedin: z.string().url().optional().or(z.literal("")),
          github: z.string().url().optional().or(z.literal("")),
          twitter: z.string().url().optional().or(z.literal("")),
        }).partial(),
      }).parse(form);
      const { error } = await supabase.from("profiles").update({
        full_name: validated.full_name || null,
        headline: validated.headline || null,
        bio: validated.bio || null,
        location: validated.location || null,
        availability: validated.availability || null,
        is_public: validated.is_public,
        skills: validated.skills,
        preferred_roles: validated.preferred_roles,
        education: validated.education as never,
        experience: validated.experience as never,
        languages: validated.languages as never,
        portfolio: validated.portfolio as never,
        links: validated.links as never,
      }).eq("id", user!.id);
      if (error) throw error;
    },
    onSuccess: async () => {
      toast.success("Profile saved");
      await qc.invalidateQueries({ queryKey: ["candidate", "profile"] });
      await refreshProfile();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleAvatar = async (file: File) => {
    if (!AVATAR_MIME.includes(file.type)) { toast.error("Use PNG, JPG or WebP"); return; }
    if (file.size > AVATAR_MAX_BYTES) { toast.error("Image must be under 3 MB"); return; }
    setAvatarUploading(true);
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${user!.id}/avatar-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, { upsert: true, contentType: file.type });
    if (upErr) { setAvatarUploading(false); toast.error(upErr.message); return; }
    if (profileQ.data?.avatar_url && profileQ.data.avatar_url !== path) {
      await supabase.storage.from("avatars").remove([profileQ.data.avatar_url]);
    }
    const { error: pErr } = await supabase.from("profiles").update({ avatar_url: path }).eq("id", user!.id);
    setAvatarUploading(false);
    if (pErr) { toast.error(pErr.message); return; }
    toast.success("Photo updated");
    await qc.invalidateQueries({ queryKey: ["candidate", "profile"] });
    await refreshProfile();
  };

  const removeAvatar = async () => {
    if (!profileQ.data?.avatar_url) return;
    await supabase.storage.from("avatars").remove([profileQ.data.avatar_url]);
    await supabase.from("profiles").update({ avatar_url: null }).eq("id", user!.id);
    toast.success("Photo removed");
    await qc.invalidateQueries({ queryKey: ["candidate", "profile"] });
    await refreshProfile();
  };

  const handleCv = async (file: File) => {
    if (!CV_MIME.includes(file.type)) { toast.error("Upload a PDF or Word document"); return; }
    if (file.size > CV_MAX_BYTES) { toast.error("File must be under 10 MB"); return; }
    setCvUploading(true);
    const ext = file.name.split(".").pop() ?? "pdf";
    const path = `${user!.id}/cv-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("cvs").upload(path, file, { upsert: true, contentType: file.type });
    if (upErr) { setCvUploading(false); toast.error(upErr.message); return; }
    if (profileQ.data?.cv_url && profileQ.data.cv_url !== path) {
      await supabase.storage.from("cvs").remove([profileQ.data.cv_url]);
    }
    const { error: pErr } = await supabase.from("profiles").update({ cv_url: path, cv_filename: file.name }).eq("id", user!.id);
    setCvUploading(false);
    if (pErr) { toast.error(pErr.message); return; }
    toast.success("CV uploaded");
    await qc.invalidateQueries({ queryKey: ["candidate", "profile"] });
  };

  const removeCv = async () => {
    if (!profileQ.data?.cv_url) return;
    await supabase.storage.from("cvs").remove([profileQ.data.cv_url]);
    await supabase.from("profiles").update({ cv_url: null, cv_filename: null }).eq("id", user!.id);
    toast.success("CV removed");
    await qc.invalidateQueries({ queryKey: ["candidate", "profile"] });
  };

  if (profileQ.isLoading) return <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  if (profileQ.error) return <div className="rounded-xl border border-border bg-card p-6 text-sm text-destructive">Failed to load profile.</div>;

  const p = profileQ.data!;
  const completion = p.completion_pct ?? 0;
  const initials = (form.full_name || p.email || "?").split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase();

  const addSkill = () => {
    const v = skillDraft.trim();
    if (!v || form.skills.includes(v)) { setSkillDraft(""); return; }
    setForm({ ...form, skills: [...form.skills, v] });
    setSkillDraft("");
  };
  const addRole = () => {
    const v = roleDraft.trim();
    if (!v || form.preferred_roles.includes(v)) { setRoleDraft(""); return; }
    setForm({ ...form, preferred_roles: [...form.preferred_roles, v] });
    setRoleDraft("");
  };

  return (
    <>
      <PageHeader
        title="Proof Profile"
        description="Your public portfolio, seen by hiring teams."
        actions={
          <>
            {p.is_public && (
              <Button asChild variant="outline"><Link to="/p/$id" params={{ id: p.id }}><ExternalLink className="mr-1.5 h-4 w-4" />View public profile</Link></Button>
            )}
            <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
              {saveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Save changes
            </Button>
          </>
        }
      />
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-6 text-center">
            <Avatar className="mx-auto h-24 w-24">
              {signedAvatar ? <AvatarImage src={signedAvatar} alt={form.full_name} /> : null}
              <AvatarFallback className="bg-primary text-primary-foreground text-xl">{initials}</AvatarFallback>
            </Avatar>
            <div className="mt-4 font-semibold">{form.full_name || "Add your name"}</div>
            <div className="text-xs text-muted-foreground">{form.headline || "Add a headline"}</div>
            <input ref={avatarRef} type="file" accept={AVATAR_MIME.join(",")} className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleAvatar(f); e.target.value = ""; }} />
            <div className="mt-4 flex gap-2">
              <Button variant="outline" size="sm" className="flex-1" onClick={() => avatarRef.current?.click()} disabled={avatarUploading}>
                {avatarUploading ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : <Upload className="mr-1.5 h-3 w-3" />}
                {p.avatar_url ? "Replace" : "Upload"}
              </Button>
              {p.avatar_url && <Button variant="ghost" size="sm" onClick={removeAvatar}><Trash2 className="h-3 w-3" /></Button>}
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center justify-between text-sm"><span className="font-medium">Profile completeness</span><span className="text-primary font-semibold">{completion}%</span></div>
            <Progress value={completion} className="mt-2" />
            <p className="mt-3 text-xs text-muted-foreground">A complete profile gets 3× more views from recruiters.</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">Public profile</div>
                <div className="text-xs text-muted-foreground">Allow recruiters and universities to find you.</div>
              </div>
              <Switch checked={form.is_public} onCheckedChange={(v) => setForm({ ...form, is_public: v })} />
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="mb-2 flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <div className="text-sm font-medium">CV / Resume</div>
            </div>
            <input ref={cvRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleCv(f); e.target.value = ""; }} />
            {p.cv_url ? (
              <div className="space-y-2">
                <div className="truncate rounded-lg border border-border bg-secondary/40 px-3 py-2 text-xs">{p.cv_filename || "cv.pdf"}</div>
                <div className="flex gap-2">
                  {signedCv && <Button asChild size="sm" variant="outline" className="flex-1"><a href={signedCv} target="_blank" rel="noreferrer"><Download className="mr-1.5 h-3 w-3" />View</a></Button>}
                  <Button size="sm" variant="outline" onClick={() => cvRef.current?.click()} disabled={cvUploading}>{cvUploading ? <Loader2 className="h-3 w-3 animate-spin" /> : "Replace"}</Button>
                  <Button size="sm" variant="ghost" onClick={removeCv}><Trash2 className="h-3 w-3" /></Button>
                </div>
              </div>
            ) : (
              <Button size="sm" variant="outline" className="w-full" onClick={() => cvRef.current?.click()} disabled={cvUploading}>
                {cvUploading ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : <Upload className="mr-1.5 h-3 w-3" />}Upload PDF or Word
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <Card title="About">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Full name"><Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} placeholder="Your name" /></Field>
              <Field label="Headline"><Input value={form.headline} onChange={(e) => setForm({ ...form, headline: e.target.value })} placeholder="e.g. Aspiring Product Analyst" /></Field>
              <Field label="Location"><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="City, Country" /></Field>
              <Field label="Availability"><Input value={form.availability} onChange={(e) => setForm({ ...form, availability: e.target.value })} placeholder="e.g. Immediate, in 3 months" /></Field>
              <div className="md:col-span-2"><Field label="Bio"><Textarea rows={4} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Tell hiring teams who you are and what you're building." /></Field></div>
            </div>
          </Card>

          <Card title="Skills" description={form.skills.length === 0 ? "Add at least 3 skills to be discoverable." : undefined}>
            <div className="flex gap-2">
              <Input value={skillDraft} onChange={(e) => setSkillDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }} placeholder="Add a skill (press Enter)" />
              <Button variant="outline" onClick={addSkill}><Plus className="h-4 w-4" /></Button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {form.skills.length === 0 ? <div className="text-xs text-muted-foreground">No skills yet.</div> : form.skills.map((s) => (
                <Badge key={s} variant="outline" className="gap-1 rounded-full">
                  {s}
                  <button onClick={() => setForm({ ...form, skills: form.skills.filter((x) => x !== s) })} aria-label={`Remove ${s}`}><X className="h-3 w-3" /></button>
                </Badge>
              ))}
            </div>
          </Card>

          <Card title="Preferred roles">
            <div className="flex gap-2">
              <Input value={roleDraft} onChange={(e) => setRoleDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addRole(); } }} placeholder="e.g. Product Analyst" />
              <Button variant="outline" onClick={addRole}><Plus className="h-4 w-4" /></Button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {form.preferred_roles.length === 0 ? <div className="text-xs text-muted-foreground">No roles yet.</div> : form.preferred_roles.map((s) => (
                <Badge key={s} variant="secondary" className="gap-1 rounded-full">
                  {s}
                  <button onClick={() => setForm({ ...form, preferred_roles: form.preferred_roles.filter((x) => x !== s) })} aria-label={`Remove ${s}`}><X className="h-3 w-3" /></button>
                </Badge>
              ))}
            </div>
          </Card>

          <Card title="Experience">
            <div className="space-y-3">
              {form.experience.map((x, i) => (
                <div key={i} className="grid gap-2 rounded-lg border border-border p-3 md:grid-cols-2">
                  <Input value={x.title} onChange={(e) => updateExp(i, { title: e.target.value })} placeholder="Role" />
                  <Input value={x.company} onChange={(e) => updateExp(i, { company: e.target.value })} placeholder="Company" />
                  <Input value={x.from} onChange={(e) => updateExp(i, { from: e.target.value })} placeholder="From (e.g. Jan 2024)" />
                  <Input value={x.to} onChange={(e) => updateExp(i, { to: e.target.value })} placeholder="To (or 'Present')" />
                  <div className="md:col-span-2"><Textarea rows={2} value={x.description ?? ""} onChange={(e) => updateExp(i, { description: e.target.value })} placeholder="What did you do or ship?" /></div>
                  <div className="md:col-span-2 flex justify-end"><Button size="sm" variant="ghost" onClick={() => setForm({ ...form, experience: form.experience.filter((_, k) => k !== i) })}><Trash2 className="h-3 w-3" /></Button></div>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={() => setForm({ ...form, experience: [...form.experience, { title: "", company: "", from: "", to: "" }] })}><Plus className="mr-1 h-3 w-3" /> Add experience</Button>
            </div>
          </Card>

          <Card title="Education">
            <div className="space-y-3">
              {form.education.map((x, i) => (
                <div key={i} className="grid gap-2 rounded-lg border border-border p-3 md:grid-cols-3">
                  <Input value={x.school} onChange={(e) => updateEdu(i, { school: e.target.value })} placeholder="School" />
                  <Input value={x.degree} onChange={(e) => updateEdu(i, { degree: e.target.value })} placeholder="Degree" />
                  <Input value={x.year} onChange={(e) => updateEdu(i, { year: e.target.value })} placeholder="Year" />
                  <div className="md:col-span-3 flex justify-end"><Button size="sm" variant="ghost" onClick={() => setForm({ ...form, education: form.education.filter((_, k) => k !== i) })}><Trash2 className="h-3 w-3" /></Button></div>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={() => setForm({ ...form, education: [...form.education, { school: "", degree: "", year: "" }] })}><Plus className="mr-1 h-3 w-3" /> Add education</Button>
            </div>
          </Card>

          <Card title="Languages">
            <div className="space-y-3">
              {form.languages.map((x, i) => (
                <div key={i} className="grid gap-2 rounded-lg border border-border p-3 md:grid-cols-[1fr_200px_auto]">
                  <Input value={x.name} onChange={(e) => updateLang(i, { name: e.target.value })} placeholder="Language" />
                  <select
                    value={x.level}
                    onChange={(e) => updateLang(i, { level: e.target.value })}
                    className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="">Level…</option>
                    {LANGUAGE_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                  <Button size="sm" variant="ghost" onClick={() => setForm({ ...form, languages: form.languages.filter((_, k) => k !== i) })}><Trash2 className="h-3 w-3" /></Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={() => setForm({ ...form, languages: [...form.languages, { name: "", level: "" }] })}><Plus className="mr-1 h-3 w-3" /> Add language</Button>
            </div>
          </Card>

          <Card title="Portfolio">
            <div className="space-y-3">
              {form.portfolio.map((x, i) => (
                <div key={i} className="grid gap-2 rounded-lg border border-border p-3 md:grid-cols-2">
                  <Input value={x.title} onChange={(e) => updatePort(i, { title: e.target.value })} placeholder="Title" />
                  <Input value={x.url} onChange={(e) => updatePort(i, { url: e.target.value })} placeholder="https://…" />
                  <div className="md:col-span-2"><Textarea rows={2} value={x.description ?? ""} onChange={(e) => updatePort(i, { description: e.target.value })} placeholder="Short description" /></div>
                  <div className="md:col-span-2 flex justify-end"><Button size="sm" variant="ghost" onClick={() => setForm({ ...form, portfolio: form.portfolio.filter((_, k) => k !== i) })}><Trash2 className="h-3 w-3" /></Button></div>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={() => setForm({ ...form, portfolio: [...form.portfolio, { title: "", url: "" }] })}><Plus className="mr-1 h-3 w-3" /> Add portfolio item</Button>
            </div>
          </Card>

          <Card title="Links">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Website"><Input value={form.links.website ?? ""} onChange={(e) => setForm({ ...form, links: { ...form.links, website: e.target.value } })} placeholder="https://" /></Field>
              <Field label="LinkedIn"><Input value={form.links.linkedin ?? ""} onChange={(e) => setForm({ ...form, links: { ...form.links, linkedin: e.target.value } })} placeholder="https://linkedin.com/in/…" /></Field>
              <Field label="GitHub"><Input value={form.links.github ?? ""} onChange={(e) => setForm({ ...form, links: { ...form.links, github: e.target.value } })} placeholder="https://github.com/…" /></Field>
              <Field label="Twitter / X"><Input value={form.links.twitter ?? ""} onChange={(e) => setForm({ ...form, links: { ...form.links, twitter: e.target.value } })} placeholder="https://x.com/…" /></Field>
            </div>
          </Card>
        </div>
      </div>
    </>
  );

  function updateExp(i: number, patch: Partial<Experience>) {
    setForm((f) => ({ ...f, experience: f.experience.map((x, k) => (k === i ? { ...x, ...patch } : x)) }));
  }
  function updateEdu(i: number, patch: Partial<Education>) {
    setForm((f) => ({ ...f, education: f.education.map((x, k) => (k === i ? { ...x, ...patch } : x)) }));
  }
  function updateLang(i: number, patch: Partial<Language>) {
    setForm((f) => ({ ...f, languages: f.languages.map((x, k) => (k === i ? { ...x, ...patch } : x)) }));
  }
  function updatePort(i: number, patch: Partial<PortfolioItem>) {
    setForm((f) => ({ ...f, portfolio: f.portfolio.map((x, k) => (k === i ? { ...x, ...patch } : x)) }));
  }
}

function Card({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h3 className="font-semibold">{title}</h3>
      {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
      <div className="mt-4">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label className="text-xs">{label}</Label>{children}</div>;
}
