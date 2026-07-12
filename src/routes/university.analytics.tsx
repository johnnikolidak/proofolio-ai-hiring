import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/DashboardShell";
import { Area, AreaChart, Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export const Route = createFileRoute("/university/analytics")({ component: Analytics });

const participation = Array.from({ length: 12 }, (_, i) => ({ m: `W${i + 1}`, students: 40 + Math.round(Math.sin(i / 2) * 20 + i * 6) }));
const completion = [
  { role: "Analyst", rate: 78 }, { role: "Product", rate: 66 }, { role: "Design", rate: 82 }, { role: "Engineering", rate: 71 }, { role: "Ops", rate: 74 },
];

function Analytics() {
  return (
    <>
      <PageHeader title="Analytics" description="Participation, completion rates and cohort trends across your challenges." />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="font-semibold">Student participation (12 weeks)</h3>
          <div className="mt-4 h-64">
            <ResponsiveContainer>
              <AreaChart data={participation}>
                <defs>
                  <linearGradient id="pu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.63 0.19 265)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="oklch(0.63 0.19 265)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="m" tickLine={false} axisLine={false} className="text-xs" />
                <YAxis tickLine={false} axisLine={false} className="text-xs" />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--background)" }} />
                <Area type="monotone" dataKey="students" stroke="oklch(0.63 0.19 265)" fill="url(#pu)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="font-semibold">Completion rate by role</h3>
          <div className="mt-4 h-64">
            <ResponsiveContainer>
              <BarChart data={completion}>
                <XAxis dataKey="role" tickLine={false} axisLine={false} className="text-xs" />
                <YAxis tickLine={false} axisLine={false} className="text-xs" />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--background)" }} />
                <Bar dataKey="rate" fill="oklch(0.63 0.19 265)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </>
  );
}
