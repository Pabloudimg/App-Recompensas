const fs = require('fs')
const path = require('path')

const filePath = path.join(process.cwd(), 'src', 'main.jsx')
let text = fs.readFileSync(filePath, 'utf8')

text = text.replace(
  "        const invitations = await listPendingInvitesForEmail(currentUser.email)\n        setPendingInvites(invitations)\n",
  "        setPendingInvites([])\n"
)

if (!text.includes('function FamilySetupPanel(')) {
  const familySetupPanel = `
function FamilySetupPanel({ user, loading, error, pendingInvites = [], onAcceptInvite, onCreateFamily, onSignOut }) {
  const [form, setForm] = useState({ familyName: '', relationship: 'Pai' })

  function submit(event) {
    event.preventDefault()
    if (!form.familyName.trim() || !form.relationship.trim()) return
    onCreateFamily(form)
  }

  return (
    <main className="app-shell">
      <section className="hero-card entrance-card setup-card">
        <div>
          <h1 className="brand-title"><img className="brand-logo" src={logoAppDataUri} alt="" />Level Up</h1>
          <p className="hero-copy italic-copy">Cumpra desafios, ganhe estrelas e ganhe recompensas!</p>
          <p className="muted-text setup-text">Olá, {user.displayName || user.email}. Ainda não encontramos uma família vinculada à sua conta. Preencha os dados abaixo para criar sua conta/família.</p>
          {error && <p className="cloud-error">{error}</p>}
        </div>
        <div>
          {pendingInvites.length > 0 && (
            <div className="pending-invites">
              <h3>Convites pendentes</h3>
              {pendingInvites.map((invite) => (
                <button key={invite.id} onClick={() => onAcceptInvite(invite, form.relationship)} type="button">
                  Aceitar convite de {invite.invitedByName} para {invite.familyName}
                </button>
              ))}
            </div>
          )}
          <form className="family-setup-form" onSubmit={submit}>
            <label className="field">
              <span>Nome da Família</span>
              <input value={form.familyName} onChange={(event) => setForm({ ...form, familyName: event.target.value })} placeholder="Ex.: Família Fernandes" required />
            </label>
            <label className="field">
              <span>Parentesco</span>
              <select value={form.relationship} onChange={(event) => setForm({ ...form, relationship: event.target.value })} required>
                {relationshipOptions.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            </label>
            <button className="google-button" type="submit" disabled={loading}>{loading ? 'Criando...' : 'Confirmar e criar família'}</button>
            <button className="ghost danger" type="button" onClick={onSignOut}>Sair</button>
          </form>
        </div>
      </section>
    </main>
  )
}
`

  text = text.replace('function LoadingScreen() {', `${familySetupPanel}\nfunction LoadingScreen() {`)
}

fs.writeFileSync(filePath, text, 'utf8')
