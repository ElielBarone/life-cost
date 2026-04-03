import { GOODS_JSON_PATH } from './constants.js'

export async function loadGoodsCatalog(basePath = GOODS_JSON_PATH) {
  const res = await fetch(basePath)
  if (!res.ok) throw new Error(`Failed to load catalog: ${res.status}`)
  const data = await res.json()
  const items = Array.isArray(data.items) ? data.items : []
  return { asOf: data.asOf ?? '', items }
}

export function formatPriceBrl(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}
