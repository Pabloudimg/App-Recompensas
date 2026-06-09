const fs = require('fs')
const path = require('path')

const cssPath = path.resolve(__dirname, '..', 'src', 'styles.css')
let css = fs.readFileSync(cssPath, 'utf8')
const marker = '/* Space visual month trail */'

if (!css.includes(marker)) {
  const points = [
    [10, 15], [24, 12], [38, 13], [52, 17], [67, 23], [72, 32], [60, 41], [42, 38],
    [50, 48], [16, 49], [27, 56], [41, 56], [10, 69], [23, 68], [36, 67], [50, 66],
    [64, 65], [78, 68], [57, 77], [69, 77], [81, 78], [82, 88], [68, 88], [52, 88],
    [35, 87], [22, 95], [37, 96], [54, 96], [70, 96], [86, 93], [50, 96]
  ]

  const positionRules = points.map(([x, y], index) => `.month-panel .month-trail .month-step:nth-child(${index + 1}) { left: ${x}%; top: ${y}%; }`).join('\n')

  css += `

${marker}
.month-panel {
  position: relative;
  overflow: hidden;
}
.month-panel::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: .55;
  background:
    radial-gradient(circle at 18% 10%, rgba(99,102,241,.38), transparent 28%),
    radial-gradient(circle at 82% 22%, rgba(168,85,247,.3), transparent 24%),
    radial-gradient(circle at 30% 84%, rgba(14,165,233,.24), transparent 24%),
    radial-gradient(circle, rgba(255,255,255,.72) 0 1px, transparent 1.6px);
  background-size: auto, auto, auto, 86px 86px;
}
.month-panel > * { position: relative; z-index: 1; }
.month-panel .panel-header {
  align-items: stretch;
}
.month-panel .score-pill {
  background: rgba(15,23,42,.72);
  color: #f8fafc;
  border: 1px solid rgba(125,211,252,.2);
  box-shadow: inset 0 0 24px rgba(56,189,248,.14);
}
.month-panel .score-pill strong { color: #fde047; text-shadow: 0 0 14px rgba(250,204,21,.4); }
.month-panel .month-selector {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding: 2px 2px 14px;
  margin-bottom: 12px;
  scrollbar-width: none;
}
.month-panel .month-selector::-webkit-scrollbar { display: none; }
.month-panel .month-selector button {
  flex: 0 0 auto;
  min-height: 46px;
  border-radius: 999px;
  background: rgba(30,41,96,.72);
  color: #fff;
  border: 1px solid rgba(148,163,255,.24);
  box-shadow: 0 14px 30px rgba(0,0,0,.16);
}
.month-panel .month-selector button.active {
  background: linear-gradient(135deg, #6d28d9, #2563eb);
  color: #fff;
  box-shadow: 0 0 0 3px rgba(96,165,250,.16), 0 16px 34px rgba(79,70,229,.36);
}
.month-panel .month-trail {
  position: relative;
  display: block;
  min-height: 920px;
  margin-top: 10px;
  border-radius: 30px;
  overflow: hidden;
  border: 1px solid rgba(148,163,255,.16);
  background:
    radial-gradient(circle at 84% 28%, rgba(147,51,234,.35), transparent 18%),
    radial-gradient(circle at 22% 88%, rgba(59,130,246,.24), transparent 18%),
    radial-gradient(circle at 52% 12%, rgba(168,85,247,.22), transparent 11%),
    linear-gradient(180deg, #07091f 0%, #0b1035 52%, #050719 100%);
  box-shadow: inset 0 0 80px rgba(59,130,246,.13), 0 24px 60px rgba(2,6,23,.18);
}
.month-panel .month-trail::before {
  content: 'COMECE AQUI!';
  position: absolute;
  left: 11%;
  top: 6%;
  z-index: 3;
  padding: 7px 10px;
  border-radius: 12px;
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  color: #fde047;
  font-size: .68rem;
  font-weight: 1000;
  transform: rotate(-6deg);
  box-shadow: 0 10px 24px rgba(37,99,235,.36);
}
.month-panel .month-trail::after {
  content: 'CHEGADA!';
  position: absolute;
  right: 4%;
  bottom: 7%;
  z-index: 3;
  padding: 7px 10px;
  border-radius: 12px;
  background: linear-gradient(135deg, #7c3aed, #db2777);
  color: #fde047;
  font-size: .68rem;
  font-weight: 1000;
  transform: rotate(-10deg);
  box-shadow: 0 10px 24px rgba(124,58,237,.36);
}
.month-panel .month-step {
  position: absolute;
  z-index: 2;
  display: block;
  width: 62px;
  height: 62px;
  opacity: .58;
  transform: translate(-50%, -50%) scale(.92);
  transition: opacity .25s ease, transform .25s ease, filter .25s ease;
}
${positionRules}
.month-panel .month-step.is-visited {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1);
}
.month-panel .month-step.is-active-step {
  z-index: 4;
}
.month-panel .month-step.is-future {
  opacity: .42;
  filter: grayscale(.45);
}
.month-panel .month-step::before {
  display: none;
}
.month-panel .month-step-node {
  width: 62px;
  height: 62px;
  border: 0;
  border-radius: 999px;
  background: radial-gradient(circle at 35% 25%, #93c5fd, #2563eb 58%, #1e1b4b);
  color: #fff;
  display: grid;
  place-items: center;
  font-weight: 1000;
  box-shadow: 0 0 0 3px rgba(103,232,249,.22), 0 0 24px rgba(56,189,248,.58);
}
.month-panel .month-step.is-future .month-step-node {
  background: radial-gradient(circle at 35% 25%, rgba(148,163,184,.75), rgba(71,85,105,.8));
  box-shadow: none;
}
.month-panel .month-step.is-selected-day {
  width: 92px;
  height: 92px;
}
.month-panel .month-step.is-selected-day .month-step-node {
  width: 92px;
  height: 92px;
  background: radial-gradient(circle at 35% 25%, #cffafe, #38bdf8 45%, #2563eb 76%, #172554);
  box-shadow: 0 0 0 8px rgba(103,232,249,.16), 0 0 42px rgba(56,189,248,.95), inset 0 -10px 24px rgba(15,23,42,.22);
}
.month-panel .month-step-node span {
  font-size: 1.22rem;
  line-height: 1;
  letter-spacing: -.04em;
}
.month-panel .month-step.is-selected-day .month-step-node span {
  font-size: 2.1rem;
  text-shadow: 0 0 12px rgba(255,255,255,.42);
}
.month-panel .month-step-card {
  position: absolute;
  left: 50%;
  top: 54px;
  width: max-content;
  min-width: 46px;
  transform: translateX(-50%);
  padding: 0;
  border: 0;
  background: transparent;
  box-shadow: none;
}
.month-panel .month-step.is-selected-day .month-step-card { top: 78px; }
.month-panel .month-step-header {
  display: block;
  text-align: center;
}
.month-panel .month-step-header strong { display: none; }
.month-panel .month-step-header span {
  display: inline-block;
  min-width: 40px;
  padding: 4px 8px;
  border-radius: 999px;
  background: rgba(7,10,32,.92);
  color: #fde047;
  font-size: .74rem;
  font-weight: 1000;
  box-shadow: 0 8px 18px rgba(0,0,0,.26);
}
.month-panel .month-step.is-future .month-step-header span {
  color: rgba(226,232,240,.8);
}
.month-panel .month-kid-results { display: none; }
.month-panel .month-redemption-badge {
  position: absolute;
  left: 42px;
  top: -78px;
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  padding: 0;
  border-radius: 14px;
  background: rgba(250,204,21,.18);
  box-shadow: 0 0 18px rgba(250,204,21,.32);
}
.month-panel .month-redemption-badge strong,
.month-panel .month-redemption-badge small { display: none; }
.month-panel .month-redemption-badge span { font-size: 1.35rem; }
.month-panel .month-step.is-selected-day::after {
  content: 'HOJE';
  position: absolute;
  right: -10px;
  top: 50%;
  transform: translate(100%, -50%);
  padding: 6px 10px;
  border-radius: 999px;
  background: linear-gradient(135deg, #7c3aed, #db2777);
  color: #fff;
  font-size: .68rem;
  font-weight: 1000;
  letter-spacing: .08em;
  box-shadow: 0 10px 24px rgba(124,58,237,.38);
}
.month-panel .month-step.is-future .month-step-node::after {
  content: '🔒';
  position: absolute;
  right: -6px;
  bottom: -8px;
  font-size: .85rem;
}
.month-panel .month-trail .planet-a,
.month-panel .month-trail .planet-b { display: none; }
@media (max-width: 760px) {
  .month-panel .month-trail { min-height: 760px; border-radius: 24px; }
  .month-panel .month-step { width: 48px; height: 48px; }
  .month-panel .month-step-node { width: 48px; height: 48px; }
  .month-panel .month-step.is-selected-day { width: 74px; height: 74px; }
  .month-panel .month-step.is-selected-day .month-step-node { width: 74px; height: 74px; }
  .month-panel .month-step-node span { font-size: 1rem; }
  .month-panel .month-step.is-selected-day .month-step-node span { font-size: 1.65rem; }
  .month-panel .month-step-card { top: 42px; }
  .month-panel .month-step.is-selected-day .month-step-card { top: 62px; }
  .month-panel .month-step-header span { font-size: .65rem; padding: 3px 6px; }
  .month-panel .month-step.is-selected-day::after { top: auto; right: 50%; bottom: -34px; transform: translateX(50%); }
}
@media (max-width: 430px) {
  .month-panel .month-trail { min-height: 650px; }
  .month-panel .month-step { width: 42px; height: 42px; }
  .month-panel .month-step-node { width: 42px; height: 42px; }
  .month-panel .month-step.is-selected-day { width: 66px; height: 66px; }
  .month-panel .month-step.is-selected-day .month-step-node { width: 66px; height: 66px; }
}
`

  fs.writeFileSync(cssPath, css)
  console.log('apply-month-space-style: ok')
} else {
  console.log('apply-month-space-style: already applied')
}
