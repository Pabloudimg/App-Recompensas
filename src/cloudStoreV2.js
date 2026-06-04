import { db } from './firebase'
import { subscribeToAuth, signInWithGoogle, signOut, loadFamilyData, saveFamilyData } from './cloudStore'
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'

export { subscribeToAuth, signInWithGoogle, signOut, loadFamilyData, saveFamilyData }

export async function ensureFamilyForUser(user) {
  const profileRef = doc(db, 'userProfiles', user.uid)
  const profileSnap = await getDoc(profileRef)

  if (!profileSnap.exists() || !profileSnap.data().selectedFamilyId) return null

  const profile = profileSnap.data()
  const familyId = profile.selectedFamilyId
  const familyRef = doc(db, 'families', familyId)
  const familySnap = await getDoc(familyRef)
  if (!familySnap.exists()) return null

  const memberRef = doc(db, 'families', familyId, 'members', user.uid)
  const memberSnap = await getDoc(memberRef)
  const memberData = memberSnap.exists() ? memberSnap.data() : {}
  const member = buildMember(user, memberData.role || profile.role || 'owner', memberData.relationship || profile.relationship || '')

  await setDoc(memberRef, member, { merge: true })

  return {
    family: { id: familyId, ...familySnap.data() },
    member
  }
}

export async function createFamilyForUser(user, { familyName, relationship }) {
  const cleanFamilyName = String(familyName || '').trim()
  const cleanRelationship = String(relationship || '').trim()
  if (!cleanFamilyName || !cleanRelationship) throw new Error('Dados obrigatórios da família ausentes.')

  const familyId = `family_${user.uid}`
  const familyRef = doc(db, 'families', familyId)
  const member = buildMember(user, 'owner', cleanRelationship)

  await setDoc(familyRef, {
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

  return {
    family: { id: familyId, name: cleanFamilyName, ownerUid: user.uid },
    member
  }
}

function buildMember(user, role = 'admin', relationship = '') {
  return {
    uid: user.uid,
    name: user.displayName || '',
    email: user.email || '',
    role,
    relationship,
    updatedAt: serverTimestamp()
  }
}
