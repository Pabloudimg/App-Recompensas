import { db } from './firebase'
import { subscribeToAuth, signInWithGoogle, signOut, loadFamilyData, saveFamilyData } from './cloudStore'
import { collection, deleteDoc, doc, getDoc, getDocs, query, serverTimestamp, setDoc, where } from 'firebase/firestore'

export { subscribeToAuth, signInWithGoogle, signOut, loadFamilyData, saveFamilyData }

export async function ensureFamilyForUser(user) {
  const profileRef = doc(db, 'userProfiles', user.uid)
  const profileSnap = await getDoc(profileRef)
  if (!profileSnap.exists() || !profileSnap.data().selectedFamilyId) return null

  const profile = profileSnap.data()
  const familyId = profile.selectedFamilyId

  try {
    const familyRef = doc(db, 'families', familyId)
    const familySnap = await getDoc(familyRef)
    if (!familySnap.exists()) return null

    const memberRef = doc(db, 'families', familyId, 'members', user.uid)
    const memberSnap = await getDoc(memberRef)
    const memberData = memberSnap.exists() ? memberSnap.data() : {}
    const member = buildMember({
      user,
      role: memberData.role || profile.role || 'owner',
      relationship: memberData.relationship || profile.relationship || '',
      inviteId: memberData.inviteId || ''
    })
    await setDoc(memberRef, member, { merge: true })

    return { family: { id: familyId, ...familySnap.data() }, member }
  } catch (error) {
    console.warn('Perfil apontava para uma família inexistente ou sem permissão. O app seguirá para criação/convite de família.', error)
    return null
  }
}

export async function createFamilyForUser(user, { familyName, relationship }) {
  const cleanFamilyName = String(familyName || '').trim()
  const cleanRelationship = String(relationship || '').trim()
  if (!cleanFamilyName || !cleanRelationship) throw new Error('Dados obrigatórios da família ausentes.')

  const familyId = `family_${user.uid}`
  const member = buildMember({ user, role: 'owner', relationship: cleanRelationship })

  await setDoc(doc(db, 'families', familyId), {
    name: cleanFamilyName,
    ownerUid: user.uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }, { merge: true })

  await setDoc(doc(db, 'families', familyId, 'members', user.uid), member, { merge: true })
  await setDoc(doc(db, 'userProfiles', user.uid), {
    uid: user.uid,
    name: user.displayName || '',
    email: user.email || '',
    selectedFamilyId: familyId,
    relationship: cleanRelationship,
    updatedAt: serverTimestamp()
  }, { merge: true })

  return { family: { id: familyId, name: cleanFamilyName, ownerUid: user.uid }, member }
}

export async function createFamilyInvite({ family, user, email, relationship }) {
  const cleanEmail = String(email || '').trim().toLowerCase()
  const cleanRelationship = String(relationship || '').trim()
  if (!family?.id || !cleanEmail || !cleanRelationship) throw new Error('Dados do convite ausentes.')

  const inviteId = `${cleanEmail.replace(/[^a-z0-9]+/g, '-')}_${Date.now().toString(36)}`
  const invite = {
    id: inviteId,
    familyId: family.id,
    familyName: family.name || 'Família',
    email: cleanEmail,
    relationship: cleanRelationship,
    status: 'pendente',
    invitedByUid: user.uid,
    invitedByName: user.displayName || user.email || '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }
  await setDoc(doc(db, 'familyInvites', inviteId), invite)
  return invite
}

export async function removePendingFamilyInvite(inviteId) {
  const inviteRef = doc(db, 'familyInvites', inviteId)
  const inviteSnap = await getDoc(inviteRef)
  if (!inviteSnap.exists()) return
  const invite = inviteSnap.data()
  if (invite.status !== 'pendente') throw new Error('Apenas convites pendentes podem ser removidos.')
  await deleteDoc(inviteRef)
}

export async function listSentFamilyInvites(familyId) {
  if (!familyId) return []
  try {
    const snapshot = await getDocs(query(collection(db, 'familyInvites'), where('familyId', '==', familyId)))
    return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))
  } catch {
    return []
  }
}

export async function listPendingInvitesForEmail(email) {
  const cleanEmail = String(email || '').trim().toLowerCase()
  if (!cleanEmail) return []
  try {
    const snapshot = await getDocs(query(collection(db, 'familyInvites'), where('email', '==', cleanEmail)))
    return snapshot.docs.map((item) => ({ id: item.id, ...item.data() })).filter((invite) => invite.status === 'pendente')
  } catch {
    return []
  }
}

export async function acceptFamilyInvite(user, inviteId, relationship) {
  const inviteRef = doc(db, 'familyInvites', inviteId)
  const inviteSnap = await getDoc(inviteRef)
  if (!inviteSnap.exists()) throw new Error('Convite não encontrado.')
  const invite = inviteSnap.data()
  const chosenRelationship = String(invite.relationship || relationship || '').trim()

  if (String(invite.email || '').toLowerCase() !== String(user.email || '').toLowerCase()) {
    throw new Error('Este convite pertence a outro e-mail.')
  }

  await setDoc(doc(db, 'families', invite.familyId, 'members', user.uid), buildMember({ user, role: 'admin', relationship: chosenRelationship, inviteId }), { merge: true })
  await setDoc(doc(db, 'userProfiles', user.uid), {
    uid: user.uid,
    name: user.displayName || '',
    email: user.email || '',
    selectedFamilyId: invite.familyId,
    relationship: chosenRelationship,
    updatedAt: serverTimestamp()
  }, { merge: true })
  await setDoc(inviteRef, {
    status: 'aceito',
    acceptedByUid: user.uid,
    acceptedByName: user.displayName || user.email || '',
    relationship: chosenRelationship,
    updatedAt: serverTimestamp()
  }, { merge: true })
  return { familyId: invite.familyId }
}

function buildMember({ user, role = 'admin', relationship = '', inviteId = '' }) {
  return {
    uid: user.uid,
    name: user.displayName || '',
    email: user.email || '',
    role,
    relationship,
    inviteId,
    updatedAt: serverTimestamp()
  }
}
