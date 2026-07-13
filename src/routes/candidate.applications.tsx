import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { PageHeader } from "@/components/DashboardShell";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/candidate/applications")({ component: Applications });

type Row = {
  id: string;
  job_id: string;
  status: string;
  created_at: string;
  jobs: { title: string; company_name: string } | null;
};

const tone: Record<string, string> = {
  submitted: "bg-secondary text-muted-foreground",
  in_review: "bg-warning/15 text-warning-foreground",
  interview: "bg-primary/15 text-primary",
  offer: "bg-success/15 text-success",
  rejected: "bg-destructive/15 text-destructive",
  withdrawn: "bg-secondary text-muted-foreground",
};

function Applications() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const appsQ = useQuery({
    enabled: !!user?.id,
    queryKey: ["candidate", "applications", "full", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("applications")
        .select("id,job_id,status,created_at,jobs(title,company_name)")
        .eq("candidate_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Row[];
    },
  });

  const withdraw = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("applications").update({ status: "withdrawn" }).eq("id", id).eq("candidate_id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Application withdrawn");
      qc.invalidateQueries({ queryKey: ["candidate", "applications"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <>
      <PageHeader title="Applications" description="Track every application in one place." />
      {appsQ.isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : (appsQ.data ?? []).length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
          <p className="text-sm text-muted-foreground">You haven't applied to any jobs yet.</p>
          <Button asChild className="mt-4"><Link to="/candidate/jobs">Browse jobs</Link></Button>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Applied</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(appsQ.data ?? []).map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">{a.jobs?.title ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{a.jobs?.company_name ?? "—"}</TableCell>
                  <TableCell><Badge className={`rounded-full font-medium ${tone[a.status] ?? tone.submitted}`} variant="secondary">{a.status.replace("_", " ")}</Badge></TableCell>
                  <TableCell className="text-muted-foreground">{format(new Date(a.created_at), "MMM d")}</TableCell>
                  <TableCell className="text-right">
                    <Button asChild size="sm" variant="ghost"><Link to="/candidate/jobs/$id" params={{ id: a.job_id }}>View</Link></Button>
                    {!["withdrawn", "rejected", "offer"].includes(a.status) && (
                      <Button size="sm" variant="ghost" className="text-destructive" onClick={() => {
                        if (confirm("Withdraw this application? This cannot be undone.")) withdraw.mutate(a.id);
                      }}>Withdraw</Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  );
}
