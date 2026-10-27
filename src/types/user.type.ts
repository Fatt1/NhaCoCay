export type UserRole = "admin" | "customer"

export interface UserProfile {
  uid: string
  fullName: string
  email: string
  phoneNumber: string
  role?: UserRole
  createdAt?: string
  updatedAt?: string
}

export type AuthStatus = "idle" | "loading" | "authenticated" | "unauthenticated" | "error"
