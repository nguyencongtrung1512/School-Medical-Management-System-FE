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

export interface CreateMedicalCheckRegistrationDTO {
  parentId: string
  studentId: string
  eventId: string
  note?: string
}

export interface UpdateMedicalCheckRegistrationDTO {
  note?: string
  status?: string
  cancellationReason?: string
}

export interface UpdateRegistrationStatusDTO {
  status: string
  cancellationReason?: string
}

export const medicalCheckRegistrationApi = {
  create: (data: CreateMedicalCheckRegistrationDTO) => {
    return axiosInstance.post('/medical-check-registration/create', data)
  },
  search: (params: {
    pageNum?: number
    pageSize?: number
    query?: string
    parentId?: string
    studentId?: string
    eventId?: string
    status?: string
  }) => {
    return axiosInstance.get('/medical-check-registration/search', { params })
  },
  getById: (id: string) => {
    return axiosInstance.get(`/medical-check-registration/${id}`)
  },
  update: (id: string, data: UpdateMedicalCheckRegistrationDTO) => {
    return axiosInstance.put(`/medical-check-registration/${id}`, data)
  },
  delete: (id: string) => {
    return axiosInstance.delete(`/medical-check-registration/${id}`)
  },
  updateStatus: (id: string, data: UpdateRegistrationStatusDTO) => {
    return axiosInstance.patch(`/medical-check-registration/${id}/status`, data)
  },
  exportExcel: (params: { [key: string]: any }) => {
    return axiosInstance.get('/medical-check-registration/export/excel', { params, responseType: 'blob' })
  }
}
