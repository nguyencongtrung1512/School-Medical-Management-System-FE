import axiosInstance from '../service/axiosInstance'

export interface VaccineType {
  _id?: string
  code: string
  name: string
  description?: string
  isDeleted?: boolean
  createdAt?: string
  updatedAt?: string
}

// Tạo loại vaccine mới
export const createVaccineTypeAPI = (data: Omit<VaccineType, '_id' | 'createdAt' | 'updatedAt' | 'isDeleted'>) => {
  return axiosInstance.post('/vaccine-types', data)
}

// Lấy danh sách loại vaccine có phân trang & tìm kiếm
export const searchVaccineTypesAPI = (pageNum: number, pageSize: number, query?: string) => {
  let url = `/vaccine-types/search/${pageNum}/${pageSize}`
  if (query) url += `?query=${encodeURIComponent(query)}`
  return axiosInstance.get(url)
}

// Lấy chi tiết loại vaccine theo id
export const getVaccineTypeByIdAPI = (id: string) => {
  return axiosInstance.get(`/vaccine-types/${id}`)
}

// Cập nhật loại vaccine
export const updateVaccineTypeAPI = (
  id: string,
  data: Partial<Omit<VaccineType, '_id' | 'createdAt' | 'updatedAt' | 'isDeleted'>>
) => {
  return axiosInstance.put(`/vaccine-types/${id}`, data)
}

// Xóa loại vaccine
export const deleteVaccineTypeAPI = (id: string) => {
  return axiosInstance.delete(`/vaccine-types/${id}`)
}
