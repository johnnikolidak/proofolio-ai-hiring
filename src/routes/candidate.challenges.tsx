import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/candidate/challenges")({ component: () => <Outlet /> });
