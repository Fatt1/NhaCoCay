import { useEffect } from "react"
import { useAuthStore } from "@/stores"
import { subscribeToAuthChanges } from "@/services"

export const useAuth = () => {
  const { user, status, error, setUser, setStatus, setError } = useAuthStore()

  useEffect(() => {
    setStatus("loading")
    const unsubscribe = subscribeToAuthChanges((firebaseUser) => {
      setUser(firebaseUser)
      setStatus(firebaseUser ? "authenticated" : "unauthenticated")
    })

    return () => unsubscribe()
  }, [setUser, setStatus])

  return {
    user,
    status,
    error,
    isAuthenticated: !!user,
    isLoading: status === "loading",
    setError,
  }
}
