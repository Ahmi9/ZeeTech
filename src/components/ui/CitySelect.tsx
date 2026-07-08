'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Search, Check } from 'lucide-react'

interface CitySelectProps {
  cities: string[]
  value: string
  onChange: (city: string) => void
  hasError?: boolean
}

export default function CitySelect({ cities, value, onChange, hasError }: CitySelectProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const wrapperRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (open) {
      setTimeout(() => searchRef.current?.focus(), 50)
    }
  }, [open])

  const filteredCities = cities.filter(c => c.toLowerCase().includes(query.trim().toLowerCase()))

  function selectCity(city: string) {
    onChange(city)
    setOpen(false)
    setQuery('')
  }

  return (
    <div ref={wrapperRef} className="city-select" style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        className="city-select-trigger"
        style={{
          width: '100%',
          padding: '10px 14px',
          border: `1px solid ${hasError ? 'var(--danger)' : open ? 'var(--brand)' : 'var(--border-strong)'}`,
          borderRadius: '8px',
          fontSize: '14px',
          background: 'var(--bg)',
          color: value ? 'var(--text-primary)' : 'var(--text-muted)',
          outline: 'none',
          boxSizing: 'border-box',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          cursor: 'pointer',
          textAlign: 'left',
          transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
          boxShadow: open ? '0 0 0 3px var(--brand-light)' : 'none',
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {value || 'Select your city'}
        </span>
        <ChevronDown
          size={16}
          style={{
            flexShrink: 0,
            color: 'var(--text-muted)',
            transition: 'transform 0.2s ease',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        />
      </button>

      {open && (
        <div
          className="city-select-panel"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            right: 0,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            boxShadow: '0 12px 32px rgba(0,0,0,0.14)',
            zIndex: 30,
            overflow: 'hidden',
          }}
        >
          <div style={{ padding: '8px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Search size={15} style={{ position: 'absolute', left: '10px', color: 'var(--text-muted)' }} />
              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search city..."
                className="city-select-search"
                style={{
                  width: '100%',
                  padding: '9px 10px 9px 32px',
                  border: '1px solid var(--border)',
                  borderRadius: '7px',
                  fontSize: '13px',
                  background: 'var(--bg)',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--brand)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
              />
            </div>
          </div>

          <div className="city-select-list" style={{ overflowY: 'auto' }}>
            {filteredCities.length === 0 ? (
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', padding: '16px', textAlign: 'center', margin: 0 }}>
                No matching city
              </p>
            ) : (
              filteredCities.map(city => {
                const isSelected = city === value
                return (
                  <button
                    key={city}
                    type="button"
                    onClick={() => selectCity(city)}
                    className="city-select-option"
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '8px',
                      padding: '10px 14px',
                      border: 'none',
                      background: isSelected ? 'var(--brand-light)' : 'transparent',
                      color: isSelected ? 'var(--brand)' : 'var(--text-primary)',
                      fontWeight: isSelected ? 600 : 400,
                      fontSize: '13.5px',
                      textAlign: 'left',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = 'var(--bg-muted)' }}
                    onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = 'transparent' }}
                  >
                    <span>{city}</span>
                    {isSelected && <Check size={14} />}
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}

      <style>{`
        .city-select-list {
          max-height: 260px;
        }
        @media (max-width: 768px) {
          .city-select-list {
            max-height: 45vh;
          }
          .city-select-option {
            min-height: 44px;
            font-size: 14px !important;
          }
          .city-select-search {
            font-size: 16px !important;
          }
        }
      `}</style>
    </div>
  )
}
