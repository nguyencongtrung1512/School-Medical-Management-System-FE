import axiosInstance from '../service/axiosInstance'

export enum RegistrationStatus {
  Pending = 'pending',
  Approved = 'approved',
  Cancelled = 'cancelled',
  Rejected = 'rejected'
}

export interface VaccineRegistration {
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
  student?: { _id: string; fullName?: string }
  event?: { _id: string; title?: string }
}

export interface CreateVaccineRegistrationDTO {
  parentId: string
  studentId: string
  eventId: string
  note?: string
  cancellationReason?: string
  status?: RegistrationStatus
  schoolYear: string
}

export interface UpdateRegistrationStatusDTO {
  status: RegistrationStatus
  cancellationReason?: string
}

export interface SearchVaccineRegistrationParams {
  pageNum?: number
  pageSize?: number
  query?: string
  parentId?: string
  studentId?: string
  eventId?: string
  status?: RegistrationStatus
}

export const vaccineRegistrationApi = {
  create: (data: CreateVaccineRegistrationDTO) => {
    return axiosInstance.post('/vaccine-registration/create', data)
  },
  search: (params: SearchVaccineRegistrationParams) => {
    const { pageNum = 1, pageSize = 10, ...query } = params
    return axiosInstance.get(`/vaccine-registration/search/${pageNum}/${pageSize}`, { params: query })
  },
  getById: (id: string) => {
    return axiosInstance.get(`/vaccine-registration/${id}`)
  },
  update: (id: string, data: CreateVaccineRegistrationDTO) => {
    return axiosInstance.put(`/vaccine-registration/${id}`, data)
  },
  delete: (id: string) => {
    return axiosInstance.delete(`/vaccine-registration/${id}`)
  },
  updateStatus: (id: string, data: UpdateRegistrationStatusDTO) => {
    return axiosInstance.patch(`/vaccine-registration/${id}/status`, data)
  },
  exportExcel: (params: SearchVaccineRegistrationParams) => {
    return axiosInstance.get('/vaccine-registration/export/excel', { params, responseType: 'blob' })
  }
}
