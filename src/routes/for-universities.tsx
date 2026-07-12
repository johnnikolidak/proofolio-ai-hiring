import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Award, Handshake, School, Sparkles, Trophy, Users, Loader2 } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { dashboardPathFor } from "@/hooks/use-guest";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/for-universities")({
  component: ForUniversities,
  head: () => ({
    meta: [
      { title: "For universities — Proofolio" },
      { name: "description", content: "Run campus challenges with employer partners. Track evidence dimensions. Issue verified certificates. Connect students to jobs." },
      { property: "og:title", content: "For universities — Proofolio" },
      { property: "og:description", content: "Connect students to employers through real challenges and verified proof profiles." },
    ],
  }),
});

const schema = z.object({
  organization: z.string().trim().min(1, "University required").max(200),
  contact_name: z.string().trim().min(1, "Name required").max(120),
  email: z.string().trim().email("Enter a valid email").max(255),
  role_title: z.string().trim().max(120).optional().or(z.literal("")),
  country: z.string().trim().max(80).optional().or(z.literal("")),
  students_or_hires: z.string().trim().max(40).optional().or(z.literal("")),
  message: z.string().trim().max(2000).optional().or(z.literal("")),
});

function ForUniversities() {
  const { session, profile, isAdmin } = useAuth();
  const isUniversity = isAdmin || profile?.role === "university";
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse(Object.fromEntries(fd));
    if (!parsed.success) return toast.error(parsed.error.issues[0]!.message);
    setLoading(true);
    const { error } = await supabase.from("partnership_requests").insert({
      kind: "university",
      organization: parsed.data.organization,
      contact_name: parsed.data.contact_name,
      email: parsed.data.email,
      role_title: parsed.data.role_title || null,
      country: parsed.data.country || null,
      students_or_hires: parsed.data.students_or_hires || null,
      message: parsed.data.message || null,
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    setSent(true);
    toast.success("Request sent — our team will be in touch within 2 business days.");
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero" />
        <div className="container-page relative py-20 md:py-28">
          <Badge variant="secondary" className="rounded-full">For universities</Badge>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight md:text-6xl">
            Bridge the gap between <span className="text-gradient">study and career.</span>
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
            Run campus challenges with employer partners. Give every student a Proof Profile. Track evidence dimensions across cohorts. Issue verified certificates that follow them into the workforce.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {session && profile?.role === "university" ? (
              <Button asChild size="lg"><Link to={dash}>Open dashboard <ArrowRight className="ml-1 h-4 w-4" /></Link></Button>
            ) : (
              <>
                <Button asChild size="lg"><a href="#partner">Request partnership <ArrowRight className="ml-1 h-4 w-4" /></a></Button>
                <Button asChild size="lg" variant="outline"><Link to="/auth/signup" search={{ role: "university" } as never}>Create university account</Link></Button>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="container-page py-20">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            [School, "Campus challenges", "Design or clone challenges tied to real employer briefs. Set eligibility, deadlines and evidence dimensions."],
            [Users, "Student Proof Profiles", "Every student gets a verified public profile that grows with each completed challenge."],
            [Trophy, "Leaderboards", "Rank by evidence dimensions, participation and improvement — never a single misleading score."],
            [Handshake, "Employer partnerships", "Connect your students to a talent pipeline of vetted employer partners."],
            [Sparkles, "Evidence dimensions", "Track critical thinking, communication, problem-solving, commercial awareness, creativity, collaboration."],
            [Award, "Verifiable certificates", "Issue tamper-proof certificates with a public verification URL."],
          ].map(([Icon, t, d]) => (
            <div key={t as string} className="rounded-2xl border border-border bg-card p-6 transition-all hover:shadow-elev">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary-soft text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-semibold">{t as string}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{d as string}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="partner" className="border-t border-border bg-secondary/30">
        <div className="container-page grid gap-10 py-20 md:grid-cols-2 md:py-24">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Become a Proofolio partner university</h2>
            <p className="mt-3 text-muted-foreground">Tell us about your institution and we'll set up a pilot with an employer partner in your student community.</p>
            <ul className="mt-6 space-y-3 text-sm">
              <li className="flex gap-3"><span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary" /> Dedicated onboarding for career services and faculty</li>
              <li className="flex gap-3"><span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary" /> Custom challenge library aligned with your programmes</li>
              <li className="flex gap-3"><span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary" /> Verified certificates with your university branding</li>
              <li className="flex gap-3"><span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary" /> Employer engagement reporting for accreditation</li>
            </ul>
          </div>
          {sent ? (
            <div className="rounded-2xl border border-border bg-card p-8 text-center">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-primary-soft text-primary">
                <Handshake className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-xl font-semibold">Thanks — request received.</h3>
              <p className="mt-2 text-sm text-muted-foreground">Our partnerships team will reach out within 2 business days.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-border bg-card p-8">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5"><Label>University</Label><Input name="organization" required placeholder="University of Athens" /></div>
                <div className="space-y-1.5"><Label>Country</Label><Input name="country" placeholder="Greece" /></div>
                <div className="space-y-1.5"><Label>Your name</Label><Input name="contact_name" required placeholder="Alex Papadopoulos" /></div>
                <div className="space-y-1.5"><Label>Role / title</Label><Input name="role_title" placeholder="Career services director" /></div>
                <div className="space-y-1.5 sm:col-span-2"><Label>Work email</Label><Input name="email" type="email" required placeholder="you@uni.edu" /></div>
                <div className="space-y-1.5 sm:col-span-2"><Label>Approx. students per year</Label><Input name="students_or_hires" placeholder="e.g. 2,500" /></div>
                <div className="space-y-1.5 sm:col-span-2"><Label>What are you hoping to solve?</Label><Textarea name="message" rows={3} placeholder="Tell us about your programmes and employer engagement goals." /></div>
              </div>
              <Button type="submit" className="w-full" disabled={loading} size="lg">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Request partnership
              </Button>
            </form>
          )}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
