import { WHATSAPP_NUMBER, BRAND, PRODUCT, SHIPPING } from './config.js'
import { saveOrder } from './orders.js'

const money = (n) => `$${Number(n).toFixed(2)}`

/** Real product photos of the Bubble Popcorn Drawing Pens set */
const GALLERY = [
  { type: 'image', src: '/media/gallery-01.jpg', alt: 'Product pack front' },
  { type: 'image', src: '/media/gallery-02.jpg', alt: 'Pens close-up' },
  { type: 'image', src: '/media/gallery-03.jpg', alt: 'Color set detail' },
  { type: 'image', src: '/media/gallery-04.jpg', alt: 'Box and pens' },
  { type: 'image', src: '/media/gallery-05.jpg', alt: 'Puffy art result' },
  { type: 'image', src: '/media/gallery-06.jpg', alt: 'Craft example' },
  { type: 'image', src: '/media/gallery-07.jpg', alt: 'Kids craft use' },
  { type: 'image', src: '/media/gallery-08.jpg', alt: '3D popcorn texture' },
  { type: 'image', src: '/media/gallery-13.jpg', alt: 'Six neon pens' },
  { type: 'image', src: '/media/gallery-15.jpg', alt: 'Before and after puff' },
  { type: 'image', src: '/media/gallery-18.jpg', alt: 'Greeting card project' },
  { type: 'image', src: '/media/gallery-21.jpg', alt: 'Retail product photo' },
  { type: 'image', src: '/media/gallery-23.jpg', alt: 'Heat puff demonstration' },
  { type: 'image', src: '/media/gallery-24.jpg', alt: 'Finished popcorn art' },
  { type: 'image', src: '/media/gallery-25.jpg', alt: 'Color variety shot' },
  {
    type: 'video',
    src: '/media/puff-demo.mp4',
    thumb: '/media/gallery-05.jpg',
    alt: 'Puff demo video',
    label: '▶ VIDEO',
  },
]

const state = {
  pack: 1,
  price: PRODUCT.price,
  compare: PRODUCT.compareAt,
  galleryIndex: 0,
  checkoutItems: [],
  lastOrder: null,
}

const els = {
  packOptions: document.getElementById('pack-options'),
  priceNow: document.getElementById('price-now'),
  priceWas: document.getElementById('price-was'),
  priceSave: document.getElementById('price-save'),
  stickyPrice: document.getElementById('sticky-price'),
  stickyNote: document.getElementById('sticky-note'),
  buyButtons: document.querySelectorAll('.js-buy-now'),
  checkout: document.getElementById('checkout'),
  checkoutForm: document.getElementById('checkout-form'),
  checkoutBack: document.getElementById('checkout-back'),
  checkoutError: document.getElementById('checkout-error'),
  checkoutSubmit: document.getElementById('checkout-submit'),
  shipEta: document.getElementById('ship-eta'),
  shipPrice: document.getElementById('ship-price'),
  shipHint: document.getElementById('ship-hint'),
  summaryLines: document.getElementById('summary-lines'),
  sumSub: document.getElementById('sum-sub'),
  sumShip: document.getElementById('sum-ship'),
  sumTotal: document.getElementById('sum-total'),
  thanks: document.getElementById('thanks'),
  thanksTitle: document.getElementById('thanks-title'),
  thanksLead: document.getElementById('thanks-lead'),
  thanksId: document.getElementById('thanks-id'),
  thanksSummary: document.getElementById('thanks-summary'),
  thanksWa: document.getElementById('thanks-wa'),
  thanksShop: document.getElementById('thanks-shop'),
  toast: document.getElementById('toast'),
  galleryImage: document.getElementById('gallery-image'),
  galleryVideo: document.getElementById('gallery-video'),
  demoPlayer: document.getElementById('demo-player'),
  galleryThumbs: document.getElementById('gallery-thumbs'),
}

function activePack() {
  return els.packOptions.querySelector('.pack.is-active')
}

function updatePriceUI() {
  const save = Math.max(0, state.compare - state.price)
  const free = activePack()?.dataset.freeShip === '1'
  els.priceNow.textContent = money(state.price)
  els.priceWas.textContent = money(state.compare)
  els.priceSave.textContent = free ? `You save ${money(save)} · Free delivery` : `You save ${money(save)}`
  els.stickyPrice.textContent = money(state.price)
  els.stickyNote.textContent = free ? '2 sets · free delivery' : 'Delivery $4 · free from $50'
}

function currentLine() {
  const freeShipping = activePack()?.dataset.freeShip === '1'
  return {
    id: `${PRODUCT.id}-pack${state.pack}`,
    name: PRODUCT.name,
    pack: state.pack,
    packLabel: `${state.pack} set${state.pack > 1 ? 's' : ''} (${state.pack * PRODUCT.packSize} pens)`,
    unitPrice: state.price,
    qty: 1,
    freeShipping,
    colors: [],
    colorsLabel: 'Full 6-color set',
  }
}

function lineTotal(item) {
  return item.unitPrice * item.qty
}

