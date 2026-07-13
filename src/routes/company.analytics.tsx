import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/DashboardShell";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, PieChart, Pie, Cell, Legend } from "recharts";

export const Route = createFileRoute("/company/analytics")({ component: Analytics });

const funnel = [
  { stage: "Applied", n: 342 },
  { stage: "Challenge", n: 214 },
  { stage: "Scored", n: 188 },
  { stage: "Shortlist", n: 24 },
  { stage: "Interview", n: 9 },
  { stage: "Offer", n: 3 },
];

const skillHeat = [
  { skill: "SQL", score: 82 },
  { skill: "Growth", score: 74 },
  { skill: "Product", score: 71 },
  { skill: "Comms", score: 86 },
  { skill: "Design", score: 68 },
];

const source = [
  { name: "Universities", value: 42 },
  { name: "Referrals", value: 22 },
  { name: "LinkedIn", value: 18 },
  { name: "Organic", value: 18 },
];
const colors = ["oklch(0.63 0.19 265)", "oklch(0.7 0.15 200)", "oklch(0.68 0.17 155)", "oklch(0.75 0.15 60)"];

function Analytics() {
  return (
    <>
      <PageHeader title="Analytics" description="Real-time hiring intelligence." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Funnel — Growth Analyst Q3">
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={funnel}>
                <XAxis dataKey="stage" tickLine={false} axisLine={false} className="text-xs" />
                <YAxis tickLine={false} axisLine={false} className="text-xs" />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--background)" }} />
                <Bar dataKey="n" fill="oklch(0.63 0.19 265)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card title="Skill heatmap (avg score)">
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={skillHeat} layout="vertical">
                <XAxis type="number" tickLine={false} axisLine={false} className="text-xs" />
                <YAxis dataKey="skill" type="category" tickLine={false} axisLine={false} className="text-xs" width={70} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--background)" }} />
                <Bar dataKey="score" fill="oklch(0.7 0.15 200)" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card title="Source of hire">
          <div className="h-72">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={source} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={2}>
                  {source.map((_, i) => <Cell key={i} fill={colors[i]} />)}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card title="Cost per hire">
          <div className="grid h-72 grid-cols-2 gap-4">
            {[
              { label: "This quarter", v: "$1,842" },
              { label: "Last quarter", v: "$2,910" },
              { label: "Industry avg", v: "$4,700" },
              { label: "Savings vs avg", v: "61%" },
            ].map((c) => (
              <div key={c.label} className="grid place-items-center rounded-xl border border-border bg-secondary/40">
                <div className="text-center">
                  <div className="text-3xl font-semibold text-primary">{c.v}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{c.label}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h3 className="font-semibold">{title}</h3>
      <div className="mt-4">{children}</div>
    </div>
  );
}
