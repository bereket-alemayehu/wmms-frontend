import apiClient from '@/lib/axios'
import type { User } from '@/lib/types'

// API Response types
export interface ApiResponse<T> {
  status: 'success' | 'error'
  message?: string
  data?: T
  accessToken?: string
  statusCode?: number
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
 export const  userapi={

     getCustomersByOffice: async (officeId?: string): Promise<ApiResponse<UserListResponse>> => {
    const response = await apiClient.get<ApiResponse<UserListResponse>>('/users/customers', {
      params: { officeId }
    })
    return response.data
  },

   // Get Technicians by office
  getTechniciansByOffice: async (officeId?: string): Promise<ApiResponse<UserListResponse>> => {
    const response = await apiClient.get<ApiResponse<UserListResponse>>('/users/technicians', {
      params: { officeId }
    })
    return response.data
  },

   getSupervisorsByOffice: async (officeId?: string): Promise<ApiResponse<UserListResponse>> => {
    const response = await apiClient.get<ApiResponse<UserListResponse>>('/users/supervisors', {
      params: { officeId }
    })
    return response.data
  },
}