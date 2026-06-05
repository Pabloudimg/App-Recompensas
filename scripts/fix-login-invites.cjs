const fs = require('fs')
const path = require('path')

const filePath = path.join(process.cwd(), 'src', 'main.jsx')
let text = fs.readFileSync(filePath, 'utf8')

text = text.replace(
  "        const invitations = await listPendingInvitesForEmail(currentUser.email)\n        setPendingInvites(invitations)\n",
  "        listPendingInvitesForEmail(currentUser.email).then(setPendingInvites).catch(() => setPendingInvites([]))\n"
)

text = text.replace(
  "createFamilyInvite, ensureFamilyForUser,",
  "createFamilyInvite, removePendingFamilyInvite, ensureFamilyForUser,"
)

text = text.replace(
  "    await createFamilyInvite({ family, user, ...invite })\n    setSentInvites(await listSentFamilyInvites(family.id))\n  }",
  "    await createFamilyInvite({ family, user, ...invite })\n    setSentInvites(await listSentFamilyInvites(family.id))\n  }\n\n  async function handleRemoveInvite(invite) {\n    if (!family?.id || invite.status !== 'pendente') return\n    const confirmation = window.confirm('Remover este convite pendente?')\n    if (!confirmation) return\n    await removePendingFamilyInvite(invite.id)\n    setSentInvites(await listSentFamilyInvites(family.id))\n  }"
)

text = text.replace(
  "sentInvites={sentInvites} onCreateInvite={handleCreateInvite}",
  "sentInvites={sentInvites} onCreateInvite={handleCreateInvite} onRemoveInvite={handleRemoveInvite}"
)

text = text.replace(
  "function RegistersPanel({ activeRegisterTab, setActiveRegisterTab, activities, children, rewards, sentInvites, onCreateInvite,",
  "function RegistersPanel({ activeRegisterTab, setActiveRegisterTab, activities, children, rewards, sentInvites, onCreateInvite, onRemoveInvite,"
)

text = text.replace(
  "<InvitesPanel sentInvites={sentInvites} onCreateInvite={onCreateInvite} />",
  "<InvitesPanel sentInvites={sentInvites} onCreateInvite={onCreateInvite} onRemoveInvite={onRemoveInvite} />"
)

text = text.replace(
  "function InvitesPanel({ sentInvites, onCreateInvite })",
  "function InvitesPanel({ sentInvites, onCreateInvite, onRemoveInvite })"
)

text = text.replace(
  "<small>Enviado por {invite.invitedByName}</small></article>)}</div>",
  "<small>Enviado por {invite.invitedByName}</small>{invite.status === 'pendente' && <button className=\"ghost danger\" type=\"button\" onClick={() => onRemoveInvite(invite)}>Remover</button>}</article>)}</div>"
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
                <button key={invite.id} onClick={() => onAcceptInvite(invite, invite.relationship)} type="button">
                  Aceitar convite de {invite.invitedByName} para {invite.familyName} como {invite.relationship}
                </button>
              ))}
            </div>
          )}
          <form className="family-setup-form" onSubmit={submit}>
            <label className="field"><span>Nome da Família</span><input value={form.familyName} onChange={(event) => setForm({ ...form, familyName: event.target.value })} placeholder="Ex.: Família Fernandes" required /></label>
            <label className="field"><span>Parentesco</span><select value={form.relationship} onChange={(event) => setForm({ ...form, relationship: event.target.value })} required>{relationshipOptions.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>
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

text = text.replace(
  "onClick={() => onAcceptInvite(invite, form.relationship)} type=\"button\">\n                  Aceitar convite de {invite.invitedByName} para {invite.familyName}",
  "onClick={() => onAcceptInvite(invite, invite.relationship)} type=\"button\">\n                  Aceitar convite de {invite.invitedByName} para {invite.familyName} como {invite.relationship}"
)

fs.writeFileSync(filePath, text, 'utf8')
