import {
  BookOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  FileTextOutlined,
  MedicineBoxOutlined,
  TeamOutlined
} from '@ant-design/icons'
import { Button, Card, Col, DatePicker, Divider, Form, Input, message, Row, Select, Space, Typography } from 'antd'
import dayjs, { Dayjs } from 'dayjs'
import React, { useEffect, useState } from 'react'
import { getGradesAPI } from '../../../api/grade.api'
import { EventStatus, medicalCheckEventApi, type CreateMedicalCheckEventDTO } from '../../../api/medicalCheckEvent.api'

const { Option } = Select
const { Title, Text } = Typography
const { TextArea } = Input

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
  provider: string
  description: string
  schoolYear: string
  eventDate: Dayjs
  startRegistrationDate: Dayjs
  endRegistrationDate: Dayjs
}

const disabledDate = (current: Dayjs) => {
  return current && current.isBefore(dayjs().startOf('day'))
}

const disabledDateTime = (current: Dayjs | null) => {
  const now = dayjs()
  if (!current) return {}
  if (!current.isSame(now, 'day')) return {}
  return {
    disabledHours: () => Array.from({ length: now.hour() }, (_, i) => i),
    disabledMinutes: (selectedHour: number) =>
      selectedHour === now.hour() ? Array.from({ length: now.minute() }, (_, i) => i) : []
  }
}

