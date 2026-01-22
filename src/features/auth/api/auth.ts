import apiClient from '@/lib/axios'
import type { User } from '../types'

// API Response types
export interface ApiResponse<T> {
  status: 'success' | 'error'
  message?: string
  data?: T
  accessToken?: string
  statusCode?: number
}

export interface SignupInitiateRequest {
  serviceNumber: string
  password: string
  passwordConfirm: string
}

export interface SignupInitiateResponse {
  fullName: string
  email: string
}

export interface SignupVerifyOtpRequest {
  serviceNumber: string
  otp: string
}

export interface LoginRequest {
  serviceNumber: string
  password: string
}

export interface AuthResponse {
  user: User
}

export interface UserListResponse {
  documents?: User[]
  customers?: User[]
  technicians?: User[]
  supervisors?: User[]
}

export const authApi = {
  // Signup - Step 1: Initiate
  signupInitiate: async (data: SignupInitiateRequest): Promise<ApiResponse<SignupInitiateResponse>> => {
    const response = await apiClient.post<ApiResponse<SignupInitiateResponse>>('/auth/signup/initiate', data)
    return response.data
  },

  // Signup - Step 2: Verify OTP
  signupVerifyOtp: async (data: SignupVerifyOtpRequest): Promise<ApiResponse<AuthResponse>> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/signup/verify-otp', data)
    return response.data
  },

  // Login
  login: async (data: LoginRequest): Promise<ApiResponse<AuthResponse>> => {
    try {
      const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', data)
      return response.data
    } catch (error: any) {
      // Re-throw with the error response data so it can be handled upstream
      throw error
    }
  },

  // Logout
  logout: async (): Promise<ApiResponse<null>> => {
    const response = await apiClient.post<ApiResponse<null>>('/auth/logout')
    return response.data
  },

  // Get current user
  getCurrentUser: async (): Promise<ApiResponse<AuthResponse>> => {
    const response = await apiClient.get<ApiResponse<AuthResponse>>('/auth/me')
    return response.data
  },






  // Forgot password
  forgotPassword: async (serviceNumber: string): Promise<ApiResponse<null>> => {
    const response = await apiClient.post<ApiResponse<null>>('/auth/forgot-password', { serviceNumber })
    return response.data
  },

  // Reset password
  resetPassword: async (token: string, password: string, passwordConfirm: string): Promise<ApiResponse<AuthResponse>> => {
    const response = await apiClient.patch<ApiResponse<AuthResponse>>(`/auth/reset-password/${token}`, {
      password,
      passwordConfirm,
    })
    return response.data
  },

  // Update password
  updatePassword: async (currentPassword: string, newPassword: string, newPasswordConfirm: string): Promise<ApiResponse<AuthResponse>> => {
    const response = await apiClient.patch<ApiResponse<AuthResponse>>('/auth/update-password', {
      currentPassword,
      newPassword,
      newPasswordConfirm,
    })
    return response.data
  },
}

