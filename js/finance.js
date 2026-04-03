export function clampHorizonYears(ageYears, lifeExpectancyYears) {
  const natural = lifeExpectancyYears - ageYears
  return Math.max(5, natural)
}

export function horizonMonths(ageYears, lifeExpectancyYears) {
  const years = clampHorizonYears(ageYears, lifeExpectancyYears)
  return Math.round(years * 12)
}

export function effectiveHorizonMonths(
  ageYears,
  lifeExpectancyYears,
  overrideYears
) {
  if (
    overrideYears != null &&
    Number.isFinite(overrideYears) &&
    overrideYears > 0
  ) {
    return Math.round(overrideYears * 12)
  }
  return horizonMonths(ageYears, lifeExpectancyYears)
}

export function effectiveHorizonYears(
  ageYears,
  lifeExpectancyYears,
  overrideYears
) {
  return effectiveHorizonMonths(ageYears, lifeExpectancyYears, overrideYears) / 12
}

export function futureValueCompound(principal, monthlyRateDecimal, months) {
  if (months <= 0) return principal
  return principal * (1 + monthlyRateDecimal) ** months
}

export function realPurchasingPowerFromNominal(
  nominalFv,
  annualInflationDecimal,
  yearsHorizon
) {
  if (yearsHorizon <= 0) return nominalFv
  if (annualInflationDecimal <= 0) return nominalFv
  return nominalFv / (1 + annualInflationDecimal) ** yearsHorizon
}

export function hourlyRateFromMonthly(monthlyIncome, hoursPerMonth = 220) {
  if (monthlyIncome <= 0 || hoursPerMonth <= 0) return null
  return monthlyIncome / hoursPerMonth
}

export function workHoursForAmount(amountBrl, hourlyRate) {
  if (hourlyRate == null || hourlyRate <= 0) return null
  return amountBrl / hourlyRate
}

export function doublingMonths(monthlyRateDecimal) {
  if (monthlyRateDecimal <= 0) return null
  return Math.log(2) / Math.log(1 + monthlyRateDecimal)
}

export function monthsToReachMultiple(monthlyRateDecimal, multiple) {
  if (multiple <= 1 || monthlyRateDecimal <= 0) return null
  return Math.log(multiple) / Math.log(1 + monthlyRateDecimal)
}

export function milestoneMultiples(
  monthlyRateDecimal,
  maxMultiple = 8,
  maxMonths = 600
) {
  if (monthlyRateDecimal <= 0) return []
  const out = []
  for (let k = 2; k <= maxMultiple; k += 1) {
    const m = monthsToReachMultiple(monthlyRateDecimal, k)
    if (m == null || m > maxMonths) break
    out.push({ multiple: k, months: m })
  }
  return out
}

export function balanceSeries(principal, monthlyRateDecimal, totalMonths, maxPoints = 120) {
  if (totalMonths <= 0) {
    return [{ month: 0, balance: principal }]
  }
  const step = Math.max(1, Math.ceil(totalMonths / maxPoints))
  const series = []
  for (let m = 0; m < totalMonths; m += step) {
    series.push({
      month: m,
      balance: futureValueCompound(principal, monthlyRateDecimal, m),
    })
  }
  const last = series[series.length - 1]
  if (last.month !== totalMonths) {
    series.push({
      month: totalMonths,
      balance: futureValueCompound(principal, monthlyRateDecimal, totalMonths),
    })
  }
  return series
}
