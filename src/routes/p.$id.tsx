import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/p/$id")({
  component: PublicProfile,
  loader: async ({ params }) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id,full_name,headline,bio,location,avatar_url,skills,preferred_roles,availability,education,experience,links,is_public")
      .eq("id", params.id)
      .maybeSingle();
    if (error) throw error;
    if (!data || !data.is_public) throw notFound();
    return data;
  },
  errorComponent: () => <div className="container-page py-24 text-center text-sm text-muted-foreground">Something went wrong.</div>,
  notFoundComponent: () => (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="container-page py-24 text-center">
        <h1 className="text-2xl font-semibold">Profile not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">This profile is private or does not exist.</p>
        <Link to="/" className="mt-4 inline-block text-sm text-primary underline">Go home</Link>
      </div>
      <SiteFooter />
    </div>
  ),
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.full_name ?? "Profile"} — Proofolio` },
          { name: "description", content: loaderData.headline ?? loaderData.bio?.slice(0, 150) ?? "Proofolio candidate profile." },
        ]
      : [{ title: "Profile — Proofolio" }],
  }),
});

type Exp = { title: string; company: string; from: string; to: string; description?: string };
type Edu = { school: string; degree: string; year: string };
type Links = { website?: string; linkedin?: string; github?: string; twitter?: string };

function PublicProfile() {
  const p = Route.useLoaderData();
  const [signedAvatar, setSignedAvatar] = useState<string | null>(null);
  useEffect(() => {
    if (!p.avatar_url) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase.storage.from("avatars").createSignedUrl(p.avatar_url!, 60 * 60);
      if (!cancelled) setSignedAvatar(data?.signedUrl ?? null);
    })();
    return () => { cancelled = true; };
  }, [p.avatar_url]);

  const initials = (p.full_name ?? "?").split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase();
  const skills = (p.skills as string[]) ?? [];
  const roles = (p.preferred_roles as string[]) ?? [];
  const experience = ((p.experience as unknown as Exp[]) ?? []);
  const education = ((p.education as unknown as Edu[]) ?? []);
  const links = ((p.links as unknown as Links) ?? {});

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="container-page py-12 md:py-16">
        <div className="grid gap-8 md:grid-cols-[240px_1fr]">
          <div className="text-center md:text-left">
            <Avatar className="mx-auto h-32 w-32 md:mx-0">
              {signedAvatar ? <AvatarImage src={signedAvatar} alt={p.full_name ?? ""} /> : null}
              <AvatarFallback className="bg-primary text-primary-foreground text-3xl">{initials}</AvatarFallback>
            </Avatar>
            <h1 className="mt-4 text-2xl font-semibold">{p.full_name ?? "Anonymous"}</h1>
            {p.headline && <p className="mt-1 text-sm text-muted-foreground">{p.headline}</p>}
            {p.location && <p className="mt-1 text-xs text-muted-foreground">{p.location}</p>}
            {p.availability && <Badge variant="secondary" className="mt-3 rounded-full">Available: {p.availability}</Badge>}
            <div className="mt-4 space-y-1 text-sm">
              {links.website && <a href={links.website} className="block text-primary underline" target="_blank" rel="noreferrer">Website <ExternalLink className="inline h-3 w-3" /></a>}
              {links.linkedin && <a href={links.linkedin} className="block text-primary underline" target="_blank" rel="noreferrer">LinkedIn</a>}
              {links.github && <a href={links.github} className="block text-primary underline" target="_blank" rel="noreferrer">GitHub</a>}
              {links.twitter && <a href={links.twitter} className="block text-primary underline" target="_blank" rel="noreferrer">X / Twitter</a>}
            </div>
          </div>
          <div className="space-y-8">
            {p.bio && (<section><h2 className="font-semibold">About</h2><p className="mt-2 text-sm text-muted-foreground whitespace-pre-line">{p.bio}</p></section>)}
            {skills.length > 0 && (<section><h2 className="font-semibold">Skills</h2><div className="mt-2 flex flex-wrap gap-2">{skills.map((s) => <Badge key={s} variant="outline" className="rounded-full">{s}</Badge>)}</div></section>)}
            {roles.length > 0 && (<section><h2 className="font-semibold">Open to</h2><div className="mt-2 flex flex-wrap gap-2">{roles.map((s) => <Badge key={s} variant="secondary" className="rounded-full">{s}</Badge>)}</div></section>)}
            {experience.length > 0 && (
              <section>
                <h2 className="font-semibold">Experience</h2>
                <div className="mt-3 space-y-3">{experience.map((x, i) => (
                  <div key={i} className="rounded-lg border border-border p-4">
                    <div className="font-medium">{x.title}</div>
                    <div className="text-xs text-muted-foreground">{x.company} · {x.from} – {x.to}</div>
                    {x.description && <p className="mt-2 text-sm">{x.description}</p>}
                  </div>
                ))}</div>
              </section>
            )}
            {education.length > 0 && (
              <section>
                <h2 className="font-semibold">Education</h2>
                <div className="mt-3 space-y-2">{education.map((x, i) => (
                  <div key={i} className="text-sm"><span className="font-medium">{x.school}</span> — {x.degree} <span className="text-muted-foreground">({x.year})</span></div>
                ))}</div>
              </section>
            )}
          </div>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
