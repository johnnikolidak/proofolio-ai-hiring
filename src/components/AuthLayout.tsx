import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";

export function AuthLayout({ title, subtitle, children, footer }: { title: string; subtitle?: string; children: ReactNode; footer?: ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col justify-between p-8 md:p-12">
        <Logo />
        <div className="mx-auto w-full max-w-sm animate-fade-in-up">
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>}
          <div className="mt-8">{children}</div>
          {footer && <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>}
        </div>
        <div className="text-xs text-muted-foreground">
          <Link to="/">← Back to Proofolio</Link>
        </div>
      </div>
      <div className="relative hidden overflow-hidden bg-primary lg:block">
        <div className="absolute inset-0 gradient-hero opacity-60" />
        <div className="absolute inset-0 grid-bg opacity-20" />
        <div className="relative flex h-full flex-col justify-between p-12 text-primary-foreground">
          <div />
          <div className="max-w-md">
            <blockquote className="text-2xl font-medium leading-snug tracking-tight">
              "We replaced 8 rounds of interviews with a single Proofolio challenge. Time-to-hire dropped by 71% and quality went up."
            </blockquote>
            <div className="mt-6 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary-foreground/20" />
              <div>
                <div className="text-sm font-semibold">Amelia Chen</div>
                <div className="text-xs opacity-80">Head of Talent, Northwind Labs</div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-6 text-xs opacity-70">
            <span>SOC 2 Type II</span>
            <span>GDPR ready</span>
            <span>Used by 400+ teams</span>
          </div>
        </div>
      </div>
    </div>
  );
}
