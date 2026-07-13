import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/DashboardShell";
import { EmptyState } from "@/components/EmptyState";
import { Bell } from "lucide-react";

export const Route = createFileRoute("/candidate/notifications")({
  component: Notifications,
  head: () => ({ meta: [{ title: "Notifications — Proofolio" }] }),
});

function Notifications() {
  return (
    <>
      <PageHeader title="Notifications" description="Everything that needs your attention." />
      <EmptyState icon={Bell} title="You're all caught up" description="Application updates, challenge feedback, and messages will show up here." />
    </>
  );
}
