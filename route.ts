import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

type Action = 'résumé' | 'quiz' | 'fiche' | 'lesson_quiz'
type Subject = 'math' | 'français' | 'histoire' | 'science' | 'anglais'

const PROMPTS: Record<string, (theme: string, subject?: string) => string> = {
  lesson: (theme, subject) => `Tu es un professeur expert en ${subject || theme}. 
Crée une leçon courte et claire sur le thème "${theme}".

Réponds UNIQUEMENT en HTML avec ces balises : h2, h3, p, ul, li, strong, em.
Structure :
- <h2> titre du thème
- 3-4 sections <h3> avec explications claires
- Exemples concrets avec <ul>
- Section finale "À retenir" avec les points clés

Sois pédagogue et facile à comprendre.`,

  quiz: (theme, subject) => `Tu es un professeur. Crée EXACTEMENT 5 QCM sur le thème "${theme}" en ${subject || 'ce domaine'}.

Réponds UNIQUEMENT en JSON valide, rien d'autre, aucun markdown.
Format :
[{"q":"Question ?","opts":["A) ...","B) ...","C) ...","D) ..."],"ans":0,"explication":"Explication détaillée"}]
(ans = index 0-3 de la bonne réponse)

Les questions doivent tester la compréhension réelle du thème.`,
}

export async function POST(req: NextRequest) {
  try {
    const { action, theme, subject } = await req.json()

    if (!action || !theme) {
      return NextResponse.json({ error: 'Paramètres invalides' }, { status: 400 })
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'Clé API non configurée' }, { status: 500 })
    }

    // Cas spécial : leçon + quiz ensemble
    if (action === 'lesson_quiz') {
      const lessonRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 2000,
          messages: [{ role: 'user', content: PROMPTS.lesson(theme, subject) }],
        }),
      })

      if (!lessonRes.ok) {
        console.error('Anthropic lesson error:', await lessonRes.text())
        return NextResponse.json({ error: 'Erreur API leçon' }, { status: 502 })
      }

      const lessonData = await lessonRes.json()
      const lesson = lessonData.content
        .map((b: { type: string; text?: string }) => b.type === 'text' ? b.text : '')
        .join('')

      // Générer le quiz
      const quizRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1500,
          messages: [{ role: 'user', content: PROMPTS.quiz(theme, subject) }],
        }),
      })

      if (!quizRes.ok) {
        console.error('Anthropic quiz error:', await quizRes.text())
        return NextResponse.json({ error: 'Erreur API quiz' }, { status: 502 })
      }

      const quizData = await quizRes.json()
      const quiz = quizData.content
        .map((b: { type: string; text?: string }) => b.type === 'text' ? b.text : '')
        .join('')

      return NextResponse.json({ lesson, quiz })
    }

    // Autres actions (résumé, quiz seul, fiche)
    const prompt = action === 'résumé' || action === 'fiche' 
      ? PROMPTS[action]?.(theme, subject)
      : PROMPTS.quiz(theme, subject)

    if (!prompt) {
      return NextResponse.json({ error: 'Action non supportée' }, { status: 400 })
    }

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!res.ok) {
      console.error('Anthropic error:', await res.text())
      return NextResponse.json({ error: 'Erreur API' }, { status: 502 })
    }

    const data = await res.json()
    const result = data.content
      .map((b: { type: string; text?: string }) => b.type === 'text' ? b.text : '')
      .join('')

    return NextResponse.json({ result })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
