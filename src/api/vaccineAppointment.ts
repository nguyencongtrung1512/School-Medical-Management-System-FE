import axiosInstance from '../service/axiosInstance'

interface VaccineAppointment {
  studentId: string
  eventId: string
  checkedBy: string
  bloodPressure: string
  isEligible: boolean
  reasonIfIneligible?: string
  notes?: string
  vaccinatedAt?: string
}

interface VaccineAppointmentCheck {
  bloodPressure: string
  isEligible: boolean
  reasonIfIneligible?: string
  notes?: string
  vaccinatedAt?: string
}

export const getAllVaccineAppointments = async (page: number, size: number) => {
  return axiosInstance.get(`/vaccine-appointments/search/${page}/${size}`)
}

export const createVaccineAppointment = async (data: VaccineAppointment) => {
  return axiosInstance.post('/vaccine-appointments/create', data)
}

export const getVaccineAppointmentDetail = async (id: string) => {
  return axiosInstance.get(`/vaccine-appointments/${id}`)
}

export const updateVaccineAppointment = async (id: string, data: Partial<VaccineAppointment>) => {
  return axiosInstance.put(`/vaccine-appointments/${id}`, data)
}

export const deleteVaccineAppointment = async (id: string) => {
  return axiosInstance.delete(`/vaccine-appointments/${id}`)
}

export const checkVaccineAppointment = async (id: string, data: VaccineAppointmentCheck) => {
  return axiosInstance.patch(`/vaccine-appointments/${id}/check`, data)
}
