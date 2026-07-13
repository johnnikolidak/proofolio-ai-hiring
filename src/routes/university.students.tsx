import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Search } from "lucide-react";
import { PageHeader } from "@/components/DashboardShell";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/university/students")({ component: Students });

type StudentProfile = {
  id: string;
  full_name: string | null;
  email: string;
  headline: string | null;
  location: string | null;
  skills: string[];
  is_public: boolean;
};
type Row = { candidate_id: string; profile: StudentProfile | null; submissions: number; avgScore: number | null };

function Students() {
  const { user } = useAuth();
  const [q, setQ] = useState("");

  const studentsQ = useQuery({
    enabled: !!user?.id,
    queryKey: ["university", "students", user?.id],
    queryFn: async () => {
      const { data: links, error } = await supabase
        .from("university_students")
        .select("candidate_id,created_at")
        .eq("university_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      const ids = (links ?? []).map((l) => l.candidate_id);
      if (ids.length === 0) return [] as Row[];

      const [{ data: profiles }, { data: submissions }] = await Promise.all([
        supabase.from("profiles").select("id,full_name,email,headline,location,skills,is_public").in("id", ids),
        supabase.from("submissions").select("candidate_id,score").in("candidate_id", ids),
      ]);
      const profileById = new Map((profiles ?? []).map((p) => [p.id, p as StudentProfile]));
      const scoresByCandidate = new Map<string, number[]>();
      for (const s of submissions ?? []) {
        if (typeof s.score !== "number") continue;
        const arr = scoresByCandidate.get(s.candidate_id) ?? [];
        arr.push(s.score);
        scoresByCandidate.set(s.candidate_id, arr);
      }
      return (links ?? []).map((l): Row => {
        const scores = scoresByCandidate.get(l.candidate_id) ?? [];
        return {
          candidate_id: l.candidate_id,
          profile: profileById.get(l.candidate_id) ?? null,
          submissions: scores.length,
          avgScore: scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null,
        };
      });
    },
  });

  const rows = useMemo(() => {
    const list = studentsQ.data ?? [];
    if (!q.trim()) return list;
    const needle = q.toLowerCase();
    return list.filter((r) => {
      const hay = [r.profile?.full_name, r.profile?.headline, r.profile?.location, ...(r.profile?.skills ?? [])]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(needle);
    });
  }, [studentsQ.data, q]);

  return (
    <>
      <PageHeader title="Students" description="Your students, ranked by evidence across completed challenges." />
      <div className="mb-4 relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search students, headlines, skills…" className="pl-9" />
      </div>
      {studentsQ.isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : studentsQ.error ? (
        <div className="rounded-xl border border-border bg-card p-6 text-sm text-destructive">Failed to load students.</div>
      ) : (studentsQ.data ?? []).length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center text-sm text-muted-foreground">
          No students are connected to your university yet. Once candidates are linked to your roster, they'll appear here.
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center text-sm text-muted-foreground">No matches for that search.</div>
      ) : (
        <div className="rounded-xl border border-border bg-card">
          {rows.map((r) => {
            const name = r.profile?.full_name ?? "Unnamed candidate";
            const initials = name.split(" ").map((x) => x[0]).slice(0, 2).join("").toUpperCase();
            return (
              <div key={r.candidate_id} className="flex flex-wrap items-center gap-4 border-b border-border p-4 last:border-0">
                <Avatar className="h-10 w-10"><AvatarFallback className="bg-primary-soft text-primary text-xs font-semibold">{initials}</AvatarFallback></Avatar>
                <div className="min-w-0 flex-1">
                  <div className="font-medium">{name}</div>
                  <div className="text-xs text-muted-foreground">
                    {r.profile?.headline ?? r.profile?.email ?? "—"}
                    {r.profile?.location ? ` · ${r.profile.location}` : ""}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">{r.submissions} challenge{r.submissions === 1 ? "" : "s"}</div>
                {r.avgScore !== null && <Badge className="rounded-full">Avg {r.avgScore}</Badge>}
                {r.profile?.is_public ? (
                  <Button asChild size="sm" variant="outline"><Link to="/p/$id" params={{ id: r.candidate_id }}>Open profile</Link></Button>
                ) : (
                  <span className="text-xs text-muted-foreground">Profile is private</span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
