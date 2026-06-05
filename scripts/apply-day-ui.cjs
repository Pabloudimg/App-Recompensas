const fs = require('fs')
const path = require('path')

const mainPath = path.join(process.cwd(), 'src', 'main.jsx')
const cssPath = path.join(process.cwd(), 'src', 'styles.css')

let main = fs.readFileSync(mainPath, 'utf8')
let css = fs.readFileSync(cssPath, 'utf8')

main = main.replace(
  `<button className="icon-action" onClick={() => setThemeMode(themeMode === 'dark' ? 'light' : 'dark')} aria-label="Alternar modo claro e escuro" title="Alternar tema">{themeMode === 'dark' ? '☀️' : '🌙'}</button>\n            <button className="icon-action" onClick={forceCloudSave} aria-label="Salvar agora" title="Salvar agora">💾</button>\n            <button className="icon-action danger" onClick={signOut} aria-label="Sair" title="Sair">🚪</button>\n            <div className="date-card compact-date-card"><span>Data de acompanhamento</span><div className="date-stepper"><button type="button" onClick={() => moveSelectedDate(-1)} aria-label="Dia anterior">‹</button><input type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} /><button type="button" onClick={() => moveSelectedDate(1)} aria-label="Próximo dia">›</button></div></div>`,
  `<button className="icon-action" onClick={() => setThemeMode(themeMode === 'dark' ? 'light' : 'dark')} aria-label="Alternar modo claro e escuro" title="Alternar tema">{themeMode === 'dark' ? '☀️' : '🌙'}</button>\n            <button className="icon-action" onClick={() => window.location.reload()} aria-label="Atualizar página" title="Atualizar página">🔄</button>\n            <button className="icon-action" onClick={forceCloudSave} aria-label="Salvar agora" title="Salvar agora">💾</button>\n            <button className="icon-action danger" onClick={signOut} aria-label="Sair" title="Sair">🚪</button>`
)

main = main.replace(
  `<button className={activeTab === 'today' ? 'active' : ''} onClick={() => setActiveTab('today')}>Hoje</button>`,
  `<button className={activeTab === 'today' ? 'active' : ''} onClick={() => setActiveTab('today')}>Dia</button>`
)

main = main.replace(
  `{activeTab === 'today' && <TodayPanel child={selectedChild} activities={activeActivities} selectedDate={selectedDate} records={data.records} notes={data.notes} onUpdateRecord={updateRecord} onUpdateNote={updateNote} />}`,
  `{activeTab === 'today' && <TodayPanel child={selectedChild} activities={activeActivities} selectedDate={selectedDate} records={data.records} notes={data.notes} onDateStep={moveSelectedDate} onDateChange={setSelectedDate} onUpdateRecord={updateRecord} onUpdateNote={updateNote} />}`
)

main = main.replace(
  `function TodayPanel({ child, activities, selectedDate, records, notes, onUpdateRecord, onUpdateNote })`,
  `function TodayPanel({ child, activities, selectedDate, records, notes, onDateStep, onDateChange, onUpdateRecord, onUpdateNote })`
)

main = main.replace(
  `<div className="panel-header"><div><p className="eyebrow">Marcação diária</p><h2>{child.photo ? <img className="title-photo" src={child.photo} alt="" /> : child.avatar} Missões de {child.name}</h2></div><div className="score-pill"><strong>{todaySummary.points}</strong><span>de {todaySummary.possiblePoints} estrelas</span></div></div>`,
  `<div className="panel-header day-panel-header"><div><p className="eyebrow">Marcação diária</p><h2>{child.photo ? <img className="title-photo" src={child.photo} alt="" /> : child.avatar} Missões de {child.name}</h2></div><div className="score-pill"><strong>{todaySummary.points}</strong><span>de {todaySummary.possiblePoints} estrelas</span></div></div>\n      <div className="day-date-card"><button type="button" onClick={() => onDateStep(-1)} aria-label="Dia anterior">‹</button><div><span>Dia selecionado</span><strong>{formatDisplayDate(selectedDate)}</strong><input type="date" value={selectedDate} onChange={(event) => onDateChange(event.target.value)} /></div><button type="button" onClick={() => onDateStep(1)} aria-label="Próximo dia">›</button></div>`
)

if (!main.includes('function formatDisplayDate')) {
  main = main.replace(
    `function formatFriendlyDate(dateString) { return parseLocalDate(dateString).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) }`,
    `function formatFriendlyDate(dateString) { return parseLocalDate(dateString).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) }\nfunction formatDisplayDate(dateString) { return parseLocalDate(dateString).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' }) }`
  )
}

const cssAdd = `

/* Ajustes da aba Dia */
.hero-actions { grid-template-columns: repeat(4, 48px); min-width: 220px; max-width: 252px; }
.day-panel-header { margin-bottom: 14px; }
.day-date-card { display: grid; grid-template-columns: 52px minmax(0, 1fr) 52px; gap: 10px; align-items: stretch; margin: 0 0 18px; padding: 12px; border-radius: 24px; background: rgba(124, 58, 237, .08); border: 1px solid rgba(124, 58, 237, .12); }
.day-date-card > button { min-height: 58px; border: 0; border-radius: 18px; background: rgba(124, 58, 237, .16); color: var(--ink); font-size: 1.8rem; font-weight: 950; }
.day-date-card > div { display: grid; grid-template-columns: 1fr auto; gap: 4px 10px; align-items: center; min-width: 0; }
.day-date-card span { grid-column: 1 / -1; color: var(--purple); font-size: .72rem; font-weight: 950; letter-spacing: .08em; text-transform: uppercase; }
.day-date-card strong { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: clamp(1.05rem, 2.4vw, 1.45rem); text-transform: capitalize; }
.day-date-card input { max-width: 172px; min-height: 44px; padding: 0 10px; border: 1px solid rgba(124, 58, 237, .18); border-radius: 14px; background: var(--field); color: var(--ink); }
@media (max-width: 920px) { .hero-actions { grid-template-columns: repeat(4, 1fr); min-width: 0; max-width: none; } }
@media (max-width: 560px) { .day-date-card { grid-template-columns: 42px minmax(0, 1fr) 42px; gap: 7px; padding: 10px; } .day-date-card > div { grid-template-columns: 1fr; } .day-date-card input { max-width: none; width: 100%; } .day-date-card > button { min-height: 86px; } }
`
if (!css.includes('Ajustes da aba Dia')) css = css.trimEnd() + cssAdd

fs.writeFileSync(mainPath, main)
fs.writeFileSync(cssPath, css)
