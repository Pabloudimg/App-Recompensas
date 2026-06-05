const fs = require('fs')
const path = require('path')

const mainPath = path.join(process.cwd(), 'src', 'main.jsx')
const cssPath = path.join(process.cwd(), 'src', 'styles.css')

let main = fs.readFileSync(mainPath, 'utf8')
let css = fs.readFileSync(cssPath, 'utf8')

function replaceOnce(oldText, newText) {
  if (main.includes(oldText)) main = main.replace(oldText, newText)
}

main = main.replace("import { ensureFamilyForUser, loadFamilyData, saveFamilyData, signInWithGoogle, signOut, subscribeToAuth } from './cloudStore'", "import { acceptFamilyInvite, createFamilyForUser, createFamilyInvite, ensureFamilyForUser, listPendingInvitesForEmail, listSentFamilyInvites, loadFamilyData, saveFamilyData, signInWithGoogle, signOut, subscribeToAuth } from './cloudStoreV2'")
main = main.replace("import { createFamilyForUser, ensureFamilyForUser, loadFamilyData, saveFamilyData, signInWithGoogle, signOut, subscribeToAuth } from './cloudStoreV2'", "import { acceptFamilyInvite, createFamilyForUser, createFamilyInvite, ensureFamilyForUser, listPendingInvitesForEmail, listSentFamilyInvites, loadFamilyData, saveFamilyData, signInWithGoogle, signOut, subscribeToAuth } from './cloudStoreV2'")
if (!main.includes("import { logoAppDataUri }")) {
  main = main.replace("import './styles.css'", "import './styles.css'\nimport { logoAppDataUri } from './logoApp'")
}

if (!main.includes('const relationshipOptions')) {
  main = main.replace("const themeOptions = [\n  ['purple', 'Roxo'], ['blue', 'Azul'], ['green', 'Verde'], ['amber', 'Âmbar'], ['rose', 'Rosa'],\n  ['orange', 'Laranja'], ['teal', 'Turquesa'], ['cyan', 'Ciano'], ['indigo', 'Índigo'], ['slate', 'Grafite']\n]", "const themeOptions = [\n  ['purple', 'Roxo'], ['blue', 'Azul'], ['green', 'Verde'], ['amber', 'Âmbar'], ['rose', 'Rosa'],\n  ['orange', 'Laranja'], ['teal', 'Turquesa'], ['cyan', 'Ciano'], ['indigo', 'Índigo'], ['slate', 'Grafite']\n]\n\nconst relationshipOptions = ['Pai', 'Mãe', 'Avó', 'Avô', 'Tio', 'Tia']")
}

if (!main.includes('const [member, setMember]')) {
  main = main.replace("  const [family, setFamily] = useState(null)\n  const [cloudLoading, setCloudLoading] = useState(true)", "  const [family, setFamily] = useState(null)\n  const [member, setMember] = useState(null)\n  const [needsFamilySetup, setNeedsFamilySetup] = useState(false)\n  const [familySetupLoading, setFamilySetupLoading] = useState(false)\n  const [cloudLoading, setCloudLoading] = useState(true)")
}
if (!main.includes('const [activeRegisterTab')) {
  main = main.replace("  const [cloudError, setCloudError] = useState('')", "  const [cloudError, setCloudError] = useState('')\n  const [activeRegisterTab, setActiveRegisterTab] = useState('activities')\n  const [sentInvites, setSentInvites] = useState([])\n  const [pendingInvites, setPendingInvites] = useState([])")
}

replaceOnce("        setFamily(null)\n        setCloudReady(false)\n        setCloudLoading(false)\n        return", "        setFamily(null)\n        setMember(null)\n        setNeedsFamilySetup(false)\n        setCloudReady(false)\n        setCloudLoading(false)\n        return")

replaceOnce("        const userFamily = await ensureFamilyForUser(currentUser)\n        setFamily(userFamily)\n        const cloudData = normalizeData(await loadFamilyData(userFamily.id))", "        const userFamily = await ensureFamilyForUser(currentUser)\n        const invitations = await listPendingInvitesForEmail(currentUser.email)\n        setPendingInvites(invitations)\n        if (!userFamily) {\n          setFamily(null)\n          setMember(null)\n          setNeedsFamilySetup(true)\n          setCloudReady(false)\n          setCloudLoading(false)\n          return\n        }\n        setNeedsFamilySetup(false)\n        setFamily(userFamily.family)\n        setMember(userFamily.member)\n        const cloudData = normalizeData(await loadFamilyData(userFamily.family.id))")

