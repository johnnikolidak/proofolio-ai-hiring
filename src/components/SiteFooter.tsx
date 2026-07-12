import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-secondary/40">
      <div className="container-page py-14">
        <div className="grid gap-10 md:grid-cols-5">
          <div className="md:col-span-2">
            <Logo />
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">
              AI-powered skills-based hiring. Real business challenges, not resumes.
            </p>
          </div>
          <FooterCol title="Product" links={[
            ["Features", "/#features"],
            ["How it works", "/#how"],
            ["Pricing", "/#pricing"],
            ["FAQ", "/#faq"],
          ]} />
          <FooterCol title="Solutions" links={[
            ["For candidates", "/for-candidates"],
            ["For companies", "/for-companies"],
            ["Book a demo", "/book-demo"],
          ]} />
          <FooterCol title="Account" links={[
            ["Sign in", "/auth/login"],
            ["Create account", "/auth/signup"],
            ["Reset password", "/auth/forgot-password"],
          ]} />
        </div>
        <div className="mt-10 flex flex-col items-start justify-between gap-4 border-t border-border pt-6 text-xs text-muted-foreground md:flex-row md:items-center">
          <p>© {new Date().getFullYear()} Proofolio, Inc. All rights reserved.</p>
          <p>Made for the next generation of hiring.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <h4 className="text-sm font-semibold">{title}</h4>
      <ul className="mt-4 space-y-2.5">
        {links.map(([label, href]) => (
          <li key={href}>
            <Link to={href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