function showToast(message) {
  els.toast.hidden = false
  els.toast.textContent = message
  els.toast.classList.add('is-show')
  clearTimeout(showToast._t)
  showToast._t = setTimeout(() => {
    els.toast.classList.remove('is-show')
  }, 2200)
}

function subtotalOf(items) {
  return items.reduce((sum, item) => sum + lineTotal(item), 0)
}

function shippingFor(items) {
  const subtotal = subtotalOf(items)
  if (items.some((item) => item.freeShipping)) return 0
  return subtotal >= SHIPPING.freeOver ? 0 : SHIPPING.price
}

function renderSummary() {
  const items = state.checkoutItems
  const sub = subtotalOf(items)
  const ship = shippingFor(items)

  els.summaryLines.innerHTML = items
    .map(
      (item) => `
      <article class="summary-line">
        <div>
          <strong>${item.name}</strong>
          <p>${item.packLabel} · Qty ${item.qty}<br>${item.colorsLabel}</p>
        </div>
        <span>${money(lineTotal(item))}</span>
      </article>`
    )
    .join('')

  els.sumSub.textContent = money(sub)
  els.sumShip.textContent = ship === 0 ? 'Free' : money(ship)
  els.sumTotal.textContent = money(sub + ship)
  els.shipPrice.textContent = ship === 0 ? 'Free' : money(ship)
  els.shipEta.textContent = SHIPPING.eta
  const twoSet = items.some((item) => item.freeShipping)
  els.shipHint.textContent = twoSet
    ? 'Free delivery on the 2-set.'
    : ship === 0
      ? `Free Express delivery on orders of ${money(SHIPPING.freeOver)} or more.`
      : `Express is ${money(SHIPPING.price)}. The 2-set ships free, and orders of ${money(SHIPPING.freeOver)} or more ship free.`
}

function showShop() {
  document.body.classList.remove('is-flow')
  els.checkout.hidden = true
  els.thanks.hidden = true
  window.scrollTo(0, 0)
}

function openCheckout() {
  state.checkoutItems = [currentLine()]
  els.checkoutError.hidden = true
  els.toast.classList.remove('is-show')
  els.thanks.hidden = true
  els.checkout.hidden = false
  document.body.classList.add('is-flow')
  renderSummary()
  window.scrollTo(0, 0)
}

function fieldValue(id) {
  return document.getElementById(id).value.trim()
}

function phoneDigits(value) {
  return String(value)
    .replace(/[٠-٩]/g, (digit) => String(digit.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, (digit) => String(digit.charCodeAt(0) - 0x06f0))
    .replace(/[０-９]/g, (digit) => String(digit.charCodeAt(0) - 0xff10))
    .replace(/\D/g, '')
}

function markInvalid(ids) {
  ;['co-phone', 'co-first', 'co-last', 'co-address', 'co-city'].forEach((id) => {
    document.getElementById(id).classList.toggle('is-invalid', ids.includes(id))
  })
}

function buildOrderMessage(order) {
  const lines = [
    `Hi ${BRAND}! Cash on delivery order ${order.id}`,
    '',
    ...order.items.map(
      (item, i) =>
        `${i + 1}) ${item.name}\n` +
        `   Pack: ${item.packLabel}\n` +
        `   Qty: ${item.qty}\n` +
        `   Colors: ${item.colorsLabel}\n` +
        `   Line: ${money(lineTotal(item))}`
    ),
    '',
    `Subtotal: ${money(order.subtotal)}`,
    `Shipping: ${order.shipping === 0 ? 'Express (free)' : `Express ${money(order.shipping)}`}`,
    `Total: ${money(order.total)}`,
    'Payment: Cash on delivery',
    `Name: ${order.firstName} ${order.lastName}`,
    `Phone: ${order.phone}`,
  ]
  lines.push(
    `Address: ${order.address}${order.apartment ? `, ${order.apartment}` : ''}`,
    `City: ${order.city}, Lebanon`,
    '',
    'Please confirm availability and delivery. Thanks!'
  )
  return lines.join('\n')
}

function showThanks(order) {
  state.lastOrder = order
  els.checkout.hidden = true
  els.thanks.hidden = false
  document.body.classList.add('is-flow')
  els.thanksTitle.textContent = `Thank you, ${order.firstName}`
  els.thanksLead.textContent =
    'Your cash-on-delivery order is saved. Send it on WhatsApp so we can confirm delivery.'
  els.thanksId.textContent = order.id
  els.thanksSummary.innerHTML = `
    <p>${order.items.map((item) => `${item.qty} × ${item.packLabel}`).join('<br>')}</p>
    <p>${order.address}${order.apartment ? `, ${order.apartment}` : ''}<br>${order.city}</p>
    <p><strong>Total ${money(order.total)}</strong> · Cash on delivery</p>
  `
  window.scrollTo(0, 0)
}

function openWhatsApp(message) {
  const text = encodeURIComponent(message)
  const phone = String(WHATSAPP_NUMBER || '').replace(/\D/g, '')
  const url = phone ? `https://wa.me/${phone}?text=${text}` : `https://wa.me/?text=${text}`
  window.open(url, '_blank', 'noopener,noreferrer')
}

/* Events */
els.packOptions.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-pack]')
  if (!btn) return
  state.pack = Number(btn.dataset.pack)
  state.price = Number(btn.dataset.price)
  state.compare = Number(btn.dataset.compare)
  els.packOptions.querySelectorAll('.pack').forEach((el) => el.classList.toggle('is-active', el === btn))
  updatePriceUI()
})

