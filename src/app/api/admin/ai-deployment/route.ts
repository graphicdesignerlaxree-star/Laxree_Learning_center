import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import ZAI from 'z-ai-web-dev-sdk'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const employeeId = searchParams.get('employeeId')
    const batch = searchParams.get('batch') === 'true'

    if (batch) {
      // Batch analysis: analyze ALL employees
      const employees = await db.user.findMany({
        where: { role: 'EMPLOYEE', isActive: true },
        include: {
          department: { select: { name: true } },
          assessmentAttempts: { orderBy: { completedAt: 'desc' }, take: 10 },
          mockSimulations: { orderBy: { completedAt: 'desc' }, take: 10 },
          moduleCompletions: true,
          enrollments: true,
        },
      })

      const batchResults = employees.map((emp) => {
        const quizAttempts = emp.assessmentAttempts.filter(a => a.completedAt !== null)
        const avgQuizScore = quizAttempts.length > 0
          ? Math.round(quizAttempts.reduce((sum, a) => sum + a.percentage, 0) / quizAttempts.length)
          : 0

        const simAttempts = emp.mockSimulations
        const avgSimScore = simAttempts.length > 0
          ? Math.round(simAttempts.reduce((sum, s) => sum + s.score, 0) / simAttempts.length)
          : 0
        const avgCommunication = simAttempts.length > 0
          ? Math.round(simAttempts.reduce((sum, s) => sum + s.communicationScore, 0) / simAttempts.length)
          : 0
        const avgTechnical = simAttempts.length > 0
          ? Math.round(simAttempts.reduce((sum, s) => sum + s.technicalScore, 0) / simAttempts.length)
          : 0
        const avgProductKnowledge = simAttempts.length > 0
          ? Math.round(simAttempts.reduce((sum, s) => sum + s.productKnowledgeScore, 0) / simAttempts.length)
          : 0
        const avgSales = simAttempts.length > 0
          ? Math.round(simAttempts.reduce((sum, s) => sum + s.salesScore, 0) / simAttempts.length)
          : 0

        const totalEnrollments = emp.enrollments.length
        const trainingProgress = totalEnrollments > 0
          ? Math.round(emp.enrollments.reduce((sum, e) => sum + e.progress, 0) / totalEnrollments)
          : 0

        const completedModules = emp.moduleCompletions.filter(m => m.completed).length
        const totalModules = emp.moduleCompletions.length

        // Algorithm-based recommendation (fast, no AI call for batch)
        let recommendation: string
        let reasoning: string[] = []
        let confidence: number

        const readiness = emp.aiReadinessScore

        if (readiness >= 70 && avgQuizScore >= 65 && avgSimScore >= 60) {
          if (avgCommunication >= 65 && avgSales >= 60) {
            recommendation = '✅ Ready for Field'
            reasoning = [
              `High AI readiness score (${Math.round(readiness)}%)`,
              `Strong quiz scores (${avgQuizScore}%)`,
              `Good simulation performance (${avgSimScore}%)`,
              `Excellent communication skills (${avgCommunication}%)`,
            ]
            confidence = 90
          } else if (avgCommunication >= 50) {
            recommendation = '✅ Ready for Inbound Calls'
            reasoning = [
              `Good AI readiness score (${Math.round(readiness)}%)`,
              `Solid product knowledge (${avgQuizScore}%)`,
              `Communication adequate for inbound (${avgCommunication}%)`,
            ]
            confidence = 85
          } else {
            recommendation = '🔄 Recommended: Start with Inbound, then Field'
            reasoning = [
              `Good readiness (${Math.round(readiness)}%) but communication needs improvement`,
              `Product knowledge is strong (${avgQuizScore}%)`,
              `Start with inbound calls to build confidence`,
            ]
            confidence = 75
          }
        } else if (readiness >= 50 && avgQuizScore >= 50) {
          recommendation = '🔄 Recommended: Start with Inbound, then Field'
          reasoning = [
            `Moderate readiness (${Math.round(readiness)}%)`,
            `Product knowledge needs improvement (${avgQuizScore}%)`,
            `Simulation scores indicate potential (${avgSimScore}%)`,
            `Build skills through inbound first`,
          ]
          confidence = 65
        } else {
          recommendation = '⚠️ Needs More Training'
          reasoning = [
            `Low AI readiness score (${Math.round(readiness)}%)`,
            avgQuizScore < 50 ? `Quiz scores below threshold (${avgQuizScore}%)` : '',
            avgSimScore < 40 ? `Simulation scores too low (${avgSimScore}%)` : '',
            trainingProgress < 50 ? `Training progress insufficient (${trainingProgress}%)` : '',
          ].filter(Boolean)
          confidence = 80
        }

        return {
          id: emp.id,
          fullName: emp.fullName || 'Unknown',
          employeeId: emp.employeeId,
          department: emp.department?.name || null,
          aiReadinessScore: Math.round(readiness),
          currentLevel: emp.currentLevel || 'Beginner',
          fieldReady: emp.fieldReady,
          inboundReady: emp.inboundReady,
          avgQuizScore,
          avgSimScore,
          trainingProgress,
          recommendation,
          reasoning,
          confidence,
        }
      })

      // Summary counts
      const fieldReadyCount = batchResults.filter(r => r.recommendation.includes('Ready for Field')).length
      const inboundReadyCount = batchResults.filter(r => r.recommendation.includes('Ready for Inbound')).length
      const needsTrainingCount = batchResults.filter(r => r.recommendation.includes('Needs More Training')).length
      const transitionCount = batchResults.filter(r => r.recommendation.includes('Start with Inbound')).length

      return NextResponse.json({
        employees: batchResults,
        summary: {
          total: batchResults.length,
          fieldReady: fieldReadyCount,
          inboundReady: inboundReadyCount,
          needsTraining: needsTrainingCount,
          transition: transitionCount,
        },
      })
    }

    // Single employee analysis with AI
    if (!employeeId) {
      return NextResponse.json({ error: 'employeeId is required' }, { status: 400 })
    }

    const employee = await db.user.findUnique({
      where: { id: employeeId },
      include: {
        department: { select: { name: true } },
        assessmentAttempts: { orderBy: { completedAt: 'desc' }, take: 20 },
        mockSimulations: { orderBy: { completedAt: 'desc' }, take: 20 },
        moduleCompletions: { include: { module: { select: { title: true, course: { select: { title: true, moduleType: true } } } } } },
        enrollments: { include: { course: { select: { title: true, moduleType: true } } } },
      },
    })

    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 })
    }

    // Calculate detailed metrics
    const quizAttempts = employee.assessmentAttempts.filter(a => a.completedAt !== null)
    const avgQuizScore = quizAttempts.length > 0
      ? Math.round(quizAttempts.reduce((sum, a) => sum + a.percentage, 0) / quizAttempts.length)
      : 0

    const simAttempts = employee.mockSimulations
    const avgSimScore = simAttempts.length > 0
      ? Math.round(simAttempts.reduce((sum, s) => sum + s.score, 0) / simAttempts.length)
      : 0
    const avgCommunication = simAttempts.length > 0
      ? Math.round(simAttempts.reduce((sum, s) => sum + s.communicationScore, 0) / simAttempts.length)
      : 0
    const avgTechnical = simAttempts.length > 0
      ? Math.round(simAttempts.reduce((sum, s) => sum + s.technicalScore, 0) / simAttempts.length)
      : 0
    const avgProductKnowledge = simAttempts.length > 0
      ? Math.round(simAttempts.reduce((sum, s) => sum + s.productKnowledgeScore, 0) / simAttempts.length)
      : 0
    const avgSales = simAttempts.length > 0
      ? Math.round(simAttempts.reduce((sum, s) => sum + s.salesScore, 0) / simAttempts.length)
      : 0

    const totalEnrollments = employee.enrollments.length
    const trainingProgress = totalEnrollments > 0
      ? Math.round(employee.enrollments.reduce((sum, e) => sum + e.progress, 0) / totalEnrollments)
      : 0

    const completedModules = employee.moduleCompletions.filter(m => m.completed).length
    const totalModules = employee.moduleCompletions.length

    // Build context for AI
    const employeeContext = `
Employee: ${employee.fullName || 'Unknown'}
Employee ID: ${employee.employeeId || 'N/A'}
Department: ${employee.department?.name || 'N/A'}
Designation: ${employee.designation || 'N/A'}
Current Level: ${employee.currentLevel || 'Beginner'}
AI Readiness Score: ${Math.round(employee.aiReadinessScore)}%
Field Ready: ${employee.fieldReady ? 'Yes' : 'No'}
Inbound Ready: ${employee.inboundReady ? 'Yes' : 'No'}

TRAINING METRICS:
- Training Progress: ${trainingProgress}%
- Total Enrollments: ${totalEnrollments}
- Modules Completed: ${completedModules}/${totalModules}

QUIZ/ASSESSMENT METRICS:
- Average Quiz Score: ${avgQuizScore}%
- Total Quiz Attempts: ${quizAttempts.length}
- Pass Rate: ${quizAttempts.length > 0 ? Math.round(quizAttempts.filter(a => a.passed).length / quizAttempts.length * 100) : 0}%

SIMULATION METRICS:
- Average Simulation Score: ${avgSimScore}%
- Communication Score: ${avgCommunication}%
- Technical Score: ${avgTechnical}%
- Product Knowledge Score: ${avgProductKnowledge}%
- Sales Score: ${avgSales}%
- Total Simulation Attempts: ${simAttempts.length}

COURSE PROGRESS:
${employee.enrollments.map(e => `- ${e.course.title}: ${e.progress}% (${e.status})`).join('\n')}

MODULE COMPLETION:
${employee.moduleCompletions.map(m => `- ${m.module.title}: ${m.completed ? 'Completed' : 'In Progress'} (Score: ${m.score || 'N/A'})`).join('\n')}
`.trim()

    // Use AI SDK to generate recommendation
    let aiRecommendation = ''
    let aiStructured: any = null

    try {
      const zai = await ZAI.create()
      const response = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: `You are an AI advisor for LAXREE Hospitality Solutions, a luxury hotel amenities company. Your job is to analyze employee performance data and recommend whether an employee should:
(A) Handle inbound sales calls (phone/WhatsApp sales to hotels)
(B) Be deployed for field sales visits (face-to-face meetings with architects, hotel owners, procurement teams)
(C) Need more training before any deployment
(D) Start with inbound calls first, then transition to field visits

Consider these factors:
- Product knowledge (quiz scores) - Critical for both inbound and field
- Communication skills (simulation scores) - More critical for inbound calls
- Sales skills (simulation scores) - Important for both
- Technical knowledge - More important for field visits where product demos happen
- Training completion - Should be at least 60% before deployment
- Current level - Beginners should not be deployed

Respond in this exact JSON format (no markdown, no code blocks):
{
  "recommendation": "One of: Ready for Field, Ready for Inbound Calls, Needs More Training, Start with Inbound then Field",
  "verdict": "A short emoji-prefixed verdict like ✅ Ready for Field or ⚠️ Needs More Training",
  "reasoning": ["point 1", "point 2", "point 3"],
  "confidence": 85,
  "suggestedModules": ["module name 1", "module name 2"],
  "strengths": ["strength 1", "strength 2"],
  "weaknesses": ["weakness 1", "weakness 2"],
  "deploymentReadiness": {
    "field": { "ready": true/false, "score": 75 },
    "inbound": { "ready": true/false, "score": 80 }
  }
}`,
          },
          {
            role: 'user',
            content: `Based on the following employee performance data, provide your deployment recommendation:\n\n${employeeContext}`,
          },
        ],
      })

      // Parse AI response
      const content = response.choices?.[0]?.message?.content || ''
      aiRecommendation = content

      // Try to extract JSON from the response
      try {
        // Remove markdown code blocks if present
        const jsonMatch = content.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          aiStructured = JSON.parse(jsonMatch[0])
        }
      } catch {
        // If parsing fails, use fallback
        aiStructured = null
      }
    } catch (aiError) {
      console.error('AI SDK error, using fallback:', aiError)
    }

    // Build fallback recommendation if AI fails
    if (!aiStructured) {
      const readiness = employee.aiReadinessScore
      let recommendation: string
      let verdict: string
      let reasoning: string[] = []
      let confidence: number
      let fieldReady = false
      let inboundReady = false
      let fieldScore = 0
      let inboundScore = 0
      let strengths: string[] = []
      let weaknesses: string[] = []
      let suggestedModules: string[] = []

      // Calculate field and inbound scores
      fieldScore = Math.round(
        (avgQuizScore * 0.3 + avgTechnical * 0.25 + avgCommunication * 0.2 + avgSales * 0.15 + trainingProgress * 0.1)
      )
      inboundScore = Math.round(
        (avgQuizScore * 0.25 + avgCommunication * 0.3 + avgSales * 0.25 + avgProductKnowledge * 0.1 + trainingProgress * 0.1)
      )

      fieldReady = fieldScore >= 65 && readiness >= 60
      inboundReady = inboundScore >= 60 && readiness >= 50

      if (fieldReady && inboundReady) {
        recommendation = 'Ready for Field'
        verdict = '✅ Ready for Field'
        reasoning = [`High AI readiness (${Math.round(readiness)}%)`, `Strong product knowledge (${avgQuizScore}%)`, `Excellent communication (${avgCommunication}%)`]
        confidence = 90
      } else if (inboundReady) {
        recommendation = 'Start with Inbound then Field'
        verdict = '🔄 Recommended: Start with Inbound, then Field'
        reasoning = [`Adequate readiness for inbound (${Math.round(readiness)}%)`, `Communication skills sufficient (${avgCommunication}%)`, `Needs field experience before deployment`]
        confidence = 75
      } else if (readiness >= 50) {
        recommendation = 'Ready for Inbound Calls'
        verdict = '✅ Ready for Inbound Calls'
        reasoning = [`Moderate readiness (${Math.round(readiness)}%)`, `Can handle inbound with support`]
        confidence = 65
      } else {
        recommendation = 'Needs More Training'
        verdict = '⚠️ Needs More Training'
        reasoning = [`Low readiness score (${Math.round(readiness)}%)`, avgQuizScore < 50 ? `Quiz scores below threshold (${avgQuizScore}%)` : '', avgSimScore < 40 ? `Simulation scores too low (${avgSimScore}%)` : '', trainingProgress < 50 ? `Training incomplete (${trainingProgress}%)` : '']
        confidence = 80
        suggestedModules = ['Product Knowledge Fundamentals', 'Communication Skills', 'Sales Process Basics']
      }

      if (avgQuizScore >= 60) strengths.push(`Good product knowledge (${avgQuizScore}%)`)
      if (avgCommunication >= 60) strengths.push(`Strong communication (${avgCommunication}%)`)
      if (avgSales >= 60) strengths.push(`Sales skills (${avgSales}%)`)
      if (avgQuizScore < 50) weaknesses.push(`Low product knowledge (${avgQuizScore}%)`)
      if (avgCommunication < 50) weaknesses.push(`Weak communication (${avgCommunication}%)`)
      if (trainingProgress < 50) weaknesses.push(`Incomplete training (${trainingProgress}%)`)

      aiStructured = {
        recommendation,
        verdict,
        reasoning: reasoning.filter(Boolean),
        confidence,
        suggestedModules,
        strengths,
        weaknesses: weaknesses.filter(Boolean),
        deploymentReadiness: {
          field: { ready: fieldReady, score: fieldScore },
          inbound: { ready: inboundReady, score: inboundScore },
        },
      }
    }

    return NextResponse.json({
      employee: {
        id: employee.id,
        fullName: employee.fullName,
        email: employee.email,
        employeeId: employee.employeeId,
        department: employee.department?.name,
        designation: employee.designation,
        currentLevel: employee.currentLevel,
        aiReadinessScore: Math.round(employee.aiReadinessScore),
        fieldReady: employee.fieldReady,
        inboundReady: employee.inboundReady,
      },
      metrics: {
        avgQuizScore,
        avgSimScore,
        avgCommunication,
        avgTechnical,
        avgProductKnowledge,
        avgSales,
        trainingProgress,
        completedModules,
        totalModules,
        totalEnrollments,
        quizAttempts: quizAttempts.length,
        simAttempts: simAttempts.length,
      },
      recommendation: aiStructured,
      aiRawResponse: aiRecommendation,
    })
  } catch (error: any) {
    console.error('AI Deployment API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { employeeId, fieldReady, inboundReady, assignedTraining } = body

    if (!employeeId) {
      return NextResponse.json({ error: 'employeeId is required' }, { status: 400 })
    }

    const updateData: any = {}
    if (typeof fieldReady === 'boolean') updateData.fieldReady = fieldReady
    if (typeof inboundReady === 'boolean') updateData.inboundReady = inboundReady

    // Update employee readiness flags
    const updated = await db.user.update({
      where: { id: employeeId },
      data: updateData,
    })

    // If training modules are assigned, create improvement plans
    if (assignedTraining && Array.isArray(assignedTraining) && assignedTraining.length > 0) {
      const adminUser = await db.user.findFirst({
        where: { role: 'SUPER_ADMIN' },
        select: { id: true },
      })

      for (const training of assignedTraining) {
        await db.improvementPlan.create({
          data: {
            employeeId,
            assignedBy: adminUser?.id || employeeId,
            title: training.title || 'Additional Training Required',
            description: training.description || `Assigned as part of AI deployment recommendation`,
            type: training.type || 'retraining',
            status: 'assigned',
            dueDate: training.dueDate ? new Date(training.dueDate) : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          },
        })
      }
    }

    // Log activity
    await db.activity.create({
      data: {
        userId: employeeId,
        type: 'readiness_update',
        description: `Readiness updated: Field=${updateData.fieldReady ?? 'unchanged'}, Inbound=${updateData.inboundReady ?? 'unchanged'}`,
        metadata: JSON.stringify({ fieldReady: updateData.fieldReady, inboundReady: updateData.inboundReady }),
      },
    })

    return NextResponse.json({
      success: true,
      employee: {
        id: updated.id,
        fullName: updated.fullName,
        fieldReady: updated.fieldReady,
        inboundReady: updated.inboundReady,
      },
    })
  } catch (error: any) {
    console.error('AI Deployment POST error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
