import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { resolvePromptingMeta, resolveFormulaMeta, resolveSystemPrompt } from '@/lib/agent-helpers'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const includeRelations = searchParams.get('include') === 'true'

    const agents = await db.agent.findMany({
      include: includeRelations
        ? { children: { select: { id: true, name: true, status: true } }, tasks: { select: { id: true, title: true, status: true } } }
        : false,
      orderBy: { createdAt: 'asc' },
    })
    return NextResponse.json(agents)
  } catch (error) {
    console.error('Failed to fetch agents:', error)
    return NextResponse.json({ error: 'Failed to fetch agents' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const [promptingMeta, formulaMeta, generatedSystemPrompt] = await Promise.all([
      resolvePromptingMeta(body.role, body.description),
      resolveFormulaMeta(body.formula),
      resolveSystemPrompt(body.role),
    ])

    const agent = await db.agent.create({
      data: {
        name: body.name, role: body.role, roleGroup: body.roleGroup,
        status: body.status || 'active', formula: body.formula,
        parentId: body.parentId || null, twinId: body.twinId || null,
        skills: body.skills || '', description: body.description || '', avatar: body.avatar || '',
      },
    })

    return NextResponse.json({
      ...agent,
      prompting: { ...promptingMeta, formulaMeta, generatedSystemPrompt },
    }, { status: 201 })
  } catch (error) {
    console.error('Failed to create agent:', error)
    return NextResponse.json({ error: 'Failed to create agent' }, { status: 500 })
  }
}