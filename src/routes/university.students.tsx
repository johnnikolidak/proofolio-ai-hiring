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
    queryFn: async (): Promise<Row[]> => {
      // The university roster table is not provisioned in this project yet, so
      // there are no linked students to hydrate. Return an empty list; the UI
      // already renders an empty-state card for this case.
      return [] as Row[];
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
