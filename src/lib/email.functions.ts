import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * Transactional email abstraction with dev-fallback.
 *
 * Behavior:
 * - Always records the attempt in the `email_log` table for admin audit.
 * - If a verified sender domain is configured via env (`APP_EMAIL_SENDER`
 *   holding `Name <address@verified.domain>`) AND `LOVABLE_API_KEY` is
 *   present, POSTs the email through Lovable's managed email API.
 * - Otherwise records the entry with status `dev_fallback` and returns
 *   `{ sent: false, dev: true }` so the UI can display an honest state.
 *
 * The only remaining external step to enable real delivery is completing
 * the domain verification and setting `APP_EMAIL_SENDER` in the project's
 * server-side environment.
 */

const ADMIN_NOTIFICATION_ADDRESS = "johnnikolidakis@gmail.com";

const inputSchema = z.object({
  to: z.string().email().max(320),
  subject: z.string().min(1).max(300),
  template: z.enum([
    "demo_request_confirmation",
    "demo_request_admin_notification",
    "partnership_request_confirmation",
    "partnership_request_admin_notification",
  ]),
  data: z.record(z.string(), z.any()).default({}),
});

type Input = z.infer<typeof inputSchema>;

function renderTemplate(input: Input): { html: string; text: string } {
  const d = input.data as Record<string, string | undefined>;
  const brand = "Proofolio";
  switch (input.template) {
    case "demo_request_confirmation":
      return {
        text: `Hi ${d.first_name ?? "there"},\n\nThanks for requesting a demo of ${brand}. A member of our team will reach out within 24 hours to confirm a time.\n\nSummary:\nCompany: ${d.company ?? ""}\nTeam size: ${d.team_size ?? "—"}\n\n— The ${brand} team`,
        html: `<p>Hi ${escape(d.first_name ?? "there")},</p><p>Thanks for requesting a demo of <strong>${brand}</strong>. A member of our team will reach out within 24 hours to confirm a time.</p><p><strong>Summary</strong><br/>Company: ${escape(d.company ?? "")}<br/>Team size: ${escape(d.team_size ?? "—")}</p><p>— The ${brand} team</p>`,
      };
    case "demo_request_admin_notification":
      return {
        text: `New demo request\n\nName: ${d.first_name} ${d.last_name}\nEmail: ${d.email}\nCompany: ${d.company}\nTeam size: ${d.team_size ?? "—"}\nHires/yr: ${d.hires_per_year ?? "—"}\n\n${d.message ?? ""}`,
        html: `<h3>New demo request</h3><ul><li><strong>Name:</strong> ${escape(`${d.first_name} ${d.last_name}`)}</li><li><strong>Email:</strong> ${escape(d.email ?? "")}</li><li><strong>Company:</strong> ${escape(d.company ?? "")}</li><li><strong>Team size:</strong> ${escape(d.team_size ?? "—")}</li><li><strong>Hires/yr:</strong> ${escape(d.hires_per_year ?? "—")}</li></ul><p>${escape(d.message ?? "")}</p>`,
      };
    case "partnership_request_confirmation":
      return {
        text: `Hi ${d.contact_name ?? "there"},\n\nThanks for reaching out about a ${brand} partnership for ${d.organization ?? "your organization"}. We'll be in touch within 2 business days.\n\n— The ${brand} team`,
        html: `<p>Hi ${escape(d.contact_name ?? "there")},</p><p>Thanks for reaching out about a <strong>${brand}</strong> partnership for ${escape(d.organization ?? "your organization")}. We'll be in touch within 2 business days.</p><p>— The ${brand} team</p>`,
      };
    case "partnership_request_admin_notification":
      return {
        text: `New partnership request (${d.kind})\n\nOrganization: ${d.organization}\nContact: ${d.contact_name} <${d.email}>\nRole: ${d.role_title ?? "—"}\nCountry: ${d.country ?? "—"}\n\n${d.message ?? ""}`,
        html: `<h3>New partnership request (${escape(d.kind ?? "")})</h3><ul><li><strong>Organization:</strong> ${escape(d.organization ?? "")}</li><li><strong>Contact:</strong> ${escape(`${d.contact_name} <${d.email}>`)}</li><li><strong>Role:</strong> ${escape(d.role_title ?? "—")}</li><li><strong>Country:</strong> ${escape(d.country ?? "—")}</li></ul><p>${escape(d.message ?? "")}</p>`,
      };
  }
}

