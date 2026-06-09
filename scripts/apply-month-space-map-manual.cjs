const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')
const mainPath = path.join(root, 'src', 'main.jsx')
const cssPath = path.join(root, 'src', 'styles.css')

let main = fs.readFileSync(mainPath, 'utf8')
let css = fs.readFileSync(cssPath, 'utf8')
let changedMain = false
let changedCss = false

const monthBlock = String.raw`
const MONTH_V6_POINTS = [
  { day: 1, x: 18, y: 8 }, { day: 2, x: 32, y: 6 }, { day: 3, x: 46, y: 7 },
  { day: 4, x: 60, y: 9 }, { day: 5, x: 72, y: 16 }, { day: 6, x: 78, y: 27 },
  { day: 7, x: 72, y: 37 }, { day: 8, x: 58, y: 40 }, { day: 9, x: 44, y: 38 },
  { day: 10, x: 32, y: 44 }, { day: 11, x: 22, y: 52 }, { day: 12, x: 34, y: 56 },
  { day: 13, x: 48, y: 54 }, { day: 14, x: 62, y: 52 }, { day: 15, x: 76, y: 55 },
  { day: 16, x: 82, y: 64 }, { day: 17, x: 74, y: 71 }, { day: 18, x: 60, y: 68 },
  { day: 19, x: 46, y: 65 }, { day: 20, x: 32, y: 68 }, { day: 21, x: 20, y: 73 },
  { day: 22, x: 28, y: 81 }, { day: 23, x: 42, y: 79 }, { day: 24, x: 56, y: 78 },
  { day: 25, x: 70, y: 81 }, { day: 26, x: 80, y: 86 }, { day: 27, x: 66, y: 90 },
  { day: 28, x: 52, y: 90 }, { day: 29, x: 38, y: 89 }, { day: 30, x: 24, y: 92 },
  { day: 31, x: 38, y: 97 }
]

function MonthPanel({ kids, selectedChildId, activities, selectedDate, records, rewards, rewardRedemptions }) {
  const monthDays = getMonthDates(selectedDate)
  const allChildIds = kids.map((child) => child.id)
  const [selectedChildIds, setSelectedChildIds] = useState(() => selectedChildId ? [selectedChildId] : allChildIds)
  const [activeStep, setActiveStep] = useState(-1)

  useEffect(() => {
    setSelectedChildIds((current) => {
      const validIds = current.filter((id) => allChildIds.includes(id))
      if (validIds.length) return validIds
      return selectedChildId && allChildIds.includes(selectedChildId) ? [selectedChildId] : allChildIds
    })
  }, [kids.length, selectedChildId])

  useEffect(() => {
    setActiveStep(-1)
    const targetIndex = Math.max(0, monthDays.findIndex((date) => date === selectedDate))
    let step = -1
    const timer = window.setInterval(() => {
      step += 1
      setActiveStep(step)
      if (step >= targetIndex) window.clearInterval(timer)
    }, 70)
    return () => window.clearInterval(timer)
  }, [selectedDate, selectedChildIds.join('|'), kids.length])

  const selectedKids = kids.filter((child) => selectedChildIds.includes(child.id))
  const selectedDayNumber = parseLocalDate(selectedDate).getDate()

  const monthNodes = monthDays.map((date, index) => {
    const dayNumber = index + 1
    const layout = MONTH_V6_POINTS[index] ?? { day: dayNumber, x: 50, y: 50 }
    const childSummaries = selectedKids.map((child) => {
      const childActivities = activities.filter((activity) => activity.active && isActivityAssignedToChild(activity, child.id))
      return { child, summary: calculateDaySummary({ activities: childActivities, dayRecords: records[date]?.[child.id] ?? {} }) }
    })
    const totalStars = childSummaries.reduce((t, i) => t + i.summary.points, 0)
    const possibleStars = childSummaries.reduce((t, i) => t + i.summary.possiblePoints, 0)
    const redemptionItems = getRewardRedemptionItemsForDate({ date, selectedChildIds, rewardRedemptions, rewards })
    const isFuture = date > selectedDate
    return {
      date, index, layout, dayNumber,
      dayLabel: String(dayNumber).padStart(2, '0'),
      totalStars, possibleStars, redemptionItems,
      isFuture,
      isCurrent: date === selectedDate,
      isCompleted: date < selectedDate
    }
  })

  const monthTotals = monthNodes.filter((n) => !n.isFuture).reduce(
    (t, n) => ({ points: t.points + n.totalStars, possiblePoints: t.possiblePoints + n.possibleStars }),
    { points: 0, possiblePoints: 0 }
  )
  const progress = monthTotals.possiblePoints > 0 ? Math.round((monthTotals.points / monthTotals.possiblePoints) * 100) : 0

  function toggleChild(childId) {
    setSelectedChildIds((current) => {
      if (!current.includes(childId)) return [...current, childId]
      const next = current.filter((id) => id !== childId)
      return next.length ? next : [childId]
    })
  }

  return (
    <section className="panel entrance-card month-panel month-v6-panel">
      <div className="month-v6-shell">

        <div className="month-v6-header">
          <div className="month-v6-date">
            <span>📅</span>
            <span>Acompanhamento até dia</span>
            <strong>{selectedDayNumber}</strong>
          </div>

          <div className="month-v6-summary">
            <div className="month-v6-star-orb">⭐</div>
            <div className="month-v6-summary-info">
              <small>Estrelas neste mês</small>
              <strong>{monthTotals.points}</strong>
              <em>Meta: {monthTotals.possiblePoints}</em>
            </div>
            <ProgressBar value={progress} />
          </div>

          <div className="month-v6-filters">
            <button type="button" className={selectedChildIds.length === allChildIds.length ? 'active' : ''} onClick={() => setSelectedChildIds(allChildIds)}>
              <span className="v6f-icon">⭐</span><strong>Todas</strong>
            </button>
            {kids.map((child) => (
              <button type="button" key={child.id} className={selectedChildIds.includes(child.id) ? 'active' : ''} onClick={() => toggleChild(child.id)}>
                {child.photo ? <img src={child.photo} alt="" className="v6f-photo" /> : <span className="v6f-icon">{child.avatar}</span>}
                <strong>{child.name}</strong>
              </button>
            ))}
          </div>
        </div>

        <div className="month-v6-board" role="img" aria-label="Mapa espacial de progresso mensal">

          <div className="v6-stars-bg" />
          <div className="v6-neb v6-neb-a" />
          <div className="v6-neb v6-neb-b" />
          <div className="v6-neb v6-neb-c" />

          <div className="v6-galaxy">
            <svg viewBox="0 0 100 100">
              <defs>
                <radialGradient id="v6GlxGrad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#fff" stopOpacity=".9"/>
                  <stop offset="30%" stopColor="#c0b0ff" stopOpacity=".7"/>
                  <stop offset="70%" stopColor="#6040c0" stopOpacity=".4"/>
                  <stop offset="100%" stopColor="#200060" stopOpacity="0"/>
                </radialGradient>
              </defs>
              <ellipse cx="50" cy="50" rx="48" ry="48" fill="url(#v6GlxGrad)"/>
              <g className="v6-gal-spin">
                <path d="M50,50 Q60,20 80,18 Q90,18 92,25 Q88,35 70,42 Q55,48 50,50" fill="none" stroke="rgba(180,160,255,.7)" strokeWidth="1.5"/>
                <path d="M50,50 Q40,80 20,82 Q10,82 8,75 Q12,65 30,58 Q45,52 50,50" fill="none" stroke="rgba(180,160,255,.7)" strokeWidth="1.5"/>
                <path d="M50,50 Q20,40 18,20 Q18,10 25,8 Q35,12 42,30 Q48,45 50,50" fill="none" stroke="rgba(120,200,255,.5)" strokeWidth="1"/>
                <path d="M50,50 Q80,60 82,80 Q82,90 75,92 Q65,88 58,70 Q52,55 50,50" fill="none" stroke="rgba(120,200,255,.5)" strokeWidth="1"/>
              </g>
              <circle cx="50" cy="50" r="5" fill="rgba(255,255,255,.95)"/>
            </svg>
          </div>

          <div className="v6-bh">
            <div className="v6-bh-disk" />
            <div className="v6-bh-ring" />
            <div className="v6-bh-core" />
          </div>

          <div className="v6-planet v6-p1">
            <div className="v6-p1-ring" />
          </div>
          <div className="v6-planet v6-p2" />
          <div className="v6-planet v6-p3" />

          <div className="v6-sat">
            <div className="v6-sat-trail" />
            <div className="v6-sat-dot" />
          </div>

          <div className="v6-station">
            <div className="v6-station-panel" />
          </div>

          <div className="v6-shoot v6-shoot-a" />
          <div className="v6-shoot v6-shoot-b" />

          <svg className="v6-path-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
            {monthNodes.slice(0, -1).map((node, i) => {
              const next = monthNodes[i + 1]
              const cx = (node.layout.x + next.layout.x) / 2
              const cy = (node.layout.y + next.layout.y) / 2 + (i % 2 === 0 ? -5 : 5)
              const done = next.index <= activeStep && next.date <= selectedDate
              const d = 'M ' + node.layout.x + ' ' + node.layout.y + ' Q ' + cx + ' ' + cy + ' ' + next.layout.x + ' ' + next.layout.y
              return (
                <g key={node.date}>
                  {done && <path d={d} fill="none" stroke="rgba(40,200,255,.3)" strokeWidth="2.5" />}
                  {done ? (
                    <path d={d} fill="none" stroke="rgba(80,225,255,.9)" strokeWidth="0.8" />
                  ) : (
                    <path d={d} fill="none" stroke="rgba(180,195,230,.22)" strokeWidth="0.4" strokeDasharray="1 3" />
                  )}
                </g>
              )
            })}
          </svg>

          {monthNodes.map((node) => {
            const visible = !node.isFuture && node.index <= activeStep
            const hasReward = node.redemptionItems.length > 0
            const cn = [
              'v6-node',
              node.isCompleted && 'done',
              node.isCurrent && 'today',
              node.isFuture && 'locked',
              visible && 'revealed',
              hasReward && 'reward'
            ].filter(Boolean).join(' ')
            return (
              <button type="button" key={node.date} className={cn}
                style={{ left: node.layout.x + '%', top: node.layout.y + '%', animationDelay: node.index * 44 + 'ms' }}
                title={formatFriendlyDate(node.date) + ' — ' + node.totalStars + ' estrelas'}>
                <span className="v6-node-shine" />
                <span className="v6-node-num">{node.dayLabel}</span>
                {visible && <span className="v6-node-stars">{node.totalStars}⭐</span>}
                {hasReward && <span className="v6-node-gift">🎁</span>}
                {node.isFuture && <span className="v6-node-lock">🔒</span>}
                {node.isCurrent && <span className="v6-node-hoje">HOJE</span>}
              </button>
            )
          })}

        </div>

        <div className="month-v6-legend">
          <span><b className="v6-leg-line" /> Concluídos</span>
          <span>🎁 Prêmio resgatado</span>
          <span>🔒 Próximos dias</span>
        </div>
      </div>
    </section>
  )
}
`

