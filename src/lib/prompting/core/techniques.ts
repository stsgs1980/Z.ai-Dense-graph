/**
 * @stsgs/prompting -- 20 Prompting Techniques
 * Each technique has: id, name, description, category, applicableTo,
 * difficulty, and a concrete example.
 */

import type { PromptTechnique, TechniqueCategory, OutputFormat } from './types'
import { clarityTechniques } from './techniques-clarity'
import { advancedTechniques } from './techniques-advanced'

const techniques: PromptTechnique[] = [...clarityTechniques, ...advancedTechniques]

/** Get all techniques, optionally filtered by category. */
export function getTechniques(filter?: TechniqueCategory): PromptTechnique[] {
  if (!filter) return techniques
  return techniques.filter(t => t.category === filter)
}

/** Get a single technique by ID. */
export function getTechnique(id: string): PromptTechnique | undefined {
  return techniques.find(t => t.id === id)
}

/** Get techniques applicable to a given output format. */
export function getTechniquesForFormat(format: OutputFormat): PromptTechnique[] {
  return techniques.filter(t => t.applicableTo.includes(format))
}

/** Get technique IDs for a given difficulty level. */
export function getTechniquesByDifficulty(level: 'beginner' | 'intermediate' | 'advanced'): string[] {
  return techniques.filter(t => t.difficulty === level).map(t => t.id)
}

export { techniques }