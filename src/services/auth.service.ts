import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  onAuthStateChanged,
  type User,
} from "firebase/auth"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { auth, db } from "@/config/firebase"
import type { LoginFormData, RegisterFormData } from "@/schemas"
import type { UserProfile, UserRole } from "@/types"

export const ADMIN_EMAILS: string[] = [
  "admin@nhacocay.vn",
  "admin.nhacocay@gmail.com",
]

export const isAdminEmail = (email?: string | null): boolean => {
  if (!email) return false
  return ADMIN_EMAILS.includes(email.trim().toLowerCase())
}

export const fetchUserRole = async (uid: string, email?: string): Promise<UserRole> => {
  try {
    const userDoc = await getDoc(doc(db, "users", uid))
    if (userDoc.exists()) {
      const data = userDoc.data()
      if (data.role === "admin" || data.role === "customer") {
        return data.role
      }
    }
  } catch (err) {
    console.warn("Could not fetch user role from Firestore, falling back to email check", err)
  }
  return isAdminEmail(email) ? "admin" : "customer"
}

export const syncUserProfileDoc = async (user: UserProfile): Promise<void> => {
  try {
    const userRef = doc(db, "users", user.uid)
    await setDoc(
      userRef,
      {
        uid: user.uid,
        email: user.email,
        fullName: user.fullName,
        phoneNumber: user.phoneNumber,
        role: user.role || (isAdminEmail(user.email) ? "admin" : "customer"),
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    )
  } catch (err) {
    console.warn("Could not sync user profile to Firestore:", err)
  }
}

export const mapFirebaseUser = (user: User, role?: UserRole): UserProfile => {
  const email = user.email || ""
  const determinedRole: UserRole = role || (isAdminEmail(email) ? "admin" : "customer")
  return {
    uid: user.uid,
    email: email,
    fullName: user.displayName || email.split("@")[0] || "Thành viên",
    phoneNumber: user.phoneNumber || "",
    role: determinedRole,
  }
}

export const loginWithEmail = async (data: LoginFormData): Promise<UserProfile> => {
  const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password)
  const role = await fetchUserRole(userCredential.user.uid, userCredential.user.email || data.email)
  const profile = mapFirebaseUser(userCredential.user, role)
  syncUserProfileDoc(profile).catch(console.error)
  return profile
}

export const registerWithEmail = async (data: RegisterFormData): Promise<UserProfile> => {
  const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password)
  if (data.fullName) {
    await updateProfile(userCredential.user, { displayName: data.fullName })
  }
  const role: UserRole = isAdminEmail(data.email) ? "admin" : "customer"
  const profile: UserProfile = {
    ...mapFirebaseUser(userCredential.user, role),
    fullName: data.fullName || userCredential.user.displayName || data.email.split("@")[0],
    phoneNumber: data.phoneNumber || "",
    role,
  }
  syncUserProfileDoc(profile).catch(console.error)
  return profile
}

export const logout = async (): Promise<void> => {
  await firebaseSignOut(auth)
}

export const subscribeToAuthChanges = (callback: (user: UserProfile | null) => void) => {
  return onAuthStateChanged(auth, async (user) => {
    if (!user) {
      callback(null)
      return
    }
    const role = await fetchUserRole(user.uid, user.email || "")
    callback(mapFirebaseUser(user, role))
  })
}
