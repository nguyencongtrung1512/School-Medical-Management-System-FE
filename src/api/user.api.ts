import axiosInstance from '../service/axiosInstance'

// Tìm kiếm user có phân trang, lọc theo vai trò (role)
export const searchUsersAPI = (pageNum: number = 1, pageSize: number = 10, query?: string, role?: string) => {
  let url = `/users/search/${pageNum}/${pageSize}?`
  if (query) url += `query=${encodeURIComponent(query)}&`
  if (role) url += `role=${role}`
  return axiosInstance.get(url)
}

export const getUserByIdAPI = (id: string) => {
  return axiosInstance.get(`/users/${id}`)
}
