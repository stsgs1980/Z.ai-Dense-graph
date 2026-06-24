/**
 * @stsgs/prompting -- CORE-EEAT Benchmark Engine
 * 40 automated checks for prompt quality across 8 categories.
 * EEAT = Expertise, Experience, Authority, Trustworthiness.
 */

import type { BenchmarkResult, BenchmarkCheck, Grade } from '../core/types'
import { numericToGrade } from './scoring'
import { CHECKS_PART1, type CheckDef } from './checks-1'
import { CHECKS_PART2 } from './checks-2'

// ─── Check Definitions ───────────────────────────────────────

const CHECKS: CheckDef[] = [...CHECKS_PART1, ...CHECKS_PART2]

// ─── Public API ──────────────────────────────────────────────

/**
 * Run the full CORE-EEAT benchmark (40 checks) on a prompt.
 *
 * @param prompt - The prompt text to benchmark
 * @returns BenchmarkResult with total score, grade, and per-check details
 */
export function runBenchmark(prompt: string): BenchmarkResult {
  const checks: BenchmarkCheck[] = CHECKS.map(check => {
    const passed = check.test(prompt)
    return {
      id: check.id,
      category: check.category,
      description: check.description,
      passed,
      severity: check.severity,
      details: check.detail(prompt, passed),
    }
  })

  const passed = checks.filter(c => c.passed).length
  const failed = checks.length - passed
  const score = Math.round((passed / checks.length) * 100)
  const grade = numericToGrade(score)

  return {
    totalChecks: checks.length,
    passed,
    failed,
    score,
    grade,
    checks,
  }
}

/**
 * Run a quick benchmark (critical checks only).
 * Useful for real-time feedback where full benchmark is too slow.
 */
export function quickBenchmark(prompt: string): { score: number; grade: Grade; criticalPassed: number; criticalTotal: number } {
  const criticalChecks = CHECKS.filter(c => c.severity === 'critical')
  const results = criticalChecks.map(c => ({ check: c, passed: c.test(prompt) }))
  const passed = results.filter(r => r.passed).length
  const score = Math.round((passed / criticalChecks.length) * 100)
  return { score, grade: numericToGrade(score), criticalPassed: passed, criticalTotal: criticalChecks.length }
}

/**
 * Get checks for a specific category.
 */
export function getChecksByCategory(category: string): BenchmarkCheck[] {
  return CHECKS.filter(c => c.category === category).map(check => ({
    id: check.id,
    category: check.category,
    description: check.description,
    passed: false,
    severity: check.severity,
    details: '',
  }))
}

/**
 * Get all benchmark categories.
 */
export function getBenchmarkCategories(): string[] {
  return Array.from(new Set(CHECKS.map(c => c.category)))
}

export { CHECKS }