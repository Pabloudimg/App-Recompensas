const fs = require('fs')
const path = require('path')

const mainPath = path.join(process.cwd(), 'src', 'main.jsx')
const cssPath = path.join(process.cwd(), 'src', 'styles.css')

let mainText = fs.readFileSync(mainPath, 'utf8')
let cssText = fs.readFileSync(cssPath, 'utf8')

function replaceOnce(text, oldText, newText) {
  return text.includes(oldText) ? text.replace(oldText, newText) : text
}

function insertBefore(text, marker, insertion) {
  return text.includes(insertion.trim().split('\n')[0]) ? text : text.replace(marker, insertion + '\n' + marker)
}

const oldTransferFunction = [
  '  function transferBalanceToNextWeek(childId, weekKey, amount) {',
  '    const nextWeekKey = getNextWeekKey(weekKey)',
  '    const transferAmount = Math.max(0, Math.round(Number(amount) || 0))',
  '    setData((current) => ({',
  '      ...current,',
  '      transfers: {',
  '        ...(current.transfers ?? {}),',
  '        [nextWeekKey]: {',
  '          ...(current.transfers?.[nextWeekKey] ?? {}),',
  '          [childId]: transferAmount',
  '        }',
  '      }',
  '    }))',
  '  }'
].join('\n')
const newTransferFunction = [
  '  function transferBalanceToNextWeek(childId, weekKey, amount) {',
  '    const nextWeekKey = getNextWeekKey(weekKey)',
  '    const transferAmount = Math.max(0, Math.round(Number(amount) || 0))',
  '    setData((current) => {',
  '      const nextWeekTransfers = current.transfers?.[nextWeekKey] ?? {}',
  '      const alreadyTransferred = Number(nextWeekTransfers[childId] ?? 0) > 0',
  '      const nextChildTransfers = { ...nextWeekTransfers }',
  '',
  '      if (alreadyTransferred) {',
  '        delete nextChildTransfers[childId]',
  '      } else {',
  '        nextChildTransfers[childId] = transferAmount',
  '      }',
  '',
  '      return {',
  '        ...current,',
  '        transfers: {',
  '          ...(current.transfers ?? {}),',
  '          [nextWeekKey]: nextChildTransfers',
  '        }',
  '      }',
  '    })',
  '  }'
].join('\n')
mainText = replaceOnce(mainText, oldTransferFunction, newTransferFunction)

const oldRemovePhotoFunction = [
  '  function removeChildPhoto(childId) {',
  '    setData((current) => ({',
  '      ...current,',
  "      children: current.children.map((child) => (child.id === childId ? { ...child, photo: '' } : child))",
  '    }))',
  '  }'
].join('\n')

const childProfileFunctions = [
  oldRemovePhotoFunction,
  '',
  '  function updateChildProfile(childId, patch) {',
  '    setData((current) => ({',
  '      ...current,',
  '      children: current.children.map((child) =>',
  '        child.id === childId ? { ...child, ...patch } : child',
  '      )',
  '    }))',
  '  }',
  '',
  '  function addChildProfile(child) {',
  "    const name = String(child.name ?? '').trim()",
  '    if (!name) return',
  '    const id = createId(name)',
  "    const birthDate = child.birthDate || ''",
  '    setData((current) => ({',
  '      ...current,',
  '      children: [',
  '        ...current.children,',
  '        {',
  '          id,',
  '          name,',
  '          birthDate,',
  '          age: calculateAge(birthDate, 0),',
  "          avatar: getRandomChildEmoji(),",
  "          photo: getRandomPlaceholderPhoto(name),",
  "          theme: child.theme || 'blue'",
  '        }',
  '      ]',
  '    }))',
  '    setSelectedChildId(id)',
  '  }',
  '',
  '  function removeChildProfile(childId) {',
  '    if (data.children.length <= 1) {',
  "      alert('É necessário manter pelo menos uma criança cadastrada.')",
  '      return',
  '    }',
  "    const confirmation = window.confirm('Remover esta criança do cadastro? O histórico antigo ficará salvo, mas não será exibido.')",
  '    if (!confirmation) return',
  '    const nextSelected = data.children.find((child) => child.id !== childId)?.id',
  '    setData((current) => ({',
  '      ...current,',
  '      children: current.children.filter((child) => child.id !== childId)',
  '    }))',
  '    if (selectedChildId === childId && nextSelected) setSelectedChildId(nextSelected)',
  '  }'
].join('\n')
if (!mainText.includes('function updateChildProfile')) {
  mainText = replaceOnce(mainText, oldRemovePhotoFunction, childProfileFunctions)
}
mainText = mainText.replace("          avatar: child.avatar || '🙂',", "          avatar: getRandomChildEmoji(),")
mainText = mainText.replace("          photo: '',", "          photo: getRandomPlaceholderPhoto(name),")