replaceOnce("        if (!hasCloudContent) await saveFamilyData(userFamily.id, nextData)", "        if (!hasCloudContent) await saveFamilyData(userFamily.family.id, nextData)")

if (!main.includes('listSentFamilyInvites(family.id)')) {
  main = main.replace("  useEffect(() => {\n    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))\n  }, [data])", "  useEffect(() => {\n    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))\n  }, [data])\n\n  useEffect(() => {\n    if (!family?.id) return\n    listSentFamilyInvites(family.id).then(setSentInvites).catch((error) => console.error(error))\n  }, [family?.id])")
}

if (!main.includes('async function handleCreateFamily')) {
  main = main.replace("  async function forceCloudSave() {\n    if (!family?.id) return\n    setCloudSaving(true)\n    await saveFamilyData(family.id, normalizeData(data))\n    setCloudSaving(false)\n  }", "  async function forceCloudSave() {\n    if (!family?.id) return\n    setCloudSaving(true)\n    await saveFamilyData(family.id, normalizeData(data))\n    setCloudSaving(false)\n  }\n\n  async function handleCreateFamily(setup) {\n    if (!user) return\n    try {\n      setFamilySetupLoading(true)\n      setCloudError('')\n      const result = await createFamilyForUser(user, setup)\n      const nextData = normalizeData(readLocalData())\n      await saveFamilyData(result.family.id, nextData)\n      setFamily(result.family)\n      setMember(result.member)\n      setData(nextData)\n      setNeedsFamilySetup(false)\n      setCloudReady(true)\n      didInitialCloudLoadRef.current = true\n    } catch (error) {\n      console.error(error)\n      setCloudError('Não foi possível criar a família. Confira os campos e tente novamente.')\n    } finally {\n      setFamilySetupLoading(false)\n    }\n  }\n\n  function moveSelectedDate(days) {\n    const next = parseLocalDate(selectedDate)\n    next.setDate(next.getDate() + days)\n    setSelectedDate(formatDate(next))\n  }")
}

if (!main.includes('async function handleCreateInvite')) {
  main = main.replace("  function resetData() {\n    const confirmation = window.confirm('Tem certeza que deseja restaurar os dados iniciais? O histórico será apagado deste navegador e será salvo na nuvem.')\n    if (confirmation) setData(defaultData)\n  }", "  function resetData() {\n    const confirmation = window.confirm('Tem certeza que deseja restaurar os dados iniciais? O histórico será apagado deste navegador e será salvo na nuvem.')\n    if (confirmation) setData(defaultData)\n  }\n\n  async function handleCreateInvite(invite) {\n    if (!family?.id || !user) return\n    await createFamilyInvite({ family, user, ...invite })\n    setSentInvites(await listSentFamilyInvites(family.id))\n  }\n\n  async function handleAcceptInvite(invite, relationship) {\n    if (!user) return\n    await acceptFamilyInvite(user, invite.id, relationship)\n    window.location.reload()\n  }")
}

if (!main.includes('FamilySetupPanel')) {
  main = main.replace("  if (!user) {\n    return (\n      <main className=\"app-shell\">\n        <section className=\"hero-card entrance-card login-card\">\n          <div>\n            <p className=\"eyebrow\">App Recompensas</p>\n            <h1>Entre para sincronizar</h1>\n            <p className=\"hero-copy\">Use sua conta Google para acessar a família, compartilhar os dados entre pai e mãe e salvar tudo no Firebase.</p>\n          </div>\n          <button className=\"google-button\" onClick={signInWithGoogle}>Entrar com Google</button>\n        </section>\n      </main>\n    )\n  }", "  if (!user) {\n    return (\n      <main className=\"app-shell\">\n        <section className=\"hero-card entrance-card login-card\">\n          <div>\n            <h1 className=\"brand-title\"><img className=\"brand-logo\" src={logoAppDataUri} alt=\"\" />Level Up</h1>\n            <p className=\"hero-copy italic-copy\">Cumpra desafios, ganhe estrelas e ganhe recompensas!</p>\n          </div>\n          <button className=\"google-button\" onClick={signInWithGoogle}>Entrar com Google</button>\n        </section>\n      </main>\n    )\n  }\n\n  if (needsFamilySetup) {\n    return <FamilySetupPanel user={user} loading={familySetupLoading} error={cloudError} pendingInvites={pendingInvites} onAcceptInvite={handleAcceptInvite} onCreateFamily={handleCreateFamily} onSignOut={signOut} />\n  }")
}

