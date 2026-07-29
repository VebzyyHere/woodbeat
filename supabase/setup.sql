-- ============================================================
-- WoodBeat — Datenbank für Live-Umfragen und Zusagen
--
-- EINMAL komplett in den Supabase SQL Editor einfügen und "Run"
-- drücken. Erwartete Ausgabe: "Success. No rows returned".
-- Kommt eine rote Meldung: abbrechen und die Meldung weitergeben,
-- nicht raten.
--
-- Das Skript ist idempotent — mehrfaches Ausführen ist ungefährlich.
--
-- SICHERHEITSMODELL
-- Der publishable Key steht öffentlich im Repo. Das ist so
-- vorgesehen, aber nur sicher, wenn die Tabellen von außen dicht
-- sind. Deshalb hier der strenge Weg:
--
--   1. Row Level Security an, aber KEINE einzige Policy
--      -> über die REST-API ist an den Tabellen gar nichts zu holen
--   2. alle Rechte für anon/authenticated entzogen
--   3. Zugriff ausschließlich über die fünf Funktionen unten,
--      die als SECURITY DEFINER mit leerem search_path laufen
--
-- Damit kann niemand mit dem Key fremde Stimmen oder Namen lesen,
-- ändern oder löschen. Die Funktionen geben nur Aggregate heraus —
-- es gibt bewusst KEINE Funktion, die Namen ausliest. Die Gästeliste
-- siehst du nur hier im Dashboard unter Table Editor -> rsvps.
-- ============================================================


-- ------------------------------------------------------------
-- 1  TABELLEN
-- ------------------------------------------------------------

-- Eine Zeile je Gerät, Umfrage und angekreuzter Option.
create table if not exists public.votes (
  id         bigint generated always as identity primary key,
  poll_id    text not null,
  option_key text not null,
  voter_id   uuid not null,
  created_at timestamptz not null default now()
);

create unique index if not exists votes_unique
  on public.votes (poll_id, option_key, voter_id);
create index if not exists votes_poll
  on public.votes (poll_id);

-- Eine Zeile je Gerät.
create table if not exists public.rsvps (
  voter_id   uuid primary key,
  name       text not null check (char_length(btrim(name)) between 2 and 40),
  ticket     text not null check (ticket in ('weekend', 'day')),
  note       text check (char_length(note) <= 140),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


-- ------------------------------------------------------------
-- 2  ABRIEGELN
--    RLS ohne Policy = von außen komplett dicht.
-- ------------------------------------------------------------

alter table public.votes enable row level security;
alter table public.rsvps enable row level security;

revoke all on public.votes from anon, authenticated;
revoke all on public.rsvps from anon, authenticated;


-- ------------------------------------------------------------
-- 3  UMFRAGEN
-- ------------------------------------------------------------

-- Stimme abgeben. Ersetzt die bisherige Auswahl dieses Geräts für
-- diese Umfrage in einem Rutsch — es entsteht nie eine Zusatzstimme,
-- auch wenn jemand seine Meinung zehnmal ändert.
create or replace function public.cast_vote(
  p_poll    text,
  p_voter   uuid,
  p_options text[]
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_options is not null and array_length(p_options, 1) > 12 then
    raise exception 'zu viele Optionen';
  end if;

  delete from public.votes
   where poll_id = p_poll and voter_id = p_voter;

  if p_options is not null and array_length(p_options, 1) > 0 then
    insert into public.votes (poll_id, option_key, voter_id)
    select p_poll, unnest(p_options), p_voter;
  end if;
end;
$$;

-- Ergebnisse. Gibt ausschließlich Aggregate heraus, nie Einzelstimmen.
-- `waehler` = wie viele Geräte in dieser Umfrage überhaupt abgestimmt
-- haben. Das ist die Prozentbasis (auch bei Mehrfachauswahl).
create or replace function public.poll_results()
returns table (
  poll_id    text,
  option_key text,
  anzahl     bigint,
  waehler    bigint
)
language sql
security definer
stable
set search_path = ''
as $$
  select
    v.poll_id,
    v.option_key,
    count(*)::bigint as anzahl,
    (select count(distinct v2.voter_id)
       from public.votes v2
      where v2.poll_id = v.poll_id)::bigint as waehler
  from public.votes v
  group by v.poll_id, v.option_key;
$$;


-- ------------------------------------------------------------
-- 4  ZUSAGEN
-- ------------------------------------------------------------

create or replace function public.upsert_rsvp(
  p_voter  uuid,
  p_name   text,
  p_ticket text,
  p_note   text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.rsvps (voter_id, name, ticket, note)
  values (
    p_voter,
    btrim(p_name),
    p_ticket,
    nullif(btrim(coalesce(p_note, '')), '')
  )
  on conflict (voter_id) do update
    set name       = excluded.name,
        ticket     = excluded.ticket,
        note       = excluded.note,
        updated_at = now();
end;
$$;

-- Nur die Zahl, aufgeschlüsselt nach Ticketart. Keine Namen.
create or replace function public.rsvp_count()
returns table (
  ticket text,
  anzahl bigint
)
language sql
security definer
stable
set search_path = ''
as $$
  select r.ticket as ticket, count(*)::bigint as anzahl
    from public.rsvps r
   group by r.ticket;
$$;

-- Jede:r kann den eigenen Eintrag zurückziehen — aber nur den eigenen,
-- denn dafür braucht es die voter_id aus dem eigenen Browserspeicher.
create or replace function public.delete_rsvp(p_voter uuid)
returns void
language sql
security definer
set search_path = ''
as $$
  delete from public.rsvps where voter_id = p_voter;
$$;


-- ------------------------------------------------------------
-- 5  RECHTE
--    Nur diese fünf Funktionen sind von außen aufrufbar.
-- ------------------------------------------------------------

grant execute on function public.cast_vote(text, uuid, text[])       to anon;
grant execute on function public.poll_results()                      to anon;
grant execute on function public.upsert_rsvp(uuid, text, text, text) to anon;
grant execute on function public.rsvp_count()                        to anon;
grant execute on function public.delete_rsvp(uuid)                   to anon;


-- ------------------------------------------------------------
-- 6  GEGENPROBE (optional, aber empfohlen)
--
--    Diese Zeile muss eine leere Tabelle zurückgeben. Kommt eine
--    Fehlermeldung "permission denied", ist alles richtig verriegelt.
--    Danach unter Advisors -> Security Advisor prüfen: es darf KEINE
--    Warnung "RLS disabled in public" stehen.
-- ------------------------------------------------------------

-- select * from public.poll_results();


-- ------------------------------------------------------------
-- 7  VOR DEM VERSCHICKEN AN DIE GRUPPE
--    Testdaten wegräumen. Nur bewusst ausführen!
-- ------------------------------------------------------------

-- delete from public.votes;
-- delete from public.rsvps;
