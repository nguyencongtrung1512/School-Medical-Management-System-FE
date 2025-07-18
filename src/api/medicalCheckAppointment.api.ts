import axiosInstance from '../service/axiosInstance'

export interface MedicalCheckAppointment {
  _id: string
  studentId: string
  eventId: string
  appointmentTime: string
  status: string
  note?: string
  createdAt?: string
  updatedAt?: string
}

export const medicalCheckAppointmentApi = {
  // Tìm kiếm lịch hẹn khám sức khỏe có phân trang
  search: (params: { pageNum: number; pageSize: number; query?: string; eventId?: string; studentId?: string }) => {
    return axiosInstance.get('/medical-check-appointments/search', { params })
  },

  // Tạo lịch hẹn mới
  create: (data: Partial<MedicalCheckAppointment>) => {
    return axiosInstance.post('/medical-check-appointments', data)
  },

  // Lấy lịch hẹn theo ID
  getById: (id: string) => {
    return axiosInstance.get(`/medical-check-appointments/${id}`)
  },

  // Cập nhật lịch hẹn
  update: (id: string, data: Partial<MedicalCheckAppointment>) => {
    return axiosInstance.put(`/medical-check-appointments/${id}`, data)
  },

  // Xóa lịch hẹn
  delete: (id: string) => {
    return axiosInstance.delete(`/medical-check-appointments/${id}`)
  }
}
