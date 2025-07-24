import { Button, Col, Form, Input, message, Row, Select, Typography } from 'antd'
import { debounce } from 'lodash'
import React, { useEffect, useState } from 'react'
import { CreateMedicalEventRequest, medicalEventApi } from '../../../api/medicalEvent.api'
import type { MedicalSupply } from '../../../api/medicalSupplies.api'
import { getAllMedicalSupplies } from '../../../api/medicalSupplies.api'
import type { Medicine } from '../../../api/medicines.api'
import { getMedicines } from '../../../api/medicines.api'
import type { StudentProfile } from '../../../api/student.api'
import { getStudentsAPI } from '../../../api/student.api'
import { useAuth } from '../../../contexts/auth.context'

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

  useEffect(() => {
    fetchMedicinesAndSupplies()
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
      const response = await getStudentsAPI(10, 1, keyword)
      if (response && response.pageData) {
        setStudents(response.pageData)
      } else {
        message.error('Dữ liệu học sinh không đúng định dạng')
      }
    } catch (error: unknown) {
      console.log('error', error)
      const err = error as { message?: string }
      if (err.message) {
        message.error(err.message)
      } else {
        message.error('Không thể tải danh sách học sinh')
      }
    } finally {
      setStudentLoading(false)
    }
  }

  const debouncedFetchStudents = debounce((value: string) => {
    fetchStudents(value)
  }, 500)

  const onFinish = async (values: CreateMedicalEventRequest) => {
    try {
      if (!user) {
        message.error('Không tìm thấy thông tin y tá')
        return
      }
      const medicalEventData: CreateMedicalEventRequest = {
        ...values,
        schoolNurseId: user.id
        // parentId: ... // cần lấy từ student nếu backend yêu cầu
      }
      await medicalEventApi.create(medicalEventData)
      message.success('Tạo sự kiện y tế thành công!')
      form.resetFields()
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
              placeholder='Tìm kiếm học sinh'
              loading={studentLoading}
              filterOption={false}
              onSearch={debouncedFetchStudents}
              onChange={(val) => {
                const stu = students.find((s) => s._id === val)
                setSelectedStudent(stu || null)
              }}
              options={students.map((student) => ({
                value: student._id,
                label: `${student.fullName} - ${student.studentCode}`
              }))}
            />
          </Form.Item>
        </Col>
        {selectedStudent && (
          <Col span={12}>
            <Row style={{ marginBottom: 16 }}>
              <Col span={24}>
                <Text strong>Mã học sinh: </Text>
                <Text>{selectedStudent.studentCode}</Text>
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

      {/* Các trường nâng cao có thể bổ sung ở đây nếu cần: severityLevel, status, leaveMethod, leaveTime, pickedUpBy, images */}

      <Form.Item name='notes' label='Ghi chú'>
        <TextArea rows={3} placeholder='Nhập ghi chú thêm nếu cần...' />
      </Form.Item>

      <Form.Item>
        <Button type='primary' htmlType='submit' style={{ marginRight: 8 }}>
          Tạo sự kiện
        </Button>
        <Button onClick={() => form.resetFields()}>Làm mới</Button>
      </Form.Item>
    </Form>
  )
}

export default CreateMedicalEventForm
