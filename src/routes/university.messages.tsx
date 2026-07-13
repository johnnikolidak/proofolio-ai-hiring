import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/DashboardShell";
import { EmptyState } from "@/components/EmptyState";
import { MessageSquare } from "lucide-react";

export const Route = createFileRoute("/university/messages")({ component: Msg });

function Msg() {
  return (
    <>
      <PageHeader title="Messages" description="Conversations with employer partners and Proofolio support." />
      <EmptyState icon={MessageSquare} title="No conversations yet" description="Threads will appear here when they start." />
    </>
  );
}