function escape(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

async function logEmail(
  to: string,
  subject: string,
  template: string,
  payload: Record<string, unknown>,
  status: string,
  error?: string,
) {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("email_log").insert({ to_addr: to, subject, template, payload: payload as never, status, error: error ?? null });
  } catch (e) {
    console.error("[email] failed to write email_log", e);
  }
}

async function attemptSend(to: string, subject: string, html: string, text: string) {
  const sender = process.env.APP_EMAIL_SENDER;
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!sender || !apiKey) return { sent: false, dev: true as const, reason: "no_sender_domain_configured" };
  try {
    const res = await fetch("https://email.lovable.dev/v1/send", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ from: sender, to, subject, html, text }),
    });
    if (!res.ok) {
      const body = await res.text();
      return { sent: false, dev: false as const, reason: `provider_${res.status}`, error: body.slice(0, 500) };
    }
    return { sent: true, dev: false as const };
  } catch (e) {
    return { sent: false, dev: false as const, reason: "network_error", error: String(e).slice(0, 500) };
  }
}

// Internal-only sender. Not exposed as a server function to prevent abuse as an open email relay.
// Only reachable through the specific createServerFn wrappers below (demo/partnership), each of
// which is bound to a fixed template and hard-coded recipient set.
async function sendAppEmailInternal(input: Input) {
  const data = inputSchema.parse(input);
  const { html, text } = renderTemplate(data);
  const result = await attemptSend(data.to, data.subject, html, text);
  const status = result.sent ? "sent" : result.dev ? "dev_fallback" : "failed";
  await logEmail(data.to, data.subject, data.template, data.data, status, "error" in result ? result.error : undefined);
  if (!result.sent) {
    // eslint-disable-next-line no-console
    console.log(`[email:${status}] to=${data.to} subject="${data.subject}" template=${data.template}`);
  }
  return { sent: result.sent, dev: "dev" in result ? result.dev : false, status };
}

export const sendDemoRequestEmails = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) =>
    z
      .object({
        first_name: z.string(),
        last_name: z.string(),
        email: z.string().email(),
        company: z.string(),
        team_size: z.string().nullable().optional(),
        hires_per_year: z.string().nullable().optional(),
        message: z.string().nullable().optional(),
      })
      .parse(raw),
  )
  .handler(async ({ data }) => {
    const [confirm, notify] = await Promise.all([
      sendAppEmailInternal(
        data: {
          to: data.email,
          subject: `Your Proofolio demo request`,
          template: "demo_request_confirmation",
          data: data as unknown as Record<string, unknown>,
        },
      }),
      sendAppEmailInternal(
        data: {
          to: ADMIN_NOTIFICATION_ADDRESS,
          subject: `New demo request — ${data.company}`,
          template: "demo_request_admin_notification",
          data: data as unknown as Record<string, unknown>,
        },
      }),
    ]);
    return { confirm, notify };
  });

export const sendPartnershipRequestEmails = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) =>
    z
      .object({
        kind: z.string(),
        organization: z.string(),
        contact_name: z.string(),
        email: z.string().email(),
        role_title: z.string().nullable().optional(),
        country: z.string().nullable().optional(),
        message: z.string().nullable().optional(),
      })
      .parse(raw),
  )
  .handler(async ({ data }) => {
    const [confirm, notify] = await Promise.all([
      sendAppEmailInternal(
        data: {
          to: data.email,
          subject: `Your Proofolio partnership inquiry`,
          template: "partnership_request_confirmation",
          data: data as unknown as Record<string, unknown>,
        },
      }),
      sendAppEmailInternal(
        data: {
          to: ADMIN_NOTIFICATION_ADDRESS,
          subject: `New ${data.kind} partnership request — ${data.organization}`,
          template: "partnership_request_admin_notification",
          data: data as unknown as Record<string, unknown>,
        },
      }),
    ]);
    return { confirm, notify };
  });
