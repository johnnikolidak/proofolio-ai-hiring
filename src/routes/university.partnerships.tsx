import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/DashboardShell";
import { EmptyState } from "@/components/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Handshake, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/university/partnerships")({ component: Partnerships });

function Partnerships() {
  const { user } = useAuth();
  const q = useQuery({
    enabled: !!user?.id,
    queryKey: ["university", "partnerships", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("partnership_requests")
        .select("*")
        .eq("submitted_by", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <>
      <PageHeader title="Employer Partnerships" description="Companies you've partnered with or requested." />
      {q.isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : (q.data?.length ?? 0) === 0 ? (
        <EmptyState
          icon={Handshake}
          title="No partnership requests yet"
          description="Submit a partnership request from the University page to invite Proofolio to connect you with employer partners."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {q.data!.map((p) => (
            <div key={p.id} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary-soft text-primary"><Handshake className="h-5 w-5" /></div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold truncate">{p.organization_name}</div>
                  <div className="text-xs text-muted-foreground">Requested {formatDistanceToNow(new Date(p.created_at), { addSuffix: true })}</div>
                </div>
                <Badge className="rounded-full capitalize" variant="outline">{p.status}</Badge>
              </div>
              {p.message && <p className="mt-3 text-sm text-muted-foreground line-clamp-3">{p.message}</p>}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
