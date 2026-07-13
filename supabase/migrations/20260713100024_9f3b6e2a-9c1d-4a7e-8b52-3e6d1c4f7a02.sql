
-- university_students: minimal roster join between a university profile and its
-- candidate students, powering the University > Students workspace page.
CREATE TABLE IF NOT EXISTS public.university_students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  candidate_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (university_id, candidate_id)
);
CREATE INDEX IF NOT EXISTS university_students_university_idx ON public.university_students(university_id);
CREATE INDEX IF NOT EXISTS university_students_candidate_idx ON public.university_students(candidate_id);

GRANT SELECT, INSERT, DELETE ON public.university_students TO authenticated;
GRANT ALL ON public.university_students TO service_role;
ALTER TABLE public.university_students ENABLE ROW LEVEL SECURITY;

-- The associated university (or an admin) can read its own roster.
CREATE POLICY "Universities read own students" ON public.university_students
  FOR SELECT TO authenticated
  USING (university_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- Only a genuine university-role account may attach a student, and only to itself.
-- A candidate account (or any other role) can never self-enroll under an arbitrary
-- university_id, since university_id must equal the caller's own id AND the caller
-- must actually hold the 'university' role.
CREATE POLICY "Universities attach own students" ON public.university_students
  FOR INSERT TO authenticated
  WITH CHECK (
    university_id = auth.uid()
    AND public.has_role(auth.uid(), 'university')
  );

CREATE POLICY "Universities remove own students" ON public.university_students
  FOR DELETE TO authenticated
  USING (university_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
