import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/DashboardShell";
import { EmptyState } from "@/components/EmptyState";
import { Users } from "lucide-react";

export const Route = createFileRoute("/university/students")({ component: Students });

function Students() {
  return (
    <>
      <PageHeader title="Students" description="Your students, ranked by evidence across campus challenges." />
      <EmptyState
        icon={Users}
        title="Student roster not connected yet"
        description="Roster sync (SSO or CSV import) arrives in a later release. Students who sign up on Proofolio and complete your challenges will appear here."
      />
    </>
  );
}
