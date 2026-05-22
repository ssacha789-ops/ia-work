'use client'

import { useState, useCallback } from 'react'

/* ─── Types ─── */
type Screen = 'landing' | 'auth' | 'app' | 'result'
type AuthTab = 'login' | 'signup'
type Action = 'résumé' | 'quiz' | 'fiche'
type QuizItem = { q: string; opts: string[]; ans: number; explication: string }
type User = { name: string; email: string }

/* ─── Styles (inline — zero external deps) ─── */
const S = {
  // Layout
  screen: { minHeight: '100vh', display: 'flex', flexDirection: 'column' as const },
  // Colors
  surface: { background: '#111', border: '1px solid #222', borderRadius: 20 },
  surface2: { background: '#1a1a1a' },
  // Text
  serif: { fontFamily: '"DM Serif Display", Georgia, serif' },
  muted: { color: '#666' },
}

/* ─── Tiny helpers ─── */
function cap(s: string) { return s.charAt(0).toUpperCase() + s.slice(1) }
function greet() {
  const h = new Date().getHours()
  return h < 12 ? 'Bonjour' : h < 18 ? 'Bonjour' : 'Bonsoir'
}

/* ════════════════════════════════════════════
   SHARED UI ATOMS
════════════════════════════════════════════ */
function Btn({
  children, onClick, variant = 'primary', full = false, style = {},
}: {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'ghost'
  full?: boolean
  style?: React.CSSProperties
}) {
  const base: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    gap: 8, cursor: 'pointer', fontFamily: 'inherit', fontSize: 14,
    fontWeight: 500, borderRadius: 40, padding: '12px 22px',
    transition: 'opacity 0.2s, transform 0.2s',
    width: full ? '100%' : undefined, border: 'none',
  }
  const variants = {
    primary:   { background: '#f0f0f0', color: '#0a0a0a' },
    secondary: { background: 'transparent', border: '1px solid #2a2a2a', color: '#666' },
    ghost:     { background: 'transparent', border: '1px solid #222', color: '#555' },
  }
  return (
    <button
      onClick={onClick}
      style={{ ...base, ...variants[variant], ...style }}
      onMouseEnter={e => { (e.target as HTMLElement).style.opacity = '0.8' }}
      onMouseLeave={e => { (e.target as HTMLElement).style.opacity = '1' }}
    >
      {children}
    </button>
  )
}

