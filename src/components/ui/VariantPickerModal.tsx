'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'

interface VariantPickerModalProps {
  product: {
    id: string
    name: string
    slug: string
    price: number
    original_price: number | null
    images: string[] | null
    category?: string | null
  }
  onClose: () => void
  onAdd: (item: {
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
  }) => void
}

export default function VariantPickerModal({ product, onClose, onAdd }: VariantPickerModalProps) {
  const [loading, setLoading] = useState(true)
  const [attributes, setAttributes] = useState<any[]>([])
  const [variants, setVariants] = useState<any[]>([])
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})
  const [selectedVariant, setSelectedVariant] = useState<any>(null)

  useEffect(() => {
    async function fetchData() {
      const { data: attrsData } = await supabase
        .from('product_attributes')
        .select('*, product_attribute_values(*)')
        .eq('product_id', product.id)
        .order('display_order')

      const { data: variantsData } = await supabase
        .from('product_variants')
        .select('*')
        .eq('product_id', product.id)
        .eq('is_active', true)

      if (attrsData) setAttributes(attrsData)
      if (variantsData) setVariants(variantsData)
      setLoading(false)
    }
    fetchData()
  }, [product.id])

  useEffect(() => {
    if (Object.keys(selectedOptions).length < attributes.length) {
      setSelectedVariant(null)
      return
    }

    const matched = variants.find(v =>
      Object.entries(selectedOptions).every(([key, val]) => v.variant_combination[key] === val)
    )
    setSelectedVariant(matched || null)
  }, [selectedOptions, variants, attributes])

  function formatPrice(price: number) {
    return `Rs ${Math.round(price).toLocaleString()}`
  }

  const displayPrice = selectedVariant ? selectedVariant.price : product.price
  const canAdd = attributes.length === 0 || !!selectedVariant

  function handleAdd() {
    onAdd({
      id: selectedVariant ? product.id + '-' + selectedVariant.id : product.id,
      name: product.name,
      slug: product.slug,
      price: selectedVariant ? selectedVariant.price : product.price,
      original_price: product.original_price,
      image: product.images?.[0] || null,
      quantity: 1,
      category: product.category || null,
      variantId: selectedVariant?.id || null,
      variantCombination: selectedVariant?.variant_combination || null,
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        zIndex: 600,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--bg)',
          width: '100%',
          maxWidth: '480px',
          borderRadius: '20px 20px 0 0',
          padding: '24px',
          maxHeight: '85vh',
          overflowY: 'auto',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {product.images?.[0] && (
              <Image
                src={product.images[0]}
                alt={product.name}
                width={56}
                height={56}
                style={{ width: '56px', height: '56px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }}
              />
            )}
            <div>
              <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{product.name}</p>
              <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--brand)', margin: '4px 0 0' }}>{formatPrice(displayPrice)}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', flexShrink: 0 }}
          >
            <X size={20} />
          </button>
        </div>

        {loading ? (
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>Loading options...</p>
        ) : (
          <>
            {attributes.map((attr) => (
              <div key={attr.id} style={{ marginBottom: '16px' }}>
                <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  {attr.attribute_name}
                </p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {attr.product_attribute_values
                    ?.sort((a: any, b: any) => a.display_order - b.display_order)
                    .map((val: any) => {
                      const isSelected = selectedOptions[attr.attribute_name] === val.value
                      return (
                        <button
                          key={val.id}
                          onClick={() => setSelectedOptions(prev => ({ ...prev, [attr.attribute_name]: val.value }))}
                          style={{
                            padding: '8px 16px',
                            borderRadius: '6px',
                            fontSize: '13px',
                            cursor: 'pointer',
                            border: isSelected ? '2px solid var(--brand)' : '1px solid var(--border-strong)',
                            background: isSelected ? 'var(--brand-light)' : 'var(--bg)',
                            color: isSelected ? 'var(--brand)' : 'var(--text-primary)',
                            fontWeight: isSelected ? 500 : 400,
                          }}
                        >
                          {val.value}
                        </button>
                      )
                    })}
                </div>
              </div>
            ))}

            <button
              onClick={handleAdd}
              disabled={!canAdd}
              style={{
                width: '100%',
                padding: '14px',
                marginTop: '8px',
                background: canAdd ? 'var(--brand)' : 'var(--border-strong)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 500,
                cursor: canAdd ? 'pointer' : 'not-allowed',
              }}
            >
              {attributes.length > 0 && !selectedVariant ? 'Select options above' : 'Add to Cart'}
            </button>
          </>
        )}
      </motion.div>
    </motion.div>
  )
}