const oldWeekCall = "        {activeTab === 'week' && <WeekPanel summaries={weeklySummaries} rewards={data.rewards} selectedDate={selectedDate} rewardRedemptions={data.rewardRedemptions} transfers={data.transfers} onTogglePrize={togglePrizeRedemption} onTransferBalance={transferBalanceToNextWeek} />}"
const newWeekCall = "        {activeTab === 'week' && <WeekPanel summaries={weeklySummaries.filter((summary) => summary.child.id === selectedChildId)} rewards={data.rewards} selectedDate={selectedDate} rewardRedemptions={data.rewardRedemptions} transfers={data.transfers} onTogglePrize={togglePrizeRedemption} onTransferBalance={transferBalanceToNextWeek} />}"
mainText = replaceOnce(mainText, oldWeekCall, newWeekCall)

mainText = replaceOnce(mainText, '                <span className="child-age">{child.age} anos</span>', '                <span className="child-age">{getChildAgeLabel(child)}</span>')
mainText = replaceOnce(mainText, '                <AvatarPicker child={child} onPhotoChange={updateChildPhoto} onRemovePhoto={removeChildPhoto} />', '                <span className="avatar static-avatar">{child.photo ? <img src={child.photo} alt={\'Foto de \' + child.name} /> : child.avatar}</span>')

const oldNavChildren = "          <button className={activeTab === 'rewards' ? 'active' : ''} onClick={() => setActiveTab('rewards')}>Prêmios</button>\n          <button className={activeTab === 'data' ? 'active' : ''} onClick={() => setActiveTab('data')}>Dados</button>"
const newNavChildren = "          <button className={activeTab === 'rewards' ? 'active' : ''} onClick={() => setActiveTab('rewards')}>Prêmios</button>\n          <button className={activeTab === 'children' ? 'active' : ''} onClick={() => setActiveTab('children')}>Crianças</button>\n          <button className={activeTab === 'data' ? 'active' : ''} onClick={() => setActiveTab('data')}>Dados</button>"
if (!mainText.includes("setActiveTab('children')")) mainText = replaceOnce(mainText, oldNavChildren, newNavChildren)

const oldPanelChildren = "        {activeTab === 'rewards' && <RewardsPanel rewards={data.rewards} onAddReward={addReward} onUpdateReward={updateReward} onRemoveReward={removeReward} />}\n        {activeTab === 'data' && <DataPanel data={data} onImportData={importData} onResetData={resetData} />}"
const newPanelChildren = "        {activeTab === 'rewards' && <RewardsPanel rewards={data.rewards} onAddReward={addReward} onUpdateReward={updateReward} onRemoveReward={removeReward} />}\n        {activeTab === 'children' && <ChildrenPanel children={data.children} selectedChildId={selectedChildId} onSelectChild={setSelectedChildId} onAddChild={addChildProfile} onUpdateChild={updateChildProfile} onRemoveChild={removeChildProfile} onPhotoChange={updateChildPhoto} onRemovePhoto={removeChildPhoto} />}\n        {activeTab === 'data' && <DataPanel data={data} onImportData={importData} onResetData={resetData} />}"
if (!mainText.includes('<ChildrenPanel')) mainText = replaceOnce(mainText, oldPanelChildren, newPanelChildren)

