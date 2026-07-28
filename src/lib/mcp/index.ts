import { auth, defineMcp } from "@lovable.dev/mcp-js";
import applyToJob from "./tools/apply-to-job";
import getJob from "./tools/get-job";
import listChallenges from "./tools/list-challenges";
import listJobs from "./tools/list-jobs";
import listMyApplications from "./tools/list-my-applications";
import listMyCertificates from "./tools/list-my-certificates";

// The OAuth issuer must be the direct Supabase host; the project ref is the only
// value that survives publish unchanged and is inlined at build time.
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "proofolio-mcp",
  title: "Proofolio",
  version: "0.1.0",
  instructions:
    "Tools for Proofolio, a proof-of-skill hiring platform. Browse published jobs and skill challenges, inspect a job, review the signed-in user's applications and earned certificates, and apply to a job on their behalf. All tools act as the authenticated Proofolio user.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listJobs, getJob, listChallenges, listMyApplications, listMyCertificates, applyToJob],
});
