import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/DashboardShell";
import { EmptyState } from "@/components/EmptyState";
import { Trophy } from "lucide-react";

export const Route = createFileRoute("/university/leaderboards")({ component: Boards });

function Boards() {
  return (
    <>
      <PageHeader title="Leaderboards" description="Ranked by evidence across your campus challenges." />
      <EmptyState icon={Trophy} title="No rankings yet" description="Leaderboards populate as students complete challenges." />
    </>
  );
}
