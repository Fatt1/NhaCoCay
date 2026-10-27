import { useEffect } from "react"
import { useAuthStore } from "@/stores"
import { subscribeToAuthChanges } from "@/services"

export const useAuth = () => {
  const { user, status, error, setUser, setStatus, setError } = useAuthStore()

  useEffect(() => {
    setStatus("loading")
    const unsubscribe = subscribeToAuthChanges((firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser)
        setStatus("authenticated")
      } else {
        const stored = localStorage.getItem("nhacocay_current_user")
        if (!stored) {
          setUser(null)
          setStatus("unauthenticated")
        } else {
          setStatus("authenticated")
        }
      }
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