function replaceMonthPanel() {
  const fnIndex = main.indexOf('function MonthPanel(')
  const anchorIndex = main.indexOf('function ActivitiesPanel')
  if (fnIndex >= 0 && anchorIndex > fnIndex) {
    const markers = ['const MONTH_SPACE_POINTS', 'const MONTH_PATH_LAYOUT', 'const MONTH_V4_POINTS', 'const MONTH_V5_POINTS', 'const MONTH_V6_POINTS', 'const MONTH_SPECIAL_DAYS', 'const MONTH_SPECIAL_V5']
    const candidates = markers.map((m) => main.lastIndexOf(m, fnIndex)).filter((i) => i >= 0)
    const start = candidates.length > 0 ? Math.min(...candidates) : fnIndex
    main = main.slice(0, start) + monthBlock + '\n' + main.slice(anchorIndex)
    changedMain = true
    return true
  }
  if (anchorIndex >= 0) {
    main = main.slice(0, anchorIndex) + monthBlock + '\n' + main.slice(anchorIndex)
    changedMain = true
    return true
  }
  return false
}

if (!replaceMonthPanel()) {
  throw new Error('Nao encontrei onde inserir o MonthPanel v6.')
}

const oldMarkers = ['/* Month space v4 polished game map */', '/* Month space v5 enhanced */', '/* Month space v6 deep space */']
for (const marker of oldMarkers) {
  const idx = css.indexOf(marker)
  if (idx >= 0) {
    css = css.slice(0, Math.max(0, idx - 2))
    changedCss = true
  }
}

