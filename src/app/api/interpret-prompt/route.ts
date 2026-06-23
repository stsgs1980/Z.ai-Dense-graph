import { NextRequest, NextResponse } from 'next/server'
import { callInterpretLLM } from '@/lib/interpret-prompt-helpers'
import { buildEnhancedSystemPrompt, evaluatePromptQuality, parseAndValidate } from './prompts'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { prompt } = body

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    const trimmed = prompt.trim()
    const systemPrompt = buildEnhancedSystemPrompt(trimmed)
    const quality = evaluatePromptQuality(trimmed)

    let llmResponse: string
    try {
      llmResponse = await callInterpretLLM(systemPrompt, trimmed)
    } catch (err) {
      const details = err instanceof Error ? err.message : String(err)
      return NextResponse.json({ error: 'LLM call failed', details }, { status: 502 })
    }

    try {
      const parsed = parseAndValidate(llmResponse)
      return NextResponse.json({ success: true, source: 'llm', result: parsed, promptQuality: quality })
    } catch {
      return NextResponse.json({
        success: false, error: 'Failed to parse AI response as JSON',
        raw: llmResponse, promptQuality: quality,
      })
    }
  } catch (error) {
    console.error('Interpret prompt error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 },
    )
  }
}