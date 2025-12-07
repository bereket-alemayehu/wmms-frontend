import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import type { User, UserRole } from "../types"
import { mockUsers } from "@/lib/mock-data"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (phoneNumber: string, role: UserRole) => Promise<boolean>
  logout: () => void
  switchRole: (role: UserRole) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const login = useCallback(async (phoneNumber: string, role: UserRole): Promise<boolean> => {
    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Find or create mock user based on role
    const existingUser = mockUsers.find((u) => u.role === role)
    if (existingUser) {
      setUser({ ...existingUser, phoneNumber })
      setIsLoading(false)
      return true
    }

    setIsLoading(false)
    return false
  }, [])

  const logout = useCallback(() => {
    setUser(null)
  }, [])

  const switchRole = useCallback((role: UserRole) => {
    const userForRole = mockUsers.find((u) => u.role === role)
    if (userForRole) {
      setUser(userForRole)
    }
  }, [])

  return <AuthContext.Provider value={{ user, isLoading, login, logout, switchRole }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

