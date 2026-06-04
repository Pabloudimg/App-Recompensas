const fs = require('fs')
const path = require('path')

const mainPath = path.join(process.cwd(), 'src', 'main.jsx')
const cssPath = path.join(process.cwd(), 'src', 'styles.css')

let main = fs.readFileSync(mainPath, 'utf8')
let css = fs.readFileSync(cssPath, 'utf8')

function replaceOnce(oldText, newText) {
  if (main.includes(oldText)) main = main.replace(oldText, newText)
}

main = main.replace("import { ensureFamilyForUser, loadFamilyData, saveFamilyData, signInWithGoogle, signOut, subscribeToAuth } from './cloudStore'", "import { createFamilyForUser, ensureFamilyForUser, loadFamilyData, saveFamilyData, signInWithGoogle, signOut, subscribeToAuth } from './cloudStoreV2'")

if (!main.includes('const relationshipOptions')) {
  main = main.replace("const themeOptions = [\n  ['purple', 'Roxo'], ['blue', 'Azul'], ['green', 'Verde'], ['amber', 'Âmbar'], ['rose', 'Rosa'],\n  ['orange', 'Laranja'], ['teal', 'Turquesa'], ['cyan', 'Ciano'], ['indigo', 'Índigo'], ['slate', 'Grafite']\n]", "const themeOptions = [\n  ['purple', 'Roxo'], ['blue', 'Azul'], ['green', 'Verde'], ['amber', 'Âmbar'], ['rose', 'Rosa'],\n  ['orange', 'Laranja'], ['teal', 'Turquesa'], ['cyan', 'Ciano'], ['indigo', 'Índigo'], ['slate', 'Grafite']\n]\n\nconst relationshipOptions = ['Pai', 'Mãe', 'Avó', 'Avô', 'Tio', 'Tia']")
}

if (!main.includes('const [member, setMember]')) {
  main = main.replace("  const [family, setFamily] = useState(null)\n  const [cloudLoading, setCloudLoading] = useState(true)", "  const [family, setFamily] = useState(null)\n  const [member, setMember] = useState(null)\n  const [needsFamilySetup, setNeedsFamilySetup] = useState(false)\n  const [familySetupLoading, setFamilySetupLoading] = useState(false)\n  const [cloudLoading, setCloudLoading] = useState(true)")
}

replaceOnce("        setFamily(null)\n        setCloudReady(false)\n        setCloudLoading(false)\n        return", "        setFamily(null)\n        setMember(null)\n        setNeedsFamilySetup(false)\n        setCloudReady(false)\n        setCloudLoading(false)\n        return")

replaceOnce("        const userFamily = await ensureFamilyForUser(currentUser)\n        setFamily(userFamily)\n        const cloudData = normalizeData(await loadFamilyData(userFamily.id))", "        const userFamily = await ensureFamilyForUser(currentUser)\n        if (!userFamily) {\n          setFamily(null)\n          setMember(null)\n          setNeedsFamilySetup(true)\n          setCloudReady(false)\n          setCloudLoading(false)\n          return\n        }\n        setNeedsFamilySetup(false)\n        setFamily(userFamily.family)\n        setMember(userFamily.member)\n        const cloudData = normalizeData(await loadFamilyData(userFamily.family.id))")

replaceOnce("        if (!hasCloudContent) await saveFamilyData(userFamily.id, nextData)", "        if (!hasCloudContent) await saveFamilyData(userFamily.family.id, nextData)")

