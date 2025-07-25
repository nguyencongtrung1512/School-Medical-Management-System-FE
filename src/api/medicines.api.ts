import axiosInstance from '../service/axiosInstance'

export interface Medicine {
  _id: string
  name: string
  description: string
  dosage: string
  sideEffects: string
  manufacturer: string // Thêm trường hãng sản xuất
  manufactureDate: Date // Ngày sản xuất
  expiryDate: Date // Ngày hết hạn
}

interface PageInfo {
  pageNum: number
  pageSize: number
  totalItems: number
  totalPages: number
}

interface MedicineResponse {
  pageData: Medicine[]
  pageInfo: PageInfo
}

interface CreateMedicineRequest {
  name: string
  description: string
  dosage: string
  sideEffects: string
  manufacturer: string
  manufactureDate: Date
  expiryDate: Date
}

interface UpdateMedicineRequest {
  name?: string
  description?: string
  dosage?: string
  sideEffects?: string
  manufacturer?: string
  manufactureDate?: Date
  expiryDate?: Date
}

export const getMedicines = async (pageNum: number = 1, pageSize: number = 10): Promise<MedicineResponse> => {
  return axiosInstance.get(`/medicines/search/${pageNum}/${pageSize}`)
}

export const getMedicineById = async (id: string): Promise<Medicine> => {
  return axiosInstance.get(`/medicines/${id}`)
}

export const createMedicine = async (data: CreateMedicineRequest): Promise<Medicine> => {
  return axiosInstance.post('/medicines', data)
}

export const updateMedicine = async (id: string, data: UpdateMedicineRequest): Promise<Medicine> => {
  return axiosInstance.put(`/medicines/${id}`, data)
}

export const deleteMedicine = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/medicines/${id}`)
}
