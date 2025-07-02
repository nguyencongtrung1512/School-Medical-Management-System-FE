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

export interface AppointmentAPIResponse {
  _id: string;
  parentId: string;
  studentId: string;
  appointmentTime: string;
  reason: string;
  type: string;
  status: string;
  note: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
  schoolNurse: unknown;
  student: {
    _id: string;
    fullName: string;
    isDeleted: boolean;
    gender: string;
    dob: string;
    classId: string;
    studentCode: string;
    studentIdCode: string;
    parents: Array<{
      userId: string;
      type: string;
      email: string;
    }>;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
  parent: {
    _id: string;
    password: string;
    email: string;
    fullName: string;
    phone: string;
    role: string;
    studentIds: string[];
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
}

export interface AppointmentListResponse {
  success: boolean
  data: {
    pageData: AppointmentAPIResponse[]
    total: number
  }
}

export interface GetAppointmentsParamsNurse {
  pageNum: number
  pageSize: number
  nurseId?: string
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

export const getAppointmentsNurse = async (params: GetAppointmentsParamsNurse): Promise<AppointmentListResponse> => {
  const { pageNum, pageSize, nurseId } = params
  const queryParams = nurseId ? `?nurseId=${nurseId}` : ''
  return axiosInstance.get(`/appointments/search/${pageNum}/${pageSize}${queryParams}`)
}