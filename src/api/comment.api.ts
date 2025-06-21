import axiosInstance from '../service/axiosInstance'

export interface Comment {
  _id: string
  blogId: string
  userId: string
  content: string
  createdAt?: string
  updatedAt?: string
  user?: {
    _id: string
    fullName: string
    email: string
    avatar?: string
  }
}

export interface CommentSearchParams {
  pageNum: number
  pageSize: number
  blogId?: string
  userId?: string
  query?: string
}

export interface CommentResponse {
  content: Comment[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

export interface CreateCommentData {
  blogId: string
  content: string
  parentId?: string
}

export interface UpdateCommentData {
  content: string
}

export const commentApi = {
  // Tìm kiếm comments có phân trang
  searchCommentsApi: (params: CommentSearchParams) => {
    return axiosInstance.get<CommentResponse>('/comments/search', {
      params: {
        pageNum: params.pageNum,
        pageSize: params.pageSize,
        blogId: params.blogId,
        userId: params.userId,
        query: params.query
      }
    })
  },

  // Tạo comment mới
  createCommentApi: (data: CreateCommentData) => {
    return axiosInstance.post<Comment>('/comments/create', data)
  },

  // Lấy comment theo ID
  getCommentByIdApi: (id: string) => {
    return axiosInstance.get<Comment>(`/comments/${id}`)
  },

  // Cập nhật comment
  updateCommentApi: (id: string, data: UpdateCommentData) => {
    return axiosInstance.put<Comment>(`/comments/${id}`, data)
  },

  // Xóa comment
  deleteCommentApi: (id: string) => {
    return axiosInstance.delete(`/comments/${id}`)
  }
}
