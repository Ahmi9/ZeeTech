-- Enable Row Level Security across all tables and lock down direct anon-key access.
-- Run this in Supabase SQL Editor ONLY AFTER the new /api/admin/* and /api/orders/*
-- server routes are deployed and live (they use the service_role key, which always
-- bypasses RLS, so admin/order functionality keeps working once this script runs).
--
-- orders and order_items get ZERO policies -> completely inaccessible via the anon key.
-- Everything else gets public SELECT (read-only) so the storefront keeps working.

alter table categories enable row level security;
alter table products enable row level security;
alter table product_attributes enable row level security;
alter table product_attribute_values enable row level security;
alter table product_variants enable row level security;
alter table product_reviews enable row level security;
alter table coupons enable row level security;
alter table payment_methods enable row level security;
alter table site_settings enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

-- categories: public can read active categories
create policy "public read categories" on categories
  for select to anon, authenticated
  using (is_active = true);

-- products: public can read active products
create policy "public read products" on products
  for select to anon, authenticated
  using (is_active = true);

-- product_attributes / values / variants: public can read (no is_active gate on attributes table)
create policy "public read product_attributes" on product_attributes
  for select to anon, authenticated
  using (true);

create policy "public read product_attribute_values" on product_attribute_values
  for select to anon, authenticated
  using (true);

create policy "public read product_variants" on product_variants
  for select to anon, authenticated
  using (is_active = true);

-- product_reviews: public can read approved reviews, and submit new ones
create policy "public read approved reviews" on product_reviews
  for select to anon, authenticated
  using (is_approved = true);

create policy "public insert reviews" on product_reviews
  for insert to anon, authenticated
  with check (true);

-- coupons: public can read active coupons (needed for client-side coupon validation)
create policy "public read active coupons" on coupons
  for select to anon, authenticated
  using (is_active = true);

-- payment_methods: public can read active bank accounts (shown at checkout)
create policy "public read active payment_methods" on payment_methods
  for select to anon, authenticated
  using (is_active = true);

-- site_settings: public can read (store info, hero content, announcement bar)
create policy "public read site_settings" on site_settings
  for select to anon, authenticated
  using (true);

-- orders and order_items: NO policies added.
-- With RLS enabled and zero policies, anon/authenticated roles get zero access.
-- All reads/writes to these tables must go through /api/orders/* and /api/admin/orders,
-- which use the service_role key via supabaseAdmin (service_role always bypasses RLS).
