import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

type Action = 'résumé' | 'quiz' | 'fiche'

const PROMPTS: Record<Action, (course: string) => string> = {
  résumé: (course) => `Tu es un expert en pédagogie. Résume ce cours de façon claire pour un étudiant.

Réponds UNIQUEMENT en HTML avec ces balises : h2, h3, p, ul, li, strong.
Structure :
- <h2> titre descriptif
- 3-4 sections <h3> + <p>
- Section finale "Points clés" avec <ul>

Cours :
${course}`,

  quiz: (course) => `Tu es un professeur. Crée EXACTEMENT 5 QCM sur ce cours.

Réponds UNIQUEMENT en JSON valide, rien d'autre, aucun markdown.
Format :
[{"q":"Question ?","opts":["A) ...","B) ...","C) ...","D) ..."],"ans":0,"explication":"..."}]
(ans = index 0-3 de la bonne réponse)

Cours :
${course}`,

  fiche: (course) => `Tu es un expert en mémorisation. Crée une fiche de révision complète.

Réponds UNIQUEMENT en HTML avec : h2, h3, p, ul, li, ol, strong, em.
Structure :
- <h2> titre
- Sections <h3> claires
- Définitions en <strong>
- Section "À mémoriser absolument" en fin

Cours :
${course}`,
}

export async function POST(req: NextRequest) {
  try {
    const { course, action } = await req.json()

    if (!course || !action || !PROMPTS[action as Action]) {
      return NextResponse.json({ error: 'Paramètres invalides' }, { status: 400 })
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'Clé API non configurée' }, { status: 500 })
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
        messages: [{ role: 'user', content: PROMPTS[action as Action](course) }],
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