const oldTodayPoints = [
  '                  <h3>{activity.title}</h3>',
  "                  <p>{activity.points} estrela{activity.points > 1 ? 's' : ''}</p>"
].join('\n')
const newTodayPoints = [
  '                  <h3 className="mission-heading">',
  '                    <span>{activity.title}</span>',
  '                    <sup className="activity-stars">',
  '                      {Array.from({ length: Math.max(0, Math.min(99, Number(activity.points) || 0)) }, (_, starIndex) => <span key={starIndex}>⭐</span>)}',
  '                    </sup>',
  '                  </h3>'
].join('\n')
if (!mainText.includes('className="activity-stars"')) mainText = replaceOnce(mainText, oldTodayPoints, newTodayPoints)

const oldWeekMetrics = [
  '              <ProgressBar value={summary.percentage} />',
  '              <div className="big-number">{summary.percentage}%</div>',
  '              <p className="summary-points">⭐ {summary.points} estrelas acumuladas</p>',
  '              <p className="summary-finance">↔️ {transferred} estrelas transferidas</p>',
  '              <p className="summary-finance">🏆 {used} estrelas utilizadas</p>',
  '              <p className="summary-finance balance-line">🧾 {balance} moedas disponíveis</p>',
  '              <p className="reward-tier">{getTierMessage(summary.percentage)}</p>'
].join('\n')
const newWeekMetrics = [
  '              <ProgressBar value={summary.percentage} />',
  '              <div className="week-metrics">',
  '                <p className="summary-points">⭐ <strong className="metric-value good">{summary.points}</strong> estrelas obtidas na semana</p>',
  '                <p className="summary-finance">↔️ <strong className="metric-value good">{transferred}</strong> estrelas transferidas</p>',
  '                <p className="summary-finance">🏆 <strong className="metric-value bad">{used + nextTransfer}</strong> estrelas utilizadas</p>',
  '                <p className="summary-finance balance-line">🧾 <strong className="metric-value good">{Math.max(0, balance - nextTransfer)}</strong> estrelas disponíveis</p>',
  '              </div>'
].join('\n')
if (!mainText.includes('className="week-metrics"')) {
  mainText = replaceOnce(mainText, oldWeekMetrics, newWeekMetrics)
} else {
  mainText = mainText.replace('{used}</strong> estrelas utilizadas', '{used + nextTransfer}</strong> estrelas utilizadas')
  mainText = mainText.replace('{balance}</strong> estrelas disponíveis', '{Math.max(0, balance - nextTransfer)}</strong> estrelas disponíveis')
}

const oldPrizeIcon = ['                      >', '                        <span className="prize-icon">{reward.icon}</span>'].join('\n')
const newPrizeIcon = ['                      >', '                        {isRedeemed && <span className="redeemed-check" aria-hidden="true">✓</span>}', '                        <span className="prize-icon">{reward.icon}</span>'].join('\n')
if (!mainText.includes('className="redeemed-check"')) mainText = replaceOnce(mainText, oldPrizeIcon, newPrizeIcon)

