import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/DashboardShell";

export const Route = createFileRoute("/university/messages")({ component: Msg });

function Msg() {
  return (
    <>
      <PageHeader title="Messages" description="Conversations with employer partners and Proofolio support." />
      <div className="rounded-xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
        No conversations yet. When an employer partner or your Proofolio success manager reaches out, threads will appear here.
      </div>
    </>
  );
}
