import axiosInstance from '../service/axiosInstance'

interface MedicalSupply {
  _id: string
  name: string
  description: string
  quantity: number
  unit: string
  expiryDate: string
  supplier: string
  createdAt: string
  updatedAt: string
  __v: number
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
  __v: number
}

interface SchoolNurse {
  _id: string
  email: string
  fullName: string
  phone: string
  role: string
  studentIds: string[]
  isDeleted: boolean
  createdAt: string
  updatedAt: string
  __v: number
}

interface Student {
  _id: string
  fullName: string
  isDeleted: boolean
  gender: string
  dob: string
  classId: string
  avatar: string
  studentCode: string
  position: number
  createdAt: string
  updatedAt: string
  __v: number
  parentId: string
}

export interface MedicalEvent {
  _id: string
  studentId: string
  schoolNurseId: string
  eventName: string
  description: string
  actionTaken: string
  medicinesId: string[]
  medicalSuppliesId: string[]
  isSerious: boolean
  notes: string
  isDeleted: boolean
  createdAt: string
  updatedAt: string
  __v: number
  medicines: Medicine[]
  schoolNurse: SchoolNurse
  student: Student
  medicalSupplies: MedicalSupply[]
}

interface PageInfo {
  pageNum: string
  pageSize: string
  totalItems: number
  totalPages: number
}

interface MedicalEventResponse {
  pageData: MedicalEvent[]
  pageInfo: PageInfo
}

export interface CreateMedicalEventRequest {
  studentId: string
  eventName: string
  description: string
  actionTaken: string
  medicinesId?: string[]
  medicalSuppliesId?: string[]
  isSerious: boolean
  notes?: string
}

interface UpdateMedicalEventRequest {
  eventName?: string
  description?: string
  actionTaken?: string
  medicinesId?: string[]
  medicalSuppliesId?: string[]
  isSerious?: boolean
  notes?: string
}

export const getMedicalEvents = async (pageNum: number = 1, pageSize: number = 10): Promise<MedicalEventResponse> => {
  return axiosInstance.get(`/medical-events/search?pageSize=${pageSize}&pageNum=${pageNum}`)
}

export const getMedicalEventById = async (id: string): Promise<MedicalEvent> => {
  return axiosInstance.get(`/medical-events/${id}`)

}

export const createMedicalEvent = async (data: CreateMedicalEventRequest): Promise<MedicalEvent> => {
  return axiosInstance.post('/medical-events/create', data)
}

export const updateMedicalEvent = async (id: string, data: UpdateMedicalEventRequest): Promise<MedicalEvent> => {
  return axiosInstance.put(`/medical-events/${id}`, data)

}

export const deleteMedicalEvent = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/medical-events/${id}`)
}