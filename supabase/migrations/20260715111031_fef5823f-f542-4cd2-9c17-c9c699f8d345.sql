
-- 1. certificate_self_issuance: remove candidate INSERT policy; only the SECURITY DEFINER trigger issues certificates.
DROP POLICY IF EXISTS "Candidates insert own certificates" ON public.certificates;

-- 2. signup_role_admin_escalation: never derive privileged roles from client-supplied signup metadata.
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  _requested text;
  _role app_role;
  _full_name text;
  _company text;
begin
  _requested := lower(coalesce(new.raw_user_meta_data->>'role',''));
  -- Only allow non-privileged roles from signup metadata. Admin can never be
  -- self-assigned; it is granted exclusively by the founder-email path or by
  -- an admin-only server-side flow.
  if _requested in ('candidate','company','university') then
    _role := _requested::app_role;
  else
    _role := 'candidate';
  end if;

  _full_name := new.raw_user_meta_data->>'full_name';
  _company := new.raw_user_meta_data->>'company_name';

  insert into public.profiles (id, email, full_name, role, company_name)
  values (new.id, new.email, _full_name, _role, _company)
  on conflict (id) do nothing;

  insert into public.user_roles (user_id, role)
  values (new.id, _role)
  on conflict (user_id, role) do nothing;

  if lower(coalesce(new.email,'')) = 'johnnikolidakis@gmail.com' then
    insert into public.user_roles (user_id, role)
    values (new.id, 'admin')
    on conflict (user_id, role) do nothing;
  end if;

  return new;
end;
$function$;

-- 3. profiles_public_email_exposure: restrict the public policy to non-sensitive columns via a public view.
DROP POLICY IF EXISTS "Public profiles are viewable" ON public.profiles;

-- Public-safe view. Excludes email and any other sensitive account fields.
DROP VIEW IF EXISTS public.public_profiles;
CREATE VIEW public.public_profiles
WITH (security_invoker = true)
AS
SELECT id, full_name, headline, bio, location, avatar_url, skills, experience,
       education, languages, portfolio, preferred_roles, cv_url, completion_pct,
       is_public
  FROM public.profiles
 WHERE is_public = true;

GRANT SELECT ON public.public_profiles TO anon, authenticated;

-- Re-add a public-read policy on the underlying table only for anonymous surfaces
-- that MUST hit the table directly (e.g. the profile page joins). Restrict it so
-- anon reads never expose email. authenticated may still see the whole row for
-- their own record via "Users read own profile" and admins via "Admins read all
-- profiles". Any other authenticated read of another user is now blocked.
-- (No anon policy added → the view above is the ONLY anon-reachable path.)

-- 4. unrestricted_listing_creation: require the company/university role on write.
DROP POLICY IF EXISTS "Owners manage own jobs" ON public.jobs;
CREATE POLICY "Owners insert own jobs" ON public.jobs
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = owner_id AND public.has_role(auth.uid(), 'company'));
CREATE POLICY "Owners update own jobs" ON public.jobs
  FOR UPDATE TO authenticated
  USING (auth.uid() = owner_id AND public.has_role(auth.uid(), 'company'))
  WITH CHECK (auth.uid() = owner_id AND public.has_role(auth.uid(), 'company'));
CREATE POLICY "Owners delete own jobs" ON public.jobs
  FOR DELETE TO authenticated
  USING (auth.uid() = owner_id AND public.has_role(auth.uid(), 'company'));

DROP POLICY IF EXISTS "Owners insert challenges" ON public.challenges;
DROP POLICY IF EXISTS "Owners update challenges" ON public.challenges;
DROP POLICY IF EXISTS "Owners delete challenges" ON public.challenges;
CREATE POLICY "Owners insert challenges" ON public.challenges
  FOR INSERT TO authenticated
  WITH CHECK (
    owner_id = auth.uid() AND
    (public.has_role(auth.uid(), 'company') OR public.has_role(auth.uid(), 'university'))
  );
CREATE POLICY "Owners update challenges" ON public.challenges
  FOR UPDATE TO authenticated
  USING (
    owner_id = auth.uid() AND
    (public.has_role(auth.uid(), 'company') OR public.has_role(auth.uid(), 'university'))
  )
  WITH CHECK (
    owner_id = auth.uid() AND
    (public.has_role(auth.uid(), 'company') OR public.has_role(auth.uid(), 'university'))
  );
CREATE POLICY "Owners delete challenges" ON public.challenges
  FOR DELETE TO authenticated
  USING (
    owner_id = auth.uid() AND
    (public.has_role(auth.uid(), 'company') OR public.has_role(auth.uid(), 'university'))
  );

DROP POLICY IF EXISTS "Owners manage campaigns ins" ON public.campaigns;
DROP POLICY IF EXISTS "Owners manage campaigns upd" ON public.campaigns;
DROP POLICY IF EXISTS "Owners manage campaigns del" ON public.campaigns;
CREATE POLICY "Owners manage campaigns ins" ON public.campaigns
  FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid() AND public.has_role(auth.uid(), 'company'));
CREATE POLICY "Owners manage campaigns upd" ON public.campaigns
  FOR UPDATE TO authenticated
  USING (owner_id = auth.uid() AND public.has_role(auth.uid(), 'company'))
  WITH CHECK (owner_id = auth.uid() AND public.has_role(auth.uid(), 'company'));
CREATE POLICY "Owners manage campaigns del" ON public.campaigns
  FOR DELETE TO authenticated
  USING (owner_id = auth.uid() AND public.has_role(auth.uid(), 'company'));

-- 5+6. SECURITY DEFINER function executable by anon/authenticated:
-- Revoke EXECUTE on functions that should only run from triggers or internal RLS lookups.
-- Trigger functions never need EXECUTE from client roles.
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.grant_founder_admin_on_confirm() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.trg_notify_new_message() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.trg_notify_application_status() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.trg_issue_certificate() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.trg_bump_thread() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.trg_notify_certificate() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.trg_profile_completion() FROM anon, authenticated, public;

-- has_role is used inside RLS policies; those run as the policy owner, so EXECUTE
-- from clients is not needed. Revoke to shut the linter warning.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon, authenticated, public;

-- verify_certificate stays callable by anon (public certificate verification page).
