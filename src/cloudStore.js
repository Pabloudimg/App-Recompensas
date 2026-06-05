import { auth, db, googleProvider } from './firebase'
import { onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth'
import { collection, deleteDoc, doc, getDoc, getDocs, query, serverTimestamp, setDoc, where, writeBatch } from 'firebase/firestore'

export function subscribeToAuth(callback) {
  return onAuthStateChanged(auth, callback)
}

export function signInWithGoogle() {
  return signInWithPopup(auth, googleProvider)
}

export function signOut() {
  return firebaseSignOut(auth)
}

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
    emailLower: cleanEmail,
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
  } catch (error) {
    console.warn('Não foi possível listar convites enviados.', error)
    return []
  }
}

export async function listPendingInvitesForEmail(email) {
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
}

export async function acceptFamilyInvite(user, inviteId, relationship) {
  const inviteRef = doc(db, 'familyInvites', inviteId)
  const inviteSnap = await getDoc(inviteRef)
  if (!inviteSnap.exists()) throw new Error('Convite não encontrado.')
  const invite = inviteSnap.data()
  const chosenRelationship = String(invite.relationship || relationship || '').trim()
  const userEmail = String(user.email || '').toLowerCase()

  if (String(invite.email || invite.emailLower || '').toLowerCase() !== userEmail) {
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

export async function loadFamilyData(familyId) {
  const [children, activities, rewards, dailyRecords, dailyNotes, weeklyRedemptions, weeklyTransfers] = await Promise.all([
    loadCollection(familyId, 'children'),
    loadCollection(familyId, 'activities'),
    loadCollection(familyId, 'rewards'),
    loadCollection(familyId, 'dailyRecords'),
    loadCollection(familyId, 'dailyNotes'),
    loadCollection(familyId, 'weeklyRedemptions'),
    loadCollection(familyId, 'weeklyTransfers')
  ])

  return {
    children,
    activities,
    rewards,
    records: dailyRecordsToMap(dailyRecords),
    notes: dailyNotesToMap(dailyNotes),
    rewardRedemptions: redemptionsToMap(weeklyRedemptions),
    transfers: transfersToMap(weeklyTransfers)
  }
}

async function loadCollection(familyId, collectionName) {
  const snapshot = await getDocs(collection(db, 'families', familyId, collectionName))
  return snapshot.docs.map((item) => stripFirestoreFields({ id: item.id, ...item.data() }))
}

export async function saveFamilyData(familyId, data) {
  const childDocs = data.children.map((child) => ({ id: child.id, data: stripUndefined(stripChildForFirestore(child)) }))
  const activityDocs = data.activities.map((activity) => ({ id: activity.id, data: stripUndefined({ ...activity }) }))
  const rewardDocs = data.rewards.map((reward) => ({ id: reward.id, data: stripUndefined({ ...reward }) }))
  const recordDocs = recordsMapToDocs(data.records, data.activities)
  const noteDocs = notesMapToDocs(data.notes)
  const redemptionDocs = redemptionsMapToDocs(data.rewardRedemptions, data.rewards)
  const transferDocs = transfersMapToDocs(data.transfers)

  await saveCollection(familyId, 'children', childDocs)
  await saveCollection(familyId, 'activities', activityDocs)
  await saveCollection(familyId, 'rewards', rewardDocs)
  await saveCollection(familyId, 'dailyRecords', recordDocs)
  await saveCollection(familyId, 'dailyNotes', noteDocs)
  await saveCollection(familyId, 'weeklyRedemptions', redemptionDocs)
  await saveCollection(familyId, 'weeklyTransfers', transferDocs)

  await setDoc(doc(db, 'families', familyId), { updatedAt: serverTimestamp() }, { merge: true })
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

function stripChildForFirestore(child) {
  const copy = { ...child }
  delete copy.avatar
  return copy
}

async function saveCollection(familyId, collectionName, docs) {
  const colRef = collection(db, 'families', familyId, collectionName)
  const currentSnapshot = await getDocs(colRef)
  const nextIds = new Set(docs.map((item) => item.id))

  let batch = writeBatch(db)
  let count = 0

  for (const currentDoc of currentSnapshot.docs) {
    if (!nextIds.has(currentDoc.id)) {
      batch.delete(currentDoc.ref)
      count += 1
    }
  }

  for (const item of docs) {
    batch.set(doc(db, 'families', familyId, collectionName, item.id), {
      ...stripUndefined(item.data),
      updatedAt: serverTimestamp()
    }, { merge: true })
    count += 1

    if (count >= 450) {
      await batch.commit()
      batch = writeBatch(db)
      count = 0
    }
  }

  if (count > 0) await batch.commit()
}

function recordsMapToDocs(records = {}, activities = []) {
  const pointsByActivity = new Map(activities.map((activity) => [activity.id, Number(activity.points || 0)]))
  const docs = []
  Object.entries(records).forEach(([date, childrenRecords]) => {
    Object.entries(childrenRecords ?? {}).forEach(([childId, activityRecords]) => {
      Object.entries(activityRecords ?? {}).forEach(([activityId, status]) => {
        docs.push({
          id: `${date}_${childId}_${activityId}`,
          data: { date, childId, activityId, status, pointsSnapshot: pointsByActivity.get(activityId) ?? 0 }
        })
      })
    })
  })
  return docs
}

function notesMapToDocs(notes = {}) {
  const docs = []
  Object.entries(notes).forEach(([date, childNotes]) => {
    Object.entries(childNotes ?? {}).forEach(([childId, note]) => {
      docs.push({ id: `${date}_${childId}`, data: { date, childId, note } })
    })
  })
  return docs
}

function redemptionsMapToDocs(redemptions = {}, rewards = []) {
  const costByReward = new Map(rewards.map((reward) => [reward.id, Number(reward.cost || 0)]))
  const docs = []
  Object.entries(redemptions).forEach(([weekKey, childrenRedemptions]) => {
    Object.entries(childrenRedemptions ?? {}).forEach(([childId, rewardRedemptions]) => {
      Object.entries(rewardRedemptions ?? {}).forEach(([rewardId, redeemed]) => {
        if (redeemed) {
          docs.push({
            id: `${weekKey}_${childId}_${rewardId}`,
            data: { weekKey, childId, rewardId, costSnapshot: costByReward.get(rewardId) ?? 0, redeemed: true }
          })
        }
      })
    })
  })
  return docs
}

function transfersMapToDocs(transfers = {}) {
  const docs = []
  Object.entries(transfers).forEach(([weekKey, childrenTransfers]) => {
    Object.entries(childrenTransfers ?? {}).forEach(([childId, amount]) => {
      if (Number(amount) > 0) docs.push({ id: `${weekKey}_${childId}`, data: { weekKey, childId, amount: Number(amount) } })
    })
  })
  return docs
}

function dailyRecordsToMap(docs) {
  return docs.reduce((map, item) => {
    if (!item.date || !item.childId || !item.activityId) return map
    if (!map[item.date]) map[item.date] = {}
    if (!map[item.date][item.childId]) map[item.date][item.childId] = {}
    map[item.date][item.childId][item.activityId] = item.status
    return map
  }, {})
}

function dailyNotesToMap(docs) {
  return docs.reduce((map, item) => {
    if (!item.date || !item.childId) return map
    if (!map[item.date]) map[item.date] = {}
    map[item.date][item.childId] = item.note || ''
    return map
  }, {})
}

function redemptionsToMap(docs) {
  return docs.reduce((map, item) => {
    if (!item.weekKey || !item.childId || !item.rewardId) return map
    if (!map[item.weekKey]) map[item.weekKey] = {}
    if (!map[item.weekKey][item.childId]) map[item.weekKey][item.childId] = {}
    map[item.weekKey][childId][item.rewardId] = true
    return map
  }, {})
}

function transfersToMap(docs) {
  return docs.reduce((map, item) => {
    if (!item.weekKey || !item.childId) return map
    if (!map[item.weekKey]) map[item.weekKey] = {}
    map[item.weekKey][item.childId] = Number(item.amount) || 0
    return map
  }, {})
}

function stripFirestoreFields(value) {
  const copy = { ...value }
  delete copy.createdAt
  delete copy.updatedAt
  delete copy.redeemedAt
  return copy
}

function stripUndefined(value) {
  return Object.entries(value).reduce((clean, [key, item]) => {
    if (item !== undefined) clean[key] = item
    return clean
  }, {})
}
