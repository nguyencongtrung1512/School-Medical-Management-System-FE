import axiosInstance from '../service/axiosInstance'

export enum AppointmentType {
  VaccineEvent = 'vaccine-event',
  MedicalCheckEvent = 'medical-check-event',
  Other = 'other'
}

export enum ParentNurseAppointmentStatus {
  Pending = 'pending',
  Approved = 'approved',
  Rejected = 'rejected',
  Cancelled = 'cancelled',
  Done = 'done'
}

export interface User {
  _id: string
  fullName: string
  email: string
  phone: string
  role: string
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}

export interface Student {
  _id: string
  fullName: string
  isDeleted: boolean
  gender: string
  dob: string
  classId: string
  studentCode: string
  createdAt: string
  updatedAt: string
}

export interface ParentNurseAppointment {
  _id: string
  parentId: string
  studentId: string
  schoolNurseId?: string
  appointmentTime: string
  reason: string
  type: AppointmentType
  status: ParentNurseAppointmentStatus
  note?: string
  isDeleted: boolean
  parentArrivalTime?: string
  createdAt: string
  updatedAt: string
  // Populated fields
  parent?: User
  student?: Student
  schoolNurse?: User
}

export interface CreateAppointmentRequest {
  studentId: string
  appointmentTime: string
  reason: string
  type: AppointmentType
  note?: string
  status?: ParentNurseAppointmentStatus
  isDeleted?: boolean
}

export interface UpdateAppointmentStatusRequest {
  status: ParentNurseAppointmentStatus
  schoolNurseId?: string
  cancellationReason?: string
  note?: string
}

export interface AppointmentListResponse {
  pageData: ParentNurseAppointment[]
  pageInfo: {
    pageNum: number
    pageSize: number
    totalItems: number
    totalPages: number
  }
}

export interface SearchAppointmentsParams {
  pageNum: number
  pageSize: number
  query?: string
  parentId?: string
  studentId?: string
  schoolNurseId?: string
  status?: ParentNurseAppointmentStatus
  type?: AppointmentType
}

export const appointmentApi = {
  // Tạo lịch hẹn mới
  create: (data: CreateAppointmentRequest) => {
    return axiosInstance.post('/appointments', data)
  },

  // Duyệt và phân nurse cho lịch hẹn (manager)
  approve: (id: string, data: UpdateAppointmentStatusRequest) => {
    return axiosInstance.patch(`/appointments/${id}/approve`, data)
  },

  // Tìm kiếm lịch hẹn có phân trang & lọc
  search: (params: SearchAppointmentsParams) => {
    const { pageNum, pageSize, ...query } = params
    return axiosInstance.get(`/appointments/search/${pageNum}/${pageSize}`, { params: query })
  },

  // Lấy chi tiết lịch hẹn
  getById: (id: string) => {
    return axiosInstance.get(`/appointments/${id}`)
  },

  // Xuất excel
  exportExcel: (params: Omit<SearchAppointmentsParams, 'pageNum' | 'pageSize'>) => {
    return axiosInstance.get('/appointments/export/excel', {
      params,
      responseType: 'blob'
    })
  },

  // Cập nhật trạng thái lịch hẹn (nurse/manager)
  updateStatus: (id: string, data: UpdateAppointmentStatusRequest) => {
    return axiosInstance.patch(`/appointments/${id}/status`, data)
  }
}
