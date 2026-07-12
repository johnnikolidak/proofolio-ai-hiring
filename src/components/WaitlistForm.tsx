import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

const schema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  role: z.enum(["candidate", "company"]),
});

export function WaitlistForm({ source = "landing" }: { source?: string }) {
  const [role, setRole] = useState<"candidate" | "company">("candidate");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse({ email: fd.get("email"), role });
    if (!parsed.success) return toast.error(parsed.error.issues[0]!.message);

    setLoading(true);
    const { error } = await supabase.from("waitlist").insert({
      email: parsed.data.email.toLowerCase(),
      role: parsed.data.role,
      source,
    });
    setLoading(false);

    if (error) {
      if (error.code === "23505") {
        toast.info("You're already on the waitlist — we'll be in touch soon.");
        setDone(true);
        return;
      }
      toast.error(error.message);
      return;
    }
    toast.success("You're on the list");
    setDone(true);
  };

  if (done) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-border bg-card p-6 text-center shadow-soft">
        <div className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-success/15 text-success">
          <CheckCircle2 className="h-5 w-5" />
        </div>
        <p className="mt-3 text-sm font-medium">You're on the waitlist.</p>
        <p className="mt-1 text-xs text-muted-foreground">We'll email you when your invite is ready.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto flex max-w-xl flex-col gap-2 sm:flex-row">
      <Select value={role} onValueChange={(v) => setRole(v as "candidate" | "company")}>
        <SelectTrigger className="h-12 w-full sm:w-40"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="candidate">I'm a candidate</SelectItem>
          <SelectItem value="company">I'm hiring</SelectItem>
        </SelectContent>
      </Select>
      <Input name="email" type="email" placeholder="you@example.com" required className="h-12 flex-1" />
      <Button type="submit" size="lg" className="h-12" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Join waitlist
      </Button>
    </form>
  );
}
