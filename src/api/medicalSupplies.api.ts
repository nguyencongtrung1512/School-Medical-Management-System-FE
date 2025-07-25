import axiosInstance from '../service/axiosInstance'

export interface MedicalSupply {
  _id?: number
  name: string
  description: string
  quantity: number
  unit: string
  expiryDate: string
  manufacturer: string //Thêm trường hãng sản xuất
  manufactureDate: string // Ngày sản xuất  
  supplier: string
}

interface PageInfo {
  pageNum: number
  pageSize: number
  totalItems: number
  totalPages: number
}

interface MedicalSupplyResponse {
  pageData: MedicalSupply[]
  pageInfo: PageInfo
}

export const getAllMedicalSupplies = async (page: number, size: number): Promise<MedicalSupplyResponse> => {
  return axiosInstance.get(`/medical-supplies/search/${page}/${size}`)
}

export const createMedicalSupply = async (data: MedicalSupply) => {
  return axiosInstance.post('/medical-supplies/create', data)
}

export const getMedicalSupplyById = async (id: number) => {
  return axiosInstance.get(`/medical-supplies/${id}`)
}

export const updateMedicalSupply = async (id: number, data: MedicalSupply) => {
  return axiosInstance.put(`/medical-supplies/${id}`, data)
}

export const deleteMedicalSupply = async (id: number) => {
  return axiosInstance.delete(`/medical-supplies/${id}`)
}
