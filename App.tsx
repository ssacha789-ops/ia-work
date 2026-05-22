'use client'

import { useState, useCallback } from 'react'

/* ─── Types ─── */
type Screen = 'landing' | 'auth' | 'app' | 'subjects' | 'result'
type AuthTab = 'login' | 'signup'
type Action = 'résumé' | 'quiz' | 'fiche' | 'leçon'
type QuizItem = { q: string; opts: string[]; ans: number; explication: string }
type User = { name: string; email: string }

type Subject = 'math' | 'français' | 'histoire' | 'science' | 'anglais'
type Theme = { id: string; name: string; subject: Subject }

/* ─── Sujets et thèmes disponibles ─── */
const SUBJECTS_THEMES: Record<Subject, Theme[]> = {
  math: [
    { id: 'geom', name: 'Géométrie', subject: 'math' },
    { id: 'percent', name: 'Pourcentages', subject: 'math' },
    { id: 'trigo', name: 'Trigonométrie', subject: 'math' },
    { id: 'algebre', name: 'Algèbre', subject: 'math' },
    { id: 'calcul', name: 'Calcul & Dérivées', subject: 'math' },
    { id: 'stats', name: 'Statistiques', subject: 'math' },
  ],
  français: [
    { id: 'gram', name: 'Grammaire', subject: 'français' },
    { id: 'conj', name: 'Conjugaison', subject: 'français' },
    { id: 'orth', name: 'Orthographe', subject: 'français' },
    { id: 'litt', name: 'Littérature', subject: 'français' },
  ],
  histoire: [
    { id: 'antiq', name: 'Antiquité', subject: 'histoire' },
    { id: 'moyen', name: 'Moyen Âge', subject: 'histoire' },
    { id: 'mod', name: 'Période Moderne', subject: 'histoire' },
    { id: 'cont', name: 'Époque Contemporaine', subject: 'histoire' },
  ],
  science: [
    { id: 'phys', name: 'Physique', subject: 'science' },
    { id: 'chim', name: 'Chimie', subject: 'science' },
    { id: 'bio', name: 'Biologie', subject: 'science' },
  ],
  anglais: [
    { id: 'vocab', name: 'Vocabulaire', subject: 'anglais' },
    { id: 'gram_en', name: 'Grammaire', subject: 'anglais' },
    { id: 'pron', name: 'Prononciation', subject: 'anglais' },
    { id: 'conv', name: 'Conversation', subject: 'anglais' },
  ],
}

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

