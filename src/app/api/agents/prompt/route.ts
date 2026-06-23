import { NextResponse } from 'next/server'
import { getCognitiveFormula, matchIntent, getBestAgentForIntent } from '@/lib/prompting'
import {
  resolveAgentData,
  buildAgentPromptContext,
  resolveCognitiveFormulaId,
  buildFormulaTemplate,
} from '@/lib/agent-helpers'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const data = await resolveAgentData(body)
    if (!data) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }

    const systemPrompt = buildAgentPromptContext(data)
    const formulaId = resolveCognitiveFormulaId(data.formula)
    const cognitiveFormula = getCognitiveFormula(formulaId)
    const intentMatch = data.description ? matchIntent(data.description) : null
    const bestRole = intentMatch ? getBestAgentForIntent(intentMatch.intent) : null
    const formulaTemplate = cognitiveFormula ? buildFormulaTemplate(formulaId, data) : null

    return NextResponse.json({
      agent: { name: data.name, formula: data.formula, role: data.role, roleGroup: data.roleGroup, description: data.description },
      systemPrompt,
      cognitiveFormula: cognitiveFormula
        ? { id: cognitiveFormula.id, name: cognitiveFormula.name, category: cognitiveFormula.category }
        : null,
      formulaTemplate,
      intentMatch: intentMatch
        ? { intent: intentMatch.intent, confidence: intentMatch.confidence, keywords: intentMatch.keywords }
        : null,
      bestAgentRole: bestRole
        ? { id: bestRole.id, name: bestRole.name, temperature: bestRole.temperature }
        : null,
    })
  } catch (error) {
    console.error('Agent prompt generation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}