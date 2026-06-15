import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (userId) {
      const attempts = await db.mockSimulationAttempt.findMany({
        where: { userId },
        include: { simulation: true },
        orderBy: { completedAt: 'desc' },
      })
      return NextResponse.json({ attempts })
    }

    const simulations = await db.mockSimulation.findMany({
      where: { isActive: true },
      include: { _count: { select: { attempts: true } } },
    })
    return NextResponse.json({ simulations })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const {
      userId,
      simulationTitle,
      simulationType,
      score,
      communicationScore,
      technicalScore,
      productKnowledgeScore,
      salesScore,
      feedback,
      aiFeedback,
      answers,
    } = data

    if (!userId || !simulationTitle) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Find or create the MockSimulation record
    let simulation = await db.mockSimulation.findFirst({
      where: { title: simulationTitle },
    })

    if (!simulation) {
      simulation = await db.mockSimulation.create({
        data: {
          title: simulationTitle,
          type: simulationType || 'field_sales',
          description: `${simulationTitle} simulation`,
          scenario: JSON.stringify({}),
          isActive: true,
        },
      })
    }

    // Create the attempt
    const attempt = await db.mockSimulationAttempt.create({
      data: {
        userId,
        mockSimulationId: simulation.id,
        score: score || 0,
        communicationScore: communicationScore || 0,
        technicalScore: technicalScore || 0,
        productKnowledgeScore: productKnowledgeScore || 0,
        salesScore: salesScore || 0,
        feedback: feedback || null,
        aiFeedback: aiFeedback || null,
        completedAt: new Date(),
      },
    })

    // Create activity
    await db.activity.create({
      data: {
        userId,
        type: 'mock_simulation',
        description: `Completed ${simulationTitle} simulation — Score: ${score}%`,
        metadata: JSON.stringify({
          score,
          communicationScore,
          technicalScore,
          productKnowledgeScore,
          salesScore,
          answers,
        }),
      },
    })

    return NextResponse.json({ attempt }, { status: 201 })
  } catch (error: any) {
    console.error('Simulation save error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
