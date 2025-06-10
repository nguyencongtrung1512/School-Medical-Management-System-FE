import axiosInstance from '../service/axiosInstance'

export interface Blog {
  id: string
  categoryId: string
  title: string
  content: string
  description: string
  image?: string
}

export interface BlogSearchParams {
  pageNum: number
  pageSize: number
  search?: string
  categoryId?: string
  userId?: string
}

export interface BlogResponse {
  content: Blog[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

export const blogApi = {
  // Tìm kiếm blogs có phân trang
  searchBlogApi: (params: BlogSearchParams) => {
    return axiosInstance.get<BlogResponse>('/blogs/search', {
      params: {
        pageSize: params.pageSize,
        pageNum: params.pageNum,
        search: params.search,
        categoryId: params.categoryId,
        userId: params.userId
      }
    })
  },

  // Tạo blog mới
  createBlogApi: (data: Omit<Blog, 'id'>) => {
    return axiosInstance.post<Blog>('/blogs/create', data)
  },

  // Lấy blog theo ID
  getBlogByIdApi: (id: string) => {
    return axiosInstance.get<Blog>(`/blogs/${id}`)
  },

  // Cập nhật blog
  updateBlogApi: (id: string, data: Partial<Blog>) => {
    return axiosInstance.put<Blog>(`/blogs/${id}`, data) // Sử dụng PUT cho update
  },

  // Xóa blog
  deleteBlogApi: (id: string) => {
    return axiosInstance.delete(`/blogs/${id}`)
  }
}
