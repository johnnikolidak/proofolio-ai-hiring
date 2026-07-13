import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Award, Bell, Briefcase, Loader2, MessageSquare, Target, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/DashboardShell";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/candidate/notifications")({
  component: Notifications,
  head: () => ({ meta: [{ title: "Notifications — Proofolio" }] }),
});

type N = { id: string; kind: string; title: string; body: string | null; link: string | null; read_at: string | null; created_at: string };

const ICONS: Record<string, typeof Bell> = {
  application_status: Briefcase,
  message: MessageSquare,
  certificate: Award,
  challenge: Target,
};

function Notifications() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const q = useQuery({
    enabled: !!user?.id,
    queryKey: ["candidate", "notifications", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("notifications").select("*").eq("user_id", user!.id).order("created_at", { ascending: false }).limit(100);
      if (error) throw error;
      return (data ?? []) as N[];
    },
  });

  const markAllRead = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("user_id", user!.id).is("read_at", null);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["candidate", "notifications"] }),
  });

  const markRead = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["candidate", "notifications"] }),
  });

  const del = useMutation({
    mutationFn: async (id: string) => { await supabase.from("notifications").delete().eq("id", id); },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["candidate", "notifications"] }),
  });

  const items = q.data ?? [];
  const unread = items.filter((n) => !n.read_at).length;

  return (
    <>
      <PageHeader
        title="Notifications"
        description={unread > 0 ? `${unread} unread` : "Everything that needs your attention."}
        actions={unread > 0 ? <Button variant="outline" size="sm" onClick={() => markAllRead.mutate()}>Mark all read</Button> : undefined}
      />
      {q.isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
          <Bell className="mx-auto h-6 w-6 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">You're all caught up.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card">
          {items.map((n) => {
            const Icon = ICONS[n.kind] ?? Bell;
            return (
              <div key={n.id} className={`flex items-start gap-4 border-b border-border p-5 last:border-0 ${!n.read_at ? "bg-primary-soft/30" : ""}`}>
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary-soft text-primary"><Icon className="h-5 w-5" /></div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{n.title}</div>
                  {n.body && <div className="mt-0.5 text-sm text-muted-foreground">{n.body}</div>}
                  <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}</span>
                    {n.link && (
                      <Button asChild size="sm" variant="link" className="h-auto p-0 text-xs" onClick={() => !n.read_at && markRead.mutate(n.id)}>
                        <Link to={n.link}>Open</Link>
                      </Button>
                    )}
                    {!n.read_at && <Button size="sm" variant="ghost" className="h-auto p-0 text-xs" onClick={() => markRead.mutate(n.id)}>Mark read</Button>}
                  </div>
                </div>
                <Button size="icon" variant="ghost" onClick={() => del.mutate(n.id)} aria-label="Delete"><Trash2 className="h-4 w-4" /></Button>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
