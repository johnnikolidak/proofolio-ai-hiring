import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  ArrowLeft,
  Building2,
  GraduationCap,
  Handshake,
  Loader2,
  LogOut,
  Mail,
  School,
  ShieldCheck,
  Users2,
} from "lucide-react";
import { AuthGate } from "@/components/AuthGate";
import { Logo } from "@/components/Logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/admin")({
  component: () => (
    <AuthGate requiredRole="admin">
      <AdminPage />
    </AuthGate>
  ),
  head: () => ({ meta: [{ title: "Admin — Proofolio" }] }),
});

type ProfileRow = {
  id: string;
  email: string;
  full_name: string | null;
  role: "candidate" | "company" | "admin";
  company_name: string | null;
  created_at: string;
};
type WaitlistRow = { id: string; email: string; role: string | null; source: string | null; created_at: string };
type DemoRow = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  company: string;
  team_size: string | null;
  hires_per_year: string | null;
  message: string | null;
  created_at: string;
};

function AdminPage() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const profilesQ = useQuery({
    queryKey: ["admin", "profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id,email,full_name,role,company_name,created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as ProfileRow[];
    },
  });
  const waitlistQ = useQuery({
    queryKey: ["admin", "waitlist"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("waitlist")
        .select("id,email,role,source,created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as WaitlistRow[];
    },
  });
  const demosQ = useQuery({
    queryKey: ["admin", "demos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("demo_requests")
        .select("id,first_name,last_name,email,company,team_size,hires_per_year,message,created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as DemoRow[];
    },
  });

  const profiles = profilesQ.data ?? [];
  const users = profiles.length;
  const candidates = profiles.filter((p) => p.role === "candidate").length;
  const companies = profiles.filter((p) => p.role === "company").length;

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out");
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen bg-secondary/30">
      <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="container-page flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Logo />
            <Badge variant="secondary" className="gap-1"><ShieldCheck className="h-3 w-3" /> Admin</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link to="/"><ArrowLeft className="mr-1.5 h-4 w-4" /> Back to site</Link>
            </Button>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="mr-1.5 h-4 w-4" /> Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="container-page space-y-8 py-10">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Admin console</h1>
          <p className="mt-1 text-sm text-muted-foreground">Signed in as {profile?.email}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <StatCard label="Total users" value={users} Icon={Users2} loading={profilesQ.isPending} />
          <StatCard label="Candidates" value={candidates} Icon={GraduationCap} loading={profilesQ.isPending} />
          <StatCard label="Companies" value={companies} Icon={Building2} loading={profilesQ.isPending} />
          <StatCard label="Demo requests" value={demosQ.data?.length ?? 0} Icon={Mail} loading={demosQ.isPending} />
        </div>

        <Tabs defaultValue="users" className="w-full">
          <TabsList>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="candidates">Candidates</TabsTrigger>
            <TabsTrigger value="companies">Companies</TabsTrigger>
            <TabsTrigger value="waitlist">Waitlist ({waitlistQ.data?.length ?? 0})</TabsTrigger>
            <TabsTrigger value="demos">Demo Requests ({demosQ.data?.length ?? 0})</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <ProfilesTable rows={profiles} loading={profilesQ.isPending} />
          </TabsContent>
          <TabsContent value="candidates">
            <ProfilesTable rows={profiles.filter((p) => p.role === "candidate")} loading={profilesQ.isPending} />
          </TabsContent>
          <TabsContent value="companies">
            <ProfilesTable rows={profiles.filter((p) => p.role === "company")} loading={profilesQ.isPending} />
          </TabsContent>
          <TabsContent value="waitlist">
            <WaitlistTable rows={waitlistQ.data ?? []} loading={waitlistQ.isPending} />
          </TabsContent>
          <TabsContent value="demos">
            <DemosTable rows={demosQ.data ?? []} loading={demosQ.isPending} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function StatCard({ label, value, Icon, loading }: { label: string; value: number; Icon: React.ComponentType<{ className?: string }>; loading?: boolean }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div className="mt-3 text-3xl font-semibold tracking-tight">
        {loading ? <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /> : value}
      </div>
    </div>
  );
}

function TableCard({ children, count, searchable, onSearch }: { children: React.ReactNode; count: number; searchable?: boolean; onSearch?: (v: string) => void }) {
  return (
    <div className="mt-4 rounded-2xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border p-4">
        <span className="text-sm text-muted-foreground">{count} rows</span>
        {searchable && (
          <Input placeholder="Filter…" className="h-8 w-64" onChange={(e) => onSearch?.(e.target.value)} />
        )}
      </div>
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}

function useSearch<T>(rows: T[], keys: (keyof T)[]) {
  const [q, setQ] = useState("");
  const filtered = q
    ? rows.filter((r) => keys.some((k) => String(r[k] ?? "").toLowerCase().includes(q.toLowerCase())))
    : rows;
  return { filtered, setQ };
}

function ProfilesTable({ rows, loading }: { rows: ProfileRow[]; loading: boolean }) {
  const { filtered, setQ } = useSearch(rows, ["email", "full_name", "company_name"]);
  return (
    <TableCard count={filtered.length} searchable onSearch={setQ}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Joined</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow><TableCell colSpan={5} className="py-8 text-center text-muted-foreground">Loading…</TableCell></TableRow>
          ) : filtered.length === 0 ? (
            <TableRow><TableCell colSpan={5} className="py-8 text-center text-muted-foreground">No users yet.</TableCell></TableRow>
          ) : (
            filtered.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">{r.full_name || "—"}</TableCell>
                <TableCell>{r.email}</TableCell>
                <TableCell><Badge variant={r.role === "company" ? "default" : "secondary"}>{r.role}</Badge></TableCell>
                <TableCell>{r.company_name || "—"}</TableCell>
                <TableCell className="text-muted-foreground">{format(new Date(r.created_at), "PPp")}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableCard>
  );
}

function WaitlistTable({ rows, loading }: { rows: WaitlistRow[]; loading: boolean }) {
  const { filtered, setQ } = useSearch(rows, ["email", "source"]);
  return (
    <TableCard count={filtered.length} searchable onSearch={setQ}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Joined</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow><TableCell colSpan={4} className="py-8 text-center text-muted-foreground">Loading…</TableCell></TableRow>
          ) : filtered.length === 0 ? (
            <TableRow><TableCell colSpan={4} className="py-8 text-center text-muted-foreground">No waitlist entries yet.</TableCell></TableRow>
          ) : (
            filtered.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{r.email}</TableCell>
                <TableCell>{r.role ? <Badge variant="secondary">{r.role}</Badge> : "—"}</TableCell>
                <TableCell className="text-muted-foreground">{r.source || "—"}</TableCell>
                <TableCell className="text-muted-foreground">{format(new Date(r.created_at), "PPp")}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableCard>
  );
}

function DemosTable({ rows, loading }: { rows: DemoRow[]; loading: boolean }) {
  const { filtered, setQ } = useSearch(rows, ["email", "company", "first_name", "last_name"]);
  return (
    <TableCard count={filtered.length} searchable onSearch={setQ}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Team size</TableHead>
            <TableHead>Hires / yr</TableHead>
            <TableHead>Message</TableHead>
            <TableHead>Submitted</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow><TableCell colSpan={7} className="py-8 text-center text-muted-foreground">Loading…</TableCell></TableRow>
          ) : filtered.length === 0 ? (
            <TableRow><TableCell colSpan={7} className="py-8 text-center text-muted-foreground">No demo requests yet.</TableCell></TableRow>
          ) : (
            filtered.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">{r.first_name} {r.last_name}</TableCell>
                <TableCell>{r.email}</TableCell>
                <TableCell>{r.company}</TableCell>
                <TableCell>{r.team_size || "—"}</TableCell>
                <TableCell>{r.hires_per_year || "—"}</TableCell>
                <TableCell className="max-w-sm truncate text-muted-foreground">{r.message || "—"}</TableCell>
                <TableCell className="text-muted-foreground">{format(new Date(r.created_at), "PPp")}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableCard>
  );
}

// touch to keep unused import silence-free on some tsconfigs
void useEffect;