if (!main.includes('async function handleCreateFamily')) {
  main = main.replace("  async function forceCloudSave() {\n    if (!family?.id) return\n    setCloudSaving(true)\n    await saveFamilyData(family.id, normalizeData(data))\n    setCloudSaving(false)\n  }", "  async function forceCloudSave() {\n    if (!family?.id) return\n    setCloudSaving(true)\n    await saveFamilyData(family.id, normalizeData(data))\n    setCloudSaving(false)\n  }\n\n  async function handleCreateFamily(setup) {\n    if (!user) return\n    try {\n      setFamilySetupLoading(true)\n      setCloudError('')\n      const result = await createFamilyForUser(user, setup)\n      const nextData = normalizeData(readLocalData())\n      await saveFamilyData(result.family.id, nextData)\n      setFamily(result.family)\n      setMember(result.member)\n      setData(nextData)\n      setNeedsFamilySetup(false)\n      setCloudReady(true)\n      didInitialCloudLoadRef.current = true\n    } catch (error) {\n      console.error(error)\n      setCloudError('Não foi possível criar a família. Confira os campos e tente novamente.')\n    } finally {\n      setFamilySetupLoading(false)\n    }\n  }\n\n  function moveSelectedDate(days) {\n    const next = parseLocalDate(selectedDate)\n    next.setDate(next.getDate() + days)\n    setSelectedDate(formatDate(next))\n  }")
}

if (!main.includes('FamilySetupPanel')) {
  main = main.replace("  if (!user) {\n    return (\n      <main className=\"app-shell\">\n        <section className=\"hero-card entrance-card login-card\">\n          <div>\n            <p className=\"eyebrow\">App Recompensas</p>\n            <h1>Entre para sincronizar</h1>\n            <p className=\"hero-copy\">Use sua conta Google para acessar a família, compartilhar os dados entre pai e mãe e salvar tudo no Firebase.</p>\n          </div>\n          <button className=\"google-button\" onClick={signInWithGoogle}>Entrar com Google</button>\n        </section>\n      </main>\n    )\n  }", "  if (!user) {\n    return (\n      <main className=\"app-shell\">\n        <section className=\"hero-card entrance-card login-card\">\n          <div>\n            <h1>Level Up</h1>\n            <p className=\"hero-copy italic-copy\">Cumpra desafios, ganhe estrelas e ganhe recompensas!</p>\n          </div>\n          <button className=\"google-button\" onClick={signInWithGoogle}>Entrar com Google</button>\n        </section>\n      </main>\n    )\n  }\n\n  if (needsFamilySetup) {\n    return <FamilySetupPanel user={user} loading={familySetupLoading} error={cloudError} onCreateFamily={handleCreateFamily} onSignOut={signOut} />\n  }")
}

replaceOnce("            <p className=\"eyebrow\">Quadro familiar</p>\n            <h1>App Recompensas</h1>\n            <p className=\"hero-copy\">Marque pequenas conquistas do dia, acompanhe estrelas e combine prêmios para o fim de semana.</p>", "            <h1>Level Up</h1>\n            <p className=\"hero-copy italic-copy\">Cumpra desafios, ganhe estrelas e ganhe recompensas!</p>")

replaceOnce("              <span>👤 {user.displayName || user.email}</span>", "              <span>👤 {user.displayName || user.email}{member?.relationship ? ` (${member.relationship})` : ''}</span>")

replaceOnce("            <button className=\"theme-toggle\" onClick={() => setThemeMode(themeMode === 'dark' ? 'light' : 'dark')} aria-label=\"Alternar modo claro e escuro\">{themeMode === 'dark' ? '☀️ Claro' : '🌙 Escuro'}</button>\n            <button className=\"ghost\" onClick={forceCloudSave}>Salvar agora</button>\n            <button className=\"ghost danger\" onClick={signOut}>Sair</button>\n            <div className=\"date-card\"><span>Data de acompanhamento</span><input type=\"date\" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} /></div>", "            <button className=\"icon-action\" onClick={() => setThemeMode(themeMode === 'dark' ? 'light' : 'dark')} aria-label=\"Alternar modo claro e escuro\" title=\"Alternar tema\">{themeMode === 'dark' ? '☀️' : '🌙'}</button>\n            <button className=\"icon-action\" onClick={forceCloudSave} aria-label=\"Salvar agora\" title=\"Salvar agora\">💾</button>\n            <button className=\"icon-action danger\" onClick={signOut} aria-label=\"Sair\" title=\"Sair\">🚪</button>\n            <div className=\"date-card compact-date-card\"><span>Data de acompanhamento</span><div className=\"date-stepper\"><button type=\"button\" onClick={() => moveSelectedDate(-1)} aria-label=\"Dia anterior\">‹</button><input type=\"date\" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} /><button type=\"button\" onClick={() => moveSelectedDate(1)} aria-label=\"Próximo dia\">›</button></div></div>")

