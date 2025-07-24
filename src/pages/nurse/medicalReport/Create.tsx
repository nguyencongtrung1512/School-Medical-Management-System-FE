import { Button, Col, Form, Input, message, Row, Select, Typography, DatePicker, Upload } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import { debounce } from 'lodash'
import React, { useEffect, useState } from 'react'
import {
  CreateMedicalEventRequest,
  medicalEventApi,
  MedicalEventStatus,
  SeverityLevel,
  LeaveMethod
} from '../../../api/medicalEvent.api'
import type { MedicalSupply } from '../../../api/medicalSupplies.api'
import { getAllMedicalSupplies } from '../../../api/medicalSupplies.api'
import type { Medicine } from '../../../api/medicines.api'
import { getMedicines } from '../../../api/medicines.api'
import type { StudentProfile } from '../../../api/student.api'
import { getStudentsAPI } from '../../../api/student.api'
import { useAuth } from '../../../contexts/auth.context'
import { handleUploadFile } from '../../../utils/upload'

const { TextArea } = Input
const { Text } = Typography

interface CreateMedicalEventFormProps {
  onSuccess: () => void
}

const CreateMedicalEventForm: React.FC<CreateMedicalEventFormProps> = ({ onSuccess }) => {
  const [form] = Form.useForm()
  const [medicines, setMedicines] = useState<Medicine[]>([])
  const [medicalSupplies, setMedicalSupplies] = useState<MedicalSupply[]>([])
  const [students, setStudents] = useState<StudentProfile[]>([])
  const [loading, setLoading] = useState(false)
  const [studentLoading, setStudentLoading] = useState(false)
  const { user } = useAuth()
  const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(null)
  const [imageUrls, setImageUrls] = useState<string[]>([])

  useEffect(() => {
    fetchMedicinesAndSupplies()
    // Load initial students without keyword
    fetchStudents('')
  }, [])

  const fetchMedicinesAndSupplies = async () => {
    try {
      setLoading(true)
      const [medicinesResponse, suppliesResponse] = await Promise.all([
        getMedicines(1, 100),
        getAllMedicalSupplies(1, 100)
      ])
      setMedicines(medicinesResponse.pageData)
      setMedicalSupplies(suppliesResponse.pageData)
    } catch (error: unknown) {
      console.log('error', error)
      const err = error as { message?: string }
      if (err.message) {
        message.error(err.message)
      } else {
        message.error('Không thể tải danh sách thuốc và vật tư y tế')
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchStudents = async (keyword: string) => {
    try {
      setStudentLoading(true)
      // Make sure to pass the keyword parameter correctly to the API
      const response = await getStudentsAPI(100, 1, keyword.trim())
      if (response && response.pageData) {
        setStudents(response.pageData)
      } else {
        message.error('Dữ liệu học sinh không đúng định dạng')
        setStudents([]) // Clear students if response is invalid
      }
    } catch (error: unknown) {
      console.log('error', error)
      const err = error as { message?: string }
      if (err.message) {
        message.error(err.message)
      } else {
        message.error('Không thể tải danh sách học sinh')
      }
      setStudents([]) // Clear students on error
    } finally {
      setStudentLoading(false)
    }
  }

  // Increase debounce time and ensure it handles empty strings
  const debouncedFetchStudents = debounce((value: string) => {
    fetchStudents(value || '')
  }, 300) // Reduced from 500ms for better UX

  const onFinish = async (values: CreateMedicalEventRequest) => {
    try {
      if (!user) {
        message.error('Không tìm thấy thông tin y tá')
        return
      }
      const medicalEventData: CreateMedicalEventRequest = {
        ...values,
        schoolNurseId: user.id,
        images: imageUrls,
        leaveTime: values.leaveTime ? (typeof values.leaveTime === 'string' ? values.leaveTime : values.leaveTime.toISOString()) : undefined
      }
      await medicalEventApi.create(medicalEventData)
      message.success('Tạo sự kiện y tế thành công!')
      form.resetFields()
      setSelectedStudent(null) // Clear selected student
      setImageUrls([]) // Clear uploaded images
      onSuccess()
    } catch (error: unknown) {
      console.log('error', error)
      const err = error as { message?: string }
      if (err.message) {
        message.error(err.message)
      } else {
        message.error('Có lỗi xảy ra khi tạo sự kiện y tế!')
      }
    }
  }

  return (
    <Form form={form} layout='vertical' onFinish={onFinish} style={{ maxWidth: '100%' }}>
      <Row gutter={24}>
        <Col span={12}>
          <Form.Item name='studentId' label='Học sinh' rules={[{ required: true, message: 'Vui lòng chọn học sinh!' }]}>
            <Select
              showSearch
              placeholder='Tìm kiếm học sinh theo tên hoặc mã'
              loading={studentLoading}
              filterOption={false} // Tắt lọc phía client, chỉ dùng server-side
              allowClear
              notFoundContent={studentLoading ? 'Đang tải...' : 'Không tìm thấy học sinh'}
              onSearch={debouncedFetchStudents} // Gọi API mỗi khi nhập từ khóa
              onChange={(val) => {
                const stu = students.find((s) => s._id === val)
                setSelectedStudent(stu || null)
              }}
              onClear={() => {
                setSelectedStudent(null)
                fetchStudents('') // Khi clear input, lấy lại toàn bộ danh sách
              }}
              onDropdownVisibleChange={(open) => {
                if (open && students.length === 0) {
                  fetchStudents('') // Khi mở dropdown mà chưa có data thì lấy toàn bộ
                }
              }}
              options={students.map((student) => {
                const studentClass = student.class as unknown
                let className = ''
                if (typeof studentClass === 'object' && studentClass !== null && 'name' in studentClass) {
                  className = (studentClass as { name?: string }).name || ''
                } else if (typeof studentClass === 'string') {
                  className = studentClass
                }
                return {
                  value: student._id,
                  label: `${student.fullName} - ${student.studentIdCode} - ${className}`
                }
              })}
            />
          </Form.Item>
        </Col>
        {selectedStudent && (
          <Col span={12}>
            <Row style={{ marginBottom: 16 }}>
              <Col span={24}>
                <Text strong>Thông tin học sinh: </Text>
                <br />
                <Text strong>Họ tên: </Text>
                <Text>{selectedStudent.fullName}</Text>
                <br />
                <Text strong>Mã học sinh: </Text>
                <Text>{selectedStudent.studentIdCode}</Text>
                <br />
                <Text strong>Lớp: </Text>
                <Text>
                  {typeof selectedStudent.class === 'object'
                    ? selectedStudent.class?.name
                    : selectedStudent.class || ''}
                </Text>
              </Col>
            </Row>
          </Col>
        )}
        <Col span={12}>
          <Form.Item
            name='eventName'
            label='Tên sự kiện'
            rules={[{ required: true, message: 'Vui lòng nhập tên sự kiện!' }]}
          >
            <Input placeholder='Nhập tên sự kiện' />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item name='description' label='Mô tả' rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}>
        <TextArea rows={4} placeholder='Nhập mô tả chi tiết về sự kiện...' />
      </Form.Item>

      <Form.Item
        name='actionTaken'
        label='Biện pháp xử lý'
        rules={[{ required: true, message: 'Vui lòng nhập biện pháp xử lý!' }]}
      >
        <TextArea rows={3} placeholder='Nhập biện pháp xử lý...' />
      </Form.Item>

      <Row gutter={24}>
        <Col span={12}>
          <Form.Item name='medicinesId' label='Thuốc sử dụng'>
            <Select
              mode='multiple'
              placeholder='Chọn thuốc'
              loading={loading}
              options={medicines.map((medicine) => ({
                value: medicine._id,
                label: medicine.name
              }))}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name='medicalSuppliesId' label='Vật tư y tế sử dụng'>
            <Select
              mode='multiple'
              placeholder='Chọn vật tư y tế'
              loading={loading}
              options={medicalSupplies
                .filter((sup) => sup.quantity > 0)
                .map((supply) => ({
                  value: supply._id,
                  label: `${supply.name} (${supply.quantity} ${supply.unit || ''})`
                }))}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={24}>
        <Col span={8}>
          <Form.Item name='severityLevel' label='Mức độ'>
            <Select placeholder='Chọn mức độ'>
              <Select.Option value={SeverityLevel.MILD}>Nhẹ</Select.Option>
              <Select.Option value={SeverityLevel.MODERATE}>Trung bình</Select.Option>
              <Select.Option value={SeverityLevel.SEVERE}>Nặng</Select.Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name='status' label='Trạng thái'>
            <Select placeholder='Chọn trạng thái'>
              <Select.Option value={MedicalEventStatus.TREATED}>Đã xử lý</Select.Option>
              <Select.Option value={MedicalEventStatus.MONITORING}>Theo dõi</Select.Option>
              <Select.Option value={MedicalEventStatus.TRANSFERRED}>Chuyển viện</Select.Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name='leaveMethod' label='Cách rời khỏi'>
            <Select placeholder='Chọn cách rời khỏi'>
              <Select.Option value={LeaveMethod.NONE}>Không</Select.Option>
              <Select.Option value={LeaveMethod.PARENT_PICKUP}>Phụ huynh đón</Select.Option>
              <Select.Option value={LeaveMethod.HOSPITAL_TRANSFER}>Chuyển viện</Select.Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={24}>
        <Col span={12}>
          <Form.Item name='leaveTime' label='Thời gian rời khỏi'>
            <DatePicker showTime style={{ width: '100%' }} placeholder='Chọn thời gian' />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name='pickedUpBy' label='Người đón'>
            <Input placeholder='Nhập tên người đón (nếu có)' />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item name='images' label='Ảnh minh họa'>
        <Upload
          listType='picture'
          customRequest={async (options) => {
            const { file, onSuccess, onError } = options as any
            const url = await handleUploadFile(file as File, 'image')
            if (url) {
              setImageUrls((prev) => {
                const newArr = [...prev, url]
                form.setFieldsValue({ images: newArr })
                return newArr
              })
              if (onSuccess) onSuccess('ok')
            } else {
              if (onError) onError(new Error('Upload failed'))
            }
          }}
          fileList={imageUrls.map((url, idx) => ({
            uid: url,
            name: `Ảnh ${idx + 1}`,
            status: 'done',
            url
          }))}
          onRemove={(file) => {
            setImageUrls((prev) => {
              const newArr = prev.filter((url) => url !== file.url)
              form.setFieldsValue({ images: newArr })
              return newArr
            })
            return true
          }}
          accept='image/*'
          multiple
        >
          <Button icon={<UploadOutlined />}>Tải ảnh lên</Button>
        </Upload>
      </Form.Item>

      <Form.Item name='notes' label='Ghi chú'>
        <TextArea rows={3} placeholder='Nhập ghi chú thêm nếu cần...' />
      </Form.Item>

      <Form.Item>
        <Button type='primary' htmlType='submit' style={{ marginRight: 8 }}>
          Tạo sự kiện
        </Button>
        <Button
          onClick={() => {
            form.resetFields()
            setSelectedStudent(null)
            setImageUrls([]) // Clear uploaded images
          }}
        >
          Làm mới
        </Button>
      </Form.Item>
    </Form>
  )
}

export default CreateMedicalEventForm
