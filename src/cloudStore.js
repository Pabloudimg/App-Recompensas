import { auth, db, googleProvider } from './firebase'
import { onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth'
import { collection, deleteDoc, doc, getDoc, getDocs, serverTimestamp, setDoc, writeBatch } from 'firebase/firestore'

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

  if (profileSnap.exists() && profileSnap.data().selectedFamilyId) {
    const familyId = profileSnap.data().selectedFamilyId
    const familyRef = doc(db, 'families', familyId)
    const familySnap = await getDoc(familyRef)
    await setDoc(doc(db, 'families', familyId, 'members', user.uid), buildMember(user, profileSnap.data().role || 'owner'), { merge: true })
    return { id: familyId, ...(familySnap.exists() ? familySnap.data() : {}) }
  }

  const familyId = `family_${user.uid}`
  const familyRef = doc(db, 'families', familyId)
  const familyName = `Família de ${user.displayName || user.email || 'casa'}`

  await setDoc(familyRef, {
    name: familyName,
    ownerUid: user.uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }, { merge: true })

  await setDoc(doc(db, 'families', familyId, 'members', user.uid), buildMember(user, 'owner'), { merge: true })

  await setDoc(profileRef, {
    uid: user.uid,
    name: user.displayName || '',
    email: user.email || '',
    selectedFamilyId: familyId,
    updatedAt: serverTimestamp()
  }, { merge: true })

  return { id: familyId, name: familyName, ownerUid: user.uid }
}

function buildMember(user, role = 'admin') {
  return {
    uid: user.uid,
    name: user.displayName || '',
    email: user.email || '',
    role,
    updatedAt: serverTimestamp()
  }
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
  const childDocs = data.children.map((child) => ({ id: child.id, data: stripUndefined({ ...child }) }))
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
    map[item.weekKey][item.childId][item.rewardId] = true
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
