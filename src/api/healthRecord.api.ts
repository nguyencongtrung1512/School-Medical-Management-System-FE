import axiosInstance from '../service/axiosInstance'

export interface HealthRecord {
  _id: string
  studentId: string
  healthStatus: string
  notes?: string
  createdAt?: string
  updatedAt?: string
}

export const healthRecordApi = {
  // Tìm kiếm hồ sơ sức khỏe có phân trang
  search: (params: { pageNum: number; pageSize: number; query?: string; studentId?: string }) => {
    return axiosInstance.get('/health-records/search', { params })
  },

  // Tạo hồ sơ sức khỏe mới
  create: (data: Partial<HealthRecord>) => {
    return axiosInstance.post('/health-records', data)
  },

  // Lấy hồ sơ sức khỏe theo ID
  getById: (id: string) => {
    return axiosInstance.get(`/health-records/${id}`)
  },

  // Cập nhật hồ sơ sức khỏe
  update: (id: string, data: Partial<HealthRecord>) => {
    return axiosInstance.put(`/health-records/${id}`, data)
  },

  // Xóa hồ sơ sức khỏe
  delete: (id: string) => {
    return axiosInstance.delete(`/health-records/${id}`)
  }
}
