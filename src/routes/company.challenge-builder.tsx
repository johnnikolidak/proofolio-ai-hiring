import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageHeader } from "@/components/DashboardShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/company/challenge-builder")({ component: Builder });

function Builder() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [role, setRole] = useState("");
  const [difficulty, setDifficulty] = useState("Intermediate");
  const [duration, setDuration] = useState("3");
  const [context, setContext] = useState("");
  const [task, setTask] = useState("");
  const [deliverables, setDeliverables] = useState("");
  const [criteria, setCriteria] = useState("");

  const save = useMutation({
    mutationFn: async (status: "draft" | "published") => {
      if (!user?.id) throw new Error("Not signed in");
      if (!title.trim()) throw new Error("Add a title");
      const { data, error } = await supabase.from("challenges").insert({
        title: title.trim(),
        role: role.trim() || null,
        difficulty,
        duration_hours: Number(duration) || null,
        context: context.trim() || null,
        task: task.trim() || null,
        deliverables: deliverables.trim() || null,
        evaluation_criteria: criteria.trim() || null,
        status,
        created_by: user.id,
      }).select("id").single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_data, status) => {
      toast.success(status === "published" ? "Challenge published" : "Draft saved");
      navigate({ to: "/company/library" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <>
      <PageHeader
        title="Challenge Builder"
        description="Create a real-work challenge candidates can complete and submit."
        actions={
          <>
            <Button variant="outline" onClick={() => save.mutate("draft")} disabled={save.isPending}>
              {save.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save draft
            </Button>
            <Button onClick={() => save.mutate("published")} disabled={save.isPending}>
              {save.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Publish
            </Button>
          </>
        }
      />
      <div className="max-w-3xl space-y-6">
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="font-semibold">Basics</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5 md:col-span-2"><Label>Title *</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Growth Analyst — Q3 case" /></div>
            <div className="space-y-1.5"><Label>Role</Label><Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Junior Growth Analyst" /></div>
            <div className="space-y-1.5"><Label>Difficulty</Label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{["Beginner", "Intermediate", "Advanced"].map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>Time budget (hours)</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{["1", "2", "3", "4", "6", "8"].map((h) => <SelectItem key={h} value={h}>{h}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <h3 className="font-semibold">Brief</h3>
          <div className="space-y-1.5"><Label>Context</Label><Textarea rows={4} value={context} onChange={(e) => setContext(e.target.value)} placeholder="Background the candidate needs to know." /></div>
          <div className="space-y-1.5"><Label>Task</Label><Textarea rows={4} value={task} onChange={(e) => setTask(e.target.value)} placeholder="What the candidate should do." /></div>
          <div className="space-y-1.5"><Label>Deliverables</Label><Textarea rows={3} value={deliverables} onChange={(e) => setDeliverables(e.target.value)} placeholder="Exact outputs to submit." /></div>
          <div className="space-y-1.5"><Label>How you'll evaluate</Label><Textarea rows={3} value={criteria} onChange={(e) => setCriteria(e.target.value)} placeholder="Rubric or key criteria." /></div>
        </div>
      </div>
    </>
  );
}
