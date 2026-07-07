import { supabase } from './supabase'
import { Category, Product, SiteSettings } from './types'

// Fetch all active categories
export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  if (error) { console.error('getCategories error:', error); return [] }
  return data || []
}

// Fetch site settings
export async function getSiteSettings(): Promise<SiteSettings | null> {
  const { data, error } = await supabase
    .from('site_settings')
    .select('*')
    .eq('id', 1)
    .single()

  if (error) { console.error('getSiteSettings error:', error); return null }
  return data
}

// Fetch featured products
export async function getFeaturedProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_featured', true)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(4)

  if (error) { console.error('getFeaturedProducts error:', error); return [] }
  return data || []
}

// Fetch products by category slug
export async function getProductsByCategory(slug: string): Promise<Product[]> {
  const { data: category, error: catError } = await supabase
    .from('categories')
    .select('id, name')
    .eq('slug', slug)
    .single()

  if (catError || !category) return []

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('category_id', category.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error) { console.error('getProductsByCategory error:', error); return [] }
  return data || []
}

// Fetch single product by slug
export async function getProductBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (error) { console.error('getProductBySlug error:', error); return null }
  return data
}