
-- Roles enum
create type public.app_role as enum ('admin', 'candidate', 'company');

-- Generic updated_at helper
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- =========================
-- profiles
-- =========================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  role app_role not null default 'candidate',
  company_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index profiles_email_idx on public.profiles(email);
create index profiles_role_idx on public.profiles(role);
create index profiles_created_at_idx on public.profiles(created_at desc);

grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;

alter table public.profiles enable row level security;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

-- =========================
-- user_roles + has_role
-- =========================
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
create index user_roles_user_id_idx on public.user_roles(user_id);

grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;

alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

-- =========================
-- profiles RLS
-- =========================
create policy "Users read own profile"
on public.profiles for select to authenticated
using (id = auth.uid());

create policy "Users insert own profile"
on public.profiles for insert to authenticated
with check (id = auth.uid());

create policy "Users update own profile"
on public.profiles for update to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create policy "Admins read all profiles"
on public.profiles for select to authenticated
using (public.has_role(auth.uid(), 'admin'));

-- =========================
-- user_roles RLS
-- =========================
create policy "Users read own roles"
on public.user_roles for select to authenticated
using (user_id = auth.uid());

create policy "Admins read all roles"
on public.user_roles for select to authenticated
using (public.has_role(auth.uid(), 'admin'));

-- =========================
-- New-user trigger:
-- create profile, assign chosen role, seed admin for the founder.
-- =========================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  _role app_role;
  _full_name text;
  _company text;
begin
  _role := coalesce(
    nullif(new.raw_user_meta_data->>'role','')::app_role,
    'candidate'
  );
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
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Also grant admin the moment the founder verifies their email later
create or replace function public.grant_founder_admin_on_confirm()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.email_confirmed_at is not null
     and lower(coalesce(new.email,'')) = 'johnnikolidakis@gmail.com' then
    insert into public.user_roles (user_id, role)
    values (new.id, 'admin')
    on conflict (user_id, role) do nothing;
  end if;
  return new;
end;
$$;

create trigger on_auth_user_confirmed_grant_founder
after update of email_confirmed_at on auth.users
for each row
when (old.email_confirmed_at is null and new.email_confirmed_at is not null)
execute function public.grant_founder_admin_on_confirm();

-- =========================
-- waitlist
-- =========================
create table public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  role app_role,
  source text,
  created_at timestamptz not null default now()
);
create index waitlist_created_at_idx on public.waitlist(created_at desc);

grant insert on public.waitlist to anon, authenticated;
grant select on public.waitlist to authenticated;
grant all on public.waitlist to service_role;

alter table public.waitlist enable row level security;

create policy "Anyone can join waitlist"
on public.waitlist for insert to anon, authenticated
with check (true);

create policy "Admins read waitlist"
on public.waitlist for select to authenticated
using (public.has_role(auth.uid(), 'admin'));

-- =========================
-- demo_requests
-- =========================
create table public.demo_requests (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  email text not null,
  company text not null,
  team_size text,
  hires_per_year text,
  message text,
  created_at timestamptz not null default now()
);
create index demo_requests_created_at_idx on public.demo_requests(created_at desc);
create index demo_requests_email_idx on public.demo_requests(email);

grant insert on public.demo_requests to anon, authenticated;
grant select on public.demo_requests to authenticated;
grant all on public.demo_requests to service_role;

alter table public.demo_requests enable row level security;

create policy "Anyone can request demo"
on public.demo_requests for insert to anon, authenticated
with check (true);

create policy "Admins read demo requests"
on public.demo_requests for select to authenticated
using (public.has_role(auth.uid(), 'admin'));
