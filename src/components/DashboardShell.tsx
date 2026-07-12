import { Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { useState, type ComponentType, type ReactNode } from "react";
import { Bell, ChevronDown, LogOut, Menu, Search, X } from "lucide-react";
import { Logo } from "./Logo";
import { Input } from "./ui/input";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { toast } from "sonner";

export type NavItem = {
  to: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  badge?: string | number;
};

export function DashboardShell({
  nav,
  role,
}: {
  nav: NavItem[];
  role: "Candidate" | "Company" | "Admin";
}) {
  const [open, setOpen] = useState(false);
  const { profile, user, signOut } = useAuth();
  const navigate = useNavigate();

  const displayName = profile?.full_name || profile?.email || user?.email || "Account";
  const displayEmail = profile?.email || user?.email || "";
  const initials = (displayName || "?")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out");
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen bg-secondary/30">
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 border-r border-border bg-sidebar text-sidebar-foreground transition-transform lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-5">
          <Logo />
          <button className="lg:hidden" onClick={() => setOpen(false)} aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-3 py-2">
          <div className="rounded-lg border border-sidebar-border bg-sidebar-accent/40 px-3 py-2 text-xs">
            <div className="text-muted-foreground">Workspace</div>
            <div className="font-medium">{role} account</div>
          </div>
        </div>
        <nav className="flex flex-col gap-0.5 p-2">
          {nav.map((item) => (
            <SideLink key={item.to} item={item} onNavigate={() => setOpen(false)} />
          ))}
        </nav>
        <div className="absolute inset-x-0 bottom-0 border-t border-sidebar-border p-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-sidebar-accent">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{displayName}</div>
                  <div className="truncate text-xs text-muted-foreground">{displayEmail}</div>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Signed in as {displayEmail}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {open && (
        <div className="fixed inset-0 z-30 bg-foreground/20 backdrop-blur-sm lg:hidden" onClick={() => setOpen(false)} />
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-5 backdrop-blur-xl">
          <button className="lg:hidden" onClick={() => setOpen(true)} aria-label="Menu">
            <Menu className="h-5 w-5" />
          </button>
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search..." className="h-9 pl-9" />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button className="relative grid h-9 w-9 place-items-center rounded-md hover:bg-accent" aria-label="Notifications">
              <Bell className="h-4 w-4" />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-primary" />
            </button>
            <Link
              to="/"
              className="hidden md:inline-flex text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              ← Back to site
            </Link>
          </div>
        </header>
        <main className="animate-fade-in p-5 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function SideLink({ item, onNavigate }: { item: NavItem; onNavigate: () => void }) {
  const location = useLocation();
  const active =
    location.pathname === item.to ||
    (item.to !== "/candidate" && item.to !== "/company" && item.to !== "/admin" && location.pathname.startsWith(item.to));
  const Icon = item.icon;
  return (
    <Link
      to={item.to}
      onClick={onNavigate}
      className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
        active
          ? "bg-primary text-primary-foreground shadow-soft"
          : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      }`}
    >
      <Icon className="h-4 w-4" />
      <span className="flex-1">{item.label}</span>
      {item.badge && (
        <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${active ? "bg-primary-foreground/20" : "bg-accent text-accent-foreground"}`}>
          {item.badge}
        </span>
      )}
    </Link>
  );
}

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
