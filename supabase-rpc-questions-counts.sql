-- Fonction pour retourner les stats de questions
create or replace function public.questions_counts()
returns jsonb
language sql
security definer
set search_path = public
as $$
  with counts as (
    select
      count(*) filter (where statut = 'repondu') as repondu,
      count(*) filter (where statut is distinct from 'repondu') as en_attente,
      count(*) as total
    from public.questions
  )
  select jsonb_build_object(
    'repondu', coalesce(repondu,0),
    'en_attente', coalesce(en_attente,0),
    'total', coalesce(total,0)
  )
  from counts;
$$;

-- Donner accès aux admins via RLS
grant execute on function public.questions_counts() to authenticated;