replaceOnce("            <p className=\"eyebrow\">Quadro familiar</p>\n            <h1>App Recompensas</h1>\n            <p className=\"hero-copy\">Marque pequenas conquistas do dia, acompanhe estrelas e combine prêmios para o fim de semana.</p>", "            <h1 className=\"brand-title\"><img className=\"brand-logo\" src={logoAppDataUri} alt=\"\" />Level Up</h1>\n            <p className=\"hero-copy italic-copy\">Cumpra desafios, ganhe estrelas e ganhe recompensas!</p>")
replaceOnce("            <h1>Level Up</h1>\n            <p className=\"hero-copy italic-copy\">Cumpra desafios, ganhe estrelas e ganhe recompensas!</p>", "            <h1 className=\"brand-title\"><img className=\"brand-logo\" src={logoAppDataUri} alt=\"\" />Level Up</h1>\n            <p className=\"hero-copy italic-copy\">Cumpra desafios, ganhe estrelas e ganhe recompensas!</p>")
replaceOnce("              <span>👤 {user.displayName || user.email}</span>", "              <span>👤 {user.displayName || user.email}{member?.relationship ? ` (${member.relationship})` : ''}</span>")

replaceOnce("            <button className=\"theme-toggle\" onClick={() => setThemeMode(themeMode === 'dark' ? 'light' : 'dark')} aria-label=\"Alternar modo claro e escuro\">{themeMode === 'dark' ? '☀️ Claro' : '🌙 Escuro'}</button>\n            <button className=\"ghost\" onClick={forceCloudSave}>Salvar agora</button>\n            <button className=\"ghost danger\" onClick={signOut}>Sair</button>\n            <div className=\"date-card\"><span>Data de acompanhamento</span><input type=\"date\" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} /></div>", "            <button className=\"icon-action\" onClick={() => setThemeMode(themeMode === 'dark' ? 'light' : 'dark')} aria-label=\"Alternar modo claro e escuro\" title=\"Alternar tema\">{themeMode === 'dark' ? '☀️' : '🌙'}</button>\n            <button className=\"icon-action\" onClick={forceCloudSave} aria-label=\"Salvar agora\" title=\"Salvar agora\">💾</button>\n            <button className=\"icon-action danger\" onClick={signOut} aria-label=\"Sair\" title=\"Sair\">🚪</button>\n            <div className=\"date-card compact-date-card\"><span>Data de acompanhamento</span><div className=\"date-stepper\"><button type=\"button\" onClick={() => moveSelectedDate(-1)} aria-label=\"Dia anterior\">‹</button><input type=\"date\" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} /><button type=\"button\" onClick={() => moveSelectedDate(1)} aria-label=\"Próximo dia\">›</button></div></div>")

replaceOnce("          <button className={activeTab === 'activities' ? 'active' : ''} onClick={() => setActiveTab('activities')}>Atividades</button>\n          <button className={activeTab === 'rewards' ? 'active' : ''} onClick={() => setActiveTab('rewards')}>Prêmios</button>\n          <button className={activeTab === 'children' ? 'active' : ''} onClick={() => setActiveTab('children')}>Crianças</button>", "          <button className={activeTab === 'registers' ? 'active' : ''} onClick={() => setActiveTab('registers')}>Cadastros</button>")

replaceOnce("        {activeTab === 'activities' && <ActivitiesPanel activities={orderedActivities} children={data.children} onAddActivity={addActivity} onUpdateActivity={updateActivity} onRemoveActivity={removeActivity} onMoveActivity={moveActivity} />}\n        {activeTab === 'rewards' && <RewardsPanel rewards={data.rewards} onAddReward={addReward} onUpdateReward={updateReward} onRemoveReward={removeReward} />}\n        {activeTab === 'children' && <ChildrenPanel children={data.children} selectedChildId={selectedChildId} onSelectChild={setSelectedChildId} onAddChild={addChildProfile} onUpdateChild={updateChildProfile} onRemoveChild={removeChildProfile} onPhotoChange={updateChildPhoto} onRemovePhoto={removeChildPhoto} />}", "        {activeTab === 'registers' && <RegistersPanel activeRegisterTab={activeRegisterTab} setActiveRegisterTab={setActiveRegisterTab} activities={orderedActivities} children={data.children} rewards={data.rewards} sentInvites={sentInvites} onCreateInvite={handleCreateInvite} onAddActivity={addActivity} onUpdateActivity={updateActivity} onRemoveActivity={removeActivity} onMoveActivity={moveActivity} onAddReward={addReward} onUpdateReward={updateReward} onRemoveReward={removeReward} selectedChildId={selectedChildId} onSelectChild={setSelectedChildId} onAddChild={addChildProfile} onUpdateChild={updateChildProfile} onRemoveChild={removeChildProfile} onPhotoChange={updateChildPhoto} onRemovePhoto={removeChildPhoto} />}")

if (!main.includes('function RegistersPanel')) {
  main = main.replace("function ActivitiesPanel", "function RegistersPanel({ activeRegisterTab, setActiveRegisterTab, activities, children, rewards, sentInvites, onCreateInvite, onAddActivity, onUpdateActivity, onRemoveActivity, onMoveActivity, onAddReward, onUpdateReward, onRemoveReward, selectedChildId, onSelectChild, onAddChild, onUpdateChild, onRemoveChild, onPhotoChange, onRemovePhoto }) {\n  return (\n    <section className=\"panel entrance-card\">\n      <div className=\"subtabbar\">\n        <button className={activeRegisterTab === 'activities' ? 'active' : ''} onClick={() => setActiveRegisterTab('activities')}>Atividades</button>\n        <button className={activeRegisterTab === 'rewards' ? 'active' : ''} onClick={() => setActiveRegisterTab('rewards')}>Prêmios</button>\n        <button className={activeRegisterTab === 'children' ? 'active' : ''} onClick={() => setActiveRegisterTab('children')}>Crianças</button>\n        <button className={activeRegisterTab === 'invites' ? 'active' : ''} onClick={() => setActiveRegisterTab('invites')}>Convites</button>\n      </div>\n      {activeRegisterTab === 'activities' && <ActivitiesPanel activities={activities} children={children} onAddActivity={onAddActivity} onUpdateActivity={onUpdateActivity} onRemoveActivity={onRemoveActivity} onMoveActivity={onMoveActivity} />}\n      {activeRegisterTab === 'rewards' && <RewardsPanel rewards={rewards} onAddReward={onAddReward} onUpdateReward={onUpdateReward} onRemoveReward={onRemoveReward} />}\n      {activeRegisterTab === 'children' && <ChildrenPanel children={children} selectedChildId={selectedChildId} onSelectChild={onSelectChild} onAddChild={onAddChild} onUpdateChild={onUpdateChild} onRemoveChild={onRemoveChild} onPhotoChange={onPhotoChange} onRemovePhoto={onRemovePhoto} />}\n      {activeRegisterTab === 'invites' && <InvitesPanel sentInvites={sentInvites} onCreateInvite={onCreateInvite} />}\n    </section>\n  )\n}\n\nfunction InvitesPanel({ sentInvites, onCreateInvite }) {\n  const [form, setForm] = useState({ email: '', relationship: 'Mãe' })\n  const [loading, setLoading] = useState(false)\n\n  async function submit(event) {\n    event.preventDefault()\n    if (!form.email.trim()) return\n    setLoading(true)\n    await onCreateInvite(form)\n    setForm({ email: '', relationship: 'Mãe' })\n    setLoading(false)\n  }\n\n  return (\n    <div className=\"register-panel-content\">\n      <div className=\"panel-header\"><div><p className=\"eyebrow\">Convites</p><h2>Responsáveis da família</h2><p className=\"muted-text\">Convide outro e-mail Google para acessar a mesma família. Quando a pessoa entrar, ela verá o convite pendente.</p></div></div>\n      <form className=\"inline-form invite-form\" onSubmit={submit}>\n        <label className=\"field\"><span>E-mail</span><input type=\"email\" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder=\"email@gmail.com\" required /></label>\n        <label className=\"field\"><span>Parentesco</span><select value={form.relationship} onChange={(event) => setForm({ ...form, relationship: event.target.value })}>{relationshipOptions.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>\n        <button type=\"submit\" disabled={loading}>{loading ? 'Enviando...' : 'Enviar convite'}</button>\n      </form>\n      <div className=\"settings-list invite-list\">{sentInvites.length === 0 ? <article><p className=\"muted-text\">Nenhum convite enviado ainda.</p></article> : sentInvites.map((invite) => <article key={invite.id}><strong>{invite.email}</strong><span>{invite.relationship}</span><span className={'invite-status status-' + invite.status}>{invite.status}</span><small>Enviado por {invite.invitedByName}</small></article>)}</div>\n    </div>\n  )\n}\n\nfunction ActivitiesPanel")
}

if (!main.includes('pendingInvites={pendingInvites}')) {
  main = main.replace('return <FamilySetupPanel user={user} loading={familySetupLoading} error={cloudError} onCreateFamily={handleCreateFamily} onSignOut={signOut} />', 'return <FamilySetupPanel user={user} loading={familySetupLoading} error={cloudError} pendingInvites={pendingInvites} onAcceptInvite={handleAcceptInvite} onCreateFamily={handleCreateFamily} onSignOut={signOut} />')
}

