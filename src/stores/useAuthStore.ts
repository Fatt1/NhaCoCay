import { create } from "zustand"
import type { UserProfile, AuthStatus } from "@/types"

const USER_STORAGE_KEY = "nhacocay_current_user"

const getStoredUser = (): UserProfile | null => {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

interface AuthState {
  user: UserProfile | null
  status: AuthStatus
  error: string | null
  setUser: (user: UserProfile | null) => void
  setStatus: (status: AuthStatus) => void
  setError: (error: string | null) => void
  reset: () => void
}

const initialUser = getStoredUser()

export const useAuthStore = create<AuthState>((set) => ({
  user: initialUser,
  status: initialUser ? "authenticated" : "idle",
  error: null,
  setUser: (user) => {
    try {
      if (user) {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
      } else {
        localStorage.removeItem(USER_STORAGE_KEY)
      }
    } catch (e) {
      console.warn("Could not save user to localStorage", e)
    }
    set({ user, status: user ? "authenticated" : "unauthenticated" })
  },
  setStatus: (status) => set({ status }),
  setError: (error) => set({ error, status: "error" }),
  reset: () => {
    try {
      localStorage.removeItem(USER_STORAGE_KEY)
    } catch (e) {
      console.warn("Could not remove user from localStorage", e)
    }
    set({ user: null, status: "unauthenticated", error: null })
  },
}))
