import axiosInstance from '../service/axiosInstance'

// ========================= TẠO SỰ KIỆN =========================
export const createMedicalCheckEvent = async (data: {
  eventName: string
  gradeId: string
  description: string
  location: string
  startRegistrationDate: string
  endRegistrationDate: string
  eventDate: string
  schoolYear: string
}) => {
  const response = await axiosInstance.post('/medical-check-events/create', data)
  return response.data
}

// ========================= LẤY DANH SÁCH/TÌM KIẾM =========================
export const searchMedicalCheckEvents = async (params: { schoolYear: string; pageSize: number; pageNum: number }) => {
  const response = await axiosInstance.get('/medical-check-events/search', {
    params
  })
  return response.data
}

// ========================= XEM CHI TIẾT =========================
export const getMedicalCheckEventDetail = async (id: string) => {
  const response = await axiosInstance.get(`/medical-check-events/${id}`)
  return response.data
}

// ========================= CẬP NHẬT =========================
export const updateMedicalCheckEvent = async (
  id: string,
  data: {
    eventName?: string
    gradeId?: string
    description?: string
    location?: string
    startRegistrationDate?: string
    endRegistrationDate?: string
    eventDate?: string
    schoolYear?: string
  }
) => {
  const response = await axiosInstance.put(`/medical-check-events/${id}`, data)
  return response.data
}

// ========================= ĐỔI TRẠNG THÁI =========================
export const patchMedicalCheckEventStatus = async (id: string, status: string) => {
  const response = await axiosInstance.patch(`/medical-check-events/${id}/status`, { status })
  return response.data
}

// ========================= XÓA =========================
export const deleteMedicalCheckEvent = async (id: string) => {
  const response = await axiosInstance.delete(`/medical-check-events/${id}`)
  return response.data
}
