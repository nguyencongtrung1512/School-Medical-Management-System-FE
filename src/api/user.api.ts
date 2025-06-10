import axiosInstance from '../service/axiosInstance'
import { AxiosResponse } from 'axios'

export interface Profile {
  _id: string
  email: string
  fullName: string
  phone: string
  role: string
  isDeleted: boolean
  createdAt: string
  updatedAt: string
  __v: number
  image: string
  studentIds?: string[]
}

interface LinkStudentRequest {
  studentCodes: string[]
}

interface LinkStudentResponse {
  success: boolean
  data: {
    fullName: string
    studentCode: string
  }[]
  message?: string
}
// Tìm kiếm user có phân trang, lọc theo vai trò (role)
export const searchUsersAPI = (pageNum: number = 1, pageSize: number = 10, query?: string, role?: string) => {
  let url = `/users/search/${pageNum}/${pageSize}?`
  if (query) url += `query=${encodeURIComponent(query)}&`
  if (role) url += `role=${role}`
  return axiosInstance.get(url)
}

export const getUserByIdAPI = (id: string) => {
  return axiosInstance.get(`/users/${id}`)
}

export const deleteUserAPI = (id: string) => {
  return axiosInstance.delete(`/users/${id}`)
}

export const updateUserAPI = (id: string, data: { fullName?: string; phone?: string; image?: string }) => {
  return axiosInstance.put(`/users/${id}`, data)
}

export const getCurrentUserAPI = (): Promise<AxiosResponse<Profile>> => {
  return axiosInstance.get(`/users`)
}

export const linkStudentAPI = (data: LinkStudentRequest): Promise<AxiosResponse<LinkStudentResponse>> => {
  return axiosInstance.post('/users/link-students', data)
}
