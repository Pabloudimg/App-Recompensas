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
const MONTH_V5_POINTS = [
  { day: 1, x: 13, y: 16 },
  { day: 2, x: 31, y: 12 },
  { day: 3, x: 49, y: 12 },
  { day: 4, x: 67, y: 15 },
  { day: 5, x: 79, y: 26 },
  { day: 6, x: 76, y: 37 },
  { day: 7, x: 62, y: 43 },
  { day: 8, x: 44, y: 40 },
  { day: 9, x: 53, y: 50 },
  { day: 10, x: 20, y: 50 },
  { day: 11, x: 31, y: 58 },
  { day: 12, x: 46, y: 57 },
  { day: 13, x: 13, y: 71 },
  { day: 14, x: 27, y: 69 },
  { day: 15, x: 41, y: 67 },
  { day: 16, x: 55, y: 66 },
  { day: 17, x: 69, y: 65 },
  { day: 18, x: 81, y: 69 },
  { day: 19, x: 59, y: 77 },
  { day: 20, x: 73, y: 77 },
  { day: 21, x: 85, y: 79 },
  { day: 22, x: 83, y: 89 },
  { day: 23, x: 68, y: 89 },
  { day: 24, x: 52, y: 89 },
  { day: 25, x: 35, y: 87 },
  { day: 26, x: 23, y: 96 },
  { day: 27, x: 39, y: 97 },
  { day: 28, x: 56, y: 97 },
  { day: 29, x: 73, y: 97 },
  { day: 30, x: 89, y: 94 },
  { day: 31, x: 50, y: 104 }
]

const MONTH_SPECIAL_V5 = new Set([4, 9, 15, 22, 27])

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
    const layout = MONTH_V5_POINTS[index] ?? { day: dayNumber, x: 50, y: 50 }
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
      isCompleted: date < selectedDate,
      isSpecial: MONTH_SPECIAL_V5.has(dayNumber)
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
    <section className="panel entrance-card month-panel month-v5-panel">
      <div className="month-v5-shell">

        <div className="month-v5-header">
          <div className="month-v5-date">
            <span>📅</span>
            <span>Acompanhamento até dia</span>
            <strong>{selectedDayNumber}</strong>
          </div>

          <div className="month-v5-summary">
            <div className="month-v5-star-orb">⭐</div>
            <div className="month-v5-summary-info">
              <small>Estrelas neste mês</small>
              <strong>{monthTotals.points}</strong>
              <em>Meta: {monthTotals.possiblePoints}</em>
            </div>
            <ProgressBar value={progress} />
          </div>

          <div className="month-v5-filters">
            <button type="button" className={selectedChildIds.length === allChildIds.length ? 'active' : ''} onClick={() => setSelectedChildIds(allChildIds)}>
              <span className="v5f-icon">⭐</span><strong>Todas</strong>
            </button>
            {kids.map((child) => (
              <button type="button" key={child.id} className={selectedChildIds.includes(child.id) ? 'active' : ''} onClick={() => toggleChild(child.id)}>
                {child.photo ? <img src={child.photo} alt="" className="v5f-photo" /> : <span className="v5f-icon">{child.avatar}</span>}
                <strong>{child.name}</strong>
              </button>
            ))}
          </div>
        </div>

        <div className="month-v5-board" role="img" aria-label="Mapa espacial de progresso mensal">
          <div className="v5-stars-bg" />
          <div className="v5-nebula v5-neb-a" />
          <div className="v5-nebula v5-neb-b" />
          <div className="v5-nebula v5-neb-c" />

          <span className="v5-planet v5-planet-red" />
          <span className="v5-planet v5-planet-blue" />
          <span className="v5-planet v5-planet-orange" />
          <span className="v5-planet v5-planet-purple" />

          <span className="v5-rock v5-rock-a" />
          <span className="v5-rock v5-rock-b" />
          <span className="v5-rock v5-rock-c" />
          <span className="v5-rock v5-rock-d" />

          <img className="v5-rocket v5-rocket-main" src="/month-space/rocket-main.svg" alt="" />
          <img className="v5-rocket v5-rocket-mini" src="/month-space/rocket-mini.svg" alt="" />

          <span className="v5-label v5-label-start">COMECE AQUI</span>
          <span className="v5-label v5-label-end">CHEGADA!</span>

          <svg className="v5-path-svg" viewBox="0 0 100 110" preserveAspectRatio="none">
            {monthNodes.slice(0, -1).map((node, i) => {
              const next = monthNodes[i + 1]
              const cx = (node.layout.x + next.layout.x) / 2
              const cy = (node.layout.y + next.layout.y) / 2 + (i % 2 === 0 ? -5.2 : 4.6)
              const done = next.index <= activeStep && next.date <= selectedDate
              const d = 'M ' + node.layout.x + ' ' + node.layout.y + ' Q ' + cx + ' ' + cy + ' ' + next.layout.x + ' ' + next.layout.y
              return (
                <g key={node.date}>
                  <path d={d} className={done ? 'vp-glow1 done' : 'vp-glow1 future'} />
                  {done && <path d={d} className="vp-glow2" />}
                  <path d={d} className={done ? 'vp-core done' : 'vp-core future'} />
                </g>
              )
            })}
          </svg>

          {monthNodes.map((node) => {
            const visible = !node.isFuture && node.index <= activeStep
            const hasReward = node.redemptionItems.length > 0 || (node.isSpecial && !node.isFuture)
            const cn = [
              'v5-node',
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
                <span className="v5-node-shine" />
                <span className="v5-node-num">{node.dayLabel}</span>
                {visible && <span className="v5-node-stars">{node.totalStars}⭐</span>}
                {hasReward && <span className="v5-node-gift">🎁</span>}
                {node.isFuture && <span className="v5-node-lock">🔒</span>}
                {node.isCurrent && <span className="v5-node-hoje">HOJE</span>}
              </button>
            )
          })}
        </div>

        <div className="month-v5-legend">
          <span><b className="v5-leg-line" /> Concluídos</span>
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
    const markers = ['const MONTH_SPACE_POINTS', 'const MONTH_PATH_LAYOUT', 'const MONTH_V4_POINTS', 'const MONTH_V5_POINTS', 'const MONTH_SPECIAL_DAYS', 'const MONTH_SPECIAL_V5']
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
  throw new Error('Nao encontrei onde inserir o MonthPanel v5.')
}