const cssMarker = '/* Month space v6 deep space */'
const cssBlock = String.raw`

/* Month space v6 deep space */

/* ── Painel principal ── */
.month-v6-panel {
  overflow: hidden;
  background:
    radial-gradient(ellipse at 18% 4%, rgba(72,38,210,.3) 0%, transparent 28%),
    radial-gradient(ellipse at 86% 18%, rgba(138,36,195,.24) 0%, transparent 26%),
    linear-gradient(180deg, #060e26 0%, #070b1c 52%, #05091a 100%);
  color: #f8fafc;
  border-color: rgba(100,130,255,.18);
}
.month-v6-shell { max-width: 640px; margin: 0 auto; }

/* ── Header ── */
.month-v6-header {
  display: grid;
  grid-template-columns: 1fr auto;
  grid-template-areas: "date star" "filters star";
  gap: 12px 16px;
  margin-bottom: 18px;
}
.month-v6-date {
  grid-area: date;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  width: fit-content;
  padding: 10px 16px;
  border-radius: 16px;
  background: rgba(8,16,52,.9);
  border: 1px solid rgba(120,160,255,.22);
  font-weight: 900;
  font-size: .94rem;
  color: rgba(238,244,255,.92);
  box-shadow: 0 10px 22px rgba(0,4,24,.3);
}
.month-v6-date strong { color: #fde047; font-size: 1.12rem; }
.month-v6-summary {
  grid-area: star;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  width: 210px;
  padding: 16px;
  border-radius: 22px;
  background: linear-gradient(160deg, rgba(20,26,84,.98), rgba(10,14,50,.98));
  border: 1px solid rgba(130,160,255,.26);
  box-shadow: 0 16px 36px rgba(0,4,20,.4), inset 0 0 26px rgba(70,80,200,.14);
  text-align: center;
}
.month-v6-summary .progress-track { width: 100%; background: rgba(255,255,255,.15); height: 10px; }
.month-v6-star-orb {
  width: 56px; height: 56px;
  display: grid; place-items: center;
  border-radius: 18px;
  background: radial-gradient(circle at 36% 32%, #fffde4, #fcd34d 55%, #b45209 100%);
  font-size: 2.2rem;
  filter: drop-shadow(0 0 18px rgba(252,211,77,.5));
  flex-shrink: 0;
}
.month-v6-summary-info { width: 100%; }
.month-v6-summary-info small { display: block; color: rgba(215,228,255,.72); font-size: .74rem; font-weight: 850; margin-bottom: 2px; }
.month-v6-summary-info strong { display: block; color: #fcd34d; font-size: 2.9rem; font-weight: 1000; line-height: .88; text-shadow: 0 0 24px rgba(252,211,77,.5); }
.month-v6-summary-info em { display: block; color: rgba(215,228,255,.65); font-size: .74rem; font-style: normal; font-weight: 850; margin-top: 4px; }
.month-v6-filters {
  grid-area: filters;
  display: flex; gap: 10px; flex-wrap: wrap; padding-bottom: 2px;
}
.month-v6-filters button {
  display: inline-flex; align-items: center; gap: 8px;
  flex: 0 0 auto; min-height: 44px; padding: 0 14px;
  border: 1.5px solid rgba(120,155,255,.24); border-radius: 999px;
  background: rgba(18,26,88,.94); color: #dde6ff;
  font-weight: 950; font-size: .88rem;
  transition: background .2s, border-color .2s, box-shadow .2s;
}
.month-v6-filters button.active {
  background: linear-gradient(135deg, #5030e8, #3470f0);
  border-color: rgba(170,205,255,.5);
  box-shadow: 0 0 0 3px rgba(70,190,255,.14), 0 10px 24px rgba(44,72,210,.38);
}
.v6f-photo { width: 28px; height: 28px; border-radius: 10px; object-fit: cover; }
.v6f-icon { display: grid; place-items: center; width: 28px; height: 28px; border-radius: 10px; background: rgba(255,255,255,.1); font-size: 1rem; }

/* ── Tabuleiro ── */
.month-v6-board {
  position: relative;
  width: min(100%, 580px);
  aspect-ratio: 9 / 16;
  margin: 0 auto;
  border-radius: 28px;
  overflow: hidden;
  background:
    radial-gradient(ellipse at 84% 20%, rgba(96,18,136,.38) 0%, transparent 24%),
    radial-gradient(ellipse at 14% 82%, rgba(18,76,210,.24) 0%, transparent 22%),
    linear-gradient(180deg, #081232 0%, #070f28 46%, #060b1c 100%);
  border: 1px solid rgba(110,145,255,.14);
  box-shadow: inset 0 0 120px rgba(2,8,40,.92), 0 20px 50px rgba(0,4,20,.3);
}

/* Estrelas */
.v6-stars-bg {
  position: absolute; inset: 0; pointer-events: none;
  background-image:
    radial-gradient(circle, rgba(255,255,255,.96) 0 1.3px, transparent 2px),
    radial-gradient(circle, rgba(155,218,255,.92) 0 1px, transparent 1.6px),
    radial-gradient(circle, rgba(255,220,100,.9) 0 1px, transparent 1.5px),
    radial-gradient(circle, rgba(255,255,255,.65) 0 .8px, transparent 1.2px),
    radial-gradient(circle, rgba(200,180,255,.8) 0 .9px, transparent 1.3px);
  background-size: 46px 46px, 76px 76px, 108px 108px, 30px 30px, 62px 62px;
  background-position: 0 0, 20px 32px, 56px 12px, 12px 20px, 38px 48px;
  opacity: .82;
}

/* Nebulosas */
.v6-neb { position: absolute; pointer-events: none; border-radius: 50%; mix-blend-mode: screen; }
.v6-neb-a {
  right: -6%; top: 4%; width: 55%; height: 30%;
  background: radial-gradient(ellipse, rgba(148,36,200,.5) 0%, rgba(80,0,160,.2) 50%, transparent 75%);
  filter: blur(18px);
}
.v6-neb-b {
  left: -8%; bottom: 18%; width: 50%; height: 28%;
  background: radial-gradient(ellipse, rgba(20,100,220,.45) 0%, rgba(0,60,180,.15) 50%, transparent 74%);
  filter: blur(16px);
}
.v6-neb-c {
  left: 20%; top: 38%; width: 44%; height: 22%;
  background: radial-gradient(ellipse, rgba(0,200,180,.18) 0%, transparent 70%);
  filter: blur(22px);
}

/* Galáxia espiral */
.v6-galaxy {
  position: absolute; top: 6%; left: 3%; width: 22%; aspect-ratio: 1;
  opacity: .78; pointer-events: none;
}
.v6-galaxy svg { width: 100%; height: 100%; }
.v6-gal-spin { transform-origin: 50px 50px; animation: v6GalSpin 40s linear infinite; }
@keyframes v6GalSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

/* Buraco negro */
.v6-bh {
  position: absolute; right: 6%; top: 26%; width: 14%; aspect-ratio: 1;
  pointer-events: none;
}
.v6-bh-disk {
  position: absolute; inset: 0 -55%;
  border-radius: 50%;
  background: conic-gradient(from 0deg,
    rgba(255,160,20,0) 0%,
    rgba(255,120,0,.5) 18%,
    rgba(255,200,60,.9) 28%,
    rgba(255,240,160,.95) 35%,
    rgba(255,200,60,.9) 42%,
    rgba(255,100,0,.5) 52%,
    rgba(180,40,0,.3) 62%,
    rgba(255,160,20,0) 78%,
    rgba(255,80,0,.3) 88%,
    rgba(255,160,20,0) 100%
  );
  filter: blur(3px);
  animation: v6BhDisk 6s linear infinite;
  z-index: 1;
}
.v6-bh-ring {
  position: absolute; inset: 3%;
  border-radius: 50%;
  border: 2px solid rgba(255,140,20,.7);
  box-shadow: 0 0 12px 3px rgba(255,140,20,.5), inset 0 0 10px rgba(255,100,0,.3);
  animation: v6BhRing 4s ease-in-out infinite;
  z-index: 2;
}
.v6-bh-core {
  position: absolute; inset: 5%;
  border-radius: 50%;
  background: radial-gradient(circle, #000 45%, rgba(40,0,0,.5) 68%, transparent 100%);
  box-shadow: 0 0 20px 8px rgba(0,0,0,.9), 0 0 40px 18px rgba(0,0,0,.7);
  z-index: 3;
}
@keyframes v6BhDisk { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
@keyframes v6BhRing { 0%, 100% { opacity: .8; } 50% { opacity: .4; } }

/* Planetas */
.v6-planet { position: absolute; border-radius: 50%; pointer-events: none; }
.v6-p1 {
  left: 2%; top: 42%; width: 13%; aspect-ratio: 1;
  background:
    radial-gradient(circle at 30% 28%, rgba(255,255,255,.18) 0%, transparent 28%),
    repeating-linear-gradient(160deg,
      rgba(120,60,200,.8) 0px, rgba(80,30,160,.9) 6px,
      rgba(60,180,200,.5) 8px, rgba(40,140,180,.6) 14px,
      rgba(100,40,180,.8) 16px),
    radial-gradient(circle at 38% 35%, #7c3aed, #1e1b60 60%, #0a0520);
  box-shadow: 0 0 18px rgba(120,60,200,.5), inset -6px -8px 18px rgba(0,0,0,.5);
}
.v6-p1-ring {
  position: absolute; left: -38%; right: -38%; top: 38%; height: 22%;
  border-radius: 50%;
  border: 2px solid rgba(160,100,255,.6);
  border-top-color: transparent; border-bottom-color: transparent;
  transform: rotateX(72deg);
  box-shadow: 0 0 8px rgba(140,80,255,.4);
}
.v6-p2 {
  left: 5%; top: 68%; width: 9%; aspect-ratio: 1;
  background:
    radial-gradient(circle at 32% 28%, rgba(255,255,255,.25) 0%, transparent 30%),
    radial-gradient(circle at 65% 55%, rgba(0,0,60,.4) 0%, transparent 20%),
    radial-gradient(circle at 40% 70%, rgba(0,0,80,.3) 0%, transparent 15%),
    radial-gradient(circle at 38% 35%, #c0e8ff, #5ab8f0 45%, #1860c0 80%, #0a2a70);
  box-shadow: 0 0 14px rgba(80,180,255,.45), inset -5px -7px 14px rgba(0,0,0,.45);
}
.v6-p3 {
  right: 3%; top: 60%; width: 10%; aspect-ratio: 1;
  background:
    radial-gradient(circle at 32% 28%, rgba(255,255,200,.2) 0%, transparent 28%),
    repeating-radial-gradient(circle at 50% 50%,
      rgba(220,80,0,0) 0px, rgba(200,60,0,.4) 8px,
      rgba(255,140,0,0) 12px, rgba(180,40,0,.4) 20px),
    radial-gradient(circle at 38% 35%, #ffd080, #e86000 45%, #8a1a00);
  box-shadow: 0 0 18px rgba(255,100,0,.55), inset -5px -7px 16px rgba(0,0,0,.4);
}

/* Satélite orbitando p1 */
.v6-sat {
  position: absolute; left: .5%; top: 35%; width: 22%; aspect-ratio: 1;
  pointer-events: none;
  animation: v6SatOrbit 8s linear infinite;
}
.v6-sat-trail {
  position: absolute; inset: 0;
  border-radius: 50%;
  border: 1px dashed rgba(160,180,255,.22);
}
.v6-sat-dot {
  position: absolute; top: 8%; left: 8%; width: 20%; aspect-ratio: 1;
  background: radial-gradient(circle at 35% 30%, #e8e8ff, #8090c0 50%, #404060);
  border-radius: 50%;
  box-shadow: 0 0 6px rgba(160,170,255,.5);
}
@keyframes v6SatOrbit { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

/* Estação espacial */
.v6-station {
  position: absolute; right: 14%; top: 16%; width: 5%; aspect-ratio: 1.8;
  background: linear-gradient(90deg, #a0b0d0, #d0e0f0, #a0b0d0);
  border-radius: 2px;
  box-shadow: 0 0 8px rgba(180,210,255,.6);
  pointer-events: none;
  animation: v6StationFloat 4s ease-in-out infinite;
}
.v6-station-panel {
  position: absolute; top: 50%; left: -60%; right: -60%; height: 30%;
  transform: translateY(-50%);
  background: linear-gradient(90deg, rgba(120,140,200,.7), rgba(200,220,255,.9), rgba(120,140,200,.7));
  border-radius: 1px;
}
@keyframes v6StationFloat {
  0%, 100% { transform: translateY(0) rotate(-3deg); }
  50% { transform: translateY(-4px) rotate(3deg); }
}

/* Estrelas cadentes */
.v6-shoot {
  position: absolute; width: 2px; height: 2px;
  background: #fff; border-radius: 50%;
  box-shadow: 0 0 4px #fff;
  pointer-events: none;
}
.v6-shoot::after {
  content: ''; position: absolute; right: 100%; top: 0;
  width: 40px; height: 1px;
  background: linear-gradient(to right, transparent, rgba(255,255,255,.8));
}
.v6-shoot-a { top: 12%; left: 60%; animation: v6Shoot 5s linear infinite; }
.v6-shoot-b { top: 25%; left: 30%; animation: v6Shoot 7s linear 2.5s infinite; }
@keyframes v6Shoot {
  0% { transform: translate(0,0); opacity: 1; }
  100% { transform: translate(120px,60px); opacity: 0; }
}

/* ── SVG de caminhos ── */
.v6-path-svg {
  position: absolute; inset: 0; width: 100%; height: 100%;
  z-index: 2; pointer-events: none;
}

/* ── Nós dos dias ── */
.v6-node {
  position: absolute; z-index: 4;
  transform: translate(-50%, -50%) scale(.9);
  width: 9.5%; aspect-ratio: 1;
  border-radius: 50%;
  border: 2.5px solid rgba(60,210,255,.9);
  background: radial-gradient(circle at 35% 28%, #ffffff, #c8eeff 40%, #80d0ff 75%, #2080d0);
  color: #0a2040;
  display: grid; place-items: center;
  font-size: clamp(7px, 1.5vw, 13px); font-weight: 900;
  box-shadow: 0 0 0 4px rgba(0,190,255,.15), 0 0 16px rgba(0,180,255,.5);
  cursor: pointer; opacity: .7;
  transition: transform .24s ease, opacity .24s ease, box-shadow .24s ease;
}
.v6-node.revealed { opacity: 1; animation: v6NodeReveal .4s ease both; }
.v6-node:hover { transform: translate(-50%,-50%) scale(1.1); box-shadow: 0 0 0 7px rgba(0,200,255,.2), 0 0 32px rgba(0,180,255,.68); }
.v6-node-shine { position: absolute; inset: -6px; border-radius: inherit; background: radial-gradient(circle at 42% 32%, rgba(50,220,255,.16), transparent 62%); pointer-events: none; }
.v6-node-num { position: relative; z-index: 1; font-size: 1.24rem; font-weight: 1000; line-height: 1; letter-spacing: -.03em; }
.v6-node.done { border-color: rgba(48,200,255,.78); background: radial-gradient(circle at 38% 32%, #eef9ff, #c4ecff 44%, #88d8ff 80%); }
.v6-node.today {
  width: 15%; aspect-ratio: 1; z-index: 6;
  border: 4px solid rgba(70,220,255,.96);
  background: radial-gradient(circle at 36% 26%, #e6fbff, #46ccff 38%, #1888e8 68%, #0c46b2);
  color: #fff;
  box-shadow: 0 0 0 8px rgba(36,196,255,.2), 0 0 0 16px rgba(36,196,255,.08), 0 0 50px rgba(44,196,255,.92), 0 0 85px rgba(24,154,255,.44);
  animation: v6TodayPulse 2.3s ease-in-out infinite;
}
.v6-node.today .v6-node-num { font-size: 2rem; }
.v6-node.today:hover { transform: translate(-50%,-50%) scale(1.06); }
.v6-node.locked {
  border-color: rgba(150,160,195,.28);
  background: radial-gradient(circle at 38% 32%, rgba(115,125,155,.82), rgba(62,72,104,.82));
  color: rgba(215,225,245,.62);
  box-shadow: none; opacity: .4; filter: grayscale(.5);
}
.v6-node.reward {
  border-color: rgba(252,200,44,.88);
  box-shadow: 0 0 0 5px rgba(252,196,44,.16), 0 0 24px rgba(250,180,24,.54), inset 0 1px 4px rgba(255,255,255,.8);
}
.v6-node-stars {
  position: absolute; bottom: -19px; left: 50%; transform: translateX(-50%);
  min-width: 36px; padding: 3px 7px; border-radius: 999px;
  background: rgba(4,8,28,.96); color: #fde047;
  font-size: .7rem; font-weight: 1000; white-space: nowrap;
  box-shadow: 0 5px 14px rgba(0,0,0,.35); z-index: 2;
}
.v6-node.today .v6-node-stars { bottom: -23px; font-size: .78rem; padding: 4px 10px; }
.v6-node-gift {
  position: absolute; top: -19px; left: 50%; transform: translateX(-50%);
  font-size: 1.28rem; filter: drop-shadow(0 0 10px rgba(255,208,50,.56)); z-index: 2;
}
.v6-node.today .v6-node-gift { top: -26px; font-size: 1.5rem; }
.v6-node-lock { position: absolute; right: -3px; bottom: -5px; font-size: .8rem; opacity: .88; }
.v6-node-hoje {
  position: absolute; right: -9px; top: 50%; transform: translate(100%,-50%);
  padding: 6px 11px; border-radius: 999px;
  color: #fff; background: linear-gradient(135deg, #7c3aed, #db2777);
  font-size: .65rem; font-weight: 1000; letter-spacing: .08em; white-space: nowrap;
  box-shadow: 0 8px 22px rgba(124,58,237,.5); z-index: 7;
}
@keyframes v6TodayPulse {
  0%, 100% { box-shadow: 0 0 0 8px rgba(36,196,255,.2), 0 0 0 16px rgba(36,196,255,.08), 0 0 50px rgba(44,196,255,.92), 0 0 85px rgba(24,154,255,.44); }
  50% { box-shadow: 0 0 0 12px rgba(36,196,255,.26), 0 0 0 22px rgba(36,196,255,.1), 0 0 68px rgba(44,196,255,1), 0 0 105px rgba(24,154,255,.58); }
}
@keyframes v6NodeReveal {
  0% { opacity: .1; transform: translate(-50%,-50%) scale(.52); }
  64% { transform: translate(-50%,-50%) scale(1.12); }
  100% { opacity: 1; transform: translate(-50%,-50%) scale(1); }
}

/* ── Legenda ── */
.month-v6-legend {
  display: flex; flex-wrap: wrap; justify-content: center; gap: 12px;
  margin-top: 14px; padding: 12px;
  border-radius: 18px; background: rgba(6,12,42,.72);
  border: 1px solid rgba(110,140,255,.14);
  color: rgba(232,238,255,.9); font-weight: 900; font-size: .84rem;
}
.month-v6-legend span { display: inline-flex; align-items: center; gap: 8px; }
.v6-leg-line {
  display: inline-block; width: 34px; height: 4px; border-radius: 999px;
  background: #62eaff; box-shadow: 0 0 14px rgba(96,232,249,.95);
}

/* ── Responsivo ── */
@media (max-width: 760px) {
  .month-v6-header { grid-template-columns: 1fr; grid-template-areas: "date" "star" "filters"; }
  .month-v6-summary { width: 100%; flex-direction: row; align-items: center; text-align: left; gap: 14px; }
  .month-v6-summary .progress-track { order: 3; flex: 0 0 100%; }
  .month-v6-board { width: 100%; }
  .v6-node { width: 8.5%; }
  .v6-node.today { width: 13%; }
  .v6-node-num { font-size: 1rem; }
  .v6-node.today .v6-node-num { font-size: 1.6rem; }
  .v6-node-stars { bottom: -16px; font-size: .63rem; padding: 3px 6px; }
  .v6-node-hoje { top: auto; right: 50%; bottom: -32px; transform: translateX(50%); }
}
@media (max-width: 430px) {
  .v6-node { width: 7.5%; border-width: 2px; }
  .v6-node.today { width: 12%; }
  .v6-node-num { font-size: .85rem; }
  .v6-node-gift { font-size: 1rem; top: -14px; }
  .v6-galaxy { width: 18%; }
  .v6-bh { width: 11%; }
  .v6-p1 { width: 10%; }
  .v6-p2 { width: 7%; }
  .v6-p3 { width: 8%; }
}
`

if (!css.includes(cssMarker)) {
  css += cssBlock
  changedCss = true
}

if (changedMain) fs.writeFileSync(mainPath, main)
if (changedCss) fs.writeFileSync(cssPath, css)

console.log('apply-month-space-map-manual v6: ok')
