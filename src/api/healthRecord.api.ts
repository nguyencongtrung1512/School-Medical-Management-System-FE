import axiosInstance from '../service/axiosInstance'

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
  height: string
  weight: string
  vaccinationHistory?: string[]
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
  vaccinationHistory?: string[]
  schoolYear: string
  height: string
  weight: string
}

export type UpdateHealthRecordDTO = Partial<CreateHealthRecordDTO>

export interface SearchHealthRecordDTO {
  pageNum: number
  pageSize: number
  query?: string
  studentId?: string
  schoolYear?: string
}

export const healthRecordApi = {
  // Tìm kiếm hồ sơ sức khỏe có phân trang
  search: (params: SearchHealthRecordDTO) => {
    return axiosInstance.get(`/health-records/search/${params.pageNum}/${params.pageSize}`, {
      params: {
        query: params.query,
        studentId: params.studentId,
        schoolYear: params.schoolYear
      }
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
