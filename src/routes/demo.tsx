import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Calendar } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ProofProfilePreview } from "@/components/marketing/ProofProfilePreview";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/demo")({
  component: Demo,
  head: () => ({
    meta: [
      { title: "Demo — Proofolio" },
      {
        name: "description",
        content:
          "See how Proofolio's Proof Profiles, challenges and AI-scored evidence work before you sign up.",
      },
    ],
  }),
});

function Demo() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero" />
        <div className="container-page relative py-20 md:py-28">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="secondary" className="rounded-full">
              Product demo
            </Badge>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
              See a real <span className="text-gradient">Proof Profile</span>
            </h1>
            <p className="mt-5 text-lg text-muted-foreground">
              Every candidate on Proofolio builds a Proof Profile like this one — real challenges,
              AI-scored evidence and verified certificates, instead of a résumé.
            </p>
          </div>

          <div className="mt-14">
            <ProofProfilePreview />
          </div>

          <div className="mx-auto mt-14 flex max-w-2xl flex-col items-center gap-3 text-center">
            <p className="text-sm text-muted-foreground">
              Want a guided walkthrough with your team?
            </p>
            <Button asChild size="lg" className="h-12 gap-1.5 px-6 shadow-elev">
              <Link to="/book-demo">
                <Calendar className="h-4 w-4" /> Book a live demo <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
