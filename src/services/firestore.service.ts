import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  type DocumentData,
} from "firebase/firestore"
import { db } from "@/config/firebase"

export const getCollectionData = async <T = DocumentData>(collectionName: string): Promise<T[]> => {
  const querySnapshot = await getDocs(collection(db, collectionName))
  return querySnapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as T)
}

export const getDocumentData = async <T = DocumentData>(
  collectionName: string,
  docId: string
): Promise<T | null> => {
  const docRef = doc(db, collectionName, docId)
  const docSnap = await getDoc(docRef)
  if (!docSnap.exists()) return null
  return { id: docSnap.id, ...docSnap.data() } as T
}

export const setDocumentData = async (
  collectionName: string,
  docId: string,
  data: DocumentData
): Promise<void> => {
  const docRef = doc(db, collectionName, docId)
  await setDoc(docRef, data, { merge: true })
}

export const updateDocumentData = async (
  collectionName: string,
  docId: string,
  data: Partial<DocumentData>
): Promise<void> => {
  const docRef = doc(db, collectionName, docId)
  await updateDoc(docRef, data)
}

export const deleteDocumentData = async (
  collectionName: string,
  docId: string
): Promise<void> => {
  const docRef = doc(db, collectionName, docId)
  await deleteDoc(docRef)
}
