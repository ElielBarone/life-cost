import {
  monthlyReturnPercent as defaultMonthlyReturnPercent,
  monthlyIncomeBrl as defaultMonthlyIncomeBrl,
  lifeExpectancyYears as defaultLifeExpectancyYears,
} from './config.js'

export const SCENARIO_STORAGE_KEY = 'life-cost-scenario-v1'

export function defaultScenarioValues() {
  return {
    monthlyReturnPercent: defaultMonthlyReturnPercent,
    monthlyIncomeBrl: defaultMonthlyIncomeBrl,
    lifeExpectancyYears: defaultLifeExpectancyYears,
  }
}

export function readStoredScenarioRaw() {
  try {
    const raw = localStorage.getItem(SCENARIO_STORAGE_KEY)
    if (!raw) return null
    const o = JSON.parse(raw)
    if (!o || typeof o !== 'object') return null
    return o
  } catch {
    return null
  }
}

function pickValidMonthlyReturn(n) {
  if (typeof n !== 'number' || !Number.isFinite(n) || n < 0 || n > 100) return null
  return n
}

function pickValidIncome(n) {
  if (typeof n !== 'number' || !Number.isFinite(n) || n <= 0) return null
  return n
}

function pickValidLifeExpectancy(n) {
  if (typeof n !== 'number' || !Number.isFinite(n) || n < 1 || n > 120) return null
  return n
}

export function parseStoredScenarioPatch(o) {
  if (!o) return {}
  const patch = {}
  const r = pickValidMonthlyReturn(o.monthlyReturnPercent)
  if (r != null) patch.monthlyReturnPercent = r
  const inc = pickValidIncome(o.monthlyIncomeBrl)
  if (inc != null) patch.monthlyIncomeBrl = inc
  const le = pickValidLifeExpectancy(o.lifeExpectancyYears)
  if (le != null) patch.lifeExpectancyYears = le
  return patch
}

export function loadEffectiveScenario() {
  const defs = defaultScenarioValues()
  const patch = parseStoredScenarioPatch(readStoredScenarioRaw())
  return {
    monthlyReturnPercent:
      patch.monthlyReturnPercent ?? defs.monthlyReturnPercent,
    monthlyIncomeBrl: patch.monthlyIncomeBrl ?? defs.monthlyIncomeBrl,
    lifeExpectancyYears: patch.lifeExpectancyYears ?? defs.lifeExpectancyYears,
    hasStoredOverrides: Object.keys(patch).length > 0,
  }
}

export function saveScenarioToStorage(values) {
  localStorage.setItem(
    SCENARIO_STORAGE_KEY,
    JSON.stringify({
      monthlyReturnPercent: values.monthlyReturnPercent,
      monthlyIncomeBrl: values.monthlyIncomeBrl,
      lifeExpectancyYears: values.lifeExpectancyYears,
    })
  )
}

export function clearScenarioStorage() {
  localStorage.removeItem(SCENARIO_STORAGE_KEY)
}
