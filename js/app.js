import {
  loadEffectiveScenario,
  saveScenarioToStorage,
  clearScenarioStorage,
  defaultScenarioValues,
} from './scenario-storage.js'
import { loadGoodsCatalog, formatPriceBrl } from './catalog.js'
import {
  effectiveHorizonMonths,
  futureValueCompound,
  workMonthsForAmount,
} from './finance.js'
import { writeCalcMemorySnapshot } from './calc-memory.js'

const moneyFmt = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0,
})

const numFmt = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 })

const brlAmountFmt = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})

function parsePositiveNumber(raw, fallback) {
  const n = Number(String(raw).replace(',', '.'))
  if (!Number.isFinite(n) || n < 0) return fallback
  return n
}

function parseMoneyBrl(raw) {
  const t = String(raw)
    .trim()
    .replace(/\s/g, '')
    .replace(/R\$\s?/gi, '')
  if (t === '') return NaN
  const hasComma = t.includes(',')
  const normalized = hasComma
    ? t.replace(/\./g, '').replace(',', '.')
    : t.replace(/\./g, '')
  const n = Number(normalized)
  if (!Number.isFinite(n) || n < 0) return NaN
  return n
}

function formatMoneyBrlInput(amount) {
  if (!Number.isFinite(amount) || amount < 0) return ''
  return brlAmountFmt.format(amount)
}

