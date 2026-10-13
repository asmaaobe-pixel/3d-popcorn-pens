/** Digits only with country code, no +. Example: 96170123456 */
export const WHATSAPP_NUMBER = ''

export const BRAND = 'PuffPop'

/** Same shipping rule as the reference shop: Express $4, free from $50. */
export const SHIPPING = {
  name: 'Express',
  price: 4,
  freeOver: 50,
  areas: [
    { id: 'beirut', label: 'Beirut & suburbs', eta: '2–3 days' },
    { id: 'beyond', label: 'Beyond Beirut', eta: '3–4 days' },
  ],
}

export const PRODUCT = {
  id: 'bubble-popcorn-pens-6',
  name: 'Bubble Popcorn Drawing Pens',
  tagline: '6 neon colors · Heat → puffy 3D art',
  price: 9.99,
  compareAt: 14.99,
  packSize: 6,
  colors: [
    { id: 'pink', name: 'Hot Pink', hex: '#ff4d8d' },
    { id: 'orange', name: 'Sunset Orange', hex: '#ff7a3d' },
    { id: 'yellow', name: 'Butter Yellow', hex: '#ffd23f' },
    { id: 'green', name: 'Mint Pop', hex: '#3dcf8e' },
    { id: 'blue', name: 'Sky Blue', hex: '#3db8ff' },
    { id: 'purple', name: 'Violet Fizz', hex: '#8b6cff' },
  ],
}
