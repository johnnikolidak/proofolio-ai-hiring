import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AuthLayout } from "@/components/AuthLayout";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Mail } from "lucide-react";

export const Route = createFileRoute("/auth/verify-email")({
  component: VerifyEmail,
  head: () => ({ meta: [{ title: "Verify email — Proofolio" }] }),
});

function VerifyEmail() {
  const [code, setCode] = useState("");
  return (
    <AuthLayout
      title="Verify your email"
      subtitle="Enter the 6-digit code we sent to ada@example.com"
      footer={<>Wrong email? <Link to="/auth/signup" className="text-primary hover:underline">Start over</Link></>}
    >
      <div className="mx-auto mb-6 grid h-14 w-14 place-items-center rounded-2xl bg-primary-soft text-primary">
        <Mail className="h-6 w-6" />
      </div>
      <div className="flex justify-center">
        <InputOTP maxLength={6} value={code} onChange={setCode}>
          <InputOTPGroup>
            {Array.from({ length: 6 }).map((_, i) => <InputOTPSlot key={i} index={i} />)}
          </InputOTPGroup>
        </InputOTP>
      </div>
      <Button asChild size="lg" className="mt-6 w-full">
        <Link to="/candidate">Verify & continue</Link>
      </Button>
      <p className="mt-4 text-center text-xs text-muted-foreground">
        Didn't receive it? <button className="text-primary hover:underline">Resend code</button>
      </p>
    </AuthLayout>
  );
}
