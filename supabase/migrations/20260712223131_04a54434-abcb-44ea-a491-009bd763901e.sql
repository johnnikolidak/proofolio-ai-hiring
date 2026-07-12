
-- 1) Add university to role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'university';

-- 2) partnership_requests
CREATE TABLE public.partnership_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL CHECK (kind IN ('university','company')),
  organization text NOT NULL,
  contact_name text NOT NULL,
  email text NOT NULL,
  role_title text,
  country text,
  students_or_hires text,
  message text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.partnership_requests TO authenticated;
GRANT INSERT ON public.partnership_requests TO anon;
GRANT ALL ON public.partnership_requests TO service_role;
ALTER TABLE public.partnership_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit partnership requests" ON public.partnership_requests
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    length(organization) BETWEEN 1 AND 200
    AND length(contact_name) BETWEEN 1 AND 120
    AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    AND length(email) BETWEEN 3 AND 255
  );
CREATE POLICY "Admins read partnership requests" ON public.partnership_requests
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins update partnership requests" ON public.partnership_requests
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- 3) challenges
CREATE TABLE public.challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  role text,
  industry text,
  difficulty text CHECK (difficulty IN ('beginner','intermediate','advanced')),
  duration_hours numeric,
  context text,
  task text,
  deliverables text,
  evaluation_criteria text,
  evidence_dimensions text[] DEFAULT '{}',
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','archived')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX challenges_owner_idx ON public.challenges(owner_id);
CREATE INDEX challenges_status_idx ON public.challenges(status);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.challenges TO authenticated;
GRANT ALL ON public.challenges TO service_role;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read published challenges" ON public.challenges
  FOR SELECT TO authenticated USING (status = 'published' OR owner_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Owners insert challenges" ON public.challenges
  FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Owners update challenges" ON public.challenges
  FOR UPDATE TO authenticated USING (owner_id = auth.uid() OR public.has_role(auth.uid(),'admin')) WITH CHECK (owner_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Owners delete challenges" ON public.challenges
  FOR DELETE TO authenticated USING (owner_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

-- 4) campaigns
CREATE TABLE public.campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id uuid REFERENCES public.challenges(id) ON DELETE SET NULL,
  title text NOT NULL,
  role text,
  description text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','live','paused','closed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX campaigns_owner_idx ON public.campaigns(owner_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.campaigns TO authenticated;
GRANT ALL ON public.campaigns TO service_role;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read live campaigns" ON public.campaigns
  FOR SELECT TO authenticated USING (status = 'live' OR owner_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Owners manage campaigns ins" ON public.campaigns
  FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Owners manage campaigns upd" ON public.campaigns
  FOR UPDATE TO authenticated USING (owner_id = auth.uid() OR public.has_role(auth.uid(),'admin')) WITH CHECK (owner_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Owners manage campaigns del" ON public.campaigns
  FOR DELETE TO authenticated USING (owner_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

-- 5) submissions
CREATE TABLE public.submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id uuid NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  campaign_id uuid REFERENCES public.campaigns(id) ON DELETE SET NULL,
  content text,
  file_url text,
  score numeric,
  feedback text,
  status text NOT NULL DEFAULT 'submitted' CHECK (status IN ('draft','submitted','reviewed','shortlisted','rejected')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (candidate_id, challenge_id)
);
CREATE INDEX submissions_candidate_idx ON public.submissions(candidate_id);
CREATE INDEX submissions_challenge_idx ON public.submissions(challenge_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.submissions TO authenticated;
GRANT ALL ON public.submissions TO service_role;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Candidates read own submissions" ON public.submissions
  FOR SELECT TO authenticated USING (candidate_id = auth.uid());
CREATE POLICY "Challenge owners read submissions" ON public.submissions
  FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.challenges c WHERE c.id = submissions.challenge_id AND c.owner_id = auth.uid()));
CREATE POLICY "Admins read submissions" ON public.submissions
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Candidates insert submissions" ON public.submissions
  FOR INSERT TO authenticated WITH CHECK (candidate_id = auth.uid());
CREATE POLICY "Candidates update own submissions" ON public.submissions
  FOR UPDATE TO authenticated USING (candidate_id = auth.uid()) WITH CHECK (candidate_id = auth.uid());
CREATE POLICY "Owners score submissions" ON public.submissions
  FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.challenges c WHERE c.id = submissions.challenge_id AND c.owner_id = auth.uid())) WITH CHECK (EXISTS (SELECT 1 FROM public.challenges c WHERE c.id = submissions.challenge_id AND c.owner_id = auth.uid()));

-- 6) updated_at triggers
CREATE TRIGGER partnership_requests_updated_at BEFORE UPDATE ON public.partnership_requests FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER challenges_updated_at BEFORE UPDATE ON public.challenges FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER campaigns_updated_at BEFORE UPDATE ON public.campaigns FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER submissions_updated_at BEFORE UPDATE ON public.submissions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 7) ensure the auth handler already inserts profile+role even for 'university' (existing function does; it casts raw_user_meta_data->>'role' to app_role and the new enum value is now valid).
