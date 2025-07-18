import axiosInstance from '../service/axiosInstance'

export interface MedicineDetail {
  _id?: string
  name: string
  dosage?: string
  usageInstructions?: string
  quantity: number
  timesPerDay: number
  timeSlots: string[]
  note?: string
  reason?: string
  createdAt?: string
  updatedAt?: string
}

export const medicineDetailApi = {
  // Tìm kiếm chi tiết thuốc có phân trang
  search: (params: { pageNum: number; pageSize: number; query?: string }) => {
    return axiosInstance.get('/medicine-detail/search', { params })
  },

  // Tạo chi tiết thuốc mới
  create: (data: Partial<MedicineDetail>) => {
    return axiosInstance.post('/medicine-detail', data)
  },

  // Lấy chi tiết thuốc theo ID
  getById: (id: string) => {
    return axiosInstance.get(`/medicine-detail/${id}`)
  },

  // Cập nhật chi tiết thuốc
  update: (id: string, data: Partial<MedicineDetail>) => {
    return axiosInstance.put(`/medicine-detail/${id}`, data)
  },

  // Xóa chi tiết thuốc
  delete: (id: string) => {
    return axiosInstance.delete(`/medicine-detail/${id}`)
  }
}
