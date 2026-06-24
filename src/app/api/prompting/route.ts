import { NextResponse } from 'next/server'
import { handlePromptingSection } from '@/shared/lib/prompting-api-handlers'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    return handlePromptingSection(
      searchParams.get('section'),
      searchParams.get('id'),
      searchParams.get('query'),
      searchParams,
    )
  } catch (error) {
    console.error('Prompting API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}