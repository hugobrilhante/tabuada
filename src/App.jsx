import { useState, useEffect, useRef, useCallback } from 'react'
import './App.css'

const COLORS = [
  '#FF6B6B', '#FF9F43', '#FECA57', '#26de81',
  '#FF9FF3', '#54A0FF', '#a29bfe', '#00D2D3',
  '#fd79a8', '#6c5ce7'
]

const TIMER_SECONDS = 10

const TRANSLATIONS = {
  pt: {
    title: 'Tabuada\nDivertida!',
    subtitle: 'Qual tabuada vai treinar?',
    you: 'Você', robot: 'Robô',
    answer: '✅ Responder',
    correct: '🎉 Arrasou!',
    wrong: n => `❌ Era ${n}!`,
    won: '🏆 Você ganhou!', lost: '😢 Robô ganhou!', tie: '🤝 Empate!',
    playAgain: '🔄 Jogar de novo',
  },
  en: {
    title: 'Times Table\nFun!',
    subtitle: 'Which table do you want to train?',
    you: 'You', robot: 'Robot',
    answer: '✅ Answer',
    correct: '🎉 Nailed it!',
    wrong: n => `❌ It was ${n}!`,
    won: '🏆 You won!', lost: '😢 Robot won!', tie: '🤝 It\'s a tie!',
    playAgain: '🔄 Play again',
  },
  es: {
    title: '¡Tablas\nDivertidas!',
    subtitle: '¿Qué tabla quieres entrenar?',
    you: 'Tú', robot: 'Robot',
    answer: '✅ Responder',
    correct: '🎉 ¡Genial!',
    wrong: n => `❌ ¡Era ${n}!`,
    won: '🏆 ¡Ganaste!', lost: '😢 ¡Ganó el Robot!', tie: '🤝 ¡Empate!',
    playAgain: '🔄 Jugar de nuevo',
  },
}

const LANGS = [
  { code: 'pt', flag: '🇧🇷', label: 'PT' },
  { code: 'en', flag: '🇺🇸', label: 'EN' },
  { code: 'es', flag: '🇪🇸', label: 'ES' },
]

function LangPicker({ lang, onChange }) {
  return (
    <div className="lang-picker">
      {LANGS.map(l => (
        <button
          key={l.code}
          className={`lang-btn ${lang === l.code ? 'lang-active' : ''}`}
          onClick={() => onChange(l.code)}
        >
          {l.flag} {l.label}
        </button>
      ))}
    </div>
  )
}

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function Bubble({ n, size = 'md', bounce = false }) {
  const color = COLORS[(n - 1) % COLORS.length]
  return (
    <span
      className={`bubble bubble-${size} ${bounce ? 'bounce' : ''}`}
      style={{ background: color }}
    >
      {n}
    </span>
  )
}

function FloatingStars() {
  const stars = ['⭐', '✨', '🌟', '💫', '⭐', '✨', '🌟', '💫', '⭐', '✨', '🌟', '💫']
  return (
    <div className="stars-bg" aria-hidden="true">
      {stars.map((s, i) => (
        <span key={i} className="star-float" style={{ '--i': i }}>{s}</span>
      ))}
    </div>
  )
}

function Confetti({ active }) {
  const pieces = Array.from({ length: 18 })
  return active ? (
    <div className="confetti-wrap" aria-hidden="true">
      {pieces.map((_, i) => (
        <div key={i} className="conf" style={{ '--ci': i, background: COLORS[i % COLORS.length] }} />
      ))}
    </div>
  ) : null
}

/* ── Select ── */
function SelectScreen({ onSelect, t }) {
  return (
    <div className="screen select-screen">
      <FloatingStars />
      <div className="mascot">🦄</div>
      <h1 className="title">{t.title.split('\n').map((l, i) => <span key={i}>{l}<br /></span>)}</h1>
      <p className="subtitle">{t.subtitle}</p>
      <div className="number-grid">
        {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
          <button
            key={n}
            className="pick-btn pop-in"
            style={{ background: COLORS[n - 1], '--delay': `${n * 0.05}s` }}
            onClick={() => onSelect(n)}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  )
}

/* ── Timer ── */
function TimerBar({ timeLeft }) {
  const pct = (timeLeft / TIMER_SECONDS) * 100
  const color = pct > 60 ? '#26de81' : pct > 30 ? '#FECA57' : '#FF6B6B'
  const urgent = pct <= 30
  return (
    <div className={`timer-track ${urgent ? 'urgent' : ''}`}>
      <div className="timer-fill" style={{ width: `${pct}%`, background: color }} />
      <span className="timer-label">{timeLeft}s</span>
    </div>
  )
}

/* ── Game ── */
function GameScreen({ number, multiplier, questionIdx, timeLeft, childScore, cpuScore, feedback, answer, onAnswer, onSubmit, total, t }) {
  const inputRef = useRef(null)

  useEffect(() => {
    if (feedback === '') inputRef.current?.focus()
  }, [multiplier, feedback])

  const handleKey = e => { if (e.key === 'Enter') onSubmit() }

  const mascot = feedback === 'correct' ? '🎉' : feedback === 'wrong' ? '😬' : '🤔'

  return (
    <div className="screen game-screen">
      <FloatingStars />
      <Confetti active={feedback === 'correct'} />

      <div className="scoreboard">
        <div className="score-block">
          <span className="score-emoji">🧒</span>
          <span className="score-num" style={{ color: '#26de81' }}>{childScore}</span>
          <span className="score-tag">{t.you}</span>
        </div>
        <div className="score-sep">✦</div>
        <div className="score-block">
          <span className="score-emoji">🤖</span>
          <span className="score-num" style={{ color: '#FF6B6B' }}>{cpuScore}</span>
          <span className="score-tag">{t.robot}</span>
        </div>
      </div>

      <TimerBar timeLeft={timeLeft} />

      <div className={`question-card ${feedback}`}>
        <div className="mascot-sm">{mascot}</div>
        <div className="equation">
          <Bubble n={number} size="lg" bounce />
          <span className="op">×</span>
          <Bubble n={multiplier} size="lg" bounce />
          <span className="op">=</span>
          <input
            ref={inputRef}
            className="answer-input"
            type="number"
            inputMode="numeric"
            value={answer}
            onChange={e => onAnswer(e.target.value)}
            onKeyDown={handleKey}
            disabled={feedback !== ''}
            placeholder="?"
          />
        </div>
        {feedback && (
          <div className={`feedback-msg ${feedback}`}>
            {feedback === 'correct' ? t.correct : t.wrong(number * multiplier)}
          </div>
        )}
      </div>

      <button className="submit-btn" onClick={onSubmit} disabled={feedback !== '' || answer === ''}>
        {t.answer}
      </button>

      <div className="progress-row">
        {Array.from({ length: total }, (_, i) => (
          <span key={i} className={`star-dot ${i < questionIdx ? 'done' : i === questionIdx ? 'cur' : ''}`}>
            {i < questionIdx ? '⭐' : i === questionIdx ? '✨' : '·'}
          </span>
        ))}
      </div>
    </div>
  )
}

/* ── Result ── */
function ResultScreen({ number, childScore, cpuScore, history, sequence, onRestart, t }) {
  const won = childScore > cpuScore
  const tie = childScore === cpuScore
  const resultLabel = tie ? t.tie : won ? t.won : t.lost
  return (
    <div className="screen result-screen">
      <FloatingStars />
      {won && <Confetti active />}
      <div className="result-hero">{tie ? '🤝' : won ? '🏆' : '😢'}</div>
      <h2 className="result-title">{resultLabel}</h2>
      <div className="result-scores">
        <span style={{ color: '#26de81' }}>🧒 {childScore}</span>
        <span className="res-dash">–</span>
        <span style={{ color: '#FF6B6B' }}>{cpuScore} 🤖</span>
      </div>

      <div className="history">
        {history.map((h, i) => (
          <div key={i} className={`hist-row ${h.correct ? 'hist-ok' : 'hist-err'}`}>
            <span className="hist-icon">{h.correct ? '⭐' : '❌'}</span>
            <span className="hist-q">{number} × {sequence[i]} =</span>
            <span className="hist-a">
              {h.correct
                ? <b>{number * sequence[i]}</b>
                : <><s style={{ opacity: .6 }}>{h.userAnswer || '—'}</s> → <b>{number * sequence[i]}</b></>}
            </span>
          </div>
        ))}
      </div>

      <button className="restart-btn" onClick={onRestart}>{t.playAgain}</button>
    </div>
  )
}

/* ── App ── */
export default function App() {
  const [lang, setLang] = useState('pt')
  const t = TRANSLATIONS[lang]
  const [gameState, setGameState] = useState('select')
  const [number, setNumber] = useState(null)
  const [sequence, setSequence] = useState([])
  const [qIdx, setQIdx] = useState(0)
  const [answer, setAnswer] = useState('')
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS)
  const [childScore, setChildScore] = useState(0)
  const [cpuScore, setCpuScore] = useState(0)
  const [history, setHistory] = useState([])
  const [feedback, setFeedback] = useState('')

  const multiplier = sequence[qIdx] ?? 1

  const advance = useCallback((nextIdx) => {
    if (nextIdx >= 10) {
      setGameState('result')
      return
    }
    setQIdx(nextIdx)
    setAnswer('')
    setTimeLeft(TIMER_SECONDS)
    setFeedback('')
  }, [])

  const evaluate = useCallback((userAns, curMult, curNum) => {
    const correct = curNum * curMult
    const isOk = parseInt(userAns) === correct
    setFeedback(isOk ? 'correct' : 'wrong')
    if (isOk) setChildScore(s => s + 1)
    else setCpuScore(s => s + 1)
    setHistory(h => [...h, { correct: isOk, userAnswer: userAns }])
    setQIdx(idx => {
      setTimeout(() => advance(idx + 1), 1300)
      return idx
    })
  }, [advance])

  useEffect(() => {
    if (gameState !== 'playing' || feedback !== '') return
    if (timeLeft === 0) { evaluate('', multiplier, number); return }
    const t = setInterval(() => setTimeLeft(s => s - 1), 1000)
    return () => clearInterval(t)
  }, [timeLeft, gameState, feedback, multiplier, number, evaluate])

  const handleSelect = n => {
    const seq = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    setNumber(n)
    setSequence(seq)
    setQIdx(0)
    setAnswer('')
    setTimeLeft(TIMER_SECONDS)
    setChildScore(0)
    setCpuScore(0)
    setHistory([])
    setFeedback('')
    setGameState('playing')
  }

  return (
    <div className="app">
      <LangPicker lang={lang} onChange={setLang} />
      {gameState === 'select' && <SelectScreen onSelect={handleSelect} t={t} />}
      {gameState === 'playing' && (
        <GameScreen
          number={number}
          multiplier={multiplier}
          questionIdx={qIdx}
          timeLeft={timeLeft}
          childScore={childScore}
          cpuScore={cpuScore}
          feedback={feedback}
          answer={answer}
          onAnswer={setAnswer}
          onSubmit={() => { if (feedback !== '' || answer === '') return; evaluate(answer, multiplier, number) }}
          total={10}
          t={t}
        />
      )}
      {gameState === 'result' && (
        <ResultScreen
          number={number}
          childScore={childScore}
          cpuScore={cpuScore}
          history={history}
          sequence={sequence}
          onRestart={() => setGameState('select')}
          t={t}
        />
      )}
    </div>
  )
}
