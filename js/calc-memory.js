export const CALC_MEMORY_STORAGE_KEY = 'life-cost-calc-memory'

export function writeCalcMemorySnapshot(obj) {
  try {
    sessionStorage.setItem(CALC_MEMORY_STORAGE_KEY, JSON.stringify(obj))
  } catch {
    /* ignore */
  }
}
