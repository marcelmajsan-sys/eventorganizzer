-- Komentari admina po sponzoru
create table if not exists sponsor_comments (
  id uuid default gen_random_uuid() primary key,
  sponsor_id uuid not null,
  comment text not null,
  admin_email text not null,
  created_at timestamptz default now() not null
);

create index if not exists sponsor_comments_sponsor_id_idx on sponsor_comments(sponsor_id);
