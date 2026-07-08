-- Adds columns needed for the WhatsApp order-confirmation flow.
-- Run this once in the Supabase SQL Editor.
--
-- Admin sends a customer a WhatsApp message (semi-automatic — admin still
-- taps "Send" inside WhatsApp) containing a link with a one-time token.
-- The customer taps Confirm/Cancel on our own site, which looks up the
-- order by this token and updates its status automatically.

alter table orders add column if not exists confirmation_token text;
alter table orders add column if not exists confirmation_sent_at timestamptz;

create index if not exists orders_confirmation_token_idx on orders (confirmation_token);
