-- À exécuter SEULEMENT si vous aviez déjà lancé l'ancien schema.sql
alter table profiles add column contact text unique;
create or replace function handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$
begin
  insert into profiles(id,full_name,gender,country,city,contact)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name','Sans nom'),
          new.raw_user_meta_data->>'gender', new.raw_user_meta_data->>'country', new.raw_user_meta_data->>'city', new.raw_user_meta_data->>'contact');
  return new;
end $$;
