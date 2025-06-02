import axiosInstance from '../service/axiosInstance'

export const getClassesAPI = (pageSize: number = 10, pageNum: number = 1, gradeId?: string) => {
  let url = `/classes/search?pageSize=${pageSize}&pageNum=${pageNum}`
  if (gradeId) {
    url += `&gradeId=${gradeId}`
  }
  return axiosInstance.get(url)
}

export const getClassByIdAPI = (id: string) => {
  return axiosInstance.get(`/classes/${id}`)
}

export const createClassAPI = (data: { gradeId: string; name: string; capacity?: number; description?: string }) => {
  return axiosInstance.post('/classes/create', data)
}

export const updateClassAPI = (id: string, data: { name?: string; capacity?: number; description?: string }) => {
  return axiosInstance.put(`/classes/${id}`, data)
}

export const deleteClassAPI = (id: string) => {
  return axiosInstance.delete(`/classes/${id}`)
}

export const getClassesByIdAPI = (id: string) => {
  return axiosInstance.get(`/grades/${id}`)
}

export const createClassesAPI = (data: { positionOrder: string; name: string }) => {
  return axiosInstance.post('/grades/create', data)
}

export const updateClassesAPI = (id: string, data: { positionOrder: string; name: string }) => {
  return axiosInstance.put(`/grades/${id}`, data)
}

export const deleteClassesAPI = (id: string) => {
  return axiosInstance.delete(`/grades/${id}`)
}
