import React, { useState, useEffect } from 'react'
import { Form, Select, DatePicker, Button, Card, Input, message } from 'antd'
import { createVaccineEvent } from '../../../api/vaccineEvent.api'
import { getGradesAPI } from '../../../api/grade.api'
import dayjs from 'dayjs'
import { toast } from 'react-toastify'

const { Option } = Select

interface Grade {
  _id: string
  name: string
}

interface CreateVaccineEventProps {
  onSuccess: () => void
}

interface FormValues {
  title: string
  gradeId: string
  vaccineName: string
  location: string
  dateRange: [dayjs.Dayjs, dayjs.Dayjs]
  registrationDeadline: dayjs.Dayjs
  description: string
}

const CreateVaccineEvent: React.FC<CreateVaccineEventProps> = ({ onSuccess }) => {
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
      message.error('Không thể tải danh sách khối lớp')
    }
  }

  const handleSubmit = async (values: FormValues) => {
    try {
      setLoading(true)
      const { dateRange, ...rest } = values
      const data = {
        ...rest,
        startDate: dateRange[0].toISOString(),
        endDate: dateRange[1].toISOString(),
        registrationDeadline: values.registrationDeadline.toISOString(),
        status: 'ongoing'
      }

      await createVaccineEvent(data)
      toast.success('Tạo kế hoạch tiêm chủng thành công')
      form.resetFields()
      onSuccess()
    } catch {
      message.error('Không thể tạo kế hoạch tiêm chủng')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className='max-w-3xl'>
      <Form form={form} layout='vertical' onFinish={handleSubmit} className='space-y-4'>
        <Form.Item name='title' label='Tiêu đề' rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}>
          <Input placeholder='Nhập tiêu đề sự kiện' />
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

        <Form.Item
          name='vaccineName'
          label='Tên vaccine'
          rules={[{ required: true, message: 'Vui lòng nhập tên vaccine' }]}
        >
          <Input placeholder='Nhập tên vaccine' />
        </Form.Item>

        <Form.Item name='location' label='Địa điểm' rules={[{ required: true, message: 'Vui lòng nhập địa điểm' }]}>
          <Input placeholder='Nhập địa điểm tiêm chủng' />
        </Form.Item>

        <Form.Item
          name='dateRange'
          label='Thời gian diễn ra'
          rules={[{ required: true, message: 'Vui lòng chọn thời gian' }]}
        >
          <DatePicker.RangePicker showTime format='DD/MM/YYYY HH:mm' className='w-full' />
        </Form.Item>

        <Form.Item
          name='registrationDeadline'
          label='Hạn đăng ký'
          rules={[{ required: true, message: 'Vui lòng chọn hạn đăng ký' }]}
        >
          <DatePicker showTime format='DD/MM/YYYY HH:mm' className='w-full' />
        </Form.Item>

        <Form.Item name='description' label='Mô tả' rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}>
          <Input.TextArea rows={4} placeholder='Nhập mô tả chi tiết về sự kiện' />
        </Form.Item>

        <Form.Item>
          <Button type='primary' htmlType='submit' className='bg-blue-500' loading={loading}>
            Tạo kế hoạch
          </Button>
        </Form.Item>
      </Form>
    </Card>
  )
}

export default CreateVaccineEvent
