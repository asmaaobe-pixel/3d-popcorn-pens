import { handleOrders } from './handler.js'

function store(db) {
  return {
    async list() {
      const { results } = await db.prepare('SELECT payload FROM orders ORDER BY created_at DESC LIMIT 200').all()
      return results.map((row) => JSON.parse(row.payload))
    },
    async insert(order) {
      await db
        .prepare(
          `INSERT INTO orders (id, created_at, status, first_name, last_name, phone, city, total, payload)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .bind(
          order.id,
          order.createdAt,
          order.status,
          order.firstName,
          order.lastName,
          order.phone,
          order.city,
          order.total,
          JSON.stringify(order)
        )
        .run()
    },
    async update(id, patch) {
      const row = await db.prepare('SELECT payload FROM orders WHERE id = ?').bind(id).first()
      if (!row) return null
      const order = { ...JSON.parse(row.payload), ...patch }
      await db
        .prepare('UPDATE orders SET status = ?, payload = ? WHERE id = ?')
        .bind(order.status, JSON.stringify(order), id)
        .run()
      return order
    },
    async remove(id) {
      const result = await db.prepare('DELETE FROM orders WHERE id = ?').bind(id).run()
      return (result.meta?.changes || 0) > 0
    },
  }
}

export default {
  async fetch(request, env) {
    return handleOrders(request, store(env.DB), env.ADMIN_PASSWORD || '')
  },
}
