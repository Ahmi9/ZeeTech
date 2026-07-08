-- Adds multi-line support to the announcement bar (up to 5 lines, rotated
-- as a carousel on the storefront). Run this once in the Supabase SQL Editor.
--
-- The old single announcement_bar_text column is left untouched/unused —
-- nothing reads it anymore, but it's not dropped in case of already-saved
-- data you want to keep around.

alter table site_settings add column if not exists announcement_bar_lines text[] default '{}';