const oldAccumulate = [
  '                  <button',
  '                    className={`prize-claim-card accumulate-card ${nextTransfer > 0 ? \'is-redeemed\' : \'\'}`}',
  '                    onClick={() => onTransferBalance(childId, weekKey, balance)}',
  '                    disabled={balance <= 0}',
  '                  >',
  '                    <span className="prize-icon">🪙</span>',
  '                    <strong>Acumular moedas</strong>',
  '                    <small>Transferir saldo</small>',
  "                    <em>{nextTransfer > 0 ? `${nextTransfer} para próxima semana` : balance > 0 ? `${balance} disponíveis` : 'Sem saldo'}</em>",
  '                  </button>'
].join('\n')
const newAccumulate = [
  '                  <button',
  '                    className={`prize-claim-card accumulate-card ${nextTransfer > 0 ? \'is-redeemed\' : \'\'}`}',
  '                    onClick={() => onTransferBalance(childId, weekKey, Math.max(0, balance - nextTransfer))}',
  '                    disabled={balance <= 0 && nextTransfer <= 0}',
  '                  >',
  '                    {nextTransfer > 0 && <span className="redeemed-check" aria-hidden="true">✓</span>}',
  '                    <span className="prize-icon">🪙</span>',
  '                    <strong>Acumular moedas</strong>',
  '                    <small>Transferir saldo</small>',
  "                    <em>{nextTransfer > 0 ? nextTransfer + ' para próxima semana' : balance > 0 ? balance + ' disponíveis' : 'Sem saldo'}</em>",
  '                  </button>'
].join('\n')
mainText = replaceOnce(mainText, oldAccumulate, newAccumulate)

const themeOptions = '<option value="purple">Roxo</option><option value="blue">Azul</option><option value="green">Verde</option><option value="amber">Âmbar</option><option value="rose">Rosa</option><option value="orange">Laranja</option><option value="teal">Turquesa</option><option value="cyan">Ciano</option><option value="indigo">Índigo</option><option value="slate">Grafite</option>'
const childrenPanel = [
  '',
  'function ChildrenPanel({ children, selectedChildId, onSelectChild, onAddChild, onUpdateChild, onRemoveChild, onPhotoChange, onRemovePhoto }) {',
  "  const [form, setForm] = useState({ name: '', birthDate: '', theme: 'blue' })",
  '',
  '  function submit(event) {',
  '    event.preventDefault()',
  '    if (!form.name.trim()) return',
  '    onAddChild(form)',
  "    setForm({ name: '', birthDate: '', theme: 'blue' })",
  '  }',
  '',
  '  return (',
  '    <section className="panel entrance-card">',
  '      <div className="panel-header"><div><p className="eyebrow">Cadastro</p><h2>Crianças</h2><p className="muted-text">Cadastre nome, data de nascimento e foto. A idade passa a ser calculada automaticamente.</p></div></div>',
  '      <form className="inline-form children-form" onSubmit={submit}>',
  '        <label className="field"><span>Nome</span><input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Nome da criança" /></label>',
  '        <label className="field"><span>Nascimento</span><input type="date" value={form.birthDate} onChange={(event) => setForm({ ...form, birthDate: event.target.value })} /></label>',
  '        <label className="field"><span>Tema</span><select value={form.theme} onChange={(event) => setForm({ ...form, theme: event.target.value })}>' + themeOptions + '</select></label>',
  '        <button type="submit">Adicionar</button>',
  '      </form>',
  '      <div className="settings-list children-settings">',
  '        {children.map((child) => (',
  "          <article key={child.id} className={'child-admin-card theme-' + child.theme}>",
  '            <div className="child-photo-tools">',
  '              <span className="avatar child-admin-avatar">{child.photo ? <img src={child.photo} alt={child.name} /> : child.avatar}</span>',
  "              <label className=\"file-button compact-file\">Trocar foto<input type=\"file\" accept=\"image/png,image/jpeg,image/webp,image/heic,image/heif,image/*\" onChange={(event) => { onPhotoChange(child.id, event.target.files?.[0]); event.currentTarget.value = '' }} /></label>",
  '              {child.photo && <button className="ghost compact-ghost" onClick={() => onRemovePhoto(child.id)}>Remover foto</button>}',
  '            </div>',
  '            <label className="field"><span>Nome</span><input value={child.name} onChange={(event) => onUpdateChild(child.id, { name: event.target.value })} /></label>',
  "            <label className=\"field\"><span>Nascimento</span><input type=\"date\" value={child.birthDate ?? ''} onChange={(event) => onUpdateChild(child.id, { birthDate: event.target.value })} /></label>",
  "            <label className=\"field\"><span>Tema</span><select value={child.theme ?? 'blue'} onChange={(event) => onUpdateChild(child.id, { theme: event.target.value })}>" + themeOptions + "</select></label>",
  '            <div className="child-age-display"><span>Idade</span><strong>{getChildAgeLabel(child)}</strong></div>',
  "            <button className={selectedChildId === child.id ? 'ghost active-selection' : 'ghost'} onClick={() => onSelectChild(child.id)}>{selectedChildId === child.id ? 'Selecionada' : 'Selecionar'}</button>",
  '            <button className="ghost danger" onClick={() => onRemoveChild(child.id)}>Remover</button>',
  '          </article>',
  '        ))}',
  '      </div>',
  '    </section>',
  '  )',
  '}',
  ''
].join('\n')
if (!mainText.includes('function ChildrenPanel')) {
  mainText = mainText.replace('function DataPanel({ data, onImportData, onResetData }) {', childrenPanel + '\nfunction DataPanel({ data, onImportData, onResetData }) {')
}

