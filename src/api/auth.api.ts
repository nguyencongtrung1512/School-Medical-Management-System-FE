import axiosInstance from '../service/axiosInstance'

interface LoginRequest {
  email: string
  password: string
}

interface LoginResponse {
  success: boolean
  data: string // JWT token
}

export const loginAPI = (data: LoginRequest) => {
  return axiosInstance.post<LoginResponse>('/auth/login', data)
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
