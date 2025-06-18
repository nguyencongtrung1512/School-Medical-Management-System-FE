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

interface UpdateUserResponse {
  success: boolean
  message?: string
  data: Profile
}

interface StudentParent {
  studentCode: string
  type: 'father' | 'mother' | 'guardian'
}

interface LinkStudentRequest {
  studentParents: StudentParent[]
}

interface LinkStudentResponse {
  success: boolean
  data: {
    fullName: string
    studentCode: string
    type: 'father' | 'mother' | 'guardian'
  }[]
  message?: string
}

interface ChangePasswordRequest {
  oldPassword: string
  newPassword: string
}

interface ChangePasswordResponse {
  success: boolean
  message?: string
}

export interface NurseProfile {
  _id: string
  fullName: string
  email: string
  phone: string
  image?: string
}

interface SearchNurseResponse {
  success: boolean
  data: {
    pageData: NurseProfile[]
    total: number
  }
  message?: string
}

// Tìm kiếm user có phân trang, lọc theo vai trò (role)
export const searchUsersAPI = (pageNum: number = 1, pageSize: number = 10, query?: string, role?: string) => {
  let url = `/users/search/${pageNum}/${pageSize}?`
  if (query) url += `query=${encodeURIComponent(query)}&`
  if (role) url += `role=${role}`
  return axiosInstance.get(url)
}

export const searchNurseUsersAPI = (pageNum: number = 1, pageSize: number = 10, query?: string): Promise<AxiosResponse<SearchNurseResponse>> => {
  let url = `/users/search/${pageNum}/${pageSize}?role=school-nurse`
  if (query) url += `&query=${encodeURIComponent(query)}`
  return axiosInstance.get(url)
}

export const getUserByIdAPI = (id: string) => {
  return axiosInstance.get(`/users/${id}`)
}

export const deleteUserAPI = (id: string) => {
  return axiosInstance.delete(`/users/${id}`)
}

export const updateUserAPI = (
  id: string,
  data: { fullName?: string; phone?: string; image?: string }
): Promise<AxiosResponse<UpdateUserResponse>> => {
  return axiosInstance.put(`/users/${id}`, data)
}

export const getCurrentUserAPI = (): Promise<Profile> => {
  return axiosInstance.get(`/users`)
}

export const linkStudentAPI = (data: LinkStudentRequest): Promise<LinkStudentResponse> => {
  return axiosInstance.post('/users/link-students', data)
}

export const changePasswordAPI = (data: ChangePasswordRequest): Promise<AxiosResponse<ChangePasswordResponse>> => {
  return axiosInstance.post('/users/change-password', data)
}