// Remove CSS de versões anteriores (sempre ao final do arquivo)
const oldMarkers = ['/* Month space v4 polished game map */', '/* Month space v5 enhanced */']
for (const marker of oldMarkers) {
  const idx = css.indexOf(marker)
  if (idx >= 0) {
    css = css.slice(0, Math.max(0, idx - 2))
    changedCss = true
  }
}

const cssMarker = '/* Month space v5 enhanced */'
const cssBlock = String.raw`

/* Month space v5 enhanced */

/* ── Painel principal ── */
.month-v5-panel {
  overflow: hidden;
  background:
    radial-gradient(ellipse at 18% 4%, rgba(72,38,210,.3) 0%, transparent 28%),
    radial-gradient(ellipse at 86% 18%, rgba(138,36,195,.24) 0%, transparent 26%),
    linear-gradient(180deg, #060e26 0%, #070b1c 52%, #05091a 100%);
  color: #f8fafc;
  border-color: rgba(100,130,255,.18);
}

.month-v5-shell { max-width: 640px; margin: 0 auto; }

/* ── Header ── */
.month-v5-header {
  display: grid;
  grid-template-columns: 1fr auto;
  grid-template-areas: "date star" "filters star";
  gap: 12px 16px;
  margin-bottom: 18px;
}

.month-v5-date {
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
.month-v5-date strong { color: #fde047; font-size: 1.12rem; }

.month-v5-summary {
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
.month-v5-summary .progress-track {
  width: 100%;
  background: rgba(255,255,255,.15);
  height: 10px;
}
.month-v5-star-orb {
  width: 56px;
  height: 56px;
  display: grid;
  place-items: center;
  border-radius: 18px;
  background: radial-gradient(circle at 36% 32%, #fffde4, #fcd34d 55%, #b45209 100%);
  font-size: 2.2rem;
  filter: drop-shadow(0 0 18px rgba(252,211,77,.5));
  flex-shrink: 0;
}
.month-v5-summary-info { width: 100%; }
.month-v5-summary-info small {
  display: block;
  color: rgba(215,228,255,.72);
  font-size: .74rem;
  font-weight: 850;
  margin-bottom: 2px;
}
.month-v5-summary-info strong {
  display: block;
  color: #fcd34d;
  font-size: 2.9rem;
  font-weight: 1000;
  line-height: .88;
  text-shadow: 0 0 24px rgba(252,211,77,.5);
}
.month-v5-summary-info em {
  display: block;
  color: rgba(215,228,255,.65);
  font-size: .74rem;
  font-style: normal;
  font-weight: 850;
  margin-top: 4px;
}

.month-v5-filters {
  grid-area: filters;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  padding-bottom: 2px;
}
.month-v5-filters button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex: 0 0 auto;
  min-height: 44px;
  padding: 0 14px;
  border: 1.5px solid rgba(120,155,255,.24);
  border-radius: 999px;
  background: rgba(18,26,88,.94);
  color: #dde6ff;
  font-weight: 950;
  font-size: .88rem;
  transition: background .2s, border-color .2s, box-shadow .2s;
}
.month-v5-filters button.active {
  background: linear-gradient(135deg, #5030e8, #3470f0);
  border-color: rgba(170,205,255,.5);
  box-shadow: 0 0 0 3px rgba(70,190,255,.14), 0 10px 24px rgba(44,72,210,.38);
}
.v5f-photo { width: 28px; height: 28px; border-radius: 10px; object-fit: cover; }
.v5f-icon {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border-radius: 10px;
  background: rgba(255,255,255,.1);
  font-size: 1rem;
}

/* ── Board / Tabuleiro ── */
.month-v5-board {
  position: relative;
  width: min(100%, 580px);
  aspect-ratio: 100 / 115;
  margin: 0 auto;
  border-radius: 28px;
  overflow: hidden;
  background:
    radial-gradient(ellipse at 84% 20%, rgba(96,18,136,.38) 0%, transparent 24%),
    radial-gradient(ellipse at 14% 82%, rgba(18,76,210,.24) 0%, transparent 22%),
    radial-gradient(ellipse at 50% 50%, rgba(6,14,54,.7) 0%, transparent 72%),
    linear-gradient(180deg, #081232 0%, #070f28 46%, #060b1c 100%);
  border: 1px solid rgba(110,145,255,.14);
  box-shadow: inset 0 0 120px rgba(2,8,40,.92), 0 20px 50px rgba(0,4,20,.3);
}

/* Estrelas */
.v5-stars-bg {
  position: absolute;
  inset: 0;
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
.v5-nebula {
  position: absolute;
  pointer-events: none;
  border-radius: 999px;
}
.v5-neb-a {
  right: 3%;
  top: 7%;
  width: 48%;
  height: 28%;
  background: radial-gradient(ellipse at 46% 42%, rgba(175,72,255,.42), rgba(110,36,198,.16) 48%, transparent 72%);
  filter: blur(7px);
}
.v5-neb-b {
  left: 0;
  bottom: 3%;
  width: 42%;
  height: 24%;
  background: radial-gradient(ellipse at 50% 50%, rgba(48,136,255,.3), rgba(32,72,255,.12) 46%, transparent 74%);
  filter: blur(7px);
}
.v5-neb-c {
  left: 28%;
  top: 40%;
  width: 44%;
  height: 20%;
  background: radial-gradient(ellipse at 50% 50%, rgba(32,195,255,.14), transparent 68%);
  filter: blur(9px);
}

/* Planetas */
.v5-planet {
  position: absolute;
  pointer-events: none;
  border-radius: 999px;
  box-shadow: inset -10px -14px 22px rgba(0,0,0,.35), 0 0 24px rgba(255,255,255,.06);
}
.v5-planet-red {
  left: 2%;
  top: 23%;
  width: 11%;
  aspect-ratio: 1;
  background: radial-gradient(circle at 32% 28%, #ffd0b0, #e85a2a 50%, #781a0a 100%);
}
.v5-planet-blue {
  left: 4%;
  top: 53%;
  width: 16%;
  aspect-ratio: 1;
  background: radial-gradient(circle at 32% 28%, #ccf0ff, #38a8e8 50%, #0a4090 100%);
}
.v5-planet-blue::after {
  content: '';
  position: absolute;
  left: -22%;
  right: -22%;
  top: 42%;
  height: 14%;
  border: 2.5px solid rgba(130,210,255,.58);
  border-left-color: transparent;
  border-right-color: transparent;
  border-radius: 999px;
  transform: rotate(-16deg);
}
.v5-planet-orange {
  right: 4%;
  top: 47%;
  width: 18%;
  aspect-ratio: 1;
  background: radial-gradient(circle at 32% 28%, #ffe2b0, #f09038 52%, #883a10 100%);
}
.v5-planet-purple {
  left: 1%;
  bottom: 2%;
  width: 21%;
  aspect-ratio: 1;
  background: radial-gradient(circle at 32% 28%, #eedcff, #8e5ee0 52%, #461e6a 100%);
}

/* Asteroides */
.v5-rock {
  position: absolute;
  pointer-events: none;
  border-radius: 8px;
  background: radial-gradient(circle at 34% 32%, #7a7892, #484a60 60%, #20223a 100%);
  box-shadow: inset -3px -4px 7px rgba(0,0,0,.35);
}
.v5-rock-a { left: 48%; top: 29%; width: 16px; height: 14px; }
.v5-rock-b { left: 42%; top: 40%; width: 13px; height: 11px; }
.v5-rock-c { right: 29%; top: 47%; width: 20px; height: 18px; }
.v5-rock-d { right: 24%; top: 56%; width: 14px; height: 13px; }

/* Foguetes (imagens SVG) */
.v5-rocket {
  position: absolute;
  pointer-events: none;
  z-index: 2;
}
.v5-rocket-main {
  left: 1%;
  top: 4%;
  width: 12%;
  transform: rotate(-20deg);
  filter: drop-shadow(0 0 10px rgba(130,200,255,.45));
}
.v5-rocket-mini {
  right: 17%;
  top: 57%;
  width: 8%;
  transform: rotate(28deg) scaleX(-1);
  filter: drop-shadow(0 0 7px rgba(130,200,255,.38));
  opacity: .88;
}

/* Etiquetas start / end */
.v5-label {
  position: absolute;
  pointer-events: none;
  z-index: 5;
  padding: 6px 11px;
  border-radius: 12px;
  font-size: .64rem;
  font-weight: 1000;
  letter-spacing: .04em;
  box-shadow: 0 8px 20px rgba(0,0,0,.32);
}
.v5-label-start {
  left: 14%;
  top: 6.5%;
  color: #dcfce7;
  background: linear-gradient(135deg, #15803d, #22c55e);
  border: 1px solid rgba(134,239,172,.42);
  transform: rotate(-6deg);
}
.v5-label-end {
  right: 3%;
  bottom: 5.5%;
  color: #fef9c3;
  background: linear-gradient(135deg, #b45309, #f59e0b);
  border: 1px solid rgba(253,224,71,.42);
  transform: rotate(-8deg);
}

/* ── SVG de caminhos ── */
.v5-path-svg {
  position: absolute;
  inset: 0;
  z-index: 2;
  width: 100%;
  height: 100%;
}

/* Glow externo (difuso) */
.vp-glow1 {
  fill: none;
  stroke-linecap: round;
}
.vp-glow1.done {
  stroke: rgba(40,215,255,.36);
  stroke-width: 3.8;
  filter: blur(2.5px);
}
.vp-glow1.future {
  stroke: rgba(200,215,240,.18);
  stroke-width: 1.6;
  stroke-dasharray: 1 3.5;
  filter: blur(.4px);
}

/* Glow médio */
.vp-glow2 {
  fill: none;
  stroke: rgba(80,230,255,.58);
  stroke-width: 2.0;
  stroke-linecap: round;
  filter: blur(.9px);
}

/* Núcleo brilhante */
.vp-core {
  fill: none;
  stroke-linecap: round;
}
.vp-core.done {
  stroke: #9df5ff;
  stroke-width: 1.1;
  filter: drop-shadow(0 0 4px rgba(90,235,255,1));
}
.vp-core.future {
  stroke: rgba(195,210,240,.3);
  stroke-width: .58;
  stroke-dasharray: .9 3.2;
}

/* ── Nós dos dias ── */
.v5-node {
  position: absolute;
  z-index: 4;
  transform: translate(-50%, -50%) scale(.9);
  width: 52px;
  height: 52px;
  border: 3px solid rgba(50,205,255,.88);
  border-radius: 50%;
  background: radial-gradient(circle at 38% 32%, #ffffff, #d4f2ff 46%, #a8e6ff 80%);
  color: #0a1e3c;
  display: grid;
  place-items: center;
  cursor: pointer;
  box-shadow:
    0 0 0 5px rgba(0,190,255,.15),
    0 0 22px rgba(0,180,255,.48),
    inset 0 1px 4px rgba(255,255,255,.8);
  opacity: .7;
  transition: transform .24s ease, opacity .24s ease, box-shadow .24s ease;
}
.v5-node.revealed {
  opacity: 1;
  animation: v5NodeReveal .4s ease both;
}
.v5-node:hover {
  transform: translate(-50%, -50%) scale(1.1);
  box-shadow:
    0 0 0 7px rgba(0,200,255,.2),
    0 0 32px rgba(0,180,255,.68),
    inset 0 1px 4px rgba(255,255,255,.85);
}

/* Shine interno */
.v5-node-shine {
  position: absolute;
  inset: -6px;
  border-radius: inherit;
  background: radial-gradient(circle at 42% 32%, rgba(50,220,255,.16), transparent 62%);
  pointer-events: none;
}

/* Número do dia */
.v5-node-num {
  position: relative;
  z-index: 1;
  font-size: 1.24rem;
  font-weight: 1000;
  line-height: 1;
  letter-spacing: -.03em;
}

/* Concluído */
.v5-node.done {
  border-color: rgba(48,200,255,.78);
  background: radial-gradient(circle at 38% 32%, #eef9ff, #c4ecff 44%, #88d8ff 80%);
}

/* Dia atual — maior + pulsante */
.v5-node.today {
  width: 80px;
  height: 80px;
  z-index: 6;
  border: 4px solid rgba(70,220,255,.96);
  background: radial-gradient(circle at 36% 26%, #e6fbff, #46ccff 38%, #1888e8 68%, #0c46b2);
  color: #fff;
  box-shadow:
    0 0 0 8px rgba(36,196,255,.2),
    0 0 0 16px rgba(36,196,255,.08),
    0 0 50px rgba(44,196,255,.92),
    0 0 85px rgba(24,154,255,.44);
  animation: v5TodayPulse 2.3s ease-in-out infinite;
}
.v5-node.today .v5-node-num { font-size: 2rem; }
.v5-node.today:hover { transform: translate(-50%, -50%) scale(1.06); }

@keyframes v5TodayPulse {
  0%, 100% {
    box-shadow:
      0 0 0 8px rgba(36,196,255,.2),
      0 0 0 16px rgba(36,196,255,.08),
      0 0 50px rgba(44,196,255,.92),
      0 0 85px rgba(24,154,255,.44);
  }
  50% {
    box-shadow:
      0 0 0 12px rgba(36,196,255,.26),
      0 0 0 22px rgba(36,196,255,.1),
      0 0 68px rgba(44,196,255,1),
      0 0 105px rgba(24,154,255,.58);
  }
}

/* Dias futuros (bloqueados) */
.v5-node.locked {
  border-color: rgba(150,160,195,.28);
  background: radial-gradient(circle at 38% 32%, rgba(115,125,155,.82), rgba(62,72,104,.82));
  color: rgba(215,225,245,.62);
  box-shadow: none;
  opacity: .4;
  filter: grayscale(.5);
}

/* Dia com prêmio/especial */
.v5-node.reward {
  border-color: rgba(252,200,44,.88);
  box-shadow:
    0 0 0 5px rgba(252,196,44,.16),
    0 0 24px rgba(250,180,24,.54),
    inset 0 1px 4px rgba(255,255,255,.8);
}

/* Estrelas abaixo do nó */
.v5-node-stars {
  position: absolute;
  bottom: -19px;
  left: 50%;
  transform: translateX(-50%);
  min-width: 36px;
  padding: 3px 7px;
  border-radius: 999px;
  background: rgba(4, 8, 28, .96);
  color: #fde047;
  font-size: .7rem;
  font-weight: 1000;
  white-space: nowrap;
  box-shadow: 0 5px 14px rgba(0,0,0,.35);
  z-index: 2;
}
.v5-node.today .v5-node-stars {
  bottom: -23px;
  font-size: .78rem;
  padding: 4px 10px;
}

/* Presente no topo */
.v5-node-gift {
  position: absolute;
  top: -19px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 1.28rem;
  filter: drop-shadow(0 0 10px rgba(255,208,50,.56));
  z-index: 2;
}
.v5-node.today .v5-node-gift { top: -26px; font-size: 1.5rem; }

/* Cadeado */
.v5-node-lock {
  position: absolute;
  right: -3px;
  bottom: -5px;
  font-size: .8rem;
  opacity: .88;
}

/* Badge HOJE */
.v5-node-hoje {
  position: absolute;
  right: -9px;
  top: 50%;
  transform: translate(100%, -50%);
  padding: 6px 11px;
  border-radius: 999px;
  color: #fff;
  background: linear-gradient(135deg, #7c3aed, #db2777);
  font-size: .65rem;
  font-weight: 1000;
  letter-spacing: .08em;
  white-space: nowrap;
  box-shadow: 0 8px 22px rgba(124,58,237,.5);
  z-index: 7;
}

/* Animação de revelação */
@keyframes v5NodeReveal {
  0% { opacity: .1; transform: translate(-50%, -50%) scale(.52); }
  64% { transform: translate(-50%, -50%) scale(1.12); }
  100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
}

/* ── Legenda ── */
.month-v5-legend {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
  margin-top: 14px;
  padding: 12px;
  border-radius: 18px;
  background: rgba(6,12,42,.72);
  border: 1px solid rgba(110,140,255,.14);
  color: rgba(232,238,255,.9);
  font-weight: 900;
  font-size: .84rem;
}
.month-v5-legend span {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.v5-leg-line {
  display: inline-block;
  width: 34px;
  height: 4px;
  border-radius: 999px;
  background: #62eaff;
  box-shadow: 0 0 14px rgba(96,232,249,.95);
}

/* ── Responsivo ── */
@media (max-width: 760px) {
  .month-v5-header {
    grid-template-columns: 1fr;
    grid-template-areas: "date" "star" "filters";
  }
  .month-v5-summary {
    width: 100%;
    flex-direction: row;
    align-items: center;
    text-align: left;
    gap: 14px;
  }
  .month-v5-summary .progress-track { order: 3; flex: 0 0 100%; }
  .month-v5-board { width: 100%; }
  .v5-node { width: 46px; height: 46px; }
  .v5-node.today { width: 68px; height: 68px; }
  .v5-node-num { font-size: 1.04rem; }
  .v5-node.today .v5-node-num { font-size: 1.6rem; }
  .v5-node-stars { bottom: -16px; font-size: .63rem; padding: 3px 6px; }
  .v5-node-hoje {
    top: auto;
    right: 50%;
    bottom: -32px;
    transform: translateX(50%);
  }
  .v5-rocket-main { width: 10%; }
  .v5-rocket-mini { width: 7%; }
}

@media (max-width: 430px) {
  .v5-node { width: 40px; height: 40px; border-width: 2.5px; }
  .v5-node.today { width: 60px; height: 60px; }
  .v5-node-num { font-size: .92rem; }
  .v5-node-gift { font-size: 1rem; top: -14px; }
  .v5-label { font-size: .55rem; padding: 5px 7px; }
  .v5-rock-c, .v5-rock-d { display: none; }
}
`

if (!css.includes(cssMarker)) {
  css += cssBlock
  changedCss = true
}

if (changedMain) fs.writeFileSync(mainPath, main)
if (changedCss) fs.writeFileSync(cssPath, css)

console.log('apply-month-space-map-manual v5: ok')
