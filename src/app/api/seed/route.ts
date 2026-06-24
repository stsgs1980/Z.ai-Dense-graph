import { NextResponse } from 'next/server'
import { seedDatabase } from '@/shared/lib/seed-data'

export async function POST() {
  try {
    const result = await seedDatabase()
    return NextResponse.json({
      message: 'Agents and tasks seeded successfully',
      ...result,
    })
  } catch (error) {
    console.error('Failed to seed agents:', error)
    return NextResponse.json({ error: 'Failed to seed agents' }, { status: 500 })
  }
}