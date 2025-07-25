import axiosInstance from '../service/axiosInstance'

export enum RegistrationStatus {
  Pending = 'pending',
  Approved = 'approved',
  Cancelled = 'cancelled',
  Rejected = 'rejected',
}

export interface MedicalCheckRegistration {
  _id: string
  parentId: string
  studentId: string
  eventId: string
  status: RegistrationStatus
  cancellationReason?: string
  note?: string
  schoolYear: string
  approvedAt?: string
  isDeleted?: boolean
  createdAt?: string
  updatedAt?: string
  parent?: { _id: string; fullName?: string; email?: string }
  student?: { _id: string; fullName?: string; avatar?: string }
  event?: { _id: string; title?: string }
}

export interface CreateMedicalCheckRegistrationDTO {
  parentId: string
  studentId: string
  eventId: string
  note?: string
  schoolYear: string
}

export interface UpdateMedicalCheckRegistrationDTO extends Partial<CreateMedicalCheckRegistrationDTO> {
  status?: RegistrationStatus
  cancellationReason?: string
}

export interface UpdateRegistrationStatusDTO {
  status: RegistrationStatus
  cancellationReason?: string
}

export interface SearchMedicalCheckRegistrationParams {
  pageNum?: number
  pageSize?: number
  query?: string
  parentId?: string
  studentId?: string
  eventId?: string
  status?: RegistrationStatus
}

export const medicalCheckRegistrationApi = {
  create: (data: CreateMedicalCheckRegistrationDTO) => {
    return axiosInstance.post('/medical-check-registration/create', data)
  },
  search: (params: SearchMedicalCheckRegistrationParams) => {
    return axiosInstance.get('/medical-check-registration/search', { params });
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
  exportExcel: (params: SearchMedicalCheckRegistrationParams) => {
    return axiosInstance.get('/medical-check-registration/export/excel', { params, responseType: 'blob' })
  }
}
