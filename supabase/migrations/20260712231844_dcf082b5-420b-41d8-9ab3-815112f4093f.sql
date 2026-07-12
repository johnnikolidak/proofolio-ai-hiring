
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS headline text,
  ADD COLUMN IF NOT EXISTS bio text,
  ADD COLUMN IF NOT EXISTS location text,
  ADD COLUMN IF NOT EXISTS skills text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS links jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS availability text,
  ADD COLUMN IF NOT EXISTS preferred_roles text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS education jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS experience jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS completion_pct integer NOT NULL DEFAULT 0;

DROP POLICY IF EXISTS "Public profiles are viewable" ON public.profiles;
CREATE POLICY "Public profiles are viewable"
  ON public.profiles FOR SELECT
  TO anon, authenticated
  USING (is_public = true);

GRANT SELECT ON public.profiles TO anon;

CREATE TABLE IF NOT EXISTS public.challenge_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id uuid NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  content text,
  file_url text,
  status text NOT NULL DEFAULT 'in_progress',
  submitted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (candidate_id, challenge_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.challenge_attempts TO authenticated;
GRANT ALL ON public.challenge_attempts TO service_role;
ALTER TABLE public.challenge_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Candidates manage own attempts"
  ON public.challenge_attempts FOR ALL TO authenticated
  USING (auth.uid() = candidate_id) WITH CHECK (auth.uid() = candidate_id);
CREATE POLICY "Challenge owners view attempts"
  ON public.challenge_attempts FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.challenges c WHERE c.id = challenge_id AND c.owner_id = auth.uid()));

CREATE TRIGGER trg_challenge_attempts_updated_at
  BEFORE UPDATE ON public.challenge_attempts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  company_name text NOT NULL,
  location text,
  remote boolean NOT NULL DEFAULT false,
  salary_range text,
  tags text[] NOT NULL DEFAULT '{}',
  description text,
  requirements text,
  status text NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.jobs TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.jobs TO authenticated;
GRANT ALL ON public.jobs TO service_role;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published jobs are viewable"
  ON public.jobs FOR SELECT TO anon, authenticated
  USING (status = 'published');
CREATE POLICY "Owners view own jobs"
  ON public.jobs FOR SELECT TO authenticated
  USING (auth.uid() = owner_id);
CREATE POLICY "Owners manage own jobs"
  ON public.jobs FOR ALL TO authenticated
  USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

CREATE TRIGGER trg_jobs_updated_at
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  candidate_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cover_note text,
  status text NOT NULL DEFAULT 'submitted',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (job_id, candidate_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.applications TO authenticated;
GRANT ALL ON public.applications TO service_role;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Candidates view own applications"
  ON public.applications FOR SELECT TO authenticated
  USING (auth.uid() = candidate_id);
CREATE POLICY "Candidates create own applications"
  ON public.applications FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = candidate_id);
CREATE POLICY "Candidates withdraw own applications"
  ON public.applications FOR UPDATE TO authenticated
  USING (auth.uid() = candidate_id) WITH CHECK (auth.uid() = candidate_id);
CREATE POLICY "Job owners view applications"
  ON public.applications FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.jobs j WHERE j.id = job_id AND j.owner_id = auth.uid()));
CREATE POLICY "Job owners update applications"
  ON public.applications FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.jobs j WHERE j.id = job_id AND j.owner_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.jobs j WHERE j.id = job_id AND j.owner_id = auth.uid()));

CREATE TRIGGER trg_applications_updated_at
  BEFORE UPDATE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.email_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  to_addr text NOT NULL,
  subject text NOT NULL,
  template text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'queued',
  error text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.email_log TO authenticated;
GRANT ALL ON public.email_log TO service_role;
ALTER TABLE public.email_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins view email log"
  ON public.email_log FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Avatars storage policies (bucket already created via tool)
DROP POLICY IF EXISTS "Avatars viewable by owner" ON storage.objects;
CREATE POLICY "Avatars viewable by owner"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Users upload own avatar" ON storage.objects;
CREATE POLICY "Users upload own avatar"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Users update own avatar" ON storage.objects;
CREATE POLICY "Users update own avatar"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Users delete own avatar" ON storage.objects;
CREATE POLICY "Users delete own avatar"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Profile completion trigger
CREATE OR REPLACE FUNCTION public.trg_profile_completion()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.completion_pct := LEAST(100, (
    (CASE WHEN NEW.full_name IS NOT NULL AND length(NEW.full_name) > 0 THEN 15 ELSE 0 END) +
    (CASE WHEN NEW.headline IS NOT NULL AND length(NEW.headline) > 0 THEN 10 ELSE 0 END) +
    (CASE WHEN NEW.bio IS NOT NULL AND length(NEW.bio) > 20 THEN 15 ELSE 0 END) +
    (CASE WHEN NEW.location IS NOT NULL AND length(NEW.location) > 0 THEN 5 ELSE 0 END) +
    (CASE WHEN NEW.avatar_url IS NOT NULL THEN 10 ELSE 0 END) +
    (CASE WHEN array_length(NEW.skills, 1) >= 3 THEN 15 ELSE 0 END) +
    (CASE WHEN jsonb_array_length(NEW.experience) >= 1 THEN 15 ELSE 0 END) +
    (CASE WHEN jsonb_array_length(NEW.education) >= 1 THEN 10 ELSE 0 END) +
    (CASE WHEN array_length(NEW.preferred_roles, 1) >= 1 THEN 5 ELSE 0 END)
  ))::int;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_profiles_completion ON public.profiles;
CREATE TRIGGER trg_profiles_completion
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.trg_profile_completion();
