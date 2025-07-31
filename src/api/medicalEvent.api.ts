import axiosInstance from '../service/axiosInstance'

export enum MedicalEventStatus {
  TREATED = 'treated',
  MONITORING = 'monitoring',
  TRANSFERRED = 'transferred'
}

export enum SeverityLevel {
  MILD = 'Mild',
  MODERATE = 'Moderate',
  SEVERE = 'Severe'
}

export enum LeaveMethod {
  NONE = 'none',
  PARENT_PICKUP = 'parent_pickup',
  HOSPITAL_TRANSFER = 'hospital_transfer'
}

export enum ParentContactStatus {
  NOT_CONTACTED = 'not_contacted',
  CONTACTING = 'contacting',
  CONTACTED = 'contacted'
}

export interface Class {
  _id: string
  name: string
}

export interface Student {
  _id: string
  fullName: string
  isDeleted: boolean
  gender: string
  dob: string
  class: Class
  classId: string
  avatar: string
  studentCode: string
  studentIdCode: string
  position: number
  createdAt: string
  updatedAt: string
  parentId: string
}

export interface User {
  _id: string
  email: string
  fullName: string
  phone: string
  role: string
  studentIds?: string[]
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}

export interface Medicine {
  _id: string
  name: string
  description: string
  quantity: number
  unit: string
  expiryDate: string
  supplier: string
  createdAt: string
  updatedAt: string
}

export interface MedicalSupply {
  _id: string
  name: string
  description: string
  quantity: number
  unit: string
  expiryDate: string
  supplier: string
  createdAt: string
  updatedAt: string
}

export interface MedicineUsage {
  medicineId: string
  quantity: number
}

export interface MedicalSupplyUsage {
  supplyId: string
  quantity: number
}

export interface ActionLog {
  time: string
  description: string
  performedBy?: string
}

export interface MedicalEvent {
  _id: string
  studentId: string
  parentId: string
  schoolNurseId: string
  eventName: string
  description?: string
  initialCondition?: string
  firstAid?: string
  actionTaken?: string
  actions?: ActionLog[]
  medicinesUsed?: MedicineUsage[]
  medicalSuppliesUsed?: MedicalSupplyUsage[]
  status?: MedicalEventStatus
  leaveMethod?: LeaveMethod
  leaveTime?: string
  pickedUpBy?: string
  parentContactStatus?: ParentContactStatus
  parentContactedAt?: string
  images?: string[]
  notes?: string
  isDeleted?: boolean
  createdAt?: string
  updatedAt?: string
  // Virtual fields from backend
  student?: Student
  parent?: User
  schoolNurse?: User
  medicines?: Medicine[]
  medicalSupplies?: MedicalSupply[]
}

export interface SearchMedicalEventParams {
  pageNum?: number
  pageSize?: number
  query?: string
  studentId?: string
  parentId?: string
  schoolNurseId?: string
  medicinesId?: string[]
  medicalSuppliesId?: string[]
  severityLevel?: SeverityLevel
  parentContactStatus?: ParentContactStatus
  isDeleted?: string // "true" | "false"
}

export interface CreateMedicalEventRequest {
  studentId: string
  schoolNurseId: string
  eventName: string
  description?: string
  initialCondition?: string
  firstAid?: string
  actionTaken?: string
  actions?: ActionLog[]
  medicinesUsed?: MedicineUsage[]
  medicalSuppliesUsed?: MedicalSupplyUsage[]
  status?: MedicalEventStatus
  parentContactStatus?: ParentContactStatus
  parentContactedAt?: string
  leaveMethod?: LeaveMethod
  leaveTime?: string
  pickedUpBy?: string
  images?: string[]
  notes?: string
}

export type UpdateMedicalEventRequest = Partial<CreateMedicalEventRequest>

export const medicalEventApi = {
  search: (params: SearchMedicalEventParams) => {
    return axiosInstance.get('/medical-events/search', { params })
  },
  getById: (id: string) => {
    return axiosInstance.get(`/medical-events/${id}`)
  },
  create: (data: CreateMedicalEventRequest) => {
    return axiosInstance.post('/medical-events/create', data)
  },
  update: (id: string, data: UpdateMedicalEventRequest) => {
    return axiosInstance.put(`/medical-events/${id}`, data)
  },
  delete: (id: string) => {
    return axiosInstance.delete(`/medical-events/${id}`)
  }
}
