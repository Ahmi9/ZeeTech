-- Web push subscriptions for admin order notifications.
-- One row per browser/device that enabled notifications in the admin panel.
create table if not exists push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  user_agent text,
  created_at timestamptz not null default now()
);

-- Only the service-role key (API route handlers) touches this table.
alter table push_subscriptions enable row level security;
