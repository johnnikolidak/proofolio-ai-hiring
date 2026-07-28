import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Compass,
  FileText,
  GraduationCap,
  Loader2,
  Plus,
  Sparkles,
  Trash2,
  Upload,
  User,
  X,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { dashboardPathFor } from "@/hooks/use-guest";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/onboarding")({
  component: OnboardingPage,
  head: () => ({ meta: [{ title: "Set up your profile — Proofolio" }] }),
});

type Education = { school: string; degree: string; year: string };
type OnboardingForm = {
  full_name: string;
  headline: string;
  bio: string;
  location: string;
  education: Education[];
  skills: string[];
  preferred_roles: string[];
  availability: string;
};

const CV_MAX_BYTES = 10 * 1024 * 1024;
const CV_MIME = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
const AVATAR_MAX_BYTES = 3 * 1024 * 1024;
const AVATAR_MIME = ["image/png", "image/jpeg", "image/webp"];

const SKILL_SUGGESTIONS = ["Communication", "Project management", "Data analysis", "Python", "SQL", "Figma", "Excel", "Public speaking"];
const AVAILABILITY_OPTIONS = ["Immediately", "Within 2 weeks", "Within 1 month", "Within 3 months", "Not actively looking"];

const STEPS = [
  { label: "Personal Information", Icon: User },
  { label: "Education", Icon: GraduationCap },
  { label: "Skills & Interests", Icon: Sparkles },
  { label: "Upload CV", Icon: FileText },
  { label: "Career Preferences", Icon: Compass },
] as const;

const isBlank = (...values: (string | undefined)[]) => values.every((v) => !v?.trim());
const emptyForm: OnboardingForm = { full_name: "", headline: "", bio: "", location: "", education: [{ school: "", degree: "", year: "" }], skills: [], preferred_roles: [], availability: "" };

