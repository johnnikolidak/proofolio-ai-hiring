
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS cv_url text,
  ADD COLUMN IF NOT EXISTS cv_filename text,
  ADD COLUMN IF NOT EXISTS languages jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS portfolio jsonb NOT NULL DEFAULT '[]'::jsonb;

CREATE OR REPLACE FUNCTION public.trg_profile_completion()
RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public' AS $$
BEGIN
  NEW.completion_pct := LEAST(100, (
    (CASE WHEN NEW.full_name IS NOT NULL AND length(NEW.full_name) > 0 THEN 10 ELSE 0 END) +
    (CASE WHEN NEW.headline IS NOT NULL AND length(NEW.headline) > 0 THEN 10 ELSE 0 END) +
    (CASE WHEN NEW.bio IS NOT NULL AND length(NEW.bio) > 20 THEN 10 ELSE 0 END) +
    (CASE WHEN NEW.location IS NOT NULL AND length(NEW.location) > 0 THEN 5 ELSE 0 END) +
    (CASE WHEN NEW.avatar_url IS NOT NULL THEN 10 ELSE 0 END) +
    (CASE WHEN NEW.cv_url IS NOT NULL THEN 10 ELSE 0 END) +
    (CASE WHEN array_length(NEW.skills, 1) >= 3 THEN 10 ELSE 0 END) +
    (CASE WHEN jsonb_array_length(NEW.experience) >= 1 THEN 10 ELSE 0 END) +
    (CASE WHEN jsonb_array_length(NEW.education) >= 1 THEN 10 ELSE 0 END) +
    (CASE WHEN jsonb_array_length(NEW.languages) >= 1 THEN 5 ELSE 0 END) +
    (CASE WHEN jsonb_array_length(NEW.portfolio) >= 1 THEN 5 ELSE 0 END) +
    (CASE WHEN array_length(NEW.preferred_roles, 1) >= 1 THEN 5 ELSE 0 END)
  ))::int;
  RETURN NEW;
END;
$$;
UPDATE public.profiles SET updated_at = now();

CREATE TABLE IF NOT EXISTS public.saved_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id uuid NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (candidate_id, job_id)
);
GRANT SELECT, INSERT, DELETE ON public.saved_jobs TO authenticated;
GRANT ALL ON public.saved_jobs TO service_role;
ALTER TABLE public.saved_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Candidates manage own saved jobs" ON public.saved_jobs
  FOR ALL TO authenticated
  USING (candidate_id = auth.uid()) WITH CHECK (candidate_id = auth.uid());

ALTER TABLE public.applications DROP CONSTRAINT IF EXISTS applications_status_check;
ALTER TABLE public.applications ADD CONSTRAINT applications_status_check
  CHECK (status IN ('submitted','in_review','interview','offer','rejected','withdrawn'));

CREATE TABLE IF NOT EXISTS public.certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id uuid REFERENCES public.challenges(id) ON DELETE SET NULL,
  submission_id uuid REFERENCES public.submissions(id) ON DELETE SET NULL,
  title text NOT NULL,
  issuer text NOT NULL DEFAULT 'Proofolio',
  score numeric,
  verification_code text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(9), 'hex'),
  issued_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS certificates_candidate_idx ON public.certificates(candidate_id);
GRANT SELECT, INSERT ON public.certificates TO authenticated;
GRANT SELECT ON public.certificates TO anon;
GRANT ALL ON public.certificates TO service_role;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Candidates view own certificates" ON public.certificates
  FOR SELECT TO authenticated USING (candidate_id = auth.uid());
CREATE POLICY "Public verify by code" ON public.certificates
  FOR SELECT TO anon USING (true);
CREATE POLICY "Candidates insert own certificates" ON public.certificates
  FOR INSERT TO authenticated WITH CHECK (candidate_id = auth.uid());

CREATE OR REPLACE FUNCTION public.trg_issue_certificate()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE _title text;
BEGIN
  IF NEW.score IS NOT NULL AND NEW.score >= 70 AND (OLD.score IS NULL OR OLD.score < 70) THEN
    SELECT title INTO _title FROM public.challenges WHERE id = NEW.challenge_id;
    INSERT INTO public.certificates (candidate_id, challenge_id, submission_id, title, score)
    VALUES (NEW.candidate_id, NEW.challenge_id, NEW.id, COALESCE(_title, 'Verified Challenge'), NEW.score)
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS submissions_issue_certificate ON public.submissions;
CREATE TRIGGER submissions_issue_certificate
  AFTER UPDATE OF score ON public.submissions
  FOR EACH ROW EXECUTE FUNCTION public.trg_issue_certificate();

CREATE TABLE IF NOT EXISTS public.message_threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  counterpart_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject text,
  last_message_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (candidate_id, counterpart_id)
);
CREATE INDEX IF NOT EXISTS threads_candidate_idx ON public.message_threads(candidate_id);
CREATE INDEX IF NOT EXISTS threads_counterpart_idx ON public.message_threads(counterpart_id);
GRANT SELECT, INSERT, UPDATE ON public.message_threads TO authenticated;
GRANT ALL ON public.message_threads TO service_role;
ALTER TABLE public.message_threads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants view threads" ON public.message_threads
  FOR SELECT TO authenticated USING (candidate_id = auth.uid() OR counterpart_id = auth.uid());
CREATE POLICY "Participants create threads" ON public.message_threads
  FOR INSERT TO authenticated
  WITH CHECK (candidate_id = auth.uid() OR counterpart_id = auth.uid());
CREATE POLICY "Participants update threads" ON public.message_threads
  FOR UPDATE TO authenticated
  USING (candidate_id = auth.uid() OR counterpart_id = auth.uid())
  WITH CHECK (candidate_id = auth.uid() OR counterpart_id = auth.uid());

CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid NOT NULL REFERENCES public.message_threads(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body text NOT NULL,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS messages_thread_idx ON public.messages(thread_id, created_at);
GRANT SELECT, INSERT, UPDATE ON public.messages TO authenticated;
GRANT ALL ON public.messages TO service_role;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Thread participants read messages" ON public.messages
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.message_threads t WHERE t.id = messages.thread_id
      AND (t.candidate_id = auth.uid() OR t.counterpart_id = auth.uid()))
  );
CREATE POLICY "Thread participants send messages" ON public.messages
  FOR INSERT TO authenticated WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (SELECT 1 FROM public.message_threads t WHERE t.id = messages.thread_id
      AND (t.candidate_id = auth.uid() OR t.counterpart_id = auth.uid()))
  );
CREATE POLICY "Recipients mark read" ON public.messages
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.message_threads t WHERE t.id = messages.thread_id
      AND (t.candidate_id = auth.uid() OR t.counterpart_id = auth.uid()))
    AND sender_id <> auth.uid()
  );

CREATE OR REPLACE FUNCTION public.trg_bump_thread()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  UPDATE public.message_threads SET last_message_at = NEW.created_at WHERE id = NEW.thread_id;
  RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS messages_bump_thread ON public.messages;
CREATE TRIGGER messages_bump_thread AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.trg_bump_thread();

CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind text NOT NULL,
  title text NOT NULL,
  body text,
  link text,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS notifications_user_idx ON public.notifications(user_id, created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own notifications" ON public.notifications
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users update own notifications" ON public.notifications
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users delete own notifications" ON public.notifications
  FOR DELETE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users insert own notifications" ON public.notifications
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.trg_notify_application_status()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE _title text; _company text;
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    SELECT title, company_name INTO _title, _company FROM public.jobs WHERE id = NEW.job_id;
    INSERT INTO public.notifications (user_id, kind, title, body, link)
    VALUES (NEW.candidate_id, 'application_status',
      'Application update: ' || COALESCE(_title,'job'),
      'Status changed to "' || NEW.status || '" at ' || COALESCE(_company,''),
      '/candidate/applications');
  END IF;
  RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS applications_notify_status ON public.applications;
CREATE TRIGGER applications_notify_status
  AFTER UPDATE OF status ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.trg_notify_application_status();

CREATE OR REPLACE FUNCTION public.trg_notify_new_message()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE _recipient uuid;
BEGIN
  SELECT CASE WHEN t.candidate_id = NEW.sender_id THEN t.counterpart_id ELSE t.candidate_id END
    INTO _recipient FROM public.message_threads t WHERE t.id = NEW.thread_id;
  IF _recipient IS NOT NULL AND _recipient <> NEW.sender_id THEN
    INSERT INTO public.notifications (user_id, kind, title, body, link)
    VALUES (_recipient, 'message', 'New message', left(NEW.body, 140), '/candidate/messages');
  END IF;
  RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS messages_notify ON public.messages;
CREATE TRIGGER messages_notify AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.trg_notify_new_message();

CREATE OR REPLACE FUNCTION public.trg_notify_certificate()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  INSERT INTO public.notifications (user_id, kind, title, body, link)
  VALUES (NEW.candidate_id, 'certificate',
    'Certificate issued: ' || NEW.title,
    'You earned a verified certificate with score ' || NEW.score,
    '/candidate/certificates');
  RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS certificates_notify ON public.certificates;
CREATE TRIGGER certificates_notify AFTER INSERT ON public.certificates
  FOR EACH ROW EXECUTE FUNCTION public.trg_notify_certificate();

CREATE TABLE IF NOT EXISTS public.interview_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_target text NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','completed')),
  ai_summary text,
  score numeric,
  ended_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS interview_sessions_candidate_idx
  ON public.interview_sessions(candidate_id, created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.interview_sessions TO authenticated;
GRANT ALL ON public.interview_sessions TO service_role;
ALTER TABLE public.interview_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Candidates manage own interviews" ON public.interview_sessions
  FOR ALL TO authenticated
  USING (candidate_id = auth.uid()) WITH CHECK (candidate_id = auth.uid());
CREATE TRIGGER interview_sessions_updated_at BEFORE UPDATE ON public.interview_sessions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.interview_turns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.interview_sessions(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('ai','user','system')),
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS interview_turns_session_idx
  ON public.interview_turns(session_id, created_at);
GRANT SELECT, INSERT ON public.interview_turns TO authenticated;
GRANT ALL ON public.interview_turns TO service_role;
ALTER TABLE public.interview_turns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners read turns" ON public.interview_turns
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.interview_sessions s WHERE s.id = interview_turns.session_id AND s.candidate_id = auth.uid())
  );
CREATE POLICY "Owners insert turns" ON public.interview_turns
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.interview_sessions s WHERE s.id = interview_turns.session_id AND s.candidate_id = auth.uid())
  );

CREATE TABLE IF NOT EXISTS public.user_settings (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  notify_new_jobs boolean NOT NULL DEFAULT true,
  notify_challenge_feedback boolean NOT NULL DEFAULT true,
  notify_interview_reminders boolean NOT NULL DEFAULT true,
  notify_product_updates boolean NOT NULL DEFAULT false,
  anonymized_benchmarking boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.user_settings TO authenticated;
GRANT ALL ON public.user_settings TO service_role;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own settings" ON public.user_settings
  FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE TRIGGER user_settings_updated_at BEFORE UPDATE ON public.user_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "Users upload own CVs" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'cvs' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users read own CVs" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'cvs' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users update own CVs" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'cvs' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users delete own CVs" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'cvs' AND (storage.foldername(name))[1] = auth.uid()::text);
