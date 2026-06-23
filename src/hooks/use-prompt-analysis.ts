'use client'

import { useState, useCallback } from 'react'
import type { PromptAnalysis, ExecutionData } from './prompt-analysis-types'
import { safeJson, buildAnalysisFromLlm, buildAnalysisFromFallback } from './prompt-analysis-helpers'
import { executeWorkflowSimulation } from './prompt-analysis-executor'

// Re-export types for consumers
export type { PipelineStepDraft, PromptAnalysis, StepResult, ExecutionData } from './prompt-analysis-types'

export function usePromptAnalysis() {
  const [prompt, setPrompt] = useState('')
  const [analysis, setAnalysis] = useState<PromptAnalysis | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [executing, setExecuting] = useState(false)
  const [executionResult, setExecutionResult] = useState<ExecutionData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const analyze = useCallback(async () => {
    if (!prompt.trim()) return
    setAnalyzing(true)
    setError(null)
    setExecutionResult(null)

    try {
      const llmRes = await fetch('/api/prompting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })
      if (!llmRes.ok) throw new Error(`LLM analysis failed (HTTP ${llmRes.status})`)
      const llmData = await safeJson(llmRes)
      setAnalysis(buildAnalysisFromLlm(llmData, prompt))
    } catch {
      try {
        setAnalysis(await buildAnalysisFromFallback(prompt))
      } catch (fallbackErr) {
        setError(fallbackErr instanceof Error ? fallbackErr.message : 'Analysis failed')
      }
    } finally {
      setAnalyzing(false)
    }
  }, [prompt])

  const clear = useCallback(() => {
    setPrompt('')
    setAnalysis(null)
    setExecutionResult(null)
    setError(null)
  }, [])

  const executeSimulation = useCallback(async () => {
    if (!analysis) return
    setExecuting(true)
    setError(null)
    try {
      const result = await executeWorkflowSimulation(
        analysis.intent.intent, prompt, analysis.pipelineSteps,
        { confidence: analysis.intent.confidence, formula: analysis.recommendedFormula?.name || '' },
      )
      setExecutionResult(result)
    } catch (err) {
      console.error('Execution failed:', err)
      setError(err instanceof Error ? err.message : 'Execution failed')
    } finally {
      setExecuting(false)
    }
  }, [analysis, prompt])

  return {
    prompt, setPrompt, analysis, analyzing, executing,
    executionResult, error, analyze, clear, executeSimulation,
  }
}