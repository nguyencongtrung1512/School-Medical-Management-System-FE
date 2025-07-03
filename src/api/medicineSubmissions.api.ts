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

export interface MedicineSubmissionData {
  parentId: string
  studentId: string
  schoolNurseId: string
  medicines: (Medicine & {
    _id: string
    createdAt: string
    updatedAt: string
  })[]
  status: 'pending' | 'approved' | 'rejected' | 'completed'
  isDeleted: boolean
  _id: string
  createdAt: string
  updatedAt: string
  __v: number
  nurseNotes?: string
}

interface MedicineSubmissionsResponse {
  success: boolean
  pageData: MedicineSubmissionData[]
  totalPage: number
}

export const createMedicineSubmission = async (
  data: CreateMedicineSubmissionRequest
): Promise<MedicineSubmissionData> => {
  return axiosInstance.post('/medicine-submissions/create', data)
}

export const getDetailMedicineSubmission = async (id: string): Promise<MedicineSubmissionData> => {
  return axiosInstance.get(`/medicine-submissions/${id}`)
}

export const getMedicineSubmissionsByParentId = async (
  parentId: string,
  page: number = 1,
  limit: number = 10
): Promise<MedicineSubmissionsResponse> => {
  return axiosInstance.get(`/medicine-submissions/search/${page}/${limit}?parentId=${parentId}`)
}

export const getMedicineSubmissionsByNurseId = async (
  nurseId: string,
  page: number = 1,
  limit: number = 10
): Promise<MedicineSubmissionsResponse> => {
  return axiosInstance.get(`/medicine-submissions/search/${page}/${limit}?schoolNurseId=${nurseId}`)
}

export const getAllMedicineSubmissions = async (
  page: number = 1,
  limit: number = 10
): Promise<MedicineSubmissionsResponse> => {
  return axiosInstance.get(`/medicine-submissions/search/${page}/${limit}`)
}

export const updateMedicineSubmission = async (id: string): Promise<MedicineSubmissionData> => {
  return axiosInstance.put(`/medicine-submissions/${id}`)
}

export const deleteMedicineSubmission = async (id: string): Promise<MedicineSubmissionData> => {
  return axiosInstance.delete(`/medicine-submissions/${id}`)
}

export const updateMedicineSubmissionStatus = async (
  id: string,
  status: 'pending' | 'approved' | 'rejected' | 'completed'
): Promise<MedicineSubmissionData> => {
  return axiosInstance.patch(`/medicine-submissions/${id}/status`, { status })
}

export const updateMedicineSlotStatus = async (
  id: string,
  data: {
    medicineDetailId: string
    time: string
    status: 'taken' | 'missed' | 'compensated'
    note?: string
    image?: string
  }
) => {
  return axiosInstance.put(`/medicine-submissions/${id}/update-slot-status`, data)
}