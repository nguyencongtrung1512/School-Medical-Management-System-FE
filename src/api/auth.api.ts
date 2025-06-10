import axiosInstance from '../service/axiosInstance'

interface LoginRequest {
  email: string
  password: string
}

interface LoginResponse {
  success: boolean
  data?: string // JWT token
  message?: string // Message, especially for error cases
}

interface RegisterRequest {
  email: string
  password: string
  fullName: string
  phone: string
  image?: string
  isDeleted?: boolean
}

interface RegisterResponse {
  success: boolean
  message: string
  data: {
    email: string
    fullName: string
    phone: string
    role: string
  }
}

export const loginAPI = (data: LoginRequest) => {
  return axiosInstance.post<LoginResponse>('/auth/login', data)
}

export const registerAPI = (data: RegisterRequest) => {
  return axiosInstance.post<RegisterResponse>('/users/register', data)
}

export const logoutAPI = () => {
  return axiosInstance.post('/auth/logout')
}

export const decodeToken = (token: string) => {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        })
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error('Error decoding token:', error)
    return null
  }
}
