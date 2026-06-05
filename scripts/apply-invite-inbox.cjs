const fs = require('fs')
const path = require('path')

const filePath = path.join(process.cwd(), 'src', 'cloudStore.js')
let text = fs.readFileSync(filePath, 'utf8')

if (!text.includes('function getInviteInboxId(')) {
  text = text.replace(
    "export function signOut() {\n  return firebaseSignOut(auth)\n}\n",
    "export function signOut() {\n  return firebaseSignOut(auth)\n}\n\nfunction getInviteInboxId(email) {\n  return String(email || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'sem-email'\n}\n"
  )
}

text = text.replace(
  "  await setDoc(doc(db, 'familyInvites', inviteId), invite)\n  return invite",
  "  await setDoc(doc(db, 'familyInvites', inviteId), invite)\n  await setDoc(doc(db, 'inviteInboxes', getInviteInboxId(cleanEmail)), {\n    email: cleanEmail,\n    emailLower: cleanEmail,\n    invites: { [inviteId]: invite },\n    updatedAt: serverTimestamp()\n  }, { merge: true })\n  return invite"
)

text = text.replace(
  "  if (invite.status !== 'pendente') throw new Error('Apenas convites pendentes podem ser removidos.')\n  await deleteDoc(inviteRef)",
  "  if (invite.status !== 'pendente') throw new Error('Apenas convites pendentes podem ser removidos.')\n  const inviteEmail = String(invite.emailLower || invite.email || '').toLowerCase()\n  if (inviteEmail) {\n    await setDoc(doc(db, 'inviteInboxes', getInviteInboxId(inviteEmail)), {\n      email: inviteEmail,\n      emailLower: inviteEmail,\n      invites: { [inviteId]: { ...invite, status: 'removido', updatedAt: serverTimestamp() } },\n      updatedAt: serverTimestamp()\n    }, { merge: true })\n  }\n  await deleteDoc(inviteRef)"
)

const oldList = `export async function listPendingInvitesForEmail(email) {
  const cleanEmail = String(email || '').trim().toLowerCase()
  if (!cleanEmail) return []

  const byId = new Map()
  const queries = [
    query(collection(db, 'familyInvites'), where('email', '==', cleanEmail)),
    query(collection(db, 'familyInvites'), where('emailLower', '==', cleanEmail))
  ]

  for (const inviteQuery of queries) {
    try {
      const snapshot = await getDocs(inviteQuery)
      snapshot.docs.forEach((item) => byId.set(item.id, { id: item.id, ...item.data() }))
    } catch (error) {
      console.warn('Não foi possível executar uma das buscas de convites pendentes.', error)
    }
  }

  return Array.from(byId.values()).filter((invite) => invite.status === 'pendente')
}`

const newList = `export async function listPendingInvitesForEmail(email) {
  const cleanEmail = String(email || '').trim().toLowerCase()
  if (!cleanEmail) return []

  const byId = new Map()

  try {
    const inboxSnap = await getDoc(doc(db, 'inviteInboxes', getInviteInboxId(cleanEmail)))
    if (inboxSnap.exists()) {
      const invites = inboxSnap.data().invites || {}
      Object.entries(invites).forEach(([id, invite]) => byId.set(id, { id, ...invite }))
    }
  } catch (error) {
    console.warn('Não foi possível ler o inbox de convites do e-mail logado.', error)
  }

  const queries = [
    query(collection(db, 'familyInvites'), where('email', '==', cleanEmail)),
    query(collection(db, 'familyInvites'), where('emailLower', '==', cleanEmail))
  ]

  for (const inviteQuery of queries) {
    try {
      const snapshot = await getDocs(inviteQuery)
      snapshot.docs.forEach((item) => byId.set(item.id, { id: item.id, ...item.data() }))
    } catch (error) {
      console.warn('Não foi possível executar uma das buscas de convites pendentes.', error)
    }
  }

  return Array.from(byId.values()).filter((invite) => invite.status === 'pendente')
}`

if (text.includes(oldList)) text = text.replace(oldList, newList)

text = text.replace(
  "  await setDoc(inviteRef, {\n    status: 'aceito',\n    acceptedByUid: user.uid,\n    acceptedByName: user.displayName || user.email || '',\n    relationship: chosenRelationship,\n    updatedAt: serverTimestamp()\n  }, { merge: true })\n  return { familyId: invite.familyId }",
  "  const acceptedInvite = {\n    ...invite,\n    status: 'aceito',\n    acceptedByUid: user.uid,\n    acceptedByName: user.displayName || user.email || '',\n    relationship: chosenRelationship,\n    updatedAt: serverTimestamp()\n  }\n  await setDoc(inviteRef, acceptedInvite, { merge: true })\n  await setDoc(doc(db, 'inviteInboxes', getInviteInboxId(userEmail)), {\n    email: userEmail,\n    emailLower: userEmail,\n    invites: { [inviteId]: acceptedInvite },\n    updatedAt: serverTimestamp()\n  }, { merge: true })\n  return { familyId: invite.familyId }"
)

text = text.replace(
  "map[item.weekKey][childId][item.rewardId] = true",
  "map[item.weekKey][item.childId][item.rewardId] = true"
)

fs.writeFileSync(filePath, text, 'utf8')
