import axiosInstance from '../service/axiosInstance'

interface VaccineRegistration {
  parentId: string
  studentId: string
  eventId: string
  status: string
  cancellationReason?: string
  note?: string
}

export const getAllVaccineRegistrations = async (page: number, size: number, parentId?: string, studentId?: string) => {
  const params = new URLSearchParams()
  if (parentId) params.append('parentId', parentId)
  if (studentId) params.append('studentId', studentId)

  return axiosInstance.get(`/vaccine-registration/search/${page}/${size}?${params.toString()}`)
}

export const createVaccineRegistration = async (data: VaccineRegistration) => {
  return axiosInstance.post('/vaccine-registration/create', data)
}

export const getVaccineRegistrationDetail = async (id: string) => {
  return axiosInstance.get(`/vaccine-registration/${id}`)
}

export const updateVaccineRegistration = async (id: string, data: Partial<VaccineRegistration>) => {
  return axiosInstance.put(`/vaccine-registration/${id}`, data)
}

export const deleteVaccineRegistration = async (id: string) => {
  return axiosInstance.delete(`/vaccine-registration/${id}`)
}
