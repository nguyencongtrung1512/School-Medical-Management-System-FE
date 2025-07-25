import axiosInstance from '../service/axiosInstance'

export enum AppointmentStatus {
  Pending = 'pending',
  Checked = 'checked',
  Ineligible = 'ineligible',
  Vaccinated = 'vaccinated',
  Cancelled = 'cancelled',
  MedicalChecked = 'medicalCheckedAt'
}

export enum PostVaccinationStatus {
  NotChecked = 'not_checked',
  Healthy = 'healthy',
  MildReaction = 'mild_reaction',
  SevereReaction = 'severe_reaction',
  Other = 'other'
}

export interface VaccineAppointment {
  _id: string
  studentId: string
  eventId: string
  checkedBy?: string
  bloodPressure?: string
  isEligible: boolean
  reasonIfIneligible?: string
  notes?: string
  isDeleted?: boolean
  status: AppointmentStatus
  vaccinatedAt?: Date
  schoolYear: string
  postVaccinationStatus?: PostVaccinationStatus
  postVaccinationNotes?: string
  createdAt?: string
  updatedAt?: string
}

export interface CreateVaccineAppointmentDTO {
  studentId: string
  eventId: string
  checkedBy?: string
  bloodPressure?: string
  isEligible: boolean
  reasonIfIneligible?: string
  notes?: string
  schoolYear: string
}

export interface CheckVaccineAppointmentDTO {
  bloodPressure?: string
  isEligible: boolean
  reasonIfIneligible?: string
  notes?: string
  vaccinatedAt?: Date
}

export interface UpdatePostVaccineDTO {
  postVaccinationStatus?: PostVaccinationStatus
  postVaccinationNotes?: string
}

export interface SearchVaccineAppointmentDTO {
  pageNum?: number
  pageSize?: number
  studentId?: string
  eventId?: string
  query?: string
  schoolYear?: string
  checkBy?: string
  status?: AppointmentStatus
}

export const vaccineAppointmentApi = {
  create: (data: CreateVaccineAppointmentDTO) => {
  return axiosInstance.post('/vaccine-appointments/create', data)
  },
  search: (params: SearchVaccineAppointmentDTO) => {
    const { pageNum = 1, pageSize = 10, ...rest } = params
    return axiosInstance.get(`/vaccine-appointments/search/${pageNum}/${pageSize}`, { params: rest })
  },
  getById: (id: string) => {
    return axiosInstance.get(`/vaccine-appointments/${id}`)
  },
  update: (id: string, data: CreateVaccineAppointmentDTO) => {
  return axiosInstance.put(`/vaccine-appointments/${id}`, data)
  },
  delete: (id: string) => {
  return axiosInstance.delete(`/vaccine-appointments/${id}`)
  },
  check: (id: string, data: CheckVaccineAppointmentDTO) => {
  return axiosInstance.patch(`/vaccine-appointments/${id}/check`, data)
  },
  updatePostVaccination: (id: string, data: UpdatePostVaccineDTO) => {
    return axiosInstance.patch(`/vaccine-appointments/${id}/post-vaccination`, data)
  }
}
