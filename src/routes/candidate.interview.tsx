import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/DashboardShell";
import { EmptyState } from "@/components/EmptyState";
import { Bot } from "lucide-react";

export const Route = createFileRoute("/candidate/interview")({ component: Interview });

function Interview() {
  return (
    <>
      <PageHeader title="Interview preparation" description="Practice interviews tailored to your target role." />
      <EmptyState
        icon={Bot}
        title="Interview prep is coming soon"
        description="We're building an AI-driven interview practice module. It will appear here when it's ready."
      />
    </>
  );
}
