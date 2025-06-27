import axiosInstance from '../service/axiosInstance'

export interface CreateAppointmentRequest {
  studentId: string
  appointmentTime: string // ISO string
  reason: string
  type: string
  note?: string
}

export interface Appointment {
  _id: string
  studentId: string
  appointmentTime: string
  reason: string
  type: string
  note?: string
  status: string
  schoolNurseId?: string
  cancellationReason?: string
  createdAt: string
  updatedAt: string
}

export interface AppointmentListResponse {
  success: boolean
  data: Appointment[]
  total: number
}

export interface CreateAppointmentResponse {
  success: boolean
  data: Appointment
}

export const createAppointment = async (data: CreateAppointmentRequest): Promise<CreateAppointmentResponse> => {
  return axiosInstance.post('/appointments', data)
}

export interface ApproveAppointmentRequest {
  status: string // 'approved'
  schoolNurseId: string
  cancellationReason?: string
  note?: string
}

export const approveAppointment = async (
  id: string,
  data: ApproveAppointmentRequest
): Promise<CreateAppointmentResponse> => {
  return axiosInstance.patch(`/appointments/${id}/approve`, data)
}

export const getAppointments = async (pageNum: number, pageSize: number): Promise<AppointmentListResponse> => {
  return axiosInstance.get(`/appointments/search/${pageNum}/${pageSize}`)
}

export const getAppointmentById = async (id: string): Promise<{ success: boolean; data: Appointment }> => {
  return axiosInstance.get(`/appointments/${id}`)
}

