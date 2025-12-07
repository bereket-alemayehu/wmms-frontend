import apiClient from '@/lib/axios'
import type { User, UserRole } from '../types'

export interface LoginRequest {
  phoneNumber: string
  role: UserRole
  otp: string
}

export interface LoginResponse {
  user: User
  token: string
}

export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/login', data)
    return response.data
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout')
  },

  verifyOtp: async (phoneNumber: string, otp: string): Promise<{ valid: boolean }> => {
    const response = await apiClient.post<{ valid: boolean }>('/auth/verify-otp', { phoneNumber, otp })
    return response.data
  },
}

