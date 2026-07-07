const BASE_URL = 'https://api.postex.pk/services/integration/api/order'

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    token: process.env.POSTEX_API_KEY!,
  }
}

export interface CreatePostexOrderParams {
  orderRefNumber: string
  invoicePayment: number
  customerName: string
  customerPhone: string
  deliveryAddress: string
  cityName: string
  items: number
  orderDetail?: string
}

export interface CreatePostexOrderResult {
  trackingNumber: string
  orderStatus: string
  orderDate: string
}

// Books a COD order with PostEx and returns their tracking number.
// Never call this from client code — POSTEX_API_KEY must stay server-side.
export async function createPostexOrder(params: CreatePostexOrderParams): Promise<CreatePostexOrderResult> {
  const res = await fetch(`${BASE_URL}/v3/create-order`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({
      cityName: params.cityName,
      customerName: params.customerName,
      customerPhone: params.customerPhone,
      deliveryAddress: params.deliveryAddress,
      invoiceDivision: 1,
      invoicePayment: params.invoicePayment,
      items: params.items,
      orderDetail: params.orderDetail || '',
      orderRefNumber: params.orderRefNumber,
      orderType: 'Normal',
      transactionNotes: '',
      pickupAddressCode: process.env.POSTEX_PICKUP_ADDRESS_CODE,
    }),
  })

  const json = await res.json()
  if (!res.ok || json.statusCode !== '200') {
    throw new Error(`PostEx create-order failed: ${json.statusMessage || res.statusText}`)
  }
  return json.dist
}

export async function getPostexOperationalCities(): Promise<{ operationalCityName: string; isDeliveryCity: boolean }[]> {
  const res = await fetch(`${BASE_URL}/v2/get-operational-city`, {
    headers: authHeaders(),
  })
  const json = await res.json()
  if (!res.ok || json.statusCode !== '200') {
    throw new Error(`PostEx get-operational-city failed: ${json.statusMessage || res.statusText}`)
  }
  return json.dist
}

export async function trackPostexOrder(trackingNumber: string) {
  const res = await fetch(`${BASE_URL}/v1/track-order/${trackingNumber}`, {
    headers: authHeaders(),
  })
  const json = await res.json()
  if (!res.ok || json.statusCode !== '200') {
    throw new Error(`PostEx track-order failed: ${json.statusMessage || res.statusText}`)
  }
  return json.dist
}

export async function cancelPostexOrder(trackingNumber: string) {
  const res = await fetch(`${BASE_URL}/v1/cancel-order`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ trackingNumber }),
  })
  if (!res.ok) {
    const json = await res.json().catch(() => ({}))
    throw new Error(`PostEx cancel-order failed: ${json.statusMessage || res.statusText}`)
  }
}
