import axiosInstance from '../service/axiosInstance'

export interface Category {
  _id: string
  name: string
  description?: string
  isDeleted?: boolean
}

export interface CategorySearchParams {
  pageNum: number
  pageSize: number
  query?: string
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
  // Tìm kiếm categories có phân trang
  searchCategoryApi: (params: CategorySearchParams) => {
    return axiosInstance.get<CategoryResponse>(`/categories/search/${params.pageNum}/${params.pageSize}`, {
      params: {
        query: params.query
      }
    })
  },

  // Tạo category mới
  createCategoryApi: (data: { name: string; description?: string }) => {
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
