pragma foreign_keys = on;
pragma journal_mode = wal;

create table if not exists schema_migrations (
  version text primary key,
  applied_at text not null default (datetime('now'))
);

create table if not exists quran_sources (
  id text primary key,
  name text not null,
  url text not null,
  version text not null,
  license text not null,
  checksum_sha256 text,
  imported_at text not null default (datetime('now'))
);

create table if not exists quran_ayahs_canonical (
  id text primary key,
  surah_number integer not null check (surah_number between 1 and 114),
  ayah_number integer not null check (ayah_number > 0),
  text_uthmani text not null,
  source_id text not null references quran_sources(id),
  source_version text not null,
  source_checksum_sha256 text not null,
  unique (surah_number, ayah_number)
);

create trigger if not exists prevent_canonical_quran_update
before update on quran_ayahs_canonical
begin
  select raise(abort, 'Canonical Quran text is immutable');
end;

create trigger if not exists prevent_canonical_quran_delete
before delete on quran_ayahs_canonical
begin
  select raise(abort, 'Canonical Quran text is immutable');
end;

create table if not exists device_progress (
  device_id text primary key,
  payload text not null check (json_valid(payload)),
  client_updated_at text not null,
  server_updated_at text not null default (datetime('now'))
);

create table if not exists review_cards (
  device_id text not null,
  vocabulary_id text not null,
  skill text not null check (skill in (
    'recognize',
    'read',
    'understand',
    'listen',
    'family',
    'write',
    'unvocalized'
  )),
  fsrs_card text not null check (json_valid(fsrs_card)),
  updated_at text not null default (datetime('now')),
  primary key (device_id, vocabulary_id, skill)
);

create table if not exists content_items (
  id text primary key,
  content_type text not null,
  reference text not null,
  payload text not null check (json_valid(payload)),
  source_ids text not null check (json_valid(source_ids)),
  status text not null check (status in (
    'imported',
    'draft',
    'needs_review',
    'linguistically_reviewed',
    'religiously_reviewed',
    'approved',
    'published',
    'rejected'
  )),
  author text,
  created_at text not null default (datetime('now')),
  updated_at text not null default (datetime('now'))
);

create table if not exists content_reviews (
  id text primary key,
  content_item_id text not null references content_items(id) on delete cascade,
  reviewer text not null,
  previous_status text not null,
  next_status text not null,
  comment text not null,
  created_at text not null default (datetime('now'))
);

create index if not exists idx_content_items_status on content_items(status);
create index if not exists idx_content_reviews_item on content_reviews(content_item_id);

insert or ignore into schema_migrations(version) values ('001_initial');
