import axiosInstance from '../service/axiosInstance'

export interface MedicalCheckAppointment {
  _id: string
  studentId: string
  eventId: string
  appointmentTime: string
  status: string
  note?: string
  checkedBy?: string
  createdAt?: string
  updatedAt?: string
}

export interface CreateMedicalCheckAppointmentDTO {
  studentId: string
  eventId: string
  appointmentTime: string
  note?: string
}

export interface UpdateMedicalCheckAppointmentDTO {
  appointmentTime?: string
  note?: string
  status?: string
}

export interface CheckMedicalCheckAppointmentDTO {
  checkedBy: string
  status: string
  note?: string
}

export const medicalCheckAppointmentApi = {
  create: (data: CreateMedicalCheckAppointmentDTO) => {
    return axiosInstance.post('/medical-check-appoinments/create', data)
  },
  search: (params: {
    pageNum: number
    pageSize: number
    query?: string
    checkedBy?: string
    eventId?: string
    schoolYear?: string
    studentId?: string
  }) => {
    const { pageNum, pageSize, ...query } = params
    return axiosInstance.get(`/medical-check-appoinments/search/${pageNum}/${pageSize}`, { params: query })
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
