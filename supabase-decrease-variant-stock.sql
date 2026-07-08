-- (Re)creates both stock-decrement functions used by /api/orders/create.
-- Run this once in the Supabase SQL Editor.
--
-- Background: stock was not decrementing after orders. The order-create
-- route calls these two RPCs by name (decrease_stock, decrease_variant_stock)
-- but never checked their error responses, so if a function was missing or
-- had mismatched parameter names, the call would silently fail with zero
-- visible symptoms (order still succeeds, stock just never changes). This
-- script defines both functions with the exact parameter names the code
-- calls them with, so there is no ambiguity about whether they exist.

-- Decrements the parent product's own stock (used for products with no variants).
create or replace function decrease_stock(product_id uuid, quantity int)
returns void as $$
begin
  update products
  set stock = greatest(stock - quantity, 0)
  where id = product_id;
end;
$$ language plpgsql;

-- Decrements a specific variant's stock (used when the ordered item has a
-- selected variant, e.g. color: black) — leaves the parent product's stock
-- column untouched, since variant stock is tracked independently.
create or replace function decrease_variant_stock(variant_id uuid, quantity int)
returns void as $$
begin
  update product_variants
  set stock = greatest(stock - quantity, 0)
  where id = variant_id;
end;
$$ language plpgsql;
