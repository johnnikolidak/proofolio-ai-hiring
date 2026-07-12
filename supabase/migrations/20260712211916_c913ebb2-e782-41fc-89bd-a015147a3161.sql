
-- 1) Fix mutable search_path on set_updated_at
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- 2) Lock down SECURITY DEFINER functions.
-- Triggers still run because they execute as table owner, not the caller.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.grant_founder_admin_on_confirm() from public, anon, authenticated;

-- has_role is intentionally callable by signed-in users (used in RLS from client too)
revoke execute on function public.has_role(uuid, public.app_role) from public, anon;
grant execute on function public.has_role(uuid, public.app_role) to authenticated;

-- 3) Tighten waitlist / demo_requests inserts with real validation instead of `true`.
drop policy "Anyone can join waitlist" on public.waitlist;
create policy "Anyone can join waitlist"
on public.waitlist for insert to anon, authenticated
with check (
  email is not null
  and length(email) between 3 and 255
  and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
);

drop policy "Anyone can request demo" on public.demo_requests;
create policy "Anyone can request demo"
on public.demo_requests for insert to anon, authenticated
with check (
  email is not null
  and length(email) between 3 and 255
  and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  and length(first_name) between 1 and 100
  and length(last_name) between 1 and 100
  and length(company) between 1 and 200
);
