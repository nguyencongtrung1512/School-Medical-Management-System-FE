import axiosInstance from '../service/axiosInstance'

export enum AppointmentStatus {
  Pending = 'pending',
  Checked = 'checked',
  Ineligible = 'ineligible',
  Vaccinated = 'vaccinated',
  Cancelled = 'cancelled',
  MedicalChecked = 'medicalChecked'
}

export interface MedicalCheckAppointment {
  _id: string
  studentId: string
  eventId: string
  checkedBy?: string
  height?: number
  weight?: number
  bmi?: number
  visionLeft?: number
  visionRight?: number
  bloodPressure?: string
  heartRate?: number
  dentalHealth?: string
  entHealth?: string
  skinCondition?: string
  notes?: string
  isHealthy: boolean
  reasonIfUnhealthy?: string
  isDeleted?: boolean
  status: AppointmentStatus
  schoolYear: string
  medicalCheckedAt?: string
  createdAt?: string
  updatedAt?: string
  student?: { _id: string; fullName?: string; avatar?: string }
  event?: { _id: string; title?: string; eventDate?: string }
}

export interface CreateMedicalCheckAppointmentDTO {
  studentId: string
  eventId: string
  schoolYear: string
  height?: number
  weight?: number
  bmi?: number
  visionLeft?: number
  visionRight?: number
  bloodPressure?: string
  heartRate?: number
  dentalHealth?: string
  entHealth?: string
  skinCondition?: string
  notes?: string
  isHealthy: boolean
  reasonIfUnhealthy?: string
  medicalCheckedAt?: Date
}

export interface UpdateMedicalCheckAppointmentDTO extends Partial<CreateMedicalCheckAppointmentDTO> {
  status?: AppointmentStatus
}

export interface CheckMedicalCheckAppointmentDTO {
  height?: number
  weight?: number
  visionLeft?: number
  visionRight?: number
  bloodPressure?: string
  heartRate?: number
  dentalHealth?: string
  entHealth?: string
  skinCondition?: string
  isHealthy: boolean
  reasonIfUnhealthy?: string
  notes?: string
  medicalCheckedAt?: Date
}

export interface SearchMedicalCheckAppointmentDTO {
  pageNum?: number
  pageSize?: number
  studentId?: string
  eventId?: string
  checkedBy?: string
  isHealthy?: boolean
  query?: string
  schoolYear?: string
  status?: AppointmentStatus
  isDeleted?: string
}

export const medicalCheckAppointmentApi = {
  create: (data: CreateMedicalCheckAppointmentDTO) => {
    return axiosInstance.post('/medical-check-appoinments/create', data)
  },
  search: (params: SearchMedicalCheckAppointmentDTO) => {
    const { pageNum = 1, pageSize = 10, ...rest } = params || {}
    return axiosInstance.get(`/medical-check-appoinments/search/${pageNum}/${pageSize}`, { params: rest })
  },
  getById: (id: string) => {
    return axiosInstance.get(`/medical-check-appoinments/${id}`)
  },
  update: (id: string, data: UpdateMedicalCheckAppointmentDTO) => {
    return axiosInstance.put(`/medical-check-appoinments/${id}`, data)
  },
  delete: (id: string) => {
    return axiosInstance.delete(`/medical-check-appoinments/${id}`)
  },
  nurseCheck: (id: string, data: CheckMedicalCheckAppointmentDTO) => {
    return axiosInstance.patch(`/medical-check-appoinments/${id}/check`, data)
  }
}