const CreateMedicalCheckEvent: React.FC<CreateMedicalCheckEventProps> = ({ onSuccess }) => {
  const [form] = Form.useForm()
  const [grades, setGrades] = useState<Grade[]>([])
  const [loading, setLoading] = useState(false)
  const [schoolYear, setSchoolYear] = useState<string>('')

  useEffect(() => {
    fetchGrades()
    // Tính năm học mặc định
    const now = dayjs()
    const year = now.year()
    let schoolYearValue = ''
    if (now.month() + 1 < 6) {
      schoolYearValue = `${year - 1}-${year}`
    } else {
      schoolYearValue = `${year}-${year + 1}`
    }
    setSchoolYear(schoolYearValue)
    form.setFieldsValue({ schoolYear: schoolYearValue })
  }, [])

  const fetchGrades = async () => {
    try {
      const response = (await getGradesAPI()) as unknown as { pageData: Grade[] }
      setGrades(response.pageData)
    } catch (error: unknown) {
      console.log('error', error)
      const err = error as { message?: string }
      if (err.message) {
        message.error(err.message)
      } else {
        message.error('Không thể tải danh sách khối')
      }
    }
  }

  const handleSubmit = async (values: FormValues) => {
    try {
      setLoading(true)
      const data: CreateMedicalCheckEventDTO = {
        eventName: values.eventName,
        gradeId: values.gradeId,
        location: values.location,
        provider: values.provider,
        description: values.description,
        schoolYear: values.schoolYear,
        eventDate: values.eventDate.toDate(),
        startRegistrationDate: values.startRegistrationDate.toDate(),
        endRegistrationDate: values.endRegistrationDate.toDate(),
        status: EventStatus.Ongoing
      }
      await medicalCheckEventApi.create(data)
      message.success('Tạo sự kiện khám sức khỏe thành công')
      form.resetFields()
      // Reset năm học về giá trị mặc định
      const now = dayjs()
      const year = now.year()
      let schoolYearValue = ''
      if (now.month() + 1 < 6) {
        schoolYearValue = `${year - 1}-${year}`
      } else {
        schoolYearValue = `${year}-${year + 1}`
      }
      setSchoolYear(schoolYearValue)
      form.setFieldsValue({ schoolYear: schoolYearValue })
      onSuccess()
    } catch (error: unknown) {
      console.log('error', error)
      const err = error as { message?: string }
      if (err.message) {
        message.error(err.message)
      } else {
        message.error('Không thể tạo sự kiện khám sức khỏe')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='max-w-4xl mx-auto p-6'>
      <Card className='shadow-lg' style={{ borderRadius: '12px' }}>
        <div className='mb-6'>
          <Title level={2} className='text-center mb-2'>
            <MedicineBoxOutlined className='mr-3 text-blue-500' />
            Tạo Sự Kiện Khám Sức Khỏe
          </Title>
          <Text type='secondary' className='block text-center'>
            Điền thông tin chi tiết để tạo sự kiện khám sức khỏe mới
          </Text>
        </div>

        <Divider />

        <Form form={form} layout='vertical' onFinish={handleSubmit} size='large' className='mt-6'>
          <Row gutter={[24, 16]}>
            <Col xs={24} lg={12}>
              <Form.Item
                name='eventName'
                label={
                  <Space>
                    <FileTextOutlined />
                    <span>Tên sự kiện khám y tế</span>
                  </Space>
                }
                rules={[{ required: true, message: 'Vui lòng nhập tên sự kiện' }]}
              >
                <Input placeholder='Nhập tên sự kiện khám sức khỏe' className='rounded-lg' />
              </Form.Item>
            </Col>

            <Col xs={24} lg={12}>
              <Form.Item
                name='gradeId'
                label={
                  <Space>
                    <TeamOutlined />
                    <span>Khối học</span>
                  </Space>
                }
                rules={[{ required: true, message: 'Vui lòng chọn khối' }]}
              >
                <Select placeholder='Chọn khối học' className='rounded-lg' showSearch optionFilterProp='children'>
                  {grades.map((grade) => (
                    <Option key={grade._id} value={grade._id}>
                      {grade.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} lg={12}>
              <Form.Item
                name='location'
                label={
                  <Space>
                    <EnvironmentOutlined />
                    <span>Địa điểm khám</span>
                  </Space>
                }
                rules={[{ required: true, message: 'Vui lòng nhập địa điểm' }]}
              >
                <Input placeholder='Nhập địa điểm khám sức khỏe' className='rounded-lg' />
              </Form.Item>
            </Col>

            <Col xs={24} lg={12}>
              <Form.Item
                name='provider'
                label={
                  <Space>
                    <MedicineBoxOutlined />
                    <span>Đơn vị cung cấp</span>
                  </Space>
                }
                rules={[{ required: true, message: 'Vui lòng nhập đơn vị cung cấp' }]}
              >
                <Input placeholder='Nhập tên đơn vị cung cấp' className='rounded-lg' />
              </Form.Item>
            </Col>

            <Col xs={24} lg={12}>
              <Form.Item
                name='schoolYear'
                label={
                  <Space>
                    <BookOutlined />
                    <span>Năm học</span>
                  </Space>
                }
                rules={[{ required: true, message: 'Vui lòng nhập năm học' }]}
              >
                <Input
                  value={schoolYear}
                  onChange={(e) => setSchoolYear(e.target.value)}
                  placeholder='VD: 2023-2024'
                  className='rounded-lg'
                />
              </Form.Item>
            </Col>

            <Col xs={24} lg={12}>
              <Form.Item
                name='startRegistrationDate'
                label={
                  <Space>
                    <CalendarOutlined />
                    <span>Ngày bắt đầu đăng ký</span>
                  </Space>
                }
                rules={[
                  { required: true, message: 'Vui lòng chọn ngày bắt đầu đăng ký' },
                  () => ({
                    validator(_, value) {
                      if (!value) return Promise.resolve()
                      const now = dayjs()
                      if (value.isBefore(now, 'minute')) {
                        return Promise.reject('Ngày bắt đầu đăng ký không được nhỏ hơn hiện tại!')
                      }
                      return Promise.resolve()
                    }
                  })
                ]}
              >
                <DatePicker
                  showTime
                  format='DD/MM/YYYY HH:mm'
                  className='w-full rounded-lg'
                  placeholder='Chọn ngày và giờ bắt đầu đăng ký'
                  disabledDate={disabledDate}
                  disabledTime={(date) => disabledDateTime(date)}
                />
              </Form.Item>
            </Col>

            <Col xs={24} lg={12}>
              <Form.Item
                name='endRegistrationDate'
                label={
                  <Space>
                    <CalendarOutlined />
                    <span>Ngày kết thúc đăng ký</span>
                  </Space>
                }
                rules={[
                  { required: true, message: 'Vui lòng chọn ngày kết thúc đăng ký' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      const startDate = getFieldValue('startRegistrationDate')
                      if (!value || !startDate) return Promise.resolve()
                      if (value.isBefore(startDate)) {
                        return Promise.reject('Ngày kết thúc đăng ký phải lớn hơn ngày bắt đầu!')
                      }
                      return Promise.resolve()
                    }
                  })
                ]}
              >
                <DatePicker
                  showTime
                  format='DD/MM/YYYY HH:mm'
                  className='w-full rounded-lg'
                  placeholder='Chọn ngày và giờ kết thúc đăng ký'
                  disabledDate={disabledDate}
                  disabledTime={(date) => disabledDateTime(date)}
                />
              </Form.Item>
            </Col>

            <Col xs={24} lg={12}>
              <Form.Item
                name='eventDate'
                label={
                  <Space>
                    <CalendarOutlined />
                    <span>Ngày diễn ra sự kiện</span>
                  </Space>
                }
                rules={[
                  { required: true, message: 'Vui lòng chọn ngày diễn ra sự kiện' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      const endRegistrationDate = getFieldValue('endRegistrationDate')
                      if (!value || !endRegistrationDate) return Promise.resolve()
                      if (value.isBefore(endRegistrationDate)) {
                        return Promise.reject('Ngày diễn ra sự kiện phải sau thời gian đăng ký kết thúc!')
                      }
                      return Promise.resolve()
                    }
                  })
                ]}
              >
                <DatePicker
                  showTime
                  format='DD/MM/YYYY HH:mm'
                  className='w-full rounded-lg'
                  placeholder='Chọn ngày và giờ diễn ra sự kiện'
                  disabledDate={disabledDate}
                  disabledTime={(date) => disabledDateTime(date)}
                />
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Form.Item
                name='description'
                label={
                  <Space>
                    <FileTextOutlined />
                    <span>Mô tả chi tiết</span>
                  </Space>
                }
                rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
              >
                <TextArea
                  rows={4}
                  placeholder='Nhập mô tả chi tiết về sự kiện khám sức khỏe, lưu ý quan trọng, yêu cầu chuẩn bị...'
                  className='rounded-lg'
                  showCount
                  maxLength={500}
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          <div className='text-center'>
            <Space size='middle'>
              <Button size='large' onClick={() => form.resetFields()} className='rounded-lg min-w-[120px]'>
                Đặt lại
              </Button>
              <Button
                type='primary'
                htmlType='submit'
                size='large'
                loading={loading}
                className='bg-blue-500 hover:bg-blue-600 rounded-lg min-w-[120px]'
                icon={<MedicineBoxOutlined />}
              >
                {loading ? 'Đang tạo...' : 'Tạo sự kiện'}
              </Button>
            </Space>
          </div>
        </Form>
      </Card>
    </div>
  )
}

export default CreateMedicalCheckEvent
