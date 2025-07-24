import axiosInstance from '../service/axiosInstance'

export interface VaccineRegistration {
  _id: string
  parentId: string
  studentId: string
  eventId: string
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
  cancellationReason?: string
  note?: string
  schoolYear: string
  createdAt?: string
  updatedAt?: string
}

export interface CreateVaccineRegistrationDTO {
  parentId: string
  studentId: string
  eventId: string
  note?: string
  cancellationReason?: string
  status?: 'pending' | 'approved' | 'rejected' | 'cancelled'
  schoolYear: string
}

export interface UpdateVaccineRegistrationDTO {
  parentId?: string
  studentId?: string
  eventId?: string
  note?: string
  cancellationReason?: string
  status?: 'pending' | 'approved' | 'rejected' | 'cancelled'
  schoolYear?: string
}

export interface UpdateRegistrationStatusDTO {
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
  cancellationReason?: string
}

export interface SearchVaccineRegistrationParams {
  pageNum?: number
  pageSize?: number
  query?: string
  parentId?: string
  studentId?: string
  eventId?: string
  status?: 'pending' | 'approved' | 'rejected' | 'cancelled'
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
  update: (id: string, data: UpdateVaccineRegistrationDTO) => {
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