function formatMonths(m) {
  if (m == null || !Number.isFinite(m)) return '—'
  return `${numFmt.format(m)} meses`
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function applyGoodPickPressedState(buttons, goodId) {
  for (const btn of buttons) {
    const id = btn.getAttribute('data-good-id')
    btn.setAttribute('aria-pressed', id === goodId ? 'true' : 'false')
  }
}

function computeScenario(ageYears, priceBrl, monthlySalaryBrl, scenario) {
  const rM = scenario.monthlyReturnPercent / 100
  const months = effectiveHorizonMonths(
    ageYears,
    scenario.lifeExpectancyYears,
    null
  )
  const fv = futureValueCompound(priceBrl, rM, months)
  const monthsFv = workMonthsForAmount(fv, monthlySalaryBrl)
  return { fv, monthsFv }
}

function setStep(els, which, opts = {}) {
  const showInput = which === 'input'
  els.stepInput.hidden = !showInput
  els.stepInput.classList.toggle('is-hidden', !showInput)
  els.stepResults.hidden = showInput
  els.stepResults.classList.toggle('is-hidden', showInput)
  if (els.siteTaglineFv) {
    if (showInput) {
      els.siteTaglineFv.textContent = 'R$?'
    } else if (
      opts.futureValueBrl != null &&
      Number.isFinite(opts.futureValueBrl)
    ) {
      els.siteTaglineFv.textContent = moneyFmt.format(opts.futureValueBrl)
    }
  }
  if (showInput) {
    els.age.focus()
  } else {
    els.btnBack.focus()
  }
}

function renderSalaryNote(monthlySalaryBrl) {
  if (!Number.isFinite(monthlySalaryBrl) || monthlySalaryBrl <= 0) {
    return 'Informe seu salário real no campo acima para ver o equivalente em meses de trabalho.'
  }
  return `Salário mensal base de ${moneyFmt.format(monthlySalaryBrl)} (informe seu salário real). O custo futuro é dividido por esse valor para obter meses equivalentes.`
}

function applySalaryToResults(els, futureValueBrl, monthlySalaryBrl) {
  const monthsFv = workMonthsForAmount(futureValueBrl, monthlySalaryBrl)
  els.resultMonths.textContent = formatMonths(monthsFv)
  els.resultSalaryNote.textContent = renderSalaryNote(monthlySalaryBrl)
}

function renderResults(els, state) {
  els.resultFv.textContent = moneyFmt.format(state.fv)
  els.monthlySalary.value = formatMoneyBrlInput(state.monthlySalaryBrl)
  applySalaryToResults(els, state.fv, state.monthlySalaryBrl)
}

async function main() {
  let lastFutureValueBrl = null
  let lastCalcInput = null
  let scenario = loadEffectiveScenario()
  let monthlySalaryBrl = scenario.monthlyIncomeBrl

  const els = {
    form: document.getElementById('calc-form'),
    stepInput: document.getElementById('step-input'),
    stepResults: document.getElementById('step-results'),
    age: document.getElementById('age'),
    price: document.getElementById('price'),
    monthlySalary: document.getElementById('monthly-salary'),
    resultFv: document.getElementById('result-fv'),
    siteTaglineFv: document.getElementById('site-tagline-fv'),
    resultMonths: document.getElementById('result-months'),
    resultSalaryNote: document.getElementById('result-salary-note'),
    btnBack: document.getElementById('btn-back'),
    goodPickField: document.getElementById('good-pick-field'),
    goodPickGrid: document.getElementById('good-pick-grid'),
    scenarioDialog: document.getElementById('scenario-dialog'),
    scenarioForm: document.getElementById('scenario-form'),
    scenarioMonthlyReturn: document.getElementById('scenario-monthly-return'),
    scenarioMonthlyIncome: document.getElementById('scenario-monthly-income'),
    scenarioLifeExpectancy: document.getElementById('scenario-life-expectancy'),
    btnScenarioOpen: document.getElementById('btn-scenario-open'),
    btnScenarioClose: document.getElementById('btn-scenario-close'),
    btnScenarioResetHeader: document.getElementById('btn-scenario-reset-header'),
    btnScenarioRestore: document.getElementById('btn-scenario-restore'),
  }

  function persistCalcMemory() {
    if (lastCalcInput == null || lastFutureValueBrl == null) return
    const rawSal = parseMoneyBrl(els.monthlySalary.value)
    const sal =
      Number.isFinite(rawSal) && rawSal > 0 ? rawSal : monthlySalaryBrl
    const months = effectiveHorizonMonths(
      lastCalcInput.ageYears,
      scenario.lifeExpectancyYears,
      null
    )
    writeCalcMemorySnapshot({
      ageYears: lastCalcInput.ageYears,
      priceBrl: lastCalcInput.priceBrl,
      monthlyReturnPercent: scenario.monthlyReturnPercent,
      lifeExpectancyYears: scenario.lifeExpectancyYears,
      horizonMonths: months,
      futureValueBrl: lastFutureValueBrl,
      monthlySalaryBrl: sal,
    })
  }

  function scenarioFormIntoScenario() {
    const monthlyReturn = parsePositiveNumber(
      els.scenarioMonthlyReturn.value,
      NaN
    )
    const income = parseMoneyBrl(els.scenarioMonthlyIncome.value)
    const life = parsePositiveNumber(els.scenarioLifeExpectancy.value, NaN)
    els.scenarioMonthlyReturn.setCustomValidity('')
    els.scenarioMonthlyIncome.setCustomValidity('')
    els.scenarioLifeExpectancy.setCustomValidity('')
    let ok = true
    if (!Number.isFinite(monthlyReturn) || monthlyReturn < 0 || monthlyReturn > 100) {
      els.scenarioMonthlyReturn.setCustomValidity(
        'Informe uma taxa entre 0 e 100%.'
      )
      ok = false
    }
    if (!Number.isFinite(income) || income <= 0) {
      els.scenarioMonthlyIncome.setCustomValidity(
        'Informe um valor em reais válido.'
      )
      ok = false
    }
    if (!Number.isFinite(life) || life < 1 || life > 120) {
      els.scenarioLifeExpectancy.setCustomValidity(
        'Informe uma expectativa entre 1 e 120 anos.'
      )
      ok = false
    }
    if (!ok) return null
    return {
      monthlyReturnPercent: monthlyReturn,
      monthlyIncomeBrl: income,
      lifeExpectancyYears: life,
      hasStoredOverrides: true,
    }
  }

  function fillScenarioFormFromState() {
    els.scenarioMonthlyReturn.value = String(scenario.monthlyReturnPercent)
    els.scenarioMonthlyIncome.value = formatMoneyBrlInput(
      scenario.monthlyIncomeBrl
    )
    els.scenarioLifeExpectancy.value = String(
      Math.round(scenario.lifeExpectancyYears)
    )
  }

  function openScenarioDialog() {
    scenario = loadEffectiveScenario()
    fillScenarioFormFromState()
    els.scenarioDialog.showModal()
    els.scenarioMonthlyReturn.focus()
  }

  function refreshResultsAfterScenarioChange() {
    if (lastCalcInput == null || els.stepResults.hidden) return
    const state = computeScenario(
      lastCalcInput.ageYears,
      lastCalcInput.priceBrl,
      monthlySalaryBrl,
      scenario
    )
    lastFutureValueBrl = state.fv
    renderResults(els, { ...state, monthlySalaryBrl })
    persistCalcMemory()
    setStep(els, 'results', { futureValueBrl: state.fv })
  }

  els.btnScenarioOpen.addEventListener('click', () => openScenarioDialog())

  els.btnScenarioClose.addEventListener('click', () => {
    els.scenarioDialog.close()
  })

  function restoreScenarioSiteDefaults() {
    clearScenarioStorage()
    scenario = { ...defaultScenarioValues(), hasStoredOverrides: false }
    fillScenarioFormFromState()
    monthlySalaryBrl = scenario.monthlyIncomeBrl
    refreshResultsAfterScenarioChange()
  }

  els.btnScenarioRestore.addEventListener('click', restoreScenarioSiteDefaults)
  els.btnScenarioResetHeader.addEventListener('click', restoreScenarioSiteDefaults)

  els.scenarioForm.addEventListener('submit', (e) => {
    e.preventDefault()
    const next = scenarioFormIntoScenario()
    if (!next) {
      els.scenarioForm.reportValidity()
      return
    }
    scenario = next
    saveScenarioToStorage({
      monthlyReturnPercent: next.monthlyReturnPercent,
      monthlyIncomeBrl: next.monthlyIncomeBrl,
      lifeExpectancyYears: Math.round(next.lifeExpectancyYears),
    })
    monthlySalaryBrl = next.monthlyIncomeBrl
    refreshResultsAfterScenarioChange()
    els.scenarioDialog.close()
  })

  els.scenarioMonthlyIncome.addEventListener('blur', () => {
    const n = parseMoneyBrl(els.scenarioMonthlyIncome.value)
    if (Number.isFinite(n) && n >= 0) {
      els.scenarioMonthlyIncome.value = formatMoneyBrlInput(n)
    }
  })

  let selectedGoodId = null
  let goodPickButtons = []

  els.age.value = '30'
  els.price.value = formatMoneyBrlInput(60000)

  try {
    const cat = await loadGoodsCatalog()
    const params = new URLSearchParams(window.location.search)
    const preGood = params.get('good')
    let preFound = null
    if (preGood && cat.items.length) {
      preFound = cat.items.find((g) => g.id === preGood)
      if (preFound) {
        els.price.value = formatMoneyBrlInput(preFound.priceBRL)
        selectedGoodId = preFound.id
      }
    }
    if (cat.items.length && els.goodPickGrid && els.goodPickField) {
      els.goodPickField.hidden = false
      els.goodPickGrid.innerHTML = cat.items
        .map((item) => {
          const img = item.image
            ? `<img class="good-pick-card__img" src="${escapeHtml(item.image)}" alt="" width="120" height="88" loading="lazy" />`
            : ''
          const pressed =
            selectedGoodId && item.id === selectedGoodId ? 'true' : 'false'
          return `<li>
  <button
    type="button"
    class="good-pick-card"
    data-good-id="${escapeHtml(item.id)}"
    data-price-brl="${Number(item.priceBRL)}"
    aria-pressed="${pressed}"
  >
    ${img}
    <span class="good-pick-card__body">
      <span class="good-pick-card__title">${escapeHtml(item.name)}</span>
      <span class="good-pick-card__price">${formatPriceBrl(item.priceBRL)}</span>
    </span>
  </button>
</li>`
        })
        .join('')
      goodPickButtons = els.goodPickGrid.querySelectorAll('.good-pick-card')
      for (const btn of goodPickButtons) {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-good-id')
          const raw = btn.getAttribute('data-price-brl')
          const amount = Number(raw)
          if (!Number.isFinite(amount) || amount <= 0) return
          selectedGoodId = id
          els.price.setCustomValidity('')
          els.price.value = formatMoneyBrlInput(amount)
          applyGoodPickPressedState(goodPickButtons, selectedGoodId)
          els.price.focus()
        })
      }
    }
  } catch {
    /* catalog optional */
  }

  setStep(els, 'input')

  els.price.addEventListener('input', () => {
    els.price.setCustomValidity('')
    selectedGoodId = null
    applyGoodPickPressedState(goodPickButtons, null)
  })

  els.price.addEventListener('blur', () => {
    const n = parseMoneyBrl(els.price.value)
    if (Number.isFinite(n) && n >= 0) {
      els.price.value = formatMoneyBrlInput(n)
    }
  })

  els.form.addEventListener('submit', (e) => {
    e.preventDefault()
    els.price.setCustomValidity('')
    const age = parsePositiveNumber(els.age.value, NaN)
    const price = parseMoneyBrl(els.price.value)
    if (!Number.isFinite(age) || !Number.isFinite(price) || price <= 0) {
      if (!Number.isFinite(price) || price <= 0) {
        els.price.setCustomValidity('Informe um valor em reais válido.')
      }
      els.price.reportValidity()
      return
    }
    els.price.value = formatMoneyBrlInput(price)
    const salaryFromField = parseMoneyBrl(els.monthlySalary.value)
    if (Number.isFinite(salaryFromField) && salaryFromField > 0) {
      monthlySalaryBrl = salaryFromField
    }
    lastCalcInput = { ageYears: age, priceBrl: price }
    const state = computeScenario(age, price, monthlySalaryBrl, scenario)
    lastFutureValueBrl = state.fv
    renderResults(els, { ...state, monthlySalaryBrl })
    persistCalcMemory()
    setStep(els, 'results', { futureValueBrl: state.fv })
    els.stepResults.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })

  els.btnBack.addEventListener('click', () => {
    setStep(els, 'input')
  })

  function readMonthlySalaryFromField() {
    const n = parseMoneyBrl(els.monthlySalary.value)
    return Number.isFinite(n) ? n : NaN
  }

  els.monthlySalary.addEventListener('input', () => {
    if (lastFutureValueBrl == null) return
    const raw = readMonthlySalaryFromField()
    applySalaryToResults(
      els,
      lastFutureValueBrl,
      Number.isFinite(raw) && raw > 0 ? raw : NaN
    )
    persistCalcMemory()
  })

  els.monthlySalary.addEventListener('blur', () => {
    if (lastFutureValueBrl == null) return
    const n = parseMoneyBrl(els.monthlySalary.value)
    if (Number.isFinite(n) && n > 0) {
      monthlySalaryBrl = n
      els.monthlySalary.value = formatMoneyBrlInput(n)
    } else {
      els.monthlySalary.value = formatMoneyBrlInput(monthlySalaryBrl)
    }
    applySalaryToResults(els, lastFutureValueBrl, monthlySalaryBrl)
    persistCalcMemory()
  })
}

main()
