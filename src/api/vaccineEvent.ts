import axiosInstance from '../service/axiosInstance'

export enum VaccineEventStatus {
  ONGOING = 'ongoing',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

interface VaccineEvent {
  _id: string
  title: string
  gradeId: string
  description: string
  vaccineName: string
  location: string
  startDate: string
  endDate: string
  status: VaccineEventStatus
  registrationDeadline: string
  isDeleted?: boolean
}

export const getAllVaccineEvents = async (page: number, size: number) => {
  return axiosInstance.get(`/vaccine-events/search/${page}/${size}`)
}

export const createVaccineEvent = async (data: Omit<VaccineEvent, '_id'>) => {
  return axiosInstance.post('/vaccine-events/create', data)
}

export const getVaccineEventDetail = async (_id: string) => {
  return axiosInstance.get(`/vaccine-events/${_id}`)
}

export const updateVaccineEvent = async (_id: string, data: Partial<Omit<VaccineEvent, '_id'>>) => {
  return axiosInstance.put(`/vaccine-events/${_id}`, data)
}

export const deleteVaccineEvent = async (_id: string) => {
  return axiosInstance.delete(`/vaccine-events/${_id}`)
}