if (!main.includes('function FamilySetupPanel({ user, loading, error, pendingInvites')) {
  main = main.replace('function FamilySetupPanel({ user, loading, error, onCreateFamily, onSignOut }) {', 'function FamilySetupPanel({ user, loading, error, pendingInvites = [], onAcceptInvite, onCreateFamily, onSignOut }) {')
  main = main.replace('<form className="family-setup-form" onSubmit={submit}>', "{pendingInvites.length > 0 && <div className=\"pending-invites\"><h3>Convites pendentes</h3>{pendingInvites.map((invite) => <button key={invite.id} onClick={() => onAcceptInvite(invite, form.relationship)} type=\"button\">Aceitar convite de {invite.invitedByName} para {invite.familyName}</button>)}</div>}\n        <form className=\"family-setup-form\" onSubmit={submit}>")
}

fs.writeFileSync(mainPath, main)

const cssAdd = `

/* Ajustes de criação de família, logo, cadastros e cabeçalho compacto */
.italic-copy { font-style: italic; }
.brand-title { display: flex; align-items: center; gap: 14px; }
.brand-logo { width: .95em; height: .95em; object-fit: cover; border-radius: .24em; box-shadow: 0 12px 30px rgba(245, 158, 11, .22); flex: 0 0 auto; }
.icon-action { width: 48px; min-height: 46px; border: 0; border-radius: 16px; background: rgba(17, 24, 39, 0.08); color: var(--ink); font-size: 1.18rem; font-weight: 950; }
:root[data-theme="dark"] .icon-action { background: rgba(248, 250, 252, .1); }
.hero-actions { grid-template-columns: repeat(3, 48px); justify-content: end; align-items: start; min-width: 268px; max-width: 310px; }
.compact-date-card { grid-column: 1 / -1; overflow: visible; padding: 12px; }
.date-stepper { display: grid; grid-template-columns: 40px minmax(0, 1fr) 40px; gap: 8px; align-items: center; }
.date-stepper button { min-height: 44px; border: 0; border-radius: 14px; background: rgba(124, 58, 237, .14); color: var(--ink); font-size: 1.5rem; font-weight: 950; }
.date-stepper input { min-width: 0; width: 100%; padding-inline: 10px; }
.setup-card { grid-template-columns: 1fr minmax(280px, 380px); align-items: start; }
.setup-text { margin-top: 18px; max-width: 680px; }
.family-setup-form, .pending-invites { display: grid; gap: 12px; padding: 16px; border-radius: 24px; background: rgba(124, 58, 237, .08); }
.family-setup-form button, .pending-invites button { width: 100%; }
.pending-invites { margin-bottom: 14px; }
.pending-invites h3 { margin: 0; }
.subtabbar { display: flex; gap: 10px; overflow-x: auto; margin-bottom: 18px; padding-bottom: 4px; }
.subtabbar button { min-height: 42px; padding: 0 16px; border: 0; border-radius: 999px; background: rgba(124, 58, 237, .1); color: var(--ink); font-weight: 950; white-space: nowrap; }
.subtabbar button.active { background: #111827; color: white; }
:root[data-theme="dark"] .subtabbar button.active { background: #f8fafc; color: #111827; }
.register-panel-content .panel { box-shadow: none; border: 0; padding: 0; background: transparent; }
.invite-form { grid-template-columns: minmax(200px, 1fr) 160px 150px; }
.invite-list article { grid-template-columns: minmax(180px, 1fr) 120px 110px minmax(160px, 1fr); align-items: center; }
.invite-status { display: inline-grid; place-items: center; min-height: 32px; padding: 0 10px; border-radius: 999px; background: rgba(245, 158, 11, .16); font-weight: 950; text-transform: capitalize; }
.invite-status.status-aceito { background: rgba(34, 197, 94, .16); }
@media (max-width: 920px) { .hero-actions { grid-template-columns: repeat(3, 1fr); min-width: 0; max-width: none; justify-content: stretch; } .icon-action { width: 100%; } .setup-card, .invite-form, .invite-list article { grid-template-columns: 1fr; } }
@media (max-width: 480px) { .brand-title { gap: 9px; } .brand-logo { width: .82em; height: .82em; } .date-stepper { grid-template-columns: 38px minmax(0, 1fr) 38px; gap: 6px; } .compact-date-card { padding: 10px; } }
`
if (!css.includes('Ajustes de criação de família, logo, cadastros e cabeçalho compacto')) css = css.trimEnd() + cssAdd
fs.writeFileSync(cssPath, css)
