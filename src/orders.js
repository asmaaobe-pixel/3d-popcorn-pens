const LIVE_API = 'https://puffpop-orders.earglow.workers.dev'

export function ordersApiBase() {
  const host = location.hostname
  if (host === 'localhost' || host === '127.0.0.1') return '/api/orders'
  return LIVE_API
}

async function readJson(response) {
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.error || 'The order could not be saved.')
  return data
}

export async function saveOrder(order) {
  const response = await fetch(ordersApiBase(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(order),
  })
  const data = await readJson(response)
  return data.order
}

export async function fetchOrders(password) {
  const response = await fetch(ordersApiBase(), {
    headers: { Authorization: `Bearer ${password}` },
  })
  const data = await readJson(response)
  return data.orders || []
}

export async function updateOrderStatus(password, id, status) {
  const response = await fetch(`${ordersApiBase()}/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${password}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  })
  const data = await readJson(response)
  return data.order
}

export async function deleteOrder(password, id) {
  const response = await fetch(`${ordersApiBase()}/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${password}` },
  })
  await readJson(response)
}
