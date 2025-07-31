import axiosInstance from '../service/axiosInstance'

// ===================== INTERFACES =====================

export interface MedicineDetail {
  _id?: string
  name: string
  dosage?: string
  usageInstructions?: string
  quantity: number
  timesPerDay: number
  timeShifts: string[] // Changed from timeSlots to timeShifts to match BE
  note?: string
  reason?: string
  createdAt?: string
  updatedAt?: string
  slotStatus?: Array<{
    shift: string
    status: string
    note?: string
    image?: string
    _id?: string
  }>
}

export interface CreateMedicineSubmissionRequest {
  parentId: string
  studentId: string
  schoolNurseId: string
  image: string // Added required field from BE
  shiftSendMedicine: string // Added required field from BE (morning, noon, evening)
  medicines: MedicineDetail[]
}

export interface MedicineSubmissionData {
  _id: string
  parentId: string
  studentId: string
  schoolNurseId: string
  medicines: MedicineDetail[]
  status: 'pending' | 'approved' | 'rejected' | 'completed'
  shiftSendMedicine: string // Added field from BE
  image: string // Added field from BE
  isDeleted: boolean
  createdAt: string
  updatedAt: string
  __v: number
  nurseNotes?: string
  cancellationReason?: string
  // Populated fields
  parent?: {
    _id: string
    fullName: string
    email: string
    phone: string
    role: string
  }
  student?: {
    _id: string
    fullName: string
    gender: string
    dob: string
    studentCode: string
    classId: string
  }
  schoolNurse?: {
    _id: string
    fullName: string
    email: string
    phone: string
    role: string
  }
}

export interface MedicineSubmissionsResponse {
  pageData: MedicineSubmissionData[]
  pageInfo: {
    pageNum: number
    pageSize: number
    totalItems: number
    totalPages: number
  }
}

export interface SearchMedicineSubmissionParams {
  pageNum: number
  pageSize: number
  query?: string
  parentId?: string
  studentId?: string
  schoolNurseId?: string
  status?: string
  isDeleted?: string // Added from BE
  shiftSendMedicine?: string // Added from BE
}

export interface UpdateMedicineSubmissionStatusRequest {
  status: 'approved' | 'rejected' | 'completed' // Updated to match BE enum
  cancellationReason?: string
}

export interface UpdateMedicineSlotStatusRequest {
  medicineDetailId: string
  shift: string // Changed from time to shift to match BE
  status: 'pending' | 'taken' | 'missed' // Updated to match BE enum
  note?: string
  image?: string
}

// ===================== API FUNCTIONS =====================

// Create medicine submission
export const createMedicineSubmission = async (
  data: CreateMedicineSubmissionRequest
): Promise<MedicineSubmissionData> => {
  return axiosInstance.post('/medicine-submissions/create', data)
}

// Get single medicine submission by ID
export const getMedicineSubmissionById = async (id: string): Promise<MedicineSubmissionData> => {
  return axiosInstance.get(`/medicine-submissions/${id}`)
}

// Search medicine submissions with pagination and filters
export const searchMedicineSubmissions = async (
  params: SearchMedicineSubmissionParams
): Promise<MedicineSubmissionsResponse> => {
  const { pageNum, pageSize, ...queryParams } = params
  return axiosInstance.get(`/medicine-submissions/search/${pageNum}/${pageSize}`, {
    params: queryParams
  })
}

// Get medicine submissions by parent ID
export const getMedicineSubmissionsByParentId = async (
  parentId: string,
  pageNum: number = 1,
  pageSize: number = 10
): Promise<MedicineSubmissionsResponse> => {
  return searchMedicineSubmissions({ pageNum, pageSize, parentId })
}

// Get medicine submissions by nurse ID
export const getMedicineSubmissionsByNurseId = async (
  nurseId: string,
  pageNum: number = 1,
  pageSize: number = 10
): Promise<MedicineSubmissionsResponse> => {
  return searchMedicineSubmissions({ pageNum, pageSize, schoolNurseId: nurseId })
}

// Get all medicine submissions
export const getAllMedicineSubmissions = async (
  pageNum: number = 1,
  pageSize: number = 10
): Promise<MedicineSubmissionsResponse> => {
  return searchMedicineSubmissions({ pageNum, pageSize })
}

// Update medicine submission (for parents)
export const updateMedicineSubmission = async (
  id: string,
  data: Partial<CreateMedicineSubmissionRequest>
): Promise<MedicineSubmissionData> => {
  return axiosInstance.put(`/medicine-submissions/${id}`, data)
}

// Delete medicine submission
export const deleteMedicineSubmission = async (id: string): Promise<boolean> => {
  return axiosInstance.delete(`/medicine-submissions/${id}`)
}

// Update medicine submission status (nurse/admin approval)
export const updateMedicineSubmissionStatus = async (
  id: string,
  data: UpdateMedicineSubmissionStatusRequest
): Promise<MedicineSubmissionData> => {
  return axiosInstance.patch(`/medicine-submissions/${id}/status`, data)
}

// Update medicine slot status (nurse confirms medicine taken)
export const updateMedicineSlotStatus = async (
  id: string,
  data: UpdateMedicineSlotStatusRequest
): Promise<MedicineSubmissionData> => {
  return axiosInstance.put(`/medicine-submissions/${id}/update-slot-status`, data)
}

// ===================== LEGACY FUNCTIONS (for backward compatibility) =====================

// Legacy function names kept for compatibility
export const getDetailMedicineSubmission = getMedicineSubmissionById
