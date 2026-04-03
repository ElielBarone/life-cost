import { loadGoodsCatalog, formatPriceBrl } from './catalog.js'

function cardTemplate(item) {
  const href = `./index.html?good=${encodeURIComponent(item.id)}`
  const img = item.image
    ? `<img src="${item.image}" alt="" class="goods-card__img" width="120" height="80" loading="lazy" />`
    : ''
  return `
    <article class="goods-card">
      ${img}
      <div class="goods-card__body">
        <h2 class="goods-card__title">${escapeHtml(item.name)}</h2>
        <p class="goods-card__price">${formatPriceBrl(item.priceBRL)}</p>
        <p class="goods-card__desc">${escapeHtml(item.description)}</p>
        <a class="goods-card__cta" href="${href}">Simular este bem</a>
      </div>
    </article>
  `
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

async function main() {
  const grid = document.getElementById('goods-grid')
  const status = document.getElementById('goods-status')
  try {
    const { items, asOf } = await loadGoodsCatalog()
    if (asOf) status.textContent = `Referência: ${asOf}`
    grid.innerHTML = items.map((it) => `<li>${cardTemplate(it)}</li>`).join('')
  } catch (e) {
    status.textContent = 'Não foi possível carregar o catálogo.'
    grid.innerHTML = ''
  }
}

main()
