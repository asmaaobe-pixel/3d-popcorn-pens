const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
}

export function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  })
}

function clip(value, max) {
  return String(value ?? '').trim().slice(0, max)
}

function phoneDigits(value) {
  return String(value ?? '')
    .replace(/[٠-٩]/g, (digit) => String(digit.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, (digit) => String(digit.charCodeAt(0) - 0x06f0))
    .replace(/[０-９]/g, (digit) => String(digit.charCodeAt(0) - 0xff10))
    .replace(/\D/g, '')
}

function cleanOrder(body) {
  if (!body || typeof body !== 'object') return null
  const items = Array.isArray(body.items)
    ? body.items.slice(0, 8).map((item) => ({
        name: clip(item?.name, 120),
        packLabel: clip(item?.packLabel, 80),
        qty: Math.min(20, Math.max(1, Number(item?.qty) || 1)),
        unitPrice: Number(item?.unitPrice) || 0,
        colorsLabel: clip(item?.colorsLabel, 160),
        freeShipping: Boolean(item?.freeShipping),
      }))
    : []
  if (!items.length || !items[0].name) return null

  const firstName = clip(body.firstName, 60)
  const lastName = clip(body.lastName, 60)
  const phone = clip(body.phone, 30)
  const address = clip(body.address, 160)
  const city = clip(body.city, 80)
  if (!firstName || !lastName || phoneDigits(phone).length < 7 || !address || !city) return null

  const subtotal = Number(body.subtotal) || 0
  const shipping = Number(body.shipping) || 0
  const area =
    body.area && typeof body.area === 'object'
      ? {
          id: clip(body.area.id, 40),
          label: clip(body.area.label, 80),
          eta: clip(body.area.eta, 40),
        }
      : { id: '', label: '', eta: '' }

  const id = /^PP-[A-Z0-9-]{4,24}$/.test(clip(body.id, 40))
    ? clip(body.id, 40)
    : `PP-${Date.now().toString(36).toUpperCase()}`

  return {
    id,
    createdAt: new Date().toISOString(),
    status: 'new',
    items,
    subtotal,
    shipping,
    total: Math.round((subtotal + shipping) * 100) / 100,
    phone,
    email: clip(body.email, 120),
    firstName,
    lastName,
    address,
    apartment: clip(body.apartment, 80),
    city,
    area,
  }
}

function authorized(request, password) {
  if (!password) return false
  const header = request.headers.get('Authorization') || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  if (token.length !== password.length) return false
  let mismatch = 0
  for (let i = 0; i < token.length; i += 1) mismatch |= token.charCodeAt(i) ^ password.charCodeAt(i)
  return mismatch === 0
}

function orderId(request) {
  const parts = new URL(request.url).pathname.split('/').filter(Boolean)
  const id = decodeURIComponent(parts[parts.length - 1] || '')
  if (!id || id === 'orders' || id === 'api') return ''
  return id
}

export async function handleOrders(request, store, adminPassword) {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS })

  if (request.method === 'GET') {
    if (!authorized(request, adminPassword)) return json({ error: 'Sign in required.' }, 401)
    return json({ orders: await store.list() })
  }

  if (request.method === 'POST') {
    let body
    try {
      body = await request.json()
    } catch {
      return json({ error: 'Invalid order.' }, 400)
    }
    const order = cleanOrder(body)
    if (!order) return json({ error: 'Add your name, phone, address, and city.' }, 400)
    await store.insert(order)
    return json({ order }, 201)
  }

  if (request.method === 'PATCH' || request.method === 'DELETE') {
    if (!authorized(request, adminPassword)) return json({ error: 'Sign in required.' }, 401)
    const id = orderId(request)
    if (!id) return json({ error: 'Missing order.' }, 400)

    if (request.method === 'DELETE') {
      const removed = await store.remove(id)
      if (!removed) return json({ error: 'Order not found.' }, 404)
      return json({ ok: true })
    }

    let body = {}
    try {
      body = await request.json()
    } catch {
      body = {}
    }
    const status = body.status === 'done' ? 'done' : 'new'
    const order = await store.update(id, { status })
    if (!order) return json({ error: 'Order not found.' }, 404)
    return json({ order })
  }

  return json({ error: 'Not found.' }, 404)
}
