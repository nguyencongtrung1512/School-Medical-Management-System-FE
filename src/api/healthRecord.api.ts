import axiosInstance from '../service/axiosInstance'

export interface VaccinationHistory {
  vaccineTypeId: string
  injectedAt: Date
  provider?: string
  note?: string
}

export interface HealthRecord {
  _id: string
  studentId: string
  studentName?: string
  studentCode?: string
  gender?: string
  birthday?: Date
  chronicDiseases?: string[]
  allergies?: string[]
  pastTreatments?: string[]
  vision?: string
  hearing?: string
  height: number
  weight: number
  vaccinationHistory?: VaccinationHistory[]
  schoolYear: string
  createdAt?: string
  updatedAt?: string
}

export interface CreateHealthRecordDTO {
  studentId: string
  chronicDiseases?: string[]
  allergies?: string[]
  pastTreatments?: string[]
  vision?: string
  hearing?: string
  vaccinationHistory?: VaccinationHistory[]
  schoolYear: string
  height: number
  weight: number
}

export type UpdateHealthRecordDTO = Partial<CreateHealthRecordDTO>

export interface SearchHealthRecordDTO {
  pageNum?: number
  pageSize?: number
  query?: string
  studentId?: string
  schoolYear?: string
  isDeleted?: string
}

export const healthRecordApi = {
  // Tìm kiếm hồ sơ sức khỏe có phân trang
  search: (params: SearchHealthRecordDTO) => {
    const { pageNum = 1, pageSize = 10, ...rest } = params
    return axiosInstance.get(`/health-records/search/${pageNum}/${pageSize}`, {
      params: rest
    })
  },

  // Tạo hồ sơ sức khỏe mới
  create: (data: CreateHealthRecordDTO) => {
    return axiosInstance.post('/health-records/create', data)
  },

  // Lấy hồ sơ sức khỏe theo ID
  getById: (id: string) => {
    return axiosInstance.get(`/health-records/${id}`)
  },

  // Cập nhật hồ sơ sức khỏe
  update: (id: string, data: UpdateHealthRecordDTO) => {
    return axiosInstance.put(`/health-records/${id}`, data)
  },

  // Xóa hồ sơ sức khỏe
  delete: (id: string) => {
    return axiosInstance.delete(`/health-records/${id}`)
  },

  // Lấy hồ sơ sức khỏe học sinh theo năm học
  getByStudentAndYear: (studentId: string, schoolYear: string) => {
    return axiosInstance.get(`/health-records/student/${studentId}/by-year/${schoolYear}`)
  }
}
