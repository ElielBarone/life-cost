import { CALC_MEMORY_STORAGE_KEY } from './calc-memory.js'
import { clampHorizonYears, workMonthsForAmount } from './finance.js'

const moneyFmt = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0,
})

const numFmt = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 })

const pctFmt = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})

function readSnapshot() {
  try {
    const raw = sessionStorage.getItem(CALC_MEMORY_STORAGE_KEY)
    if (!raw) return null
    const o = JSON.parse(raw)
    if (
      !o ||
      typeof o.ageYears !== 'number' ||
      typeof o.priceBrl !== 'number' ||
      typeof o.monthlyReturnPercent !== 'number' ||
      typeof o.lifeExpectancyYears !== 'number' ||
      typeof o.horizonMonths !== 'number' ||
      typeof o.futureValueBrl !== 'number' ||
      typeof o.monthlySalaryBrl !== 'number'
    ) {
      return null
    }
    if (
      !Number.isFinite(o.priceBrl) ||
      !Number.isFinite(o.futureValueBrl) ||
      !Number.isFinite(o.monthlySalaryBrl) ||
      o.monthlySalaryBrl <= 0 ||
      o.horizonMonths < 0
    ) {
      return null
    }
    return o
  } catch {
    return null
  }
}

function formatMonths(m) {
  if (m == null || !Number.isFinite(m)) return '—'
  return `${numFmt.format(m)} meses`
}

function render(root) {
  const data = readSnapshot()
  if (!data) {
    root.innerHTML = `
<section class="card memory-card" aria-labelledby="memory-empty-title">
  <h1 id="memory-empty-title" class="card__title">Memória de cálculo</h1>
  <p class="muted">Não há uma simulação recente neste navegador. Volte ao simulador, calcule de novo e abra este link a partir da tela de resultado.</p>
  <p class="memory-card__actions">
    <a class="btn-primary memory-card__btn" href="./index.html">Ir ao simulador</a>
  </p>
</section>`
    return
  }

  const naturalYears = data.lifeExpectancyYears - data.ageYears
  const clampedYears = clampHorizonYears(data.ageYears, data.lifeExpectancyYears)
  const workMonths = workMonthsForAmount(
    data.futureValueBrl,
    data.monthlySalaryBrl
  )

  root.innerHTML = `
<div class="memory-back">
  <a class="memory-back__link" href="./index.html"><span class="material-symbols-outlined" aria-hidden="true">arrow_back</span> Voltar ao simulador</a>
</div>
<section class="card memory-card" aria-labelledby="memory-title">
  <h1 id="memory-title" class="card__title">Memória de cálculo</h1>
  <p class="muted small memory-card__lead">Valores da última simulação neste aparelho (mesmos parâmetros da tela de resultado).</p>

  <div class="memory-section">
    <h2 class="memory-section__title">Entradas</h2>
    <ul class="memory-list">
      <li><span class="memory-list__k">Sua idade</span> <span class="memory-list__v">${data.ageYears} anos</span></li>
      <li><span class="memory-list__k">Valor do bem (principal <span class="memory-mono">P</span>)</span> <span class="memory-list__v">${moneyFmt.format(data.priceBrl)}</span></li>
      <li><span class="memory-list__k">Salário mensal base</span> <span class="memory-list__v">${moneyFmt.format(data.monthlySalaryBrl)}</span></li>
    </ul>
  </div>

  <div class="memory-section">
    <h2 class="memory-section__title">Horizonte</h2>
    <p class="muted small memory-section__text">Expectativa de vida do cenário: <strong class="memory-strong">${Math.round(data.lifeExpectancyYears)} anos</strong>. Anos até lá: <strong class="memory-strong">${numFmt.format(naturalYears)}</strong>; o modelo usa pelo menos <strong class="memory-strong">5 anos</strong>, então o prazo efetivo é <strong class="memory-strong">${numFmt.format(clampedYears)} anos</strong> (<strong class="memory-strong">${data.horizonMonths} meses</strong>).</p>
  </div>

  <div class="memory-section">
    <h2 class="memory-section__title">Custo total no futuro</h2>
    <p class="muted small memory-section__text">Juros compostos ao mês: <span class="memory-mono memory-mono--block">VF = P × (1 + r)<sup>n</sup></span> com <span class="memory-mono">r</span> = ${pctFmt.format(data.monthlyReturnPercent)}% ao mês e <span class="memory-mono">n</span> = ${data.horizonMonths}.</p>
    <p class="memory-fv">${moneyFmt.format(data.futureValueBrl)}</p>
  </div>

  <div class="memory-section">
    <h2 class="memory-section__title">Meses equivalentes de trabalho</h2>
    <p class="muted small memory-section__text"><span class="memory-mono memory-mono--block">meses = VF ÷ salário mensal</span></p>
    <p class="memory-fv memory-fv--secondary">${formatMonths(workMonths)}</p>
  </div>
</section>`
}

const root = document.getElementById('memory-app')
if (root) render(root)
