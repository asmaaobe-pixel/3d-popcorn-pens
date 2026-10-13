import { WHATSAPP_NUMBER, BRAND, PRODUCT, SHIPPING } from './config.js'

const money = (n) => `$${Number(n).toFixed(2)}`

/** Real product photos (same Bubble Popcorn Drawing Pens product as Alibaba listing) */
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
  qty: 1,
  favorites: new Set(),
  galleryIndex: 0,
  checkoutItems: [],
  lastOrder: null,
}

const els = {
  colorPicks: document.getElementById('color-picks'),
  packOptions: document.getElementById('pack-options'),
  priceNow: document.getElementById('price-now'),
  priceWas: document.getElementById('price-was'),
  priceSave: document.getElementById('price-save'),
  qty: document.getElementById('qty'),
  qtyMinus: document.getElementById('qty-minus'),
  qtyPlus: document.getElementById('qty-plus'),
  buyButtons: document.querySelectorAll('.js-buy-now'),
  checkout: document.getElementById('checkout'),
  checkoutForm: document.getElementById('checkout-form'),
  checkoutBack: document.getElementById('checkout-back'),
  checkoutError: document.getElementById('checkout-error'),
  areaChoices: document.getElementById('area-choices'),
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

function renderColors() {
  els.colorPicks.innerHTML = PRODUCT.colors
    .map(
      (c) => `
      <button
        type="button"
        class="swatch${state.favorites.has(c.id) ? ' is-active' : ''}"
        style="background:${c.hex}"
        data-color="${c.id}"
        title="${c.name}"
        aria-label="${c.name}"
        aria-pressed="${state.favorites.has(c.id)}"
      ></button>`
    )
    .join('')
}

function activePack() {
  return els.packOptions.querySelector('.pack.is-active')
}

function updatePriceUI() {
  els.priceNow.textContent = money(state.price)
  els.priceWas.textContent = money(state.compare)
  const save = state.compare > state.price ? Math.round((1 - state.price / state.compare) * 100) : 0
  const free = activePack()?.dataset.freeShip === '1'
  els.priceSave.textContent = free ? `Save ${save}% · Free delivery` : `Save ${save}%`
}

function selectedColorNames() {
  return PRODUCT.colors
    .filter((c) => state.favorites.has(c.id))
    .map((c) => c.name)
}

function currentLine() {
  const colors = selectedColorNames()
  const freeShipping = activePack()?.dataset.freeShip === '1'
  return {
    id: `${PRODUCT.id}-pack${state.pack}-${[...state.favorites].sort().join('-') || 'all'}`,
    name: PRODUCT.name,
    pack: state.pack,
    packLabel: `${state.pack} set${state.pack > 1 ? 's' : ''} (${state.pack * PRODUCT.packSize} pens)`,
    unitPrice: state.price,
    qty: state.qty,
    freeShipping,
    colors,
    colorsLabel: colors.length ? colors.join(', ') : 'Full 6-color set',
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

function selectedArea() {
  const picked = els.checkoutForm.querySelector('input[name="area"]:checked')
  return SHIPPING.areas.find((area) => area.id === picked?.value) || SHIPPING.areas[0]
}

function renderAreas() {
  els.areaChoices.innerHTML = SHIPPING.areas
    .map(
      (area, index) => `
      <label class="choice">
        <input type="radio" name="area" value="${area.id}" ${index === 0 ? 'checked' : ''} />
        <span>
          <strong>${area.label}</strong>
          <small>${area.eta}</small>
        </span>
      </label>`
    )
    .join('')
}

function renderSummary() {
  const items = state.checkoutItems
  const sub = subtotalOf(items)
  const ship = shippingFor(items)
  const area = selectedArea()

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
  els.shipEta.textContent = `${area.eta} · ${area.label}`
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
  if (order.email) lines.push(`Email: ${order.email}`)
  lines.push(
    `Address: ${order.address}${order.apartment ? `, ${order.apartment}` : ''}`,
    `City: ${order.city}, Lebanon`,
    `Area: ${order.area.label} (${order.area.eta})`,
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
    'Your cash-on-delivery order is ready. Send it on WhatsApp so we can confirm delivery.'
  els.thanksId.textContent = order.id
  els.thanksSummary.innerHTML = `
    <p>${order.items.map((item) => `${item.qty} × ${item.packLabel}`).join('<br>')}</p>
    <p>${order.address}${order.apartment ? `, ${order.apartment}` : ''}<br>${order.city} · ${order.area.label}</p>
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
els.colorPicks.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-color]')
  if (!btn) return
  const id = btn.dataset.color
  if (state.favorites.has(id)) state.favorites.delete(id)
  else state.favorites.add(id)
  renderColors()
})

els.packOptions.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-pack]')
  if (!btn) return
  state.pack = Number(btn.dataset.pack)
  state.price = Number(btn.dataset.price)
  state.compare = Number(btn.dataset.compare)
  els.packOptions.querySelectorAll('.pack').forEach((el) => el.classList.toggle('is-active', el === btn))
  updatePriceUI()
})

els.qtyMinus.addEventListener('click', () => {
  state.qty = Math.max(1, state.qty - 1)
  els.qty.value = state.qty
})

els.qtyPlus.addEventListener('click', () => {
  state.qty = Math.min(20, state.qty + 1)
  els.qty.value = state.qty
})

els.qty.addEventListener('change', () => {
  state.qty = Math.min(20, Math.max(1, Number(els.qty.value) || 1))
  els.qty.value = state.qty
})

els.buyButtons.forEach((button) => button.addEventListener('click', openCheckout))

els.checkoutBack.addEventListener('click', showShop)

els.areaChoices.addEventListener('change', renderSummary)

els.checkoutForm.addEventListener('submit', (event) => {
  event.preventDefault()
  const phone = fieldValue('co-phone')
  const email = fieldValue('co-email')
  const firstName = fieldValue('co-first')
  const lastName = fieldValue('co-last')
  const address = fieldValue('co-address')
  const city = fieldValue('co-city')
  const phoneDigits = phone.replace(/\D/g, '')

  if (!firstName || !lastName || !address || !city || phoneDigits.length < 8) {
    els.checkoutError.hidden = false
    els.checkoutError.textContent = 'Add your name, phone, address, and city to complete the order.'
    return
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    els.checkoutError.hidden = false
    els.checkoutError.textContent = 'Enter a valid email, or leave it blank.'
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
    email,
    firstName,
    lastName,
    address,
    apartment: fieldValue('co-apt'),
    city,
    area: selectedArea(),
  }

  els.checkoutForm.reset()
  renderAreas()
  showThanks(order)
  openWhatsApp(buildOrderMessage(order))
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
renderColors()
renderAreas()
updatePriceUI()
