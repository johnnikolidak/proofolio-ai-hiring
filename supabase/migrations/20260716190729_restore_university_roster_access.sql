-- The 20260715111031 security migration tightened profiles RLS to owner-only + admin
-- (dropping the old blanket "is_public = true, to anon/authenticated" policy) and its
-- own comment acknowledges the gap: "the [public_profiles] view above is the ONLY
-- anon-reachable path" — but no follow-up policy was added for the several legitimate
-- authenticated cross-user relationships the app depends on, so all of the following
-- silently broke (RLS filters rows rather than erroring, so these just went blank):
--   - University roster (university_students): university reading its own students
--   - Company applicant lists (company.candidates/interviews/jobs/shortlists):
--     a job owner reading applicant profiles
--   - Company submission reports (company.reports): a challenge owner reading
--     submitter profiles
--   - Messages (candidate.messages/company.messages): either side of a
--     message_thread reading the other party's profile
-- Add narrow policies scoped to each real relationship instead of reverting to the
-- old broad "any authenticated user can read any is_public profile" policy.

CREATE POLICY "Universities read own students' profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.university_students us
      WHERE us.university_id = auth.uid() AND us.candidate_id = profiles.id
    )
  );

CREATE POLICY "Universities read own students' submissions" ON public.submissions
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.university_students us
      WHERE us.university_id = auth.uid() AND us.candidate_id = submissions.candidate_id
    )
  );

CREATE POLICY "Job owners read applicant profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.applications a
      JOIN public.jobs j ON j.id = a.job_id
      WHERE a.candidate_id = profiles.id AND j.owner_id = auth.uid()
    )
  );

CREATE POLICY "Challenge owners read submitter profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.submissions s
      JOIN public.challenges c ON c.id = s.challenge_id
      WHERE s.candidate_id = profiles.id AND c.owner_id = auth.uid()
    )
  );

CREATE POLICY "Message thread participants read each other's profile" ON public.profiles
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.message_threads mt
      WHERE (mt.candidate_id = auth.uid() AND mt.counterpart_id = profiles.id)
         OR (mt.counterpart_id = auth.uid() AND mt.candidate_id = profiles.id)
    )
  );

-- p.$id.tsx (the public Proof Profile page) reads availability/links in addition to
-- the columns already in public_profiles; extend the view so that page can be moved
-- off the base table (which anon can no longer read at all) onto this view.
DROP VIEW IF EXISTS public.public_profiles;
CREATE VIEW public.public_profiles
WITH (security_invoker = true)
AS
SELECT id, full_name, headline, bio, location, avatar_url, skills, experience,
       education, languages, portfolio, preferred_roles, cv_url, completion_pct,
       is_public, availability, links
  FROM public.profiles
 WHERE is_public = true;

GRANT SELECT ON public.public_profiles TO anon, authenticated;
