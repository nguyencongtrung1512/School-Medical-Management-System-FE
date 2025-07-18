import axiosInstance from '../service/axiosInstance'

export interface MedicalCheckRegistration {
  _id: string
  parentId: string
  studentId: string
  eventId: string
  status: string
  cancellationReason?: string
  note?: string
  createdAt?: string
  updatedAt?: string
}

export const medicalCheckRegistrationApi = {
  // Tìm kiếm đăng ký khám sức khỏe có phân trang
  search: (params: { pageNum: number; pageSize: number; query?: string; eventId?: string; parentId?: string; studentId?: string }) => {
    return axiosInstance.get('/medical-check-registrations/search', { params })
  },

  // Tạo đăng ký mới
  create: (data: Partial<MedicalCheckRegistration>) => {
    return axiosInstance.post('/medical-check-registrations', data)
  },

  // Lấy đăng ký theo ID
  getById: (id: string) => {
    return axiosInstance.get(`/medical-check-registrations/${id}`)
  },

  // Cập nhật đăng ký
  update: (id: string, data: Partial<MedicalCheckRegistration>) => {
    return axiosInstance.put(`/medical-check-registrations/${id}`, data)
  },

  // Xóa đăng ký
  delete: (id: string) => {
    return axiosInstance.delete(`/medical-check-registrations/${id}`)
  }
}
