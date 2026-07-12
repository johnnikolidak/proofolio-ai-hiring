import { useNavigate } from "@tanstack/react-router";
import { Check, ChevronsUpDown, GraduationCap, Building2, School, ShieldCheck } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export type WorkspaceKey = "candidate" | "company" | "university" | "admin";

const WORKSPACES: Record<WorkspaceKey, { label: string; to: string; icon: typeof GraduationCap }> = {
  candidate: { label: "Candidate workspace", to: "/candidate", icon: GraduationCap },
  company: { label: "Company workspace", to: "/company", icon: Building2 },
  university: { label: "University workspace", to: "/university", icon: School },
  admin: { label: "Admin Console", to: "/admin", icon: ShieldCheck },
};

export function WorkspaceSwitcher({ current }: { current: WorkspaceKey }) {
  const { profile, isAdmin } = useAuth();
  const navigate = useNavigate();

  // Admin/founder sees every workspace. Regular users see only their own role.
  const available: WorkspaceKey[] = isAdmin
    ? ["candidate", "company", "university", "admin"]
    : profile?.role
      ? [profile.role as WorkspaceKey]
      : [];

  const curr = WORKSPACES[current];
  const CurrIcon = curr.icon;

  if (available.length <= 1) {
    return (
      <div className="rounded-lg border border-sidebar-border bg-sidebar-accent/40 px-3 py-2 text-xs">
        <div className="text-muted-foreground">Workspace</div>
        <div className="mt-0.5 flex items-center gap-1.5 font-medium">
          <CurrIcon className="h-3.5 w-3.5" />
          {curr.label}
        </div>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="w-full rounded-lg border border-sidebar-border bg-sidebar-accent/40 px-3 py-2 text-left text-xs transition-colors hover:bg-sidebar-accent">
          <div className="flex items-center justify-between">
            <div className="text-muted-foreground">Workspace</div>
            <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          <div className="mt-0.5 flex items-center gap-1.5 font-medium">
            <CurrIcon className="h-3.5 w-3.5" />
            {curr.label}
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-60">
        <DropdownMenuLabel>Switch workspace</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {available.map((k) => {
          const w = WORKSPACES[k];
          const Icon = w.icon;
          return (
            <DropdownMenuItem key={k} onClick={() => navigate({ to: w.to })}>
              <Icon className="mr-2 h-4 w-4" />
              <span className="flex-1">{w.label}</span>
              {k === current && <Check className="h-4 w-4 text-primary" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
