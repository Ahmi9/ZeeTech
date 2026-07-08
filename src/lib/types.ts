export interface Category {
  id: string
  name: string
  slug: string
  parent_id: string | null
  display_order: number
  is_active: boolean
  created_at: string
  image_url: string | null
}

export interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  original_price: number | null
  images: string[]
  category: string | null
  category_id: string | null
  stock: number
  is_active: boolean
  is_featured: boolean
  specs: Record<string, any> | null
  created_at: string
}

export interface ProductVariant {
  id: string
  product_id: string
  variant_combination: Record<string, string>
  price: number
  stock: number
  sku: string | null
  is_active: boolean
}

export interface ProductAttribute {
  id: string
  product_id: string
  attribute_name: string
  display_order: number
  values: ProductAttributeValue[]
}

export interface ProductAttributeValue {
  id: string
  attribute_id: string
  value: string
  display_order: number
}

export interface ProductReview {
  id: string
  product_id: string
  customer_name: string
  customer_city: string | null
  review_text: string
  rating: number
  is_approved: boolean
  images: string[]
  created_at: string
}

export interface Order {
  id: string
  order_number: string
  customer_name: string
  customer_phone: string
  customer_email: string | null
  customer_address: string
  customer_city: string
  payment_type: string
  payment_status: string
  status: string
  subtotal: number
  discount: number
  total: number
  notes: string | null
  coupon_code: string | null
  coupon_discount: number
  postex_tracking_number: string | null
  postex_order_id: string | null
  postex_status: string | null
  confirmation_token: string | null
  confirmation_sent_at: string | null
  created_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string | null
  product_name: string
  product_image: string | null
  price: number
  quantity: number
  total: number
  selected_variant: Record<string, string> | null
}

export interface Coupon {
  id: string
  code: string
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  min_order_amount: number
  max_uses: number | null
  used_count: number
  expiry_date: string | null
  is_active: boolean
  created_at: string
}

export interface PaymentMethod {
  id: string
  method_name: string
  account_title: string | null
  account_number: string | null
  iban: string | null
  display_order: number
  is_active: boolean
  created_at: string
}

export interface SiteSettings {
  id: number
  store_name: string
  logo_url: string | null
  hero_image_url: string | null
  hero_title: string | null
  hero_subtitle: string | null
  announcement_bar_text: string | null
  announcement_bar_lines: string[] | null
  announcement_bar_active: boolean
  whatsapp_number: string | null
  instagram_handle: string | null
  free_shipping_threshold: number
  shipping_fee: number
  cod_fee: number
  store_email: string | null
  store_phone: string | null
  store_address: string | null
  store_city: string | null
  meta_pixel_id: string | null
  ga4_id: string | null
}