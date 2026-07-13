import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/DashboardShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const Route = createFileRoute("/company/campaigns")({ component: Campaigns });

const campaigns = [
  { name: "Growth Analyst — Q3", role: "Analyst", applicants: 342, shortlisted: 24, hires: 2, status: "Live", updated: "2h ago" },
  { name: "Product Designer", role: "Design", applicants: 187, shortlisted: 12, hires: 1, status: "Live", updated: "1d ago" },
  { name: "Data Engineer", role: "Engineering", applicants: 96, shortlisted: 8, hires: 0, status: "Draft", updated: "3d ago" },
  { name: "Grad program — 2025", role: "Rotational", applicants: 812, shortlisted: 60, hires: 12, status: "Closed", updated: "2w ago" },
  { name: "Frontend Engineer I", role: "Engineering", applicants: 121, shortlisted: 9, hires: 0, status: "Live", updated: "5h ago" },
  { name: "Marketing Ops", role: "Marketing", applicants: 54, shortlisted: 4, hires: 0, status: "Paused", updated: "1w ago" },
];

const tone: Record<string, string> = {
  Live: "bg-success/15 text-success",
  Draft: "bg-secondary text-muted-foreground",
  Paused: "bg-warning/20 text-warning-foreground",
  Closed: "bg-muted text-muted-foreground",
};

function Campaigns() {
  return (
    <>
      <PageHeader
        title="Campaigns"
        description="All your hiring campaigns in one view."
        actions={<Button asChild><Link to="/company/challenge-builder">+ New campaign</Link></Button>}
      />
      <div className="rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Campaign</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Applicants</TableHead>
              <TableHead>Shortlisted</TableHead>
              <TableHead>Hires</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {campaigns.map((c) => (
              <TableRow key={c.name}>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell className="text-muted-foreground">{c.role}</TableCell>
                <TableCell>{c.applicants}</TableCell>
                <TableCell>{c.shortlisted}</TableCell>
                <TableCell>{c.hires}</TableCell>
                <TableCell><Badge variant="secondary" className={`rounded-full ${tone[c.status]}`}>{c.status}</Badge></TableCell>
                <TableCell className="text-muted-foreground">{c.updated}</TableCell>
                <TableCell><Button size="sm" variant="ghost">Open</Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