els.buyButtons.forEach((button) => button.addEventListener('click', openCheckout))

els.checkoutBack.addEventListener('click', showShop)

els.checkoutForm.addEventListener('input', () => {
  els.checkoutError.hidden = true
  markInvalid([])
})

els.checkoutForm.addEventListener('submit', async (event) => {
  event.preventDefault()
  await new Promise((resolve) => setTimeout(resolve, 0))
  const phone = fieldValue('co-phone')
  const firstName = fieldValue('co-first')
  const lastName = fieldValue('co-last')
  const address = fieldValue('co-address')
  const city = fieldValue('co-city')
  const digits = phoneDigits(phone)
  const missing = []
  if (digits.length < 7) missing.push(['co-phone', 'a phone number'])
  if (!firstName) missing.push(['co-first', 'your first name'])
  if (!lastName) missing.push(['co-last', 'your last name'])
  if (!address) missing.push(['co-address', 'your address'])
  if (!city) missing.push(['co-city', 'your city'])

  if (missing.length) {
    markInvalid(missing.map(([id]) => id))
    els.checkoutError.hidden = false
    els.checkoutError.textContent =
      missing.length === 1 && missing[0][0] === 'co-phone'
        ? 'Enter the full phone number. A Lebanese mobile is fine, like 03 123 456.'
        : `Add ${missing.map(([, label]) => label).join(', ')} to complete the order.`
    document.getElementById(missing[0][0]).focus()
    return
  }

  const subtotal = subtotalOf(state.checkoutItems)
  const shipping = shippingFor(state.checkoutItems)
  const order = {
    id: `PP-${Date.now().toString(36).toUpperCase()}`,
    items: state.checkoutItems,
    subtotal,
    shipping,
    total: subtotal + shipping,
    phone,
    firstName,
    lastName,
    address,
    apartment: fieldValue('co-apt'),
    city,
  }

  els.checkoutError.hidden = true
  els.checkoutSubmit.disabled = true
  els.checkoutSubmit.textContent = 'Saving order...'
  try {
    const saved = await saveOrder(order)
    els.checkoutForm.reset()
    showThanks(saved)
    openWhatsApp(buildOrderMessage(saved))
  } catch {
    els.checkoutError.hidden = false
    els.checkoutError.textContent = 'Could not save the order. Check your connection and try again.'
  } finally {
    els.checkoutSubmit.disabled = false
    els.checkoutSubmit.textContent = 'Complete order'
  }
})

els.thanksWa.addEventListener('click', () => {
  if (!state.lastOrder) return
  openWhatsApp(buildOrderMessage(state.lastOrder))
})

els.thanksShop.addEventListener('click', showShop)

document.querySelector('.site-header').addEventListener('click', (event) => {
  if (event.target.closest('a')) showShop()
})

function showGalleryItem(index) {
  state.galleryIndex = index
  const item = GALLERY[index]
  if (!item) return

  els.galleryThumbs.querySelectorAll('.thumb').forEach((btn, i) => {
    btn.classList.toggle('is-active', i === index)
  })

  const stopLocal = () => {
    if (els.demoPlayer) {
      els.demoPlayer.pause()
      els.demoPlayer.hidden = true
    }
  }

  if (item.type === 'video') {
    els.galleryImage.hidden = true
    els.galleryVideo.hidden = false
    if (els.demoPlayer) {
      els.demoPlayer.hidden = false
      els.demoPlayer.src = item.src
      els.demoPlayer.play().catch(() => {})
    }
    return
  }

  els.galleryVideo.hidden = true
  stopLocal()
  els.galleryImage.hidden = false
  els.galleryImage.src = item.src
  els.galleryImage.alt = item.alt
}

function renderGallery() {
  els.galleryThumbs.innerHTML = GALLERY.map((item, index) => {
    if (item.type === 'video') {
      const label = item.label || '▶ VIDEO'
      return `<button type="button" class="thumb is-video${index === 0 ? ' is-active' : ''}" data-index="${index}" aria-label="${item.alt}">${label}</button>`
    }
    return `<button type="button" class="thumb${index === 0 ? ' is-active' : ''}" data-index="${index}" aria-label="${item.alt}">
      <img src="${item.src}" alt="" loading="lazy" />
    </button>`
  }).join('')

  els.galleryThumbs.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-index]')
    if (!btn) return
    showGalleryItem(Number(btn.dataset.index))
  })

  showGalleryItem(0)
}

renderGallery()
updatePriceUI()
