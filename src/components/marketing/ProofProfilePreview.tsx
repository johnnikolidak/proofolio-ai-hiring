import { Award, CheckCircle2, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const skills = ["React", "TypeScript", "System design", "SQL", "API design"];

const evidence = [
  { label: "E-commerce checkout rebuild", score: 94 },
  { label: "API rate-limiter design", score: 88 },
];

/**
 * Static, representative preview of a candidate Proof Profile.
 * Sample data only — mirrors the real /p/$id layout, not a live fetch.
 */
export function ProofProfilePreview() {
  return (
    <div
      className="mx-auto w-full max-w-3xl rounded-3xl border border-border bg-card p-2 shadow-glow"
      aria-hidden="true"
    >
      <div className="flex items-center gap-1.5 px-3 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-destructive/40" />
        <span className="h-2.5 w-2.5 rounded-full bg-warning/50" />
        <span className="h-2.5 w-2.5 rounded-full bg-success/50" />
        <span className="ml-3 text-[11px] font-medium text-muted-foreground">
          proofolio.com/p/maya-chen
        </span>
      </div>
      <div className="rounded-2xl border border-border bg-background p-5 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14 border border-border">
              <AvatarFallback className="bg-primary-soft text-sm font-semibold text-primary">
                MC
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-semibold">Maya Chen</h3>
                <ShieldCheck className="h-4 w-4 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">Full-Stack Engineer · Proof Profile</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-semibold tracking-tight text-primary">94</div>
            <div className="text-xs text-muted-foreground">Skill score</div>
          </div>
        </div>

        <Progress value={94} className="mt-5 h-1.5" />

        <div className="mt-5 flex flex-wrap gap-1.5">
          {skills.map((s) => (
            <Badge key={s} variant="outline" className="rounded-full font-normal">
              {s}
            </Badge>
          ))}
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {evidence.map((e) => (
            <div key={e.label} className="rounded-xl border border-border bg-card p-3.5">
              <div className="flex items-center gap-1.5 text-xs font-medium text-success">
                <CheckCircle2 className="h-3.5 w-3.5" /> Verified evidence
              </div>
              <div className="mt-1.5 text-sm font-medium leading-snug">{e.label}</div>
              <div className="mt-1 text-xs text-muted-foreground">Score {e.score}/100</div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center gap-2 rounded-xl bg-primary-soft px-3.5 py-2.5 text-xs font-medium text-primary">
          <Award className="h-4 w-4" /> Certified: Full-Stack Engineering — issued by Proofolio
        </div>
      </div>
    </div>
  );
}