mainText = replaceOnce(mainText, "    children: (data.children ?? defaultData.children).map((child) => ({ photo: '', ...child })),", "    children: (data.children ?? defaultData.children).map((child, index) => ({ birthDate: '', photo: '', theme: index % 2 === 0 ? 'purple' : 'blue', ...child })),")

const helperFunctions = [
  '',
  'function calculateAge(birthDate, fallbackAge = 0) {',
  '  if (!birthDate) return Number(fallbackAge) || 0',
  '  const birth = parseLocalDate(birthDate)',
  '  if (Number.isNaN(birth.getTime())) return Number(fallbackAge) || 0',
  '  const today = new Date()',
  '  let age = today.getFullYear() - birth.getFullYear()',
  '  const hadBirthdayThisYear = today.getMonth() > birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() >= birth.getDate())',
  '  if (!hadBirthdayThisYear) age -= 1',
  '  return Math.max(0, age)',
  '}',
  '',
  'function getChildAgeLabel(child) {',
  '  const age = calculateAge(child.birthDate, child.age)',
  "  return age === 1 ? '1 ano' : String(age) + ' anos'",
  '}',
  '',
  'function getRandomChildEmoji() {',
  "  const icons = ['🧒', '👧', '👦', '🌟', '🚀', '🦄', '🐼', '🦊', '🐯', '🐵']",
  '  return icons[Math.floor(Math.random() * icons.length)]',
  '}',
  '',
  'function getRandomPlaceholderPhoto(name = \'\') {',
  '  const emoji = getRandomChildEmoji()',
  '  const bgColors = [\'#7c3aed\', \'#0ea5e9\', \'#22c55e\', \'#f59e0b\', \'#ec4899\', \'#14b8a6\', \'#6366f1\', \'#f97316\']',
  '  const bg = bgColors[Math.floor(Math.random() * bgColors.length)]',
  '  const svg = \'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect width="120" height="120" rx="34" fill="\' + bg + \'"/><circle cx="92" cy="24" r="18" fill="rgba(255,255,255,.22)"/><text x="60" y="74" text-anchor="middle" font-size="52">\' + emoji + \'</text></svg>\'',
  '  return \'data:image/svg+xml;charset=UTF-8,\' + encodeURIComponent(svg)',
  '}',
  ''
].join('\n')
if (!mainText.includes('function calculateAge')) {
  mainText = mainText.replace('function createId(value) {', helperFunctions + '\nfunction createId(value) {')
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
.static-avatar { pointer-events: none; }
`
if (!cssText.includes('.activity-stars') || !cssText.includes('.week-metrics') || !cssText.includes('.redeemed-check')) {
  cssText = cssText.trimEnd() + cssAdd
}
if (!cssText.includes('.static-avatar')) cssText = cssText.trimEnd() + '\n.static-avatar { pointer-events: none; }\n'

const childrenCss = `

/* Cadastro de crianças */
.children-form { grid-template-columns: minmax(180px, 1fr) 160px 180px 150px; align-items: end; }
.children-form select, .children-settings select { width: 100%; min-height: 48px; padding: 0 14px; border: 1px solid rgba(124, 58, 237, 0.18); border-radius: 16px; background: var(--field); color: var(--ink); outline: none; }
.children-settings article { grid-template-columns: 180px minmax(160px, 1fr) 150px 180px 92px 118px 105px; align-items: end; }
.child-photo-tools { display: grid; gap: 8px; align-self: stretch; }
.child-admin-avatar { width: 72px; height: 72px; border-radius: 24px; }
.compact-file, .compact-ghost { min-height: 38px; border-radius: 13px; font-size: .82rem; }
.child-age-display { display: grid; gap: 5px; align-self: end; min-height: 48px; align-content: center; }
.child-age-display span { color: var(--ink-muted); font-size: .72rem; font-weight: 950; letter-spacing: .06em; text-transform: uppercase; }
.child-age-display strong { font-size: .95rem; }
.active-selection { background: rgba(34, 197, 94, .16); color: var(--ink); }
.theme-green { background: linear-gradient(135deg, rgba(236, 253, 245, .95), rgba(220, 252, 231, .86)); }
.theme-amber { background: linear-gradient(135deg, rgba(255, 251, 235, .95), rgba(254, 243, 199, .86)); }
.theme-rose { background: linear-gradient(135deg, rgba(255, 241, 242, .95), rgba(252, 231, 243, .86)); }
.theme-orange { background: linear-gradient(135deg, rgba(255, 247, 237, .95), rgba(254, 215, 170, .78)); }
.theme-teal { background: linear-gradient(135deg, rgba(240, 253, 250, .95), rgba(204, 251, 241, .82)); }
.theme-cyan { background: linear-gradient(135deg, rgba(236, 254, 255, .95), rgba(207, 250, 254, .82)); }
.theme-indigo { background: linear-gradient(135deg, rgba(238, 242, 255, .95), rgba(224, 231, 255, .84)); }
.theme-slate { background: linear-gradient(135deg, rgba(248, 250, 252, .95), rgba(226, 232, 240, .84)); }
:root[data-theme="dark"] .theme-green { background: linear-gradient(135deg, rgba(20, 83, 45, .62), rgba(22, 101, 52, .36)); }
:root[data-theme="dark"] .theme-amber { background: linear-gradient(135deg, rgba(120, 53, 15, .62), rgba(146, 64, 14, .36)); }
:root[data-theme="dark"] .theme-rose { background: linear-gradient(135deg, rgba(136, 19, 55, .62), rgba(157, 23, 77, .36)); }
:root[data-theme="dark"] .theme-orange { background: linear-gradient(135deg, rgba(124, 45, 18, .62), rgba(154, 52, 18, .36)); }
:root[data-theme="dark"] .theme-teal { background: linear-gradient(135deg, rgba(19, 78, 74, .62), rgba(17, 94, 89, .36)); }
:root[data-theme="dark"] .theme-cyan { background: linear-gradient(135deg, rgba(21, 94, 117, .62), rgba(14, 116, 144, .36)); }
:root[data-theme="dark"] .theme-indigo { background: linear-gradient(135deg, rgba(49, 46, 129, .62), rgba(67, 56, 202, .36)); }
:root[data-theme="dark"] .theme-slate { background: linear-gradient(135deg, rgba(30, 41, 59, .72), rgba(51, 65, 85, .42)); }
@media (max-width: 820px) { .children-form, .children-settings article { grid-template-columns: 1fr; } .child-photo-tools { grid-template-columns: 72px 1fr; align-items: center; } }
`
if (!cssText.includes('.children-form')) {
  cssText = cssText.trimEnd() + childrenCss
} else if (!cssText.includes('.theme-green')) {
  cssText = cssText.trimEnd() + childrenCss
}

fs.writeFileSync(cssPath, cssText, 'utf8')
