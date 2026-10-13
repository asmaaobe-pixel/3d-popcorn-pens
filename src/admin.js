import { deleteOrder, fetchOrders, updateOrderStatus } from './orders.js'

const SESSION_KEY = 'puffpop-admin-key'
const money = (n) => `$${Number(n).toFixed(2)}`

const loginForm = document.getElementById('admin-login')
const loginError = document.getElementById('admin-login-error')
const passwordInput = document.getElementById('admin-password')
const board = document.getElementById('admin-board')
const list = document.getElementById('admin-list')
const boardError = document.getElementById('admin-error')

function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]
  )
}

function when(iso) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function showLoginError(message) {
  loginError.hidden = false
  loginError.textContent = message
}

function render(orders) {
  if (!orders.length) {
    list.innerHTML = '<p class="admin-empty">No orders yet.</p>'
    return
  }

  list.innerHTML = orders
    .map((order) => {
      const done = order.status === 'done'
      const items = (order.items || [])
        .map((item) => `${item.qty} × ${esc(item.packLabel)} · ${esc(item.colorsLabel)}`)
        .join('<br>')
      return `
        <article class="admin-card${done ? ' is-done' : ''}" data-id="${esc(order.id)}">
          <header>
            <strong>${esc(order.firstName)} ${esc(order.lastName)}</strong>
            <span>${done ? 'Delivered' : 'New'}</span>
          </header>
          <p class="admin-meta">${esc(when(order.createdAt))} · ${esc(order.id)}</p>
          <p><a href="tel:${esc(order.phone)}">${esc(order.phone)}</a></p>
          <p>${esc(order.address)}${order.apartment ? `, ${esc(order.apartment)}` : ''}<br>${esc(order.city)}</p>
          <p>${items}</p>
          <p class="admin-total">${money(order.total)} · ${order.shipping === 0 ? 'Free delivery' : `Shipping ${money(order.shipping)}`} · Cash on delivery</p>
          <div class="admin-actions">
            <button type="button" class="btn btn-ghost" data-action="status">${done ? 'Mark as new' : 'Mark delivered'}</button>
            <button type="button" class="btn btn-ghost" data-action="delete">Delete</button>
          </div>
        </article>`
    })
    .join('')
}

async function load(password) {
  boardError.hidden = true
  const orders = await fetchOrders(password)
  loginForm.hidden = true
  board.hidden = false
  render(orders)
}

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault()
  const password = passwordInput.value
  loginError.hidden = true
  try {
    await load(password)
    sessionStorage.setItem(SESSION_KEY, password)
  } catch (error) {
    showLoginError(error.message === 'Sign in required.' ? 'That password is not right.' : error.message)
  }
})

document.getElementById('admin-refresh').addEventListener('click', async () => {
  const password = sessionStorage.getItem(SESSION_KEY)
  if (!password) return
  try {
    await load(password)
  } catch (error) {
    boardError.hidden = false
    boardError.textContent = error.message
  }
})

list.addEventListener('click', async (event) => {
  const button = event.target.closest('[data-action]')
  if (!button) return
  const card = button.closest('[data-id]')
  const password = sessionStorage.getItem(SESSION_KEY)
  if (!card || !password) return
  const id = card.dataset.id
  button.disabled = true
  try {
    if (button.dataset.action === 'delete') {
      await deleteOrder(password, id)
    } else {
      const done = card.classList.contains('is-done')
      await updateOrderStatus(password, id, done ? 'new' : 'done')
    }
    await load(password)
  } catch (error) {
    boardError.hidden = false
    boardError.textContent = error.message
    button.disabled = false
  }
})

const savedPassword = sessionStorage.getItem(SESSION_KEY)
if (savedPassword) {
  passwordInput.value = savedPassword
  load(savedPassword).catch(() => {
    sessionStorage.removeItem(SESSION_KEY)
  })
}
