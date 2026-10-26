import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  onAuthStateChanged,
  type User,
} from "firebase/auth"
import { auth } from "@/config/firebase"
import type { LoginFormData, RegisterFormData } from "@/schemas"
import type { UserProfile } from "@/types"

export const mapFirebaseUser = (user: User): UserProfile => {
  const email = user.email || ""
  return {
    uid: user.uid,
    email: email,
    fullName: user.displayName || email.split("@")[0] || "Thành viên",
    phoneNumber: user.phoneNumber || "",
  }
}

export const loginWithEmail = async (data: LoginFormData): Promise<UserProfile> => {
  const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password)
  return mapFirebaseUser(userCredential.user)
}

export const registerWithEmail = async (data: RegisterFormData): Promise<UserProfile> => {
  const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password)
  if (data.fullName) {
    await updateProfile(userCredential.user, { displayName: data.fullName })
  }
  return {
    ...mapFirebaseUser(userCredential.user),
    fullName: data.fullName || userCredential.user.displayName || data.email.split("@")[0],
    phoneNumber: data.phoneNumber || "",
  }
}

export const logout = async (): Promise<void> => {
  await firebaseSignOut(auth)
}

export const subscribeToAuthChanges = (callback: (user: UserProfile | null) => void) => {
  return onAuthStateChanged(auth, (user) => {
    callback(user ? mapFirebaseUser(user) : null)
  })
}