if (!main.includes('function FamilySetupPanel')) {
  main = main.replace("function LoadingScreen() {", "function FamilySetupPanel({ user, loading, error, onCreateFamily, onSignOut }) {\n  const [form, setForm] = useState({ familyName: '', relationship: 'Pai' })\n\n  function submit(event) {\n    event.preventDefault()\n    if (!form.familyName.trim() || !form.relationship.trim()) return\n    onCreateFamily(form)\n  }\n\n  return (\n    <main className=\"app-shell\">\n      <section className=\"hero-card entrance-card setup-card\">\n        <div>\n          <h1>Level Up</h1>\n          <p className=\"hero-copy italic-copy\">Cumpra desafios, ganhe estrelas e ganhe recompensas!</p>\n          <p className=\"muted-text setup-text\">Olá, {user.displayName || user.email}. Ainda não encontramos uma família vinculada à sua conta. Preencha os dados abaixo para criar sua conta/família.</p>\n          {error && <p className=\"cloud-error\">{error}</p>}\n        </div>\n        <form className=\"family-setup-form\" onSubmit={submit}>\n          <label className=\"field\"><span>Nome da Família</span><input value={form.familyName} onChange={(event) => setForm({ ...form, familyName: event.target.value })} placeholder=\"Ex.: Família Fernandes\" required /></label>\n          <label className=\"field\"><span>Parentesco</span><select value={form.relationship} onChange={(event) => setForm({ ...form, relationship: event.target.value })} required>{relationshipOptions.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>\n          <button className=\"google-button\" type=\"submit\" disabled={loading}>{loading ? 'Criando...' : 'Confirmar e criar família'}</button>\n          <button className=\"ghost danger\" type=\"button\" onClick={onSignOut}>Sair</button>\n        </form>\n      </section>\n    </main>\n  )\n}\n\nfunction LoadingScreen() {")
}

fs.writeFileSync(mainPath, main)

const cssAdd = `

/* Ajustes de criação de família e cabeçalho compacto */
.italic-copy { font-style: italic; }
.icon-action { width: 52px; min-height: 46px; border: 0; border-radius: 16px; background: rgba(17, 24, 39, 0.08); color: var(--ink); font-size: 1.25rem; font-weight: 950; }
:root[data-theme="dark"] .icon-action { background: rgba(248, 250, 252, .1); }
.hero-actions { grid-template-columns: repeat(3, 52px); justify-content: end; align-items: start; min-width: 260px; }
.compact-date-card { grid-column: 1 / -1; }
.date-stepper { display: grid; grid-template-columns: 42px minmax(150px, 1fr) 42px; gap: 8px; align-items: center; }
.date-stepper button { min-height: 44px; border: 0; border-radius: 14px; background: rgba(124, 58, 237, .14); color: var(--ink); font-size: 1.5rem; font-weight: 950; }
.date-stepper input { min-width: 0; }
.setup-card { grid-template-columns: 1fr minmax(280px, 360px); align-items: start; }
.setup-text { margin-top: 18px; max-width: 680px; }
.family-setup-form { display: grid; gap: 12px; padding: 16px; border-radius: 24px; background: rgba(124, 58, 237, .08); }
.family-setup-form button { width: 100%; }
@media (max-width: 820px) { .hero-actions { grid-template-columns: repeat(3, 1fr); min-width: 0; justify-content: stretch; } .icon-action { width: 100%; } .setup-card { grid-template-columns: 1fr; } }
`
if (!css.includes('Ajustes de criação de família e cabeçalho compacto')) css = css.trimEnd() + cssAdd
fs.writeFileSync(cssPath, css)