const SUBJECT_LABELS: Record<Subject, { name: string; icon: string }> = {
  math: { name: 'Mathématiques', icon: '📐' },
  français: { name: 'Français', icon: '📚' },
  histoire: { name: 'Histoire', icon: '🏛️' },
  science: { name: 'Science', icon: '🧪' },
  anglais: { name: 'Anglais', icon: '🌍' },
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
          Choisis une matière, sélectionne un thème, et l'IA crée une leçon + un quiz en quelques secondes.
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
          { icon: '⚡', title: 'Leçon personnalisée', desc: "L'IA crée une leçon complète sur ton thème." },
          { icon: '🎯', title: 'Quiz instantané', desc: 'Questions générées pour tester ta compréhension.' },
          { icon: '📚', title: 'Plusieurs matières', desc: 'Maths, Français, Histoire, Science, Anglais...' },
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
   SCREEN: APP (dashboard with subjects)
════════════════════════════════════════════ */
function AppDashboard({
  user, onLogout, onSelectTheme,
}: {
  user: User
  onLogout: () => void
  onSelectTheme: (subject: Subject, theme: Theme) => void
}) {
  const [toast, setToast] = useState('')

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

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

      {/* Matières */}
      <div style={{ flex: 1, padding: '20px 24px', overflowY: 'auto' }}>
        <p style={{ ...S.muted, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 16 }}>
          Choisir une matière
        </p>
        
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10,
          marginBottom: 32,
        }}>
          {(Object.keys(SUBJECTS_THEMES) as Subject[]).map((subject, i) => {
            const info = SUBJECT_LABELS[subject]
            return (
              <button
                key={subject}
                onClick={() => {
                  // Navigue vers la sélection de thème
                  onSelectTheme(subject, SUBJECTS_THEMES[subject][0])
                }}
                style={{
                  ...S.surface,
                  padding: 20, cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  justifyContent: 'center', gap: 10,
                  transition: 'background 0.2s, transform 0.2s',
                  animation: `fadeUp 0.4s ${0.1 + i * 0.06}s both`,
                  borderRadius: 20,
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
                <span style={{ fontSize: 32 }}>{info.icon}</span>
                <span style={{ fontSize: 14, fontWeight: 500 }}>{info.name}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════
   SCREEN: SUBJECTS (theme selection)
════════════════════════════════════════════ */
function SubjectsScreen({
  subject, onBack, onSelectTheme, onAction,
}: {
  subject: Subject
  onBack: () => void
  onSelectTheme: (theme: Theme) => void
  onAction: (theme: Theme) => void
}) {
  const themes = SUBJECTS_THEMES[subject]
  const subjectInfo = SUBJECT_LABELS[subject]
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(themes[0])

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
        <span style={{ ...S.serif, fontSize: 18 }}>
          {subjectInfo.icon} {subjectInfo.name}
        </span>
      </div>

      {/* Thèmes */}
      <div style={{ flex: 1, padding: '20px 24px', overflowY: 'auto' }}>
        <p style={{ ...S.muted, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 16 }}>
          Choisir un thème
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
          {themes.map((theme, i) => (
            <button
              key={theme.id}
              onClick={() => setSelectedTheme(theme)}
              style={{
                ...S.surface,
                padding: 16, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                transition: 'all 0.2s',
                animation: `fadeUp 0.4s ${0.1 + i * 0.06}s both`,
                background: selectedTheme?.id === theme.id ? '#1a1a1a' : '#111',
                borderColor: selectedTheme?.id === theme.id ? '#444' : '#222',
              }}
            >
              <span style={{ fontSize: 14, fontWeight: 500 }}>{theme.name}</span>
              <span style={{ color: '#555', fontSize: 18 }}>
                {selectedTheme?.id === theme.id ? '✓' : '→'}
              </span>
            </button>
          ))}
        </div>

        {selectedTheme && (
          <Btn
            full
            onClick={() => onAction(selectedTheme)}
            style={{ padding: '15px', fontSize: 15, marginTop: 16 }}
          >
            Générer leçon + quiz 🚀
          </Btn>
        )}
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════
   SCREEN: RESULT (Lesson + Quiz)
════════════════════════════════════════════ */
function Result({
  theme, lessonContent, quizContent, loading, onBack,
}: {
  theme: Theme
  lessonContent: string
  quizContent: string
  loading: boolean
  onBack: () => void
}) {
  const [quizData, setQuizData] = useState<QuizItem[] | null>(null)
  const [answered, setAnswered] = useState<Record<number, number>>({})
  const [tab, setTab] = useState<'lesson' | 'quiz'>('lesson')

  // Parse quiz JSON
  const parsedQuiz = useCallback(() => {
    if (!quizContent || loading) return null
    try {
      const clean = quizContent.replace(/```json|```/g, '').trim()
      return JSON.parse(clean) as QuizItem[]
    } catch {
      return null
    }
  }, [quizContent, loading])

  const quiz = parsedQuiz()

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
        <span style={{ ...S.serif, fontSize: 18 }}>{theme.name}</span>
        <span style={{
          marginLeft: 'auto', background: '#1a1a1a', border: '1px solid #2a2a2a',
          padding: '4px 12px', borderRadius: 20, fontSize: 11, color: '#555',
        }}>Leçon + Quiz</span>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #1a1a1a', padding: '0 24px' }}>
        <button
          onClick={() => setTab('lesson')}
          style={{
            flex: 1, padding: '12px', borderBottom: tab === 'lesson' ? '2px solid #f0f0f0' : '2px solid transparent',
            background: 'none', border: 'none', color: tab === 'lesson' ? '#f0f0f0' : '#555',
            cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 500,
            transition: 'all 0.2s',
          }}
        >
          📖 Leçon
        </button>
        <button
          onClick={() => setTab('quiz')}
          style={{
            flex: 1, padding: '12px', borderBottom: tab === 'quiz' ? '2px solid #f0f0f0' : '2px solid transparent',
            background: 'none', border: 'none', color: tab === 'quiz' ? '#f0f0f0' : '#555',
            cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 500,
            transition: 'all 0.2s',
          }}
        >
          🎯 Quiz
        </button>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px 32px' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', gap: 16 }}>
            <div style={{
              width: 32, height: 32, border: '2px solid #2a2a2a', borderTopColor: '#f0f0f0',
              borderRadius: '50%', animation: 'spin 0.7s linear infinite',
            }} />
            <p style={{ ...S.muted, fontSize: 13 }}>
              {tab === 'lesson' ? 'Génération de la leçon…' : 'Génération du quiz…'}
            </p>
          </div>
        ) : tab === 'lesson' ? (
          <div
            style={{
              ...S.surface, padding: 20, fontSize: 13, lineHeight: 1.8, color: '#ccc',
              animation: 'fadeUp 0.4s both',
            }}
            dangerouslySetInnerHTML={{ __html: lessonContent }}
          />
        ) : quiz ? (
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
          <div style={{ ...S.surface, padding: 20, color: '#f87171', textAlign: 'center' }}>
            Erreur de génération du quiz. Réessaye.
          </div>
        )}
      </div>

      {/* Inline styles */}
      <style>{`
        .result-body h2 { font-family: "DM Serif Display", Georgia, serif; font-size: 18px; margin: 16px 0 8px; color: #f0f0f0; }
        .result-body h3 { font-size: 14px; font-weight: 600; margin: 14px 0 6px; color: #ddd; }
        .result-body p  { color: #999; margin-bottom: 10px; }
        .result-body strong { color: #f0f0f0; }
        .result-body ul { padding-left: 16px; color: #999; }
        .result-body li { margin-bottom: 5px; }
        .result-body ol { padding-left: 16px; color: #999; }
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
  const [currentSubject, setCurrentSubject] = useState<Subject | null>(null)
  const [currentTheme, setCurrentTheme] = useState<Theme | null>(null)
  const [lessonContent, setLessonContent] = useState('')
  const [quizContent, setQuizContent] = useState('')
  const [resultLoading, setResultLoading] = useState(false)

  function enterApp(u: User) { setUser(u); setScreen('app') }
  function logout() { setUser(null); setScreen('landing') }

  function handleSelectTheme(subject: Subject, theme: Theme) {
    setCurrentSubject(subject)
    setCurrentTheme(theme)
    setScreen('subjects')
  }

  async function handleAction(theme: Theme) {
    setCurrentTheme(theme)
    setLessonContent('')
    setQuizContent('')
    setResultLoading(true)
    setScreen('result')

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'lesson_quiz',
          theme: theme.name,
          subject: currentSubject,
        }),
      })
      const data = await res.json()
      setLessonContent(data.lesson || '')
      setQuizContent(data.quiz || '')
    } catch (err) {
      setLessonContent('<p>Erreur de connexion. Réessaye.</p>')
      setQuizContent('')
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
        <AppDashboard user={user} onLogout={logout} onSelectTheme={handleSelectTheme} />
      )}
      {screen === 'subjects' && currentSubject && (
        <SubjectsScreen
          subject={currentSubject}
          onBack={() => setScreen('app')}
          onSelectTheme={(theme) => setCurrentTheme(theme)}
          onAction={handleAction}
        />
      )}
      {screen === 'result' && currentTheme && (
        <Result
          theme={currentTheme}
          lessonContent={lessonContent}
          quizContent={quizContent}
          loading={resultLoading}
          onBack={() => setScreen('app')}
        />
      )}
    </>
  )
}
