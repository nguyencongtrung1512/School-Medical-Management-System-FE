import React, { useState, useEffect } from 'react'
import { Form, Select, DatePicker, Button, Card, Input, message } from 'antd'
import { createMedicalCheckEvent } from '../../../api/medicalCheckEvent.api'
import { getGradesAPI } from '../../../api/grade.api'
import dayjs from 'dayjs'
import { toast } from 'react-toastify'

const { Option } = Select

interface Grade {
  _id: string
  name: string
}

interface CreateMedicalCheckEventProps {
  onSuccess: () => void
}

interface FormValues {
  eventName: string
  gradeId: string
  location: string
  dateRange: [dayjs.Dayjs, dayjs.Dayjs]
  registrationRange: [dayjs.Dayjs, dayjs.Dayjs]
  description: string
  schoolYear: string
}

const CreateMedicalCheckEvent: React.FC<CreateMedicalCheckEventProps> = ({ onSuccess }) => {
  const [form] = Form.useForm()
  const [grades, setGrades] = useState<Grade[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchGrades()
  }, [])

  const fetchGrades = async () => {
    try {
      const response = await getGradesAPI()
      setGrades(response.pageData)
    } catch {
      message.error('Không thể tải danh sách khối')
    }
  }

  const handleSubmit = async (values: FormValues) => {
    try {
      setLoading(true)
      const { dateRange, registrationRange, ...rest } = values
      const data = {
        eventName: rest.eventName,
        gradeId: rest.gradeId,
        location: rest.location,
        description: rest.description,
        schoolYear: rest.schoolYear,
        eventDate: dateRange[0].toISOString(),
        startRegistrationDate: registrationRange[0].toISOString(),
        endRegistrationDate: registrationRange[1].toISOString()
      }
      await createMedicalCheckEvent(data)
      toast.success('Tạo sự kiện khám sức khỏe thành công')
      form.resetFields()
      onSuccess()
    } catch {
      message.error('Không thể tạo sự kiện khám sức khỏe')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className='max-w-3xl'>
      <Form form={form} layout='vertical' onFinish={handleSubmit} className='space-y-4'>
        <Form.Item
          name='eventName'
          label='Tên sự kiện khám y tế'
          rules={[{ required: true, message: 'Vui lòng nhập tên sự kiện' }]}
        >
          <Input placeholder='Nhập tên sự kiện' />
        </Form.Item>

        <Form.Item name='gradeId' label='Khối' rules={[{ required: true, message: 'Vui lòng chọn khối' }]}>
          <Select placeholder='Chọn khối'>
            {grades.map((grade) => (
              <Option key={grade._id} value={grade._id}>
                {grade.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name='location' label='Địa điểm' rules={[{ required: true, message: 'Vui lòng nhập địa điểm' }]}>
          <Input placeholder='Nhập địa điểm khám' />
        </Form.Item>

        <Form.Item name='schoolYear' label='Năm học' rules={[{ required: true, message: 'Vui lòng nhập năm học' }]}>
          <Input placeholder='Nhập năm học (VD: 2024-2025)' />
        </Form.Item>

        <Form.Item
          name='dateRange'
          label='Thời gian diễn ra sự kiện'
          rules={[{ required: true, message: 'Vui lòng chọn thời gian' }]}
        >
          <DatePicker.RangePicker showTime format='DD/MM/YYYY HH:mm' className='w-full' />
        </Form.Item>

        <Form.Item
          name='registrationRange'
          label='Thời gian đăng ký'
          rules={[{ required: true, message: 'Vui lòng chọn thời gian đăng ký' }]}
        >
          <DatePicker.RangePicker showTime format='DD/MM/YYYY HH:mm' className='w-full' />
        </Form.Item>

        <Form.Item name='description' label='Mô tả' rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}>
          <Input.TextArea rows={4} placeholder='Nhập mô tả chi tiết về sự kiện' />
        </Form.Item>

        <Form.Item>
          <Button type='primary' htmlType='submit' className='bg-blue-500' loading={loading}>
            Tạo sự kiện
          </Button>
        </Form.Item>
      </Form>
    </Card>
  )
}

export default CreateMedicalCheckEvent
