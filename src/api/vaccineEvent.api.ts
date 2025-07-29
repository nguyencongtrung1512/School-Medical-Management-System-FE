import axiosInstance from '../service/axiosInstance'

export enum VaccineEventStatus {
  Ongoing = 'ongoing',
  Completed = 'completed',
  Cancelled = 'cancelled'
}

export interface VaccineEvent {
  _id: string
  title: string
  gradeId: string
  description?: string
  vaccineTypeId: string
  location: string
  provider: string
  startRegistrationDate: Date
  endRegistrationDate: Date
  eventDate: Date
  status: VaccineEventStatus
  schoolYear: string
  isDeleted?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface CreateVaccineEventDTO {
  title: string
  gradeId: string
  description?: string
  vaccineTypeId: string
  location: string
  provider: string
  startRegistrationDate: Date
  endRegistrationDate: Date
  eventDate: Date
  status?: VaccineEventStatus
  schoolYear: string
}

export type UpdateVaccineEventDTO = Partial<CreateVaccineEventDTO>

export interface SearchVaccineEventDTO {
  pageNum?: number
  pageSize?: number
  query?: string
  gradeId?: string
  schoolYear?: string
  status?: VaccineEventStatus
  isDeleted?: string
}

export interface UpdateEventStatusDTO {
  status: VaccineEventStatus
}

export const vaccineEventApi = {
  create: (data: CreateVaccineEventDTO) => {
    return axiosInstance.post('/vaccine-events/create', data)
  },
  search: (params: SearchVaccineEventDTO) => {
    const { pageNum = 1, pageSize = 10, ...rest } = params
    return axiosInstance.get(`/vaccine-events/search/${pageNum}/${pageSize}`, { params: rest })
  },
  getById: (id: string) => {
    return axiosInstance.get(`/vaccine-events/${id}`)
  },
  update: (id: string, data: CreateVaccineEventDTO) => {
    return axiosInstance.put(`/vaccine-events/${id}`, data)
  },
  delete: (id: string) => {
    return axiosInstance.delete(`/vaccine-events/${id}`)
  },
  updateStatus: (id: string, status: VaccineEventStatus) => {
    return axiosInstance.patch(`/vaccine-events/${id}/status`, { status })
  }
}
