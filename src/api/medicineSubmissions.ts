import axiosInstance from '../service/axiosInstance'

interface Medicine {
  name: string
  dosage: string
  usageInstructions: string
  quantity: number
  timesPerDay: number
  timeSlots: string[]
  startDate: string
  endDate: string
  reason: string
  note?: string
}

interface CreateMedicineSubmissionRequest {
  parentId: string
  studentId: string
  schoolNurseId: string
  medicines: Medicine[]
}

interface StudentInfo {
  _id: string
  fullName: string
  studentCode: string
}

export interface MedicineSubmissionData {
  parentId: string
  studentId: string
  schoolNurseId: string
  medicines: (Medicine & {
    _id: string
    createdAt: string
    updatedAt: string
  })[]
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'in_progress' | 'received'
  isDeleted: boolean
  _id: string
  createdAt: string
  updatedAt: string
  __v: number
  nurseNotes?: string
}

interface MedicineSubmissionResponse {
  success: boolean
  data: MedicineSubmissionData
}

interface MedicineSubmissionsResponse {
  success: boolean
  pageData: MedicineSubmissionData[]
  totalPage: number
}

export const createMedicineSubmission = async (
  data: CreateMedicineSubmissionRequest
): Promise<MedicineSubmissionResponse> => {
  return axiosInstance.post('/medicine-submissions/create', data)
}

export const getDetailMedicineSubmission = async (id: string): Promise<MedicineSubmissionResponse> => {
  return axiosInstance.get(`/medicine-submissions/${id}`)
}

export const getMedicineSubmissionsByParentId = async (
  parentId: string,
  page: number = 1,
  limit: number = 10
): Promise<MedicineSubmissionsResponse> => {
  return axiosInstance.get(`/medicine-submissions/search/${page}/${limit}?parentId=${parentId}`)
}

export const getAllMedicineSubmissions = async (
  page: number = 1,
  limit: number = 10
): Promise<MedicineSubmissionsResponse> => {
  return axiosInstance.get(`/medicine-submissions/search/${page}/${limit}`)
}

export const updateMedicineSubmission = async (id: string): Promise<MedicineSubmissionResponse> => {
  return axiosInstance.put(`/medicine-submissions/${id}`)
}

export const deleteMedicineSubmission = async (id: string): Promise<MedicineSubmissionResponse> => {
  return axiosInstance.delete(`/medicine-submissions/${id}`)
}
