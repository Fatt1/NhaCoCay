export interface UserProfile {
  uid: string
  fullName: string
  email: string
  phoneNumber: string
  createdAt?: string
  updatedAt?: string
}

export type AuthStatus = "idle" | "loading" | "authenticated" | "unauthenticated" | "error"
