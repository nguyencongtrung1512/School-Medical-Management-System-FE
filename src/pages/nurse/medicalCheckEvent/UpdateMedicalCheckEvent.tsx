import React, { useState, useEffect } from 'react'
import { Form, Select, DatePicker, Button, Card, Input, message, Space } from 'antd'
import { getMedicalCheckEventDetail, updateMedicalCheckEvent } from '../../../api/medicalCheckEvent.api'
import { getGradesAPI } from '../../../api/grade.api'
import dayjs from 'dayjs'
import { toast } from 'react-toastify'

const { Option } = Select

interface Grade {
  _id: string
  name: string
}

interface MedicalCheckEventDetail {
  _id: string
  eventName: string
  gradeId: string
  description: string
  location: string
  eventDate: string
  startRegistrationDate: string
  endRegistrationDate: string
  schoolYear: string
}

interface UpdateMedicalCheckEventProps {
  eventId: string
  onSuccess: () => void
  onCancel: () => void
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

const UpdateMedicalCheckEvent: React.FC<UpdateMedicalCheckEventProps> = ({ eventId, onSuccess, onCancel }) => {
  const [form] = Form.useForm()
  const [grades, setGrades] = useState<Grade[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchGrades()
    if (eventId) {
      fetchEventDetails(eventId)
    }
  }, [eventId])

  const fetchGrades = async () => {
    try {
      const response = await getGradesAPI()
      setGrades(response.data.pageData)
    } catch {
      message.error('Không thể tải danh sách khối lớp')
    }
  }

  const fetchEventDetails = async (id: string) => {
    try {
      setLoading(true)
      const response = await getMedicalCheckEventDetail(id)
      const eventData = response.data as MedicalCheckEventDetail
      form.setFieldsValue({
        ...eventData,
        dateRange: [dayjs(eventData.eventDate), dayjs(eventData.eventDate)],
        registrationRange: [dayjs(eventData.startRegistrationDate), dayjs(eventData.endRegistrationDate)]
      })
    } catch {
      message.error('Không thể tải chi tiết sự kiện')
    } finally {
      setLoading(false)
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
        endRegistrationDate: registrationRange[1].toISOString(),
      }
      await updateMedicalCheckEvent(eventId, data)
      toast.success('Cập nhật sự kiện khám sức khỏe thành công')
      onSuccess()
    } catch {
      message.error('Không thể cập nhật sự kiện khám sức khỏe')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className='max-w-3xl'>
      <Form form={form} layout='vertical' onFinish={handleSubmit} className='space-y-4'>
        <Form.Item name='eventName' label='Tên sự kiện' rules={[{ required: true, message: 'Vui lòng nhập tên sự kiện' }]}>
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

        <Form.Item name='dateRange' label='Thời gian diễn ra sự kiện' rules={[{ required: true, message: 'Vui lòng chọn thời gian' }]}>
          <DatePicker.RangePicker showTime format='DD/MM/YYYY HH:mm' className='w-full' />
        </Form.Item>

        <Form.Item name='registrationRange' label='Thời gian đăng ký' rules={[{ required: true, message: 'Vui lòng chọn thời gian đăng ký' }]}>
          <DatePicker.RangePicker showTime format='DD/MM/YYYY HH:mm' className='w-full' />
        </Form.Item>

        <Form.Item name='description' label='Mô tả' rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}>
          <Input.TextArea rows={4} placeholder='Nhập mô tả chi tiết về sự kiện' />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type='primary' htmlType='submit' className='bg-blue-500' loading={loading}>
              Cập nhật sự kiện
            </Button>
            <Button onClick={onCancel}>Hủy</Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  )
}

export default UpdateMedicalCheckEvent
