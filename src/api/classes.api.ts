import axiosInstance from '../service/axiosInstance'

export const getClassesAPI = (pageSize: number = 10, pageNum: number = 1, gradeId?: string, schoolYear?: string) => {
  let url = `/classes/search?pageSize=${pageSize}&pageNum=${pageNum}`
  if (gradeId) {
    url += `&gradeId=${gradeId}`
  }
  if (schoolYear) {
    url += `&schoolYear=${encodeURIComponent(schoolYear)}`
  }
  return axiosInstance.get(url)
}

export const getClassByIdAPI = (id: string) => {
  return axiosInstance.get(`/classes/${id}`)
}

export const createClassAPI = (data: { gradeId: string; name: string; schoolYear: string }) => {
  return axiosInstance.post('/classes/create', data)
}

export const updateClassAPI = (id: string, data: { name?: string; schoolYear?: string }) => {
  return axiosInstance.put(`/classes/${id}`, data)
}

export const deleteClassAPI = (id: string) => {
  return axiosInstance.delete(`/classes/${id}`)
}
