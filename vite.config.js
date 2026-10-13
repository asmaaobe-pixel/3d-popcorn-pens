import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import { handleOrders } from './orders-api/src/handler.js'

const root = path.dirname(fileURLToPath(import.meta.url))
const ordersFile = path.join(root, 'data', 'orders.json')
const passwordFile = path.join(root, 'orders-api', '.dev-password')

function readOrders() {
  try {
    return JSON.parse(fs.readFileSync(ordersFile, 'utf8'))
  } catch {
    return []
  }
}

function writeOrders(orders) {
  fs.mkdirSync(path.dirname(ordersFile), { recursive: true })
  fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2))
}

function devPassword() {
  try {
    return fs.readFileSync(passwordFile, 'utf8').trim()
  } catch {
    return ''
  }
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', (chunk) => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

function fileStore() {
  return {
    async list() {
      return readOrders()
    },
    async insert(order) {
      const orders = readOrders().filter((item) => item.id !== order.id)
      orders.unshift(order)
      writeOrders(orders)
    },
    async update(id, patch) {
      const orders = readOrders()
      const index = orders.findIndex((item) => item.id === id)
      if (index < 0) return null
      orders[index] = { ...orders[index], ...patch }
      writeOrders(orders)
      return orders[index]
    },
    async remove(id) {
      const orders = readOrders()
      const next = orders.filter((item) => item.id !== id)
      if (next.length === orders.length) return false
      writeOrders(next)
      return true
    },
  }
}

function ordersApi() {
  const attach = (server) => {
    server.middlewares.use(async (req, res, next) => {
      const url = req.url || ''
      if (!url.startsWith('/api/orders')) return next()
      const body = await readBody(req)
      const request = new Request(`http://127.0.0.1${url}`, {
        method: req.method,
        headers: req.headers,
        body: req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS' ? undefined : body,
      })
      const response = await handleOrders(request, fileStore(), devPassword())
      res.statusCode = response.status
      response.headers.forEach((value, key) => res.setHeader(key, value))
      res.end(Buffer.from(await response.arrayBuffer()))
    })
  }

  return {
    name: 'orders-api',
    configureServer: attach,
    configurePreviewServer: attach,
  }
}

export default defineConfig({
  plugins: [ordersApi()],
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(root, 'index.html'),
        admin: path.resolve(root, 'admin.html'),
      },
    },
  },
  server: {
    port: 1577,
    strictPort: true,
    host: true,
    open: true,
  },
})
