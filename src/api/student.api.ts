import axiosInstance from '../service/axiosInstance'
import { AxiosResponse } from 'axios'

export interface StudentProfile {
  _id: string
  fullName: string
  studentCode: string
  studentIdCode: string
  class: string | { name?: string }
  status: 'active' | 'graduated' | 'transferred' | 'reserved'
}

// Lấy danh sách học sinh có tìm kiếm và phân trang
export const getStudentsAPI = (pageSize: number = 10, pageNum: number = 1, keyword?: string) => {
  let url = `/students/search?pageSize=${pageSize}&pageNum=${pageNum}`
  if (keyword) {
    url += `&query=${encodeURIComponent(keyword)}`
  }
  return axiosInstance.get(url)
}

// Lấy chi tiết học sinh theo id
export const getStudentByIdAPI = (id: string): Promise<AxiosResponse<StudentProfile>> => {
  return axiosInstance.get(`/students/${id}`)
}

// Tạo học sinh mới
export const createStudentAPI = (data: {
  fullName: string
  gender: 'male' | 'female' | 'other'
  dob: string
  email: string
  classId: string
  avatar?: string
}) => {
  return axiosInstance.post('/students/create', data)
}

// Cập nhật học sinh
export const updateStudentAPI = (
  id: string,
  data: {
    fullName?: string
    gender?: 'male' | 'female' | 'other'
    dob?: string
    parentId?: string
    classId?: string
    avatar?: string
    status?: 'active' | 'graduated' | 'transferred' | 'reserved'
  }
) => {
  return axiosInstance.put(`/students/${id}`, data)
}

// Xóa học sinh
export const deleteStudentAPI = (id: string) => {
  return axiosInstance.delete(`/students/${id}`)
}
