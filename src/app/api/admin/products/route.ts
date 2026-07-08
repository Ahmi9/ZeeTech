import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get('id')

  if (id) {
    const { data: product, error } = await supabaseAdmin.from('products').select('*').eq('id', id).single()
    if (error || !product) return NextResponse.json({ error: 'Product not found' }, { status: 404 })

    const { data: attributes } = await supabaseAdmin
      .from('product_attributes')
      .select('*, product_attribute_values(*)')
      .eq('product_id', id)
      .order('display_order')

    const { data: variants } = await supabaseAdmin
      .from('product_variants')
      .select('*')
      .eq('product_id', id)
      .eq('is_active', true)

    return NextResponse.json({ product, attributes: attributes || [], variants: variants || [] })
  }

  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*, categories(name)')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data: allVariants } = await supabaseAdmin
    .from('product_variants')
    .select('product_id, stock')
    .eq('is_active', true)

  const variantStockByProduct = new Map<string, number>()
  for (const v of allVariants || []) {
    variantStockByProduct.set(v.product_id, (variantStockByProduct.get(v.product_id) || 0) + (Number(v.stock) || 0))
  }

  const products = (data || []).map(product =>
    variantStockByProduct.has(product.id)
      ? { ...product, stock: variantStockByProduct.get(product.id) }
      : product
  )

  return NextResponse.json({ products })
}

async function saveAttributesAndVariants(productId: string, attributes: any[], variants: any[]) {
  for (const attr of attributes || []) {
    if (!attr.name || !attr.values?.length) continue
    const { data: attrData } = await supabaseAdmin
      .from('product_attributes')
      .insert({ product_id: productId, attribute_name: attr.name, display_order: 0 })
      .select()
      .single()
    if (!attrData) continue
    for (let i = 0; i < attr.values.length; i++) {
      await supabaseAdmin.from('product_attribute_values').insert({
        attribute_id: attrData.id,
        value: attr.values[i],
        display_order: i,
      })
    }
  }

  for (const variant of variants || []) {
    await supabaseAdmin.from('product_variants').insert({
      product_id: productId,
      variant_combination: variant.combination,
      price: Number(variant.price) || 0,
      stock: Number(variant.stock) || 0,
      sku: variant.sku || null,
      is_active: true,
    })
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid body' }, { status: 400 })

  const { attributes, variants, ...productFields } = body

  const { data: product, error } = await supabaseAdmin.from('products').insert(productFields).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await saveAttributesAndVariants(product.id, attributes, variants)

  return NextResponse.json({ product })
}

export async function PATCH(request: NextRequest) {
  const body = await request.json().catch(() => null)
  if (!body?.id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const { id, attributes, variants, ...productFields } = body

  const { data: product, error } = await supabaseAdmin.from('products').update(productFields).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await supabaseAdmin.from('product_variants').delete().eq('product_id', id)
  const { data: attrIds } = await supabaseAdmin.from('product_attributes').select('id').eq('product_id', id)
  if (attrIds && attrIds.length > 0) {
    await supabaseAdmin.from('product_attribute_values').delete().in('attribute_id', attrIds.map(a => a.id))
  }
  await supabaseAdmin.from('product_attributes').delete().eq('product_id', id)

  await saveAttributesAndVariants(id, attributes, variants)

  return NextResponse.json({ product })
}

export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const { count: orderItemCount } = await supabaseAdmin
    .from('order_items')
    .select('*', { count: 'exact', head: true })
    .eq('product_id', id)

  if (orderItemCount && orderItemCount > 0) {
    return NextResponse.json({ error: 'This product has order history and cannot be deleted. Deactivate it instead.' }, { status: 409 })
  }

  const { data: attrIds } = await supabaseAdmin.from('product_attributes').select('id').eq('product_id', id)
  if (attrIds && attrIds.length > 0) {
    await supabaseAdmin.from('product_attribute_values').delete().in('attribute_id', attrIds.map(a => a.id))
  }
  await supabaseAdmin.from('product_attributes').delete().eq('product_id', id)
  await supabaseAdmin.from('product_variants').delete().eq('product_id', id)
  await supabaseAdmin.from('product_reviews').delete().eq('product_id', id)

  const { error } = await supabaseAdmin.from('products').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
