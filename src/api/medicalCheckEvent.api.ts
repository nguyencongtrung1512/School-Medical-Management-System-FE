import axiosInstance from '../service/axiosInstance'

export enum EventStatus {
  Ongoing = 'ongoing',
  Completed = 'completed',
  Cancelled = 'cancelled'
}

export interface MedicalCheckEvent {
  _id: string
  eventName: string
  gradeId: string
  description?: string
  location: string
  eventDate: string
  startRegistrationDate: string
  endRegistrationDate: string
  schoolYear: string
  status?: EventStatus
  isDeleted?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface CreateMedicalCheckEventDTO {
  eventName: string
  gradeId: string
  description?: string
  location: string
  eventDate: string
  startRegistrationDate: string
  endRegistrationDate: string
  schoolYear: string
  status?: EventStatus
}

export interface UpdateMedicalCheckEventDTO {
  eventName?: string
  gradeId?: string
  description?: string
  location?: string
  eventDate?: string
  startRegistrationDate?: string
  endRegistrationDate?: string
  schoolYear?: string
  status?: EventStatus
}

export interface SearchMedicalCheckEventDTO {
  pageNum?: number
  pageSize?: number
  query?: string
  studentId?: string
  gradeId?: string
  schoolYear?: string
  status?: EventStatus
}

export interface UpdateEventStatusDTO {
  status: EventStatus
}

export const medicalCheckEventApi = {
  create: (data: CreateMedicalCheckEventDTO) => {
    return axiosInstance.post('/medical-check-events/create', data)
  },
  search: (params: SearchMedicalCheckEventDTO) => {
    return axiosInstance.get('/medical-check-events/search', { params })
  },
  getById: (id: string) => {
    return axiosInstance.get(`/medical-check-events/${id}`)
  },
  update: (id: string, data: UpdateMedicalCheckEventDTO) => {
    return axiosInstance.put(`/medical-check-events/${id}`, data)
  },
  delete: (id: string) => {
    return axiosInstance.delete(`/medical-check-events/${id}`)
  },
  updateStatus: (id: string, status: EventStatus) => {
    return axiosInstance.patch(`/medical-check-events/${id}/status`, { status })
  }
}
