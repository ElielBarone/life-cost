import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  clampHorizonYears,
  horizonMonths,
  futureValueCompound,
  realPurchasingPowerFromNominal,
  doublingMonths,
  monthsToReachMultiple,
  effectiveHorizonMonths,
  balanceSeries,
} from '../js/finance.js'

test('clampHorizonYears uses at least 5 years', () => {
  assert.equal(clampHorizonYears(76, 77), 5)
  assert.equal(clampHorizonYears(30, 77), 47)
})

test('horizonMonths rounds 12 * years', () => {
  assert.equal(horizonMonths(30, 77), 47 * 12)
})

test('futureValueCompound at 0% is principal', () => {
  assert.equal(futureValueCompound(1000, 0, 24), 1000)
})

test('futureValueCompound 1% monthly for 12 months', () => {
  const fv = futureValueCompound(100, 0.01, 12)
  assert.ok(Math.abs(fv - 100 * 1.01 ** 12) < 1e-9)
})

test('doublingMonths at 1% monthly', () => {
  const dm = doublingMonths(0.01)
  assert.ok(dm > 0)
  const check = 100 * (1.01 ** dm)
  assert.ok(Math.abs(check - 200) < 0.02)
})

test('monthsToReachMultiple for double at 1%', () => {
  const m = monthsToReachMultiple(0.01, 2)
  assert.ok(m != null)
  assert.ok(Math.abs(m - doublingMonths(0.01)) < 1e-6)
})

test('effectiveHorizonMonths respects override', () => {
  assert.equal(effectiveHorizonMonths(30, 77, 10), 120)
  assert.equal(effectiveHorizonMonths(30, 77, null), 47 * 12)
})

test('realPurchasingPowerFromNominal deflates by inflation', () => {
  const real = realPurchasingPowerFromNominal(1100, 0.1, 1)
  assert.ok(Math.abs(real - 1000) < 1)
})

test('balanceSeries includes endpoints', () => {
  const s = balanceSeries(100, 0.01, 24, 1000)
  assert.equal(s[0].month, 0)
  assert.equal(s[s.length - 1].month, 24)
})
