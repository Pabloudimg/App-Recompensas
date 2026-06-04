const fs = require('fs')
const path = require('path')

const mainPath = path.join(process.cwd(), 'src', 'main.jsx')
const cssPath = path.join(process.cwd(), 'src', 'styles.css')

let mainText = fs.readFileSync(mainPath, 'utf8')
let cssText = fs.readFileSync(cssPath, 'utf8')

function replaceOnce(text, oldText, newText) {
  return text.includes(oldText) ? text.replace(oldText, newText) : text
}

const oldWeekCall = `        {activeTab === 'week' && <WeekPanel summaries={weeklySummaries} rewards={data.rewards} selectedDate={selectedDate} rewardRedemptions={data.rewardRedemptions} transfers={data.transfers} onTogglePrize={togglePrizeRedemption} onTransferBalance={transferBalanceToNextWeek} />}`
const newWeekCall = `        {activeTab === 'week' && <WeekPanel summaries={weeklySummaries.filter((summary) => summary.child.id === selectedChildId)} rewards={data.rewards} selectedDate={selectedDate} rewardRedemptions={data.rewardRedemptions} transfers={data.transfers} onTogglePrize={togglePrizeRedemption} onTransferBalance={transferBalanceToNextWeek} />}`
mainText = replaceOnce(mainText, oldWeekCall, newWeekCall)

const oldTodayPoints = `                  <h3>{activity.title}</h3>
                  <p>{activity.points} estrela{activity.points > 1 ? 's' : ''}</p>`
const newTodayPoints = `                  <h3 className="mission-heading">
                    <span>{activity.title}</span>
                    <sup className="activity-stars" aria-label={\`${'${activity.points}'} estrela${'${activity.points > 1 ? \'s\' : \'\''}'}\`}>
                      {Array.from({ length: Math.max(0, Math.min(99, Number(activity.points) || 0)) }, (_, starIndex) => <span key={starIndex}>⭐</span>)}
                    </sup>
                  </h3>`
if (!mainText.includes('className="activity-stars"')) {
  mainText = replaceOnce(mainText, oldTodayPoints, newTodayPoints)
}

const oldWeekMetrics = `              <ProgressBar value={summary.percentage} />
              <div className="big-number">{summary.percentage}%</div>
              <p className="summary-points">⭐ {summary.points} estrelas acumuladas</p>
              <p className="summary-finance">↔️ {transferred} estrelas transferidas</p>
              <p className="summary-finance">🏆 {used} estrelas utilizadas</p>
              <p className="summary-finance balance-line">🧾 {balance} moedas disponíveis</p>
              <p className="reward-tier">{getTierMessage(summary.percentage)}</p>`
const newWeekMetrics = `              <ProgressBar value={summary.percentage} />
              <div className="week-metrics">
                <p className="summary-points">⭐ <strong className="metric-value good">{summary.points}</strong> estrelas obtidas na semana</p>
                <p className="summary-finance">↔️ <strong className="metric-value good">{transferred}</strong> estrelas transferidas</p>
                <p className="summary-finance">🏆 <strong className="metric-value bad">{used}</strong> estrelas utilizadas</p>
                <p className="summary-finance balance-line">🧾 <strong className="metric-value good">{balance}</strong> estrelas disponíveis</p>
              </div>`
if (!mainText.includes('className="week-metrics"')) {
  mainText = replaceOnce(mainText, oldWeekMetrics, newWeekMetrics)
}

const oldPrizeIcon = `                      >
                        <span className="prize-icon">{reward.icon}</span>`
const newPrizeIcon = `                      >
                        {isRedeemed && <span className="redeemed-check" aria-hidden="true">✓</span>}
                        <span className="prize-icon">{reward.icon}</span>`
if (!mainText.includes('className="redeemed-check"')) {
  mainText = replaceOnce(mainText, oldPrizeIcon, newPrizeIcon)
}

const oldAccumulateIcon = `                  >
                    <span className="prize-icon">🪙</span>`
const newAccumulateIcon = `                  >
                    {nextTransfer > 0 && <span className="redeemed-check" aria-hidden="true">✓</span>}
                    <span className="prize-icon">🪙</span>`
if (!mainText.includes('{nextTransfer > 0 && <span className="redeemed-check"')) {
  mainText = replaceOnce(mainText, oldAccumulateIcon, newAccumulateIcon)
}

fs.writeFileSync(mainPath, mainText, 'utf8')

const cssAdd = `

/* Ajustes: estrelas das atividades e resumo semanal */
.mission-heading { display: inline-flex; align-items: flex-start; gap: 6px; flex-wrap: wrap; margin-right: 4px; }
.activity-stars { display: inline-flex; gap: 1px; max-width: min(12rem, 42vw); flex-wrap: wrap; transform: translateY(-0.35em); font-size: 0.62em; line-height: 1; letter-spacing: -0.12em; margin-left: 2px; }
.activity-stars span { display: inline-block; }
.summary-grid { grid-template-columns: 1fr; }
.week-metrics { display: grid; gap: 5px; margin-top: 12px; }
.metric-value { font-size: 1.08em; font-weight: 950; }
.metric-value.good { color: var(--blue); }
.metric-value.bad { color: var(--red); }
.prize-claim-card { position: relative; }
.redeemed-check { position: absolute; top: 9px; right: 9px; display: grid; width: 25px; height: 25px; place-items: center; border-radius: 999px; background: var(--green); color: white; font-size: .95rem; font-weight: 950; box-shadow: 0 8px 18px rgba(34, 197, 94, .28); }
`
if (!cssText.includes('.activity-stars') || !cssText.includes('.week-metrics') || !cssText.includes('.redeemed-check')) {
  cssText = cssText.trimEnd() + cssAdd
}
fs.writeFileSync(cssPath, cssText, 'utf8')
