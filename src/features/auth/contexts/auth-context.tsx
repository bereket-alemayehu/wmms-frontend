import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"
import type { User } from "../types"
import { authApi } from "../api/auth"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (serviceNumber: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  signupInitiate: (serviceNumber: string, password: string, passwordConfirm: string) => Promise<{ success: boolean; error?: string; data?: { fullName: string; email: string } }>
  signupVerifyOtp: (serviceNumber: string, otp: string) => Promise<{ success: boolean; error?: string }>
  checkAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true) // Start as true to check auth on mount

  const checkAuth = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await authApi.getCurrentUser()
      if (response.status === 'success' && response.data?.user) {
        setUser(response.data.user)
      } else {
        setUser(null)
      }
    } catch (error) {
      // Not authenticated or token expired - silently fail
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Check if user is authenticated on mount
  useEffect(() => {
    checkAuth()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run once on mount

  const login = useCallback(async (serviceNumber: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true)
      const response = await authApi.login({ serviceNumber, password })
      if (response.status === 'success' && response.data?.user) {
        // Cookie is automatically set by backend
        setUser(response.data.user)
        return { success: true }
      } else {
        // Handle case where response is not success but no exception thrown
        const errorMsg = response.message || 'Login failed'
        return { success: false, error: errorMsg }
      }
    } catch (error: any) {
      // Log full error for debugging
      console.error('=== LOGIN ERROR ===')
      console.error('Error object:', error)
      console.error('Error response:', error.response)
      console.error('Error response data:', error.response?.data)
      console.error('Error message:', error.message)
      console.error('Error response status:', error.response?.status)
      console.error('==================')
      
      // Extract error message from backend response
      let errorMessage = 'Login failed. Please try again.'
      
      // Backend sends errors in this format: 
      // Development: { status: "fail", message: "...", stack: "...", error: {...} }
      // Production: { status: "fail", message: "..." }
      if (error.response?.data) {
        const data = error.response.data
        
        // Try different possible locations for the error message
        if (typeof data.message === 'string' && data.message) {
          errorMessage = data.message
        } else if (data.error?.message) {
          errorMessage = data.error.message
        } else if (typeof data === 'string') {
          errorMessage = data
        } else if (data.status && data.message) {
          errorMessage = data.message
        }
      } else if (error.message) {
        errorMessage = error.message
      }
      
      console.log('Extracted error message:', errorMessage)
      console.log('Full error response data:', error.response?.data)
      
      return { success: false, error: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const signupInitiate = useCallback(async (serviceNumber: string, password: string, passwordConfirm: string): Promise<{ success: boolean; error?: string; data?: { fullName: string; email: string } }> => {
    try {
      setIsLoading(true)
      const response = await authApi.signupInitiate({ serviceNumber, password, passwordConfirm })
      if (response.status === 'success' && response.data) {
        return { success: true, data: response.data }
      } else {
        return { success: false, error: response.message || 'Signup initiation failed' }
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Signup initiation failed. Please try again.'
      return { success: false, error: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const signupVerifyOtp = useCallback(async (serviceNumber: string, otp: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true)
      const response = await authApi.signupVerifyOtp({ serviceNumber, otp })
      if (response.status === 'success' && response.data?.user) {
        // Cookie is automatically set by backend
        setUser(response.data.user)
        return { success: true }
      } else {
        return { success: false, error: response.message || 'OTP verification failed' }
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'OTP verification failed. Please try again.'
      return { success: false, error: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      setIsLoading(true)
      await authApi.logout()
    } catch (error) {
      // Even if API call fails, we still want to clear local state
      console.error("Logout API call failed:", error)
    } finally {
      // Backend clears cookie automatically
      // Just clear user state
      setUser(null)
      setIsLoading(false)
    }
  }, [])

  return <AuthContext.Provider value={{ user, isLoading, login, logout, signupInitiate, signupVerifyOtp, checkAuth }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

