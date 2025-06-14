import axiosInstance from '../service/axiosInstance'

interface VaccineEvent {
  title: string
  gradeId: string
  description: string
  vaccineName: string
  location: string
  startDate: string
  endDate: string
  status: string
  registrationDeadline: string
}

export const getAllVaccineEvents = async (page: number, size: number) => {
  return axiosInstance.get(`/vaccine-events/search/${page}/${size}`)
}

export const createVaccineEvent = async (data: VaccineEvent) => {
  return axiosInstance.post('/vaccine-events/create', data)
}

export const getVaccineEventDetail = async (id: string) => {
  return axiosInstance.get(`/vaccine-events/${id}`)
}

export const updateVaccineEventDetail = async (id: string) => {
  return axiosInstance.get(`/vaccine-events/${id}`)
}

export const deleteVaccineEventDetail = async (id: string) => {
  return axiosInstance.get(`/vaccine-events/${id}`)
}
