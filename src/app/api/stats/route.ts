import { NextResponse } from 'next/server'
import { computeStats } from '@/shared/lib/stats-computations'

export async function GET() {
  try {
    const stats = await computeStats()
    return NextResponse.json(stats)
  } catch (error) {
    console.error('Failed to compute stats:', error)
    return NextResponse.json(
      { error: 'Failed to compute stats' },
      { status: 500 }
    )
  }
}