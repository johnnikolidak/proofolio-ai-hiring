-- Restrict anonymous certificate exposure: replace the broad public-read policy
-- with a security-definer RPC that returns only the certificate matching a code.

DROP POLICY IF EXISTS "Public verify by code" ON public.certificates;

CREATE OR REPLACE FUNCTION public.verify_certificate(_code text)
RETURNS TABLE (
  id uuid,
  title text,
  issuer text,
  score numeric,
  verification_code text,
  issued_at timestamptz,
  candidate_id uuid,
  holder_name text,
  holder_is_public boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT c.id, c.title, c.issuer, c.score, c.verification_code, c.issued_at, c.candidate_id,
         p.full_name AS holder_name,
         COALESCE(p.is_public, false) AS holder_is_public
    FROM public.certificates c
    LEFT JOIN public.profiles p ON p.id = c.candidate_id
   WHERE c.verification_code = _code
   LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.verify_certificate(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.verify_certificate(text) TO anon, authenticated;