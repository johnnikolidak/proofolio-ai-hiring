import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/DashboardShell";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/candidate/applications")({ component: Applications });

type Status = "In review" | "Interview" | "Offer" | "Rejected" | "Submitted";
const apps: { role: string; company: string; stage: Status; date: string; score?: number }[] = [
  { role: "Junior Growth Analyst", company: "Northwind Labs", stage: "Interview", date: "Aug 4", score: 91 },
  { role: "Associate PM", company: "Lumen", stage: "In review", date: "Jul 30", score: 84 },
  { role: "Data Analyst Intern", company: "Foundry", stage: "Offer", date: "Jul 25", score: 93 },
  { role: "Marketing Associate", company: "Vela", stage: "Submitted", date: "Jul 22" },
  { role: "Frontend Engineer I", company: "Kinetic", stage: "Rejected", date: "Jul 12", score: 68 },
];

const tone: Record<Status, string> = {
  "In review": "bg-warning/15 text-warning-foreground",
  Interview: "bg-primary/15 text-primary",
  Offer: "bg-success/15 text-success",
  Rejected: "bg-destructive/15 text-destructive",
  Submitted: "bg-secondary text-muted-foreground",
};

function Applications() {
  return (
    <>
      <PageHeader title="Applications" description="Track every application in one place." />
      <div className="rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Role</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Stage</TableHead>
              <TableHead>Applied</TableHead>
              <TableHead>Score</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {apps.map((a) => (
              <TableRow key={a.role}>
                <TableCell className="font-medium">{a.role}</TableCell>
                <TableCell className="text-muted-foreground">{a.company}</TableCell>
                <TableCell><Badge className={`rounded-full font-medium ${tone[a.stage]}`} variant="secondary">{a.stage}</Badge></TableCell>
                <TableCell className="text-muted-foreground">{a.date}</TableCell>
                <TableCell>{a.score ?? "—"}</TableCell>
                <TableCell><Button size="sm" variant="ghost">View</Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
