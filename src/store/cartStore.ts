import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  id: string
  name: string
  slug: string
  price: number
  original_price: number | null
  image: string | null
  quantity: number
  category: string | null
  variantId?: string | null
  variantCombination?: Record<string, string> | null
}

export interface AppliedCoupon {
  code: string
  discount_type: string
  discount_value: number
  discount_amount: number
}

interface CartStore {
  items: CartItem[]
  appliedCoupon: AppliedCoupon | null
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  getTotalItems: () => number
  getTotalPrice: () => number
  applyCoupon: (coupon: AppliedCoupon) => void
  removeCoupon: () => void
  getFinalPrice: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      appliedCoupon: null,

      addItem: (item) => {
        const existing = get().items.find(i => i.id === item.id)
        if (existing) {
          set(state => ({
            items: state.items.map(i =>
              i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
            )
          }))
        } else {
          set(state => ({ items: [...state.items, { ...item }] }))
        }
      },

      removeItem: (id) => {
        set(state => ({ items: state.items.filter(i => i.id !== id) }))
      },

      updateQuantity: (id, quantity) => {
        if (quantity < 1) return
        set(state => ({
          items: state.items.map(i => i.id === id ? { ...i, quantity } : i)
        }))
      },

      clearCart: () => set({ items: [], appliedCoupon: null }),

      getTotalItems: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0)
      },

      getTotalPrice: () => {
        return get().items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      },

      applyCoupon: (coupon) => set({ appliedCoupon: coupon }),

      removeCoupon: () => set({ appliedCoupon: null }),

      getFinalPrice: () => {
        const subtotal = get().getTotalPrice()
        const coupon = get().appliedCoupon
        if (!coupon) return subtotal
        return Math.max(subtotal - coupon.discount_amount, 0)
      },
    }),
    {
      name: 'tijarat-cart',
    }
  )
)