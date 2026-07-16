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