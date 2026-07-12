import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/DashboardShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CreditCard, Download } from "lucide-react";

export const Route = createFileRoute("/company/billing")({ component: Billing });

const invoices = [
  { id: "INV-2025-0812", date: "Aug 1, 2025", amount: "$490.00", status: "Paid" },
  { id: "INV-2025-0711", date: "Jul 1, 2025", amount: "$490.00", status: "Paid" },
  { id: "INV-2025-0611", date: "Jun 1, 2025", amount: "$490.00", status: "Paid" },
  { id: "INV-2025-0511", date: "May 1, 2025", amount: "$390.00", status: "Paid" },
];

function Billing() {
  return (
    <>
      <PageHeader title="Billing" description="Manage your plan, payment methods, and invoices." />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <Badge className="rounded-full">Current plan</Badge>
                <h3 className="mt-2 text-2xl font-semibold">Growth</h3>
                <p className="mt-1 text-sm text-muted-foreground">$490 / month · Renews Sept 1, 2025</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">Change plan</Button>
                <Button variant="ghost">Cancel</Button>
              </div>
            </div>
            <div className="mt-6">
              <div className="flex justify-between text-sm"><span>Campaign credits</span><span className="text-muted-foreground">14 / 20 used</span></div>
              <Progress value={70} className="mt-2 h-2" />
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="font-semibold">Invoices</h3>
            <Table className="mt-4">
              <TableHeader><TableRow><TableHead>Invoice</TableHead><TableHead>Date</TableHead><TableHead>Amount</TableHead><TableHead>Status</TableHead><TableHead></TableHead></TableRow></TableHeader>
              <TableBody>
                {invoices.map((i) => (
                  <TableRow key={i.id}>
                    <TableCell className="font-medium">{i.id}</TableCell>
                    <TableCell>{i.date}</TableCell>
                    <TableCell>{i.amount}</TableCell>
                    <TableCell><Badge variant="secondary" className="rounded-full bg-success/15 text-success">{i.status}</Badge></TableCell>
                    <TableCell><Button size="sm" variant="ghost"><Download className="h-4 w-4" /></Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
        <div>
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="font-semibold">Payment method</h3>
            <div className="mt-4 flex items-center gap-3 rounded-lg border border-border p-4">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary-soft text-primary"><CreditCard className="h-5 w-5" /></div>
              <div>
                <div className="text-sm font-medium">Visa •••• 4242</div>
                <div className="text-xs text-muted-foreground">Expires 06/28</div>
              </div>
            </div>
            <Button variant="outline" className="mt-4 w-full">Update card</Button>
          </div>
        </div>
      </div>
    </>
  );
}