function OnboardingPage() {
  const { user, session, profile, loading: authLoading, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();

  useEffect(() => {
    if (authLoading) return;
    if (!session) { navigate({ to: "/auth/login" }); return; }
    if (profile && profile.role !== "candidate") {
      navigate({ to: dashboardPathFor({ role: profile.role, completionPct: profile.completion_pct }) });
      return;
    }
    if (profile && profile.completion_pct >= 100) {
      navigate({ to: "/candidate" });
    }
  }, [authLoading, session, profile, navigate]);

  const profileQ = useQuery({
    enabled: !!user?.id,
    queryKey: ["onboarding", "profile", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", user!.id).single();
      if (error) throw error;
      return data;
    },
  });

  const [step, setStep] = useState(0);
  const [form, setForm] = useState<OnboardingForm>(emptyForm);
  const [skillDraft, setSkillDraft] = useState("");
  const [roleDraft, setRoleDraft] = useState("");
  const [cvUploading, setCvUploading] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [finalPct, setFinalPct] = useState(100);
  const [finishing, setFinishing] = useState(false);
  const seeded = useRef(false);
  const resumed = useRef(false);

  useEffect(() => {
    const p = profileQ.data;
    if (!p || seeded.current) return;
    seeded.current = true;
    const education = ((p.education as unknown as Education[]) ?? []).filter((e) => !isBlank(e.school, e.degree, e.year));
    setForm({
      full_name: p.full_name ?? "",
      headline: p.headline ?? "",
      bio: p.bio ?? "",
      location: p.location ?? "",
      education: education.length ? education : [{ school: "", degree: "", year: "" }],
      skills: (p.skills as string[]) ?? [],
      preferred_roles: (p.preferred_roles as string[]) ?? [],
      availability: p.availability ?? "",
    });
  }, [profileQ.data]);

  // Resume where they left off, once, the first time data loads — never re-jump after that.
  useEffect(() => {
    const p = profileQ.data;
    if (!p || resumed.current) return;
    resumed.current = true;
    if (p.cv_url) { setStep(5); return; }
    if (((p.skills as string[] | null)?.length ?? 0) >= 3) { setStep(4); return; }
    if (((p.education as unknown[] | null)?.length ?? 0) >= 1) { setStep(3); return; }
    if (p.full_name && p.bio && p.bio.length > 20) { setStep(2); return; }
  }, [profileQ.data]);

  const saveMutation = useMutation({
    mutationFn: async (patch: Partial<OnboardingForm>) => {
      const next = { ...form, ...patch };
      const payload = {
        full_name: next.full_name.trim() || null,
        headline: next.headline.trim() || null,
        bio: next.bio.trim() || null,
        location: next.location.trim() || null,
        education: next.education.filter((e) => !isBlank(e.school, e.degree, e.year)) as never,
        skills: next.skills,
        preferred_roles: next.preferred_roles,
        availability: next.availability.trim() || null,
      };
      const { data, error } = await supabase.from("profiles").update(payload).eq("id", user!.id).select("completion_pct").single();
      if (error) throw error;
      return data.completion_pct;
    },
    onError: (e: Error) => toast.error(e.message || "Couldn't save — try again"),
  });

  const cv = profileQ.data?.cv_url;
  const avatar = profileQ.data?.avatar_url;

  const stepValid = [
    form.full_name.trim().length > 0 && form.bio.trim().length >= 20,
    form.education.some((e) => e.school.trim() && e.degree.trim()),
    form.skills.length >= 3,
    !!cv,
    form.preferred_roles.length >= 1 && !!form.availability,
  ];

  const goNext = async () => {
    if (!stepValid[step - 1]) return;
    try {
      const pct = await saveMutation.mutateAsync({});
      await qc.invalidateQueries({ queryKey: ["onboarding", "profile", user?.id] });
      if (step === 5) {
        setFinalPct(pct ?? 100);
        setStep(6);
        return;
      }
      setSavedFlash(true);
      window.setTimeout(() => setSavedFlash(false), 2200);
      setStep((s) => s + 1);
    } catch {
      // toast already shown by mutation
    }
  };

  const finishOnboarding = async () => {
    setFinishing(true);
    await refreshProfile();
    navigate({ to: "/candidate" });
  };

  const handleAvatar = async (file: File) => {
    if (!AVATAR_MIME.includes(file.type)) { toast.error("Use PNG, JPG or WebP"); return; }
    if (file.size > AVATAR_MAX_BYTES) { toast.error("Image must be under 3 MB"); return; }
    setAvatarUploading(true);
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${user!.id}/avatar-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, { upsert: true, contentType: file.type });
    if (upErr) { setAvatarUploading(false); toast.error(upErr.message); return; }
    if (avatar && avatar !== path) await supabase.storage.from("avatars").remove([avatar]);
    const { error: pErr } = await supabase.from("profiles").update({ avatar_url: path }).eq("id", user!.id);
    setAvatarUploading(false);
    if (pErr) { toast.error(pErr.message); return; }
    await qc.invalidateQueries({ queryKey: ["onboarding", "profile", user?.id] });
  };

  const handleCv = async (file: File) => {
    if (!CV_MIME.includes(file.type)) { toast.error("Upload a PDF or Word document"); return; }
    if (file.size > CV_MAX_BYTES) { toast.error("File must be under 10 MB"); return; }
    setCvUploading(true);
    const ext = file.name.split(".").pop() ?? "pdf";
    const path = `${user!.id}/cv-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("cvs").upload(path, file, { upsert: true, contentType: file.type });
    if (upErr) { setCvUploading(false); toast.error(upErr.message); return; }
    if (cv && cv !== path) await supabase.storage.from("cvs").remove([cv]);
    const { error: pErr } = await supabase.from("profiles").update({ cv_url: path, cv_filename: file.name }).eq("id", user!.id);
    setCvUploading(false);
    if (pErr) { toast.error(pErr.message); return; }
    toast.success("CV uploaded");
    await qc.invalidateQueries({ queryKey: ["onboarding", "profile", user?.id] });
  };

  if (authLoading || !session || profileQ.isLoading || (profile && (profile.role !== "candidate" || profile.completion_pct >= 100))) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const addSkill = (v: string) => {
    const val = v.trim();
    if (!val || form.skills.includes(val)) { setSkillDraft(""); return; }
    setForm((f) => ({ ...f, skills: [...f.skills, val] }));
    setSkillDraft("");
  };
  const addRole = () => {
    const v = roleDraft.trim();
    if (!v || form.preferred_roles.includes(v)) { setRoleDraft(""); return; }
    setForm((f) => ({ ...f, preferred_roles: [...f.preferred_roles, v] }));
    setRoleDraft("");
  };
  const updateEdu = (i: number, patch: Partial<Education>) =>
    setForm((f) => ({ ...f, education: f.education.map((x, k) => (k === i ? { ...x, ...patch } : x)) }));

  const remainingMin = Math.max(1, Math.round(((5 - step + 1) * 45) / 60));

  return (
    <div className="min-h-screen bg-secondary/30">
      <div className="pointer-events-none fixed inset-0 gradient-hero opacity-70" />
      <div className="relative flex min-h-screen flex-col">
        <header className="flex items-center justify-between px-6 py-6 md:px-10">
          <Logo />
          <SignOutLink />
        </header>

        <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-6 pb-16 md:px-0">
          {step === 0 && <WelcomeScreen onStart={() => setStep(1)} />}

          {step === 6 && <CelebrationScreen pct={finalPct} onContinue={finishOnboarding} loading={finishing} />}

          {step >= 1 && step <= 5 && (
          <>
          <StepProgress step={step} />

          <div key={step} className="animate-fade-in-up mt-8 rounded-2xl border border-border bg-card p-6 shadow-card md:p-8">
            <div className={cn("mb-1 flex items-center gap-1.5 text-xs font-medium text-success transition-opacity duration-700", savedFlash ? "opacity-100" : "opacity-0")}>
              <CheckCircle2 className="h-3.5 w-3.5" /> Progress saved automatically
            </div>
            {step === 1 && (
              <StepShell
                title="Let's get to know you"
                subtitle="Two things recruiters see first — your name and how you describe yourself."
                why="This is the first thing companies see when they discover your profile."
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <input id="avatar-input" type="file" accept={AVATAR_MIME.join(",")} className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleAvatar(f); e.target.value = ""; }} />
                    <label
                      htmlFor="avatar-input"
                      className="relative grid h-16 w-16 shrink-0 cursor-pointer place-items-center overflow-hidden rounded-full border border-dashed border-border bg-secondary text-xs text-muted-foreground hover:border-primary/50"
                    >
                      {avatarUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : avatar ? <AvatarPreview path={avatar} /> : <Upload className="h-4 w-4" />}
                    </label>
                    <div className="text-xs text-muted-foreground">
                      Add a photo <span className="text-muted-foreground/70">(optional)</span>
                      <div className="mt-1"><label htmlFor="avatar-input" className="cursor-pointer text-primary hover:underline">{avatar ? "Replace" : "Upload"}</label></div>
                    </div>
                  </div>
                  <Field label="Full name" required>
                    <Input autoFocus value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} placeholder="Ada Lovelace" />
                  </Field>
                  <Field label="Headline" hint="optional">
                    <Input value={form.headline} onChange={(e) => setForm({ ...form, headline: e.target.value })} placeholder="e.g. Aspiring Product Analyst" />
                  </Field>
                  <Field label="About you" required hint={`${form.bio.trim().length}/20 min`}>
                    <Textarea rows={3} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="What are you building toward? What should hiring teams know about you?" />
                  </Field>
                  <Field label="Location" hint="optional">
                    <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="City, Country" />
                  </Field>
                </div>
              </StepShell>
            )}

            {step === 2 && (
              <StepShell
                title="Where did you study?"
                subtitle="One entry is enough — a degree, bootcamp, or self-taught program all count."
                why="Companies use this to understand your academic background."
              >
                <div className="space-y-3">
                  {form.education.map((x, i) => (
                    <div key={i} className="grid gap-2 rounded-lg border border-border p-3 sm:grid-cols-3">
                      <Input value={x.school} onChange={(e) => updateEdu(i, { school: e.target.value })} placeholder="School or program" />
                      <Input value={x.degree} onChange={(e) => updateEdu(i, { degree: e.target.value })} placeholder="Degree / focus" />
                      <div className="flex gap-2">
                        <Input value={x.year} onChange={(e) => updateEdu(i, { year: e.target.value })} placeholder="Year" />
                        {form.education.length > 1 && (
                          <Button type="button" size="icon" variant="ghost" onClick={() => setForm((f) => ({ ...f, education: f.education.filter((_, k) => k !== i) }))}><Trash2 className="h-3.5 w-3.5" /></Button>
                        )}
                      </div>
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={() => setForm((f) => ({ ...f, education: [...f.education, { school: "", degree: "", year: "" }] }))}>
                    <Plus className="mr-1 h-3.5 w-3.5" /> Add another
                  </Button>
                </div>
              </StepShell>
            )}

            {step === 3 && (
              <StepShell
                title="What are you good at?"
                subtitle="Add at least 3 skills. Tap a suggestion or type your own."
                why="We'll use these to match you with relevant company challenges."
              >
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input value={skillDraft} onChange={(e) => setSkillDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(skillDraft); } }} placeholder="Add a skill and press Enter" />
                    <Button type="button" variant="outline" onClick={() => addSkill(skillDraft)}><Plus className="h-4 w-4" /></Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {form.skills.map((s) => (
                      <Badge key={s} variant="secondary" className="gap-1 rounded-full py-1">
                        {s}
                        <button onClick={() => setForm((f) => ({ ...f, skills: f.skills.filter((x) => x !== s) }))} aria-label={`Remove ${s}`}><X className="h-3 w-3" /></button>
                      </Badge>
                    ))}
                  </div>
                  <div>
                    <div className="mb-2 text-xs font-medium text-muted-foreground">Suggestions</div>
                    <div className="flex flex-wrap gap-2">
                      {SKILL_SUGGESTIONS.filter((s) => !form.skills.includes(s)).map((s) => (
                        <button key={s} type="button" onClick={() => addSkill(s)} className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary">
                          + {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </StepShell>
            )}

            {step === 4 && (
              <StepShell
                title="Upload your CV"
                subtitle="One file, PDF or Word. Recruiters read this first."
                why="Uploading a CV helps companies understand your experience before inviting you."
              >
                <input id="cv-input" type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleCv(f); e.target.value = ""; }} />
                <label
                  htmlFor="cv-input"
                  className="flex min-h-40 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border p-8 text-center transition-colors hover:border-primary/50 hover:bg-primary-soft/40"
                >
                  {cvUploading ? (
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  ) : cv ? (
                    <>
                      <div className="grid h-10 w-10 place-items-center rounded-full bg-primary-soft text-primary"><Check className="h-5 w-5" /></div>
                      <div className="text-sm font-medium">{profileQ.data?.cv_filename || "CV uploaded"}</div>
                      <div className="text-xs text-primary">Click to replace</div>
                    </>
                  ) : (
                    <>
                      <div className="grid h-10 w-10 place-items-center rounded-full bg-secondary text-muted-foreground"><Upload className="h-5 w-5" /></div>
                      <div className="text-sm font-medium">Drop your CV here or click to browse</div>
                      <div className="text-xs text-muted-foreground">PDF or Word, up to 10 MB</div>
                    </>
                  )}
                </label>
              </StepShell>
            )}

            {step === 5 && (
              <StepShell
                title="What are you looking for?"
                subtitle="This tunes the jobs and challenges we surface for you."
                why="We'll only notify you about opportunities that match your interests."
              >
                <div className="space-y-5">
                  <Field label="Target roles" required hint="at least 1">
                    <div className="flex gap-2">
                      <Input value={roleDraft} onChange={(e) => setRoleDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addRole(); } }} placeholder="e.g. Product Analyst" />
                      <Button type="button" variant="outline" onClick={addRole}><Plus className="h-4 w-4" /></Button>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {form.preferred_roles.map((s) => (
                        <Badge key={s} variant="secondary" className="gap-1 rounded-full py-1">
                          {s}
                          <button onClick={() => setForm((f) => ({ ...f, preferred_roles: f.preferred_roles.filter((x) => x !== s) }))} aria-label={`Remove ${s}`}><X className="h-3 w-3" /></button>
                        </Badge>
                      ))}
                    </div>
                  </Field>
                  <Field label="Availability" required>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {AVAILABILITY_OPTIONS.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setForm({ ...form, availability: opt })}
                          className={`rounded-lg border px-3 py-2 text-left text-sm transition-colors ${form.availability === opt ? "border-primary bg-primary-soft text-primary" : "border-border hover:border-primary/50"}`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </Field>
                </div>
              </StepShell>
            )}

            <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
              {step > 1 ? (
                <Button type="button" variant="ghost" onClick={() => setStep((s) => s - 1)}>
                  <ArrowLeft className="mr-1.5 h-4 w-4" /> Back
                </Button>
              ) : <span />}
              <Button type="button" onClick={goNext} disabled={!stepValid[step - 1] || saveMutation.isPending} size="lg">
                {saveMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {step === 5 ? "Finish" : "Continue"}
                {step < 5 && !saveMutation.isPending && <ArrowRight className="ml-1.5 h-4 w-4" />}
              </Button>
            </div>
          </div>

          <p className="mt-5 text-center text-xs text-muted-foreground">
            About {remainingMin} minute{remainingMin === 1 ? "" : "s"} left · your progress is saved as you go
          </p>
          </>
          )}
        </main>
      </div>
    </div>
  );
}

function WelcomeScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="animate-fade-in-up rounded-2xl border border-border bg-card p-8 text-center shadow-card md:p-14">
      <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Welcome to Proofolio 👋</h1>
      <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
        You're less than 5 minutes away from creating your professional Proof Profile.
      </p>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
        This profile will help companies discover you for future challenges.
      </p>
      <Button size="lg" className="hover-lift mt-8" onClick={onStart}>
        Start Setup <ArrowRight className="ml-1.5 h-4 w-4" />
      </Button>
      <p className="mt-4 text-xs text-muted-foreground">5 quick steps.</p>
    </div>
  );
}

function CelebrationScreen({ pct, onContinue, loading }: { pct: number; onContinue: () => void; loading: boolean }) {
  return (
    <div className="animate-fade-in-up rounded-2xl border border-border bg-card p-8 text-center shadow-card md:p-14">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-success/15 text-success">
        <CheckCircle2 className="h-9 w-9" />
      </div>
      <h1 className="mt-6 text-2xl font-semibold tracking-tight md:text-3xl">🎉 Your Proofolio profile is ready.</h1>
      <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
        Companies can now discover you when relevant opportunities become available.
      </p>
      <div className="mx-auto mt-8 max-w-xs">
        <div className="text-xs font-medium text-muted-foreground">Your profile completion</div>
        <div className="mt-1 text-4xl font-bold tracking-tight text-success">{pct}%</div>
        <Progress value={pct} className="mt-3 h-2 bg-success/15 [&>div]:bg-success" />
      </div>
      <Button size="lg" className="hover-lift mt-8" onClick={onContinue} disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Go to Dashboard <ArrowRight className="ml-1.5 h-4 w-4" />
      </Button>
    </div>
  );
}

function AvatarPreview({ path }: { path: string }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    supabase.storage.from("avatars").createSignedUrl(path, 60 * 60).then(({ data }) => {
      if (!cancelled) setUrl(data?.signedUrl ?? null);
    });
    return () => { cancelled = true; };
  }, [path]);
  if (!url) return <User className="h-5 w-5 text-muted-foreground" />;
  return <img src={url} alt="" className="h-full w-full object-cover" />;
}

function StepProgress({ step }: { step: number }) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold tracking-tight text-foreground">Step {step} of {STEPS.length}</span>
        <span className="text-xs text-muted-foreground">{STEPS[step - 1].label}</span>
      </div>
      <div className="mt-4 grid grid-cols-5 gap-2">
        {STEPS.map((s, i) => {
          const idx = i + 1;
          const done = idx < step;
          const active = idx === step;
          return (
            <div key={s.label} className="flex flex-col items-center gap-2">
              <div className={cn("h-1.5 w-full rounded-full transition-colors duration-500", done ? "bg-success" : active ? "bg-primary" : "bg-border")} />
              <div
                className={cn(
                  "grid h-7 w-7 place-items-center rounded-full border text-[11px] font-medium transition-all duration-300",
                  done ? "border-success bg-success text-success-foreground" : active ? "scale-110 border-primary bg-primary text-primary-foreground shadow-soft" : "border-border bg-background text-muted-foreground",
                )}
              >
                {done ? <Check className="h-3.5 w-3.5" /> : idx}
              </div>
              <span className={cn("hidden text-center text-[10px] leading-tight sm:block", active ? "font-semibold text-foreground" : done ? "text-foreground/70" : "text-muted-foreground")}>
                {s.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StepShell({ title, subtitle, why, children }: { title: string; subtitle: string; why: string; children: ReactNode }) {
  return (
    <div>
      <h1 className="text-xl font-semibold tracking-tight md:text-2xl">{title}</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>
      <div className="mt-4 flex items-start gap-2 rounded-lg bg-primary-soft/70 px-3.5 py-2.5 text-xs text-foreground/80">
        <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
        <span>{why}</span>
      </div>
      <div className="mt-6">{children}</div>
    </div>
  );
}

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-xs">{label}{required && <span className="text-primary"> *</span>}</Label>
        {hint && <span className="text-[10px] text-muted-foreground">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function SignOutLink() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  return (
    <button
      type="button"
      className="text-xs text-muted-foreground transition-colors hover:text-foreground"
      onClick={async () => { await signOut(); navigate({ to: "/" }); }}
    >
      Sign out
    </button>
  );
}
