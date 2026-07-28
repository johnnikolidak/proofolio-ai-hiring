
-- Realign completion_pct with the 5-step candidate onboarding wizard, so finishing
-- the wizard (Personal info, Education, Skills, CV, Career preferences) means 100%.
-- Fields left out of the wizard (avatar, headline, location, experience, languages,
-- portfolio, links) stay editable on the full profile page but no longer gate onboarding.
CREATE OR REPLACE FUNCTION public.trg_profile_completion()
RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public' AS $$
BEGIN
  NEW.completion_pct := LEAST(100, (
    -- Step 1: Personal information
    (CASE WHEN NEW.full_name IS NOT NULL AND length(NEW.full_name) > 0 THEN 10 ELSE 0 END) +
    (CASE WHEN NEW.bio IS NOT NULL AND length(NEW.bio) > 20 THEN 10 ELSE 0 END) +
    -- Step 2: Education
    (CASE WHEN jsonb_array_length(NEW.education) >= 1 THEN 20 ELSE 0 END) +
    -- Step 3: Skills & interests
    (CASE WHEN array_length(NEW.skills, 1) >= 3 THEN 20 ELSE 0 END) +
    -- Step 4: Upload CV
    (CASE WHEN NEW.cv_url IS NOT NULL THEN 20 ELSE 0 END) +
    -- Step 5: Career preferences
    (CASE WHEN array_length(NEW.preferred_roles, 1) >= 1 THEN 10 ELSE 0 END) +
    (CASE WHEN NEW.availability IS NOT NULL AND length(NEW.availability) > 0 THEN 10 ELSE 0 END)
  ))::int;
  RETURN NEW;
END;
$$;

-- Recompute completion_pct for existing rows under the new weights.
UPDATE public.profiles SET updated_at = now();
