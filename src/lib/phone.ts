// Pakistani mobile numbers only. Accepts any of the common formats customers
// type them in — 03083403662, 3083403662, +923083403662, +9203083403662 —
// and normalizes them all to a single canonical local form: 03083403662.
export function normalizePhonePK(input: string | null | undefined): string {
  let digits = (input || '').replace(/\D/g, '')
  if (!digits) return ''

  if (digits.startsWith('92')) {
    const rest = digits.slice(2)
    digits = rest.startsWith('0') ? rest : '0' + rest
  } else if (digits.length === 10 && !digits.startsWith('0')) {
    digits = '0' + digits
  }

  if (digits.startsWith('0') && digits.length > 11) {
    digits = digits.slice(0, 11)
  }

  return digits
}

// "+92 308 3403662" — for showing the store's contact number to customers.
export function formatPhonePKDisplay(input: string | null | undefined): string {
  const local = normalizePhonePK(input)
  if (local.length !== 11) return input || ''
  const rest = local.slice(1)
  return `+92 ${rest.slice(0, 3)} ${rest.slice(3)}`
}

// "923083403662" — for wa.me links, which require digits only, no "+".
export function formatPhoneWhatsApp(input: string | null | undefined): string {
  const local = normalizePhonePK(input)
  if (local.length !== 11) return (input || '').replace(/\D/g, '')
  return '92' + local.slice(1)
}

// "12345" / "ord-12345" / "ORD-00012" -> "ORD-00012"
export function normalizeOrderNumber(input: string | null | undefined): string {
  const raw = (input || '').trim().toUpperCase()
  const match = raw.match(/(\d+)/)
  if (!match) return raw
  return `ORD-${match[1].padStart(5, '0')}`
}
