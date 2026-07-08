-- Adds a variant-aware stock decrement function, mirroring the existing
-- decrease_stock(product_id, quantity) function but targeting a single
-- product_variants row instead of the parent products row.
-- Run this once in the Supabase SQL Editor.
--
-- Needed because orders/create previously always decremented products.stock,
-- even when the ordered item was a specific variant (e.g. color: black) that
-- has its own stock column in product_variants — the variant's own stock was
-- never being reduced.

create or replace function decrease_variant_stock(variant_id uuid, quantity int)
returns void as $$
begin
  update product_variants
  set stock = greatest(stock - quantity, 0)
  where id = variant_id;
end;
$$ language plpgsql;
