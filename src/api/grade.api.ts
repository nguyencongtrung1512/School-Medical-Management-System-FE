import axiosInstance from '../service/axiosInstance'

export const getGradesAPI = (pageSize: number = 10, pageNum: number = 1) => {
  return axiosInstance.get(`/grades/search?pageSize=${pageSize}&pageNum=${pageNum}`)
}

export const getGradeByIdAPI = (id: string) => {
  return axiosInstance.get(`/grades/${id}`)
}

export const createGradeAPI = (data: { positionOrder: string; name: string; description?: string }) => {
  return axiosInstance.post('/grades/create', data)
}

export const updateGradeAPI = (id: string, data: { positionOrder: string; name: string; description?: string }) => {
  return axiosInstance.put(`/grades/${id}`, data)
}

export const deleteGradeAPI = (id: string) => {
  return axiosInstance.delete(`/grades/${id}`)
}