function Field({ label, type, value, onChange, placeholder }: {
  label: string; type: string; value: string
  onChange: (v: string) => void; placeholder: string
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
      <label style={{ fontSize: 11, color: '#555', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
        {label}
      </label>
      <input
        type={type} value={value} placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        style={{
          background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 12,
          padding: '12px 14px', color: '#f0f0f0', fontFamily: 'inherit', fontSize: 14,
          outline: 'none', transition: 'border 0.2s',
        }}
        onFocus={e => { e.target.style.borderColor = '#444' }}
        onBlur={e => { e.target.style.borderColor = '#2a2a2a' }}
      />
    </div>
  )
}

function Toast({ msg }: { msg: string }) {
  if (!msg) return null
  return (
    <div style={{
      position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
      background: '#f0f0f0', color: '#0a0a0a', padding: '10px 22px',
      borderRadius: 40, fontSize: 13, fontWeight: 500, zIndex: 999,
      animation: 'fadeIn 0.3s ease',
      whiteSpace: 'nowrap',
    }}>
      {msg}
    </div>
  )
}

/* ════════════════════════════════════════════
   SCREEN: LANDING
════════════════════════════════════════════ */
function Landing({ onLogin, onDemo }: { onLogin: () => void; onDemo: () => void }) {
  return (
    <div style={S.screen}>
      {/* Nav */}
      <nav style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '20px 24px', animation: 'fadeUp 0.5s both',
      }}>
        <span style={{ ...S.serif, fontSize: 22 }}>révise.</span>
        <div style={{ display: 'flex', gap: 10 }}>
          <Btn variant="ghost" onClick={onLogin} style={{ padding: '8px 16px', fontSize: 13 }}>Connexion</Btn>
          <Btn onClick={onLogin} style={{ padding: '8px 18px', fontSize: 13 }}>Commencer</Btn>
        </div>
      </nav>

      {/* Hero */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', padding: '32px 24px', textAlign: 'center', gap: 20,
        animation: 'fadeUp 0.5s 0.1s both',
      }}>
        <div style={{
          background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#555',
          padding: '6px 14px', borderRadius: 40, fontSize: 11,
          letterSpacing: '1.5px', textTransform: 'uppercase',
        }}>
          ✦ IA · 2026
        </div>

        <h1 style={{ ...S.serif, fontSize: 'clamp(40px, 12vw, 56px)', lineHeight: 1.05, letterSpacing: -1 }}>
          Révise<br /><em style={{ color: '#555', fontStyle: 'italic' }}>autrement.</em>
        </h1>

        <p style={{ ...S.muted, fontSize: 15, lineHeight: 1.7, maxWidth: 300, fontWeight: 300 }}>
          Colle ton cours, l'IA crée des quiz, des résumés et des fiches en quelques secondes.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 280, marginTop: 8 }}>
          <Btn full onClick={onLogin} style={{ padding: '15px', fontSize: 15 }}>
            Commencer gratuitement
          </Btn>
          <Btn full variant="secondary" onClick={onDemo} style={{ padding: '15px', fontSize: 15 }}>
            Voir la démo →
          </Btn>
        </div>
      </div>

      {/* Features */}
      <div style={{ padding: '0 24px 40px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[
          { icon: '⚡', title: 'Résumé instantané', desc: "L'essentiel de ton cours en quelques lignes claires." },
          { icon: '🎯', title: 'Quiz personnalisé', desc: 'Des questions générées depuis ton propre contenu.' },
          { icon: '📋', title: 'Fiche de révision', desc: 'Structure parfaite pour mémoriser efficacement.' },
        ].map((f, i) => (
          <div key={i} style={{
            ...S.surface, padding: '18px', display: 'flex', gap: 14, alignItems: 'flex-start',
            animation: `fadeUp 0.5s ${0.1 + i * 0.07}s both`,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, background: '#1a1a1a',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, flexShrink: 0,
            }}>{f.icon}</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 3 }}>{f.title}</div>
              <div style={{ fontSize: 12, color: '#555', lineHeight: 1.5 }}>{f.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════
   SCREEN: AUTH
════════════════════════════════════════════ */
function Auth({
  onBack, onEnter,
}: {
  onBack: () => void
  onEnter: (user: User) => void
}) {
  const [tab, setTab] = useState<AuthTab>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('demo@revise.fr')
  const [pass, setPass] = useState('demo123')
  const [err, setErr] = useState('')

  function login() {
    if (!email) return setErr('Entre ton email')
    const n = email.split('@')[0]
    onEnter({ name: n, email })
  }

  function signup() {
    if (!name || !email || !pass) return setErr('Remplis tous les champs')
    if (pass.length < 8) return setErr('Mot de passe trop court (8 car. min)')
    onEnter({ name, email })
  }

  return (
    <div style={{
      ...S.screen, alignItems: 'center', justifyContent: 'center',
      padding: 24, background: '#0a0a0a',
    }}>
      <div style={{
        ...S.surface, padding: 28, width: '100%', maxWidth: 360,
        animation: 'slideUp 0.45s cubic-bezier(0.34,1.56,0.64,1) both',
      }}>
        <button
          onClick={onBack}
          style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: 13, marginBottom: 24, padding: 0, display: 'flex', alignItems: 'center', gap: 6 }}
        >← Retour</button>

        <div style={{ ...S.serif, fontSize: 20, marginBottom: 4 }}>révise.</div>
        <div style={{ ...S.muted, fontSize: 13, marginBottom: 28 }}>Ton espace de révision intelligent</div>

        {/* Tabs */}
        <div style={{ display: 'flex', background: '#1a1a1a', borderRadius: 10, padding: 3, marginBottom: 24 }}>
          {(['login', 'signup'] as AuthTab[]).map(t => (
            <button key={t} onClick={() => { setTab(t); setErr('') }} style={{
              flex: 1, padding: 8, borderRadius: 8, border: 'none', cursor: 'pointer',
              background: tab === t ? '#333' : 'transparent',
              color: tab === t ? '#f0f0f0' : '#555',
              fontFamily: 'inherit', fontSize: 13, transition: 'all 0.2s',
            }}>
              {t === 'login' ? 'Connexion' : 'Inscription'}
            </button>
          ))}
        </div>

        {tab === 'login' ? (
          <>
            <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="ton@email.com" />
            <Field label="Mot de passe" type="password" value={pass} onChange={setPass} placeholder="••••••••" />
            <Btn full onClick={login} style={{ padding: 14, marginTop: 8 }}>Se connecter</Btn>
          </>
        ) : (
          <>
            <Field label="Prénom" type="text" value={name} onChange={setName} placeholder="Marie" />
            <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="ton@email.com" />
            <Field label="Mot de passe" type="password" value={pass} onChange={setPass} placeholder="8 caractères minimum" />
            <Btn full onClick={signup} style={{ padding: 14, marginTop: 8 }}>Créer mon compte</Btn>
          </>
        )}

        {err && <div style={{ color: '#f87171', fontSize: 12, marginTop: 10, textAlign: 'center' }}>{err}</div>}

        <div style={{ textAlign: 'center', color: '#333', fontSize: 11, letterSpacing: 1, margin: '18px 0' }}>DÉMO RAPIDE</div>
        <Btn full variant="secondary" onClick={() => onEnter({ name: 'Demo', email: 'demo@revise.fr' })} style={{ padding: 12 }}>
          Accès sans compte →
        </Btn>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════
   SCREEN: APP (dashboard)
════════════════════════════════════════════ */
const DEMO_COURSE = `La photosynthèse est le processus biologique par lequel les végétaux chlorophylliens convertissent l'énergie lumineuse du soleil en énergie chimique stockée dans le glucose.

Elle se déroule dans les chloroplastes des cellules végétales et comprend deux phases :

1. Phase lumineuse : La chlorophylle absorbe la lumière, ce qui provoque la photolyse de l'eau. L'énergie lumineuse est convertie en ATP et NADPH. Le dioxygène (O₂) est libéré comme sous-produit.

2. Cycle de Calvin (phase sombre) : Le CO₂ est fixé grâce à l'enzyme RuBisCO. L'ATP et le NADPH produisent du glucose (C₆H₁₂O₆).

Équation bilan : 6CO₂ + 6H₂O + lumière → C₆H₁₂O₆ + 6O₂

La photosynthèse est fondamentale : elle produit l'oxygène atmosphérique et est le point d'entrée de l'énergie dans les chaînes alimentaires.`

function AppDashboard({
  user, onLogout, onAction,
}: {
  user: User
  onLogout: () => void
  onAction: (action: Action, course: string) => void
}) {
  const [course, setCourse] = useState('')
  const [toast, setToast] = useState('')

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  async function paste() {
    try {
      const text = await navigator.clipboard.readText()
      if (text) { setCourse(text); showToast('Cours collé ✓') }
    } catch {
      showToast('Colle avec Ctrl+V dans le champ')
    }
  }

  function run(action: Action) {
    if (course.trim().length < 20) return showToast('Colle un cours d\'abord !')
    onAction(action, course)
  }

  const actions: { action: Action; icon: string; title: string; desc: string; full?: boolean }[] = [
    { action: 'résumé', icon: '⚡', title: 'Résumer', desc: 'Points clés en 5 lignes' },
    { action: 'quiz',   icon: '🎯', title: 'Créer un Quiz', desc: '5 QCM sur ton cours' },
    { action: 'fiche',  icon: '📋', title: 'Fiche de révision complète', desc: 'Structure mémo optimisée pour l\'examen', full: true },
  ]

  return (
    <div style={{ ...S.screen, background: '#0a0a0a' }}>
      <Toast msg={toast} />

      {/* Header */}
      <header style={{
        padding: '20px 24px 16px', borderBottom: '1px solid #1a1a1a',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        animation: 'fadeUp 0.4s both',
      }}>
        <div>
          <h1 style={{ ...S.serif, fontSize: 20 }}>{greet()} {cap(user.name)} 👋</h1>
          <p style={{ ...S.muted, fontSize: 12, marginTop: 2 }}>Que veux-tu réviser aujourd'hui ?</p>
        </div>
        <button
          onClick={onLogout}
          title="Se déconnecter"
          style={{
            width: 36, height: 36, borderRadius: '50%', background: '#1a1a1a',
            border: '1px solid #2a2a2a', color: '#f0f0f0', cursor: 'pointer',
            fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          {user.name[0].toUpperCase()}
        </button>
      </header>

      {/* Course input */}
      <div style={{ margin: '20px 24px 0', ...S.surface, animation: 'fadeUp 0.4s 0.05s both' }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '12px 16px', borderBottom: '1px solid #1a1a1a',
        }}>
          <span style={{ fontSize: 11, color: '#555', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
            Ton cours
          </span>
          <button onClick={paste} style={{
            background: 'transparent', border: '1px solid #2a2a2a', color: '#555',
            padding: '6px 12px', borderRadius: 8, fontSize: 12, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'inherit',
            transition: 'all 0.2s',
          }}>
            📋 Coller
          </button>
        </div>
        <textarea
          value={course}
          onChange={e => setCourse(e.target.value)}
          placeholder={"Colle ou écris ton cours ici…\n\nEx : La photosynthèse est le processus par lequel les plantes…"}
          rows={6}
          style={{
            width: '100%', background: 'transparent', border: 'none', color: '#f0f0f0',
            fontFamily: 'inherit', fontSize: 13, lineHeight: 1.7, padding: 16,
            resize: 'none', outline: 'none',
          }}
        />
      </div>

      {/* Demo filler */}
      {!course && (
        <button
          onClick={() => setCourse(DEMO_COURSE)}
          style={{
            background: 'none', border: 'none', color: '#333', fontSize: 12,
            cursor: 'pointer', padding: '8px 24px', textAlign: 'left', fontFamily: 'inherit',
          }}
        >
          ↑ Utiliser le cours de démo
        </button>
      )}

      {/* Action cards */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10,
        padding: '16px 24px 32px',
      }}>
        {actions.map(({ action, icon, title, desc, full }, i) => (
          <div
            key={action}
            onClick={() => run(action)}
            style={{
              ...S.surface,
              gridColumn: full ? '1 / -1' : undefined,
              padding: 18, cursor: 'pointer',
              display: 'flex',
              flexDirection: full ? 'row' : 'column',
              alignItems: full ? 'center' : 'flex-start',
              justifyContent: full ? 'space-between' : undefined,
              gap: full ? 0 : 10,
              transition: 'background 0.2s, transform 0.2s',
              animation: `fadeUp 0.4s ${0.1 + i * 0.06}s both`,
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = '#1a1a1a'
              ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = '#111'
              ;(e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
            }}
          >
            <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12, background: '#1a1a1a',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0,
              }}>{icon}</div>
              {full && (
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{title}</div>
                  <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>{desc}</div>
                </div>
              )}
            </div>
            {!full && (
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{title}</div>
                <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>{desc}</div>
              </div>
            )}
            {full && <span style={{ color: '#444', fontSize: 20 }}>→</span>}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════
   SCREEN: RESULT
════════════════════════════════════════════ */
function Result({
  action, content, loading, onBack,
}: {
  action: Action
  content: string
  loading: boolean
  onBack: () => void
}) {
  const [quizData, setQuizData] = useState<QuizItem[] | null>(null)
  const [answered, setAnswered] = useState<Record<number, number>>({})
  const [parseErr, setParseErr] = useState(false)

  // Parse quiz JSON when content arrives
  useState(() => {
    if (action === 'quiz' && content && !loading) {
      try {
        const clean = content.replace(/```json|```/g, '').trim()
        setQuizData(JSON.parse(clean))
      } catch {
        setParseErr(true)
      }
    }
  })

  // Re-parse when content changes
  const parsedQuiz = useCallback(() => {
    if (action !== 'quiz' || !content || loading) return null
    try {
      const clean = content.replace(/```json|```/g, '').trim()
      return JSON.parse(clean) as QuizItem[]
    } catch {
      return null
    }
  }, [action, content, loading])

  const quiz = parsedQuiz()

  const titles: Record<Action, string> = { résumé: 'Résumé', quiz: 'Quiz', fiche: 'Fiche de révision' }
  const tags:   Record<Action, string> = { résumé: 'Résumé IA', quiz: '5 questions', fiche: 'Mémo' }
  const loadMsgs: Record<Action, string> = {
    résumé: 'Résumé en cours…',
    quiz: 'Génération du quiz…',
    fiche: 'Création de la fiche…',
  }

  function answer(qi: number, oi: number) {
    if (answered[qi] !== undefined) return
    setAnswered(prev => ({ ...prev, [qi]: oi }))
  }

  return (
    <div style={{ ...S.screen, background: '#0a0a0a' }}>
      {/* Header */}
      <div style={{
        padding: '20px 24px 16px', borderBottom: '1px solid #1a1a1a',
        display: 'flex', alignItems: 'center', gap: 12,
        animation: 'fadeIn 0.3s both',
      }}>
        <button onClick={onBack} style={{
          width: 36, height: 36, borderRadius: 10, background: 'transparent',
          border: '1px solid #2a2a2a', color: '#555', cursor: 'pointer', fontSize: 18,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>←</button>
        <span style={{ ...S.serif, fontSize: 18 }}>{titles[action]}</span>
        <span style={{
          marginLeft: 'auto', background: '#1a1a1a', border: '1px solid #2a2a2a',
          padding: '4px 12px', borderRadius: 20, fontSize: 11, color: '#555',
        }}>{tags[action]}</span>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px 32px' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', gap: 16 }}>
            <div style={{
              width: 32, height: 32, border: '2px solid #2a2a2a', borderTopColor: '#f0f0f0',
              borderRadius: '50%', animation: 'spin 0.7s linear infinite',
            }} />
            <p style={{ ...S.muted, fontSize: 13 }}>{loadMsgs[action]}</p>
          </div>
        ) : action === 'quiz' && quiz ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {quiz.map((q, qi) => (
              <div key={qi} style={{ ...S.surface, padding: 20, animation: `fadeUp 0.4s ${qi * 0.08}s both` }}>
                <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 14, lineHeight: 1.5 }}>
                  {qi + 1}. {q.q}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {q.opts.map((opt, oi) => {
                    const isAnswered = answered[qi] !== undefined
                    const isCorrect = oi === q.ans
                    const isChosen = answered[qi] === oi
                    let bg = '#1a1a1a'
                    let border = '1px solid #2a2a2a'
                    let color = '#f0f0f0'
                    if (isAnswered && isCorrect) { bg = '#0a1a0a'; border = '1px solid #1a4a1a'; color = '#4ade80' }
                    else if (isAnswered && isChosen) { bg = '#1a0a0a'; border = '1px solid #4a1a1a'; color = '#f87171' }
                    return (
                      <button key={oi} onClick={() => answer(qi, oi)} style={{
                        background: bg, border, borderRadius: 10,
                        padding: '11px 14px', fontSize: 13, cursor: isAnswered ? 'default' : 'pointer',
                        color, textAlign: 'left', fontFamily: 'inherit', transition: 'all 0.2s',
                      }}>
                        {opt}
                      </button>
                    )
                  })}
                </div>
                {answered[qi] !== undefined && (
                  <div style={{ marginTop: 12, fontSize: 12, color: '#555', lineHeight: 1.5, borderTop: '1px solid #1a1a1a', paddingTop: 10 }}>
                    💡 {q.explication}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div
            style={{
              ...S.surface, padding: 20, fontSize: 13, lineHeight: 1.8, color: '#ccc',
              animation: 'fadeUp 0.4s both',
            }}
            dangerouslySetInnerHTML={{ __html: content }}
          />
        )}
      </div>

      {/* Inline style for result HTML content */}
      <style>{`
        .result-body h2 { font-family: "DM Serif Display", Georgia, serif; font-size: 18px; margin: 16px 0 8px; color: #f0f0f0; }
        .result-body h3 { font-size: 14px; font-weight: 600; margin: 14px 0 6px; color: #ddd; }
        .result-body p  { color: #999; margin-bottom: 10px; }
        .result-body strong { color: #f0f0f0; }
        .result-body ul { padding-left: 16px; color: #999; }
        .result-body li { margin-bottom: 5px; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  )
}

/* ════════════════════════════════════════════
   ROOT APP CONTROLLER
════════════════════════════════════════════ */
export default function App() {
  const [screen, setScreen] = useState<Screen>('landing')
  const [user, setUser] = useState<User | null>(null)
  const [action, setAction] = useState<Action>('résumé')
  const [resultContent, setResultContent] = useState('')
  const [resultLoading, setResultLoading] = useState(false)

  function enterApp(u: User) { setUser(u); setScreen('app') }
  function logout() { setUser(null); setScreen('landing') }

  async function handleAction(act: Action, course: string) {
    setAction(act)
    setResultContent('')
    setResultLoading(true)
    setScreen('result')

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ course, action: act }),
      })
      const data = await res.json()
      setResultContent(data.result || data.error || 'Erreur inconnue')
    } catch {
      setResultContent('<p>Erreur de connexion. Vérifie ta connexion internet.</p>')
    } finally {
      setResultLoading(false)
    }
  }

  return (
    <>
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {screen === 'landing' && (
        <Landing onLogin={() => setScreen('auth')} onDemo={() => enterApp({ name: 'Demo', email: 'demo@revise.fr' })} />
      )}
      {screen === 'auth' && (
        <Auth onBack={() => setScreen('landing')} onEnter={enterApp} />
      )}
      {screen === 'app' && user && (
        <AppDashboard user={user} onLogout={logout} onAction={handleAction} />
      )}
      {screen === 'result' && (
        <Result
          action={action}
          content={resultContent}
          loading={resultLoading}
          onBack={() => setScreen('app')}
        />
      )}
    </>
  )
}
