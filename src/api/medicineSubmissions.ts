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
}

interface CreateMedicineSubmissionRequest {
  parentId: string
  studentId: string
  schoolNurseId: string
  medicines: Medicine[]
}

interface MedicineSubmissionData {
  parentId: string
  studentId: string
  schoolNurseId: string
  medicines: (Medicine & {
    _id: string
    createdAt: string
    updatedAt: string
  })[]
  status: string
  isDeleted: boolean
  _id: string
  createdAt: string
  updatedAt: string
  __v: number
}

interface MedicineSubmissionResponse {
  success: boolean
  data: MedicineSubmissionData
}

export const createMedicineSubmission = async (
  data: CreateMedicineSubmissionRequest
): Promise<MedicineSubmissionResponse> => {
  return axiosInstance.post('/medicine-submissions/create', data)
}

export const getDetailMedicineSubmission = async (id: string): Promise<MedicineSubmissionResponse> => {
  return axiosInstance.get(`/medicine-submissions/${id}`)
}

export const updateMedicineSubmission = async (id: string): Promise<MedicineSubmissionResponse> => {
  return axiosInstance.put(`/medicine-submissions/${id}`)
}

export const deleteMedicineSubmission = async (id: string): Promise<MedicineSubmissionResponse> => {
  return axiosInstance.delete(`/medicine-submissions/${id}`)
}
