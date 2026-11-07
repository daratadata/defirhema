-- Défi Rhema : à coller dans Supabase > SQL Editor > Run
create table profiles(
  id uuid primary key references auth.users on delete cascade,
  full_name text not null,
  gender text check (gender in ('homme','femme')),
  country text, city text, contact text unique,
  role text not null default 'participant' check (role in ('participant','admin')),
  created_at timestamptz default now());
create table app_settings(id int primary key default 1 check (id=1), start_date date);
insert into app_settings values (1,null);
create table user_readings(
  user_id uuid references profiles on delete cascade,
  day int check (day between 1 and 30),
  reading text, intention text, assigned_by uuid references profiles,
  primary key (user_id,day));
create table attendance(
  user_id uuid references profiles on delete cascade,
  day int check (day between 1 and 30),
  self_done boolean not null default false,
  validated boolean not null default false,
  validated_by uuid references profiles,
  updated_at timestamptz default now(),
  primary key (user_id,day));

create function is_admin() returns boolean language sql security definer stable set search_path=public
as $$ select exists(select 1 from profiles where id=auth.uid() and role='admin') $$;

create function handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$
begin
  insert into profiles(id,full_name,gender,country,city,contact)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name','Sans nom'),
          new.raw_user_meta_data->>'gender', new.raw_user_meta_data->>'country', new.raw_user_meta_data->>'city', new.raw_user_meta_data->>'contact');
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function handle_new_user();

alter table profiles enable row level security;
alter table app_settings enable row level security;
alter table user_readings enable row level security;
alter table attendance enable row level security;

create policy p_sel on profiles for select using (id=auth.uid() or is_admin());
create policy p_adm on profiles for all using (is_admin()) with check (is_admin());
create policy s_sel on app_settings for select to authenticated using (true);
create policy s_adm on app_settings for all using (is_admin()) with check (is_admin());
create policy r_sel on user_readings for select using (user_id=auth.uid() or is_admin());
create policy r_own on user_readings for insert with check (user_id=auth.uid());
create policy r_upd on user_readings for update using (user_id=auth.uid()) with check (user_id=auth.uid());
create policy r_adm on user_readings for all using (is_admin()) with check (is_admin());
create policy a_sel on attendance for select using (user_id=auth.uid() or is_admin());
create policy a_ins on attendance for insert with check (user_id=auth.uid() and validated=false);
create policy a_upd on attendance for update using (user_id=auth.uid() and validated=false) with check (user_id=auth.uid() and validated=false);
create policy a_adm on attendance for all using (is_admin()) with check (is_admin());

-- Après VOTRE inscription dans l'application, devenez administrateur (votre contact, chiffres seulement, ex. 22507000000) :
-- update profiles set role='admin' where contact='VOTRE_CONTACT_EN_CHIFFRES';
