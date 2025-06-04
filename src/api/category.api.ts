import axiosInstance from '../service/axiosInstance'

export interface Category {
  _id: string
  name: string
  description?: string
  isDeleted?: boolean
}

export interface CategorySearchParams {
  page: number
  size: number
  search?: string
}

// Thêm export cho CategoryResponse
export interface CategoryResponse {
  content: Category[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

export const categoryApi = {
  searchCategoryApi: (params: CategorySearchParams) => {
    return axiosInstance.get(`/categories/search/${params.page}/${params.size}`, {
      params: {
        search: params.search
      }
    })
  },

  // Tạo category mới
  createCategoryApi: (data: Omit<Category, 'id'>) => {
    return axiosInstance.post<Category>('/categories', data)
  },

  // Lấy category theo ID
  getByIdCategoryApi: (id: string) => {
    return axiosInstance.get<Category>(`/categories/${id}`)
  },

  // Cập nhật category
  updateCategoryApi: (id: string, data: Partial<Category>) => {
    return axiosInstance.put<Category>(`/categories/${id}`, data)
  },

  // Xóa category
  deleteCategoryApi: (id: string) => {
    return axiosInstance.delete(`/categories/${id}`)
  }
}
