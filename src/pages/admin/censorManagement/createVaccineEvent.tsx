import {
  BookOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  FileTextOutlined,
  MedicineBoxOutlined,
  TeamOutlined
} from '@ant-design/icons'
import { Button, Card, Col, DatePicker, Divider, Form, Input, message, Row, Select, Space, Typography } from 'antd'
import dayjs from 'dayjs'
import type React from 'react'
import { useEffect, useState } from 'react'
import { getGradesAPI } from '../../../api/grade.api'
import { vaccineEventApi, VaccineEventStatus, type VaccineEvent } from '../../../api/vaccineEvent.api'

const { Option } = Select
const { Title, Text } = Typography
const { TextArea } = Input

interface Grade {
  _id: string
  name: string
}

interface CreateVaccineEventProps {
  onSuccess: () => void
  eventData?: VaccineEvent
  isEdit?: boolean
}

interface FormValues {
  title: string
  gradeId: string
  vaccineName: string
  location: string
  provider: string
  dateRange: [dayjs.Dayjs, dayjs.Dayjs]
  eventDate: dayjs.Dayjs
  description: string
  schoolYear: string
}

const CreateVaccineEvent: React.FC<CreateVaccineEventProps> = ({ onSuccess, eventData, isEdit }) => {
  const [form] = Form.useForm()
  const [grades, setGrades] = useState<Grade[]>([])
  const [loading, setLoading] = useState(false)
  const [schoolYear, setSchoolYear] = useState<string>('')

  useEffect(() => {
    fetchGrades()
    if (isEdit && eventData) {
      form.setFieldsValue({
        ...eventData,
        provider: eventData.provider,
        dateRange: [dayjs(eventData.startRegistrationDate), dayjs(eventData.endRegistrationDate)],
        eventDate: dayjs(eventData.eventDate)
      })
      setSchoolYear(eventData.schoolYear)
    } else {
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
    }
  }, [isEdit, eventData])

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
      const { dateRange, ...rest } = values
      const data = {
        ...rest,
        provider: values.provider,
        startRegistrationDate: dateRange[0].toDate(),
        endRegistrationDate: dateRange[1].toDate(),
        eventDate: values.eventDate.toDate(),
        schoolYear: values.schoolYear,
        status: VaccineEventStatus.Ongoing
      }
      if (isEdit && eventData) {
        await vaccineEventApi.update(eventData._id, data)
        message.success('Cập nhật kế hoạch tiêm chủng thành công')
      } else {
        await vaccineEventApi.create(data)
        message.success('Tạo kế hoạch tiêm chủng thành công')
      }
      form.resetFields()
      onSuccess()
    } catch (error: unknown) {
      console.log('error', error)
      const err = error as { message?: string }
      if (err.message) {
        message.error(err.message)
      } else {
        message.error(isEdit ? 'Không thể cập nhật kế hoạch tiêm chủng' : 'Không thể tạo kế hoạch tiêm chủng')
      }
    } finally {
      setLoading(false)
    }
  }

  // Disable ngày trong quá khứ cho tất cả DatePicker
  const disabledDate = (current: dayjs.Dayjs) => {
    return current && current.isBefore(dayjs().startOf('day'))
  }
  const disabledDateTime = (current: dayjs.Dayjs | null) => {
    const now = dayjs()
    if (!current) return {}
    if (!current.isSame(now, 'day')) return {}
    return {
      disabledHours: () => Array.from({ length: now.hour() }, (_, i) => i),
      disabledMinutes: (selectedHour: number) =>
        selectedHour === now.hour() ? Array.from({ length: now.minute() }, (_, i) => i) : []
    }
  }

  return (
    <div className='max-w-4xl mx-auto p-6'>
      <Card className='shadow-lg' style={{ borderRadius: '12px' }}>
        <div className='mb-6'>
          <Title level={2} className='text-center mb-2'>
            <MedicineBoxOutlined className='mr-3 text-blue-500' />
            Tạo Kế Hoạch Tiêm Chủng
          </Title>
          <Text type='secondary' className='block text-center'>
            Điền thông tin chi tiết để tạo kế hoạch tiêm chủng mới
          </Text>
        </div>

        <Divider />

        <Form form={form} layout='vertical' onFinish={handleSubmit} size='large' className='mt-6'>
          <Row gutter={[24, 16]}>
            <Col xs={24} lg={12}>
              <Form.Item
                name='title'
                label={
                  <Space>
                    <FileTextOutlined />
                    <span>Tiêu đề sự kiện</span>
                  </Space>
                }
                rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
              >
                <Input placeholder='Nhập tiêu đề sự kiện tiêm chủng' className='rounded-lg' />
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
                name='vaccineName'
                label={
                  <Space>
                    <MedicineBoxOutlined />
                    <span>Tên vaccine</span>
                  </Space>
                }
                rules={[{ required: true, message: 'Vui lòng nhập tên vaccine' }]}
              >
                <Input placeholder='Nhập tên vaccine (VD: Vaccine COVID-19)' className='rounded-lg' />
              </Form.Item>
            </Col>

            <Col xs={24} lg={12}>
              <Form.Item
                name='location'
                label={
                  <Space>
                    <EnvironmentOutlined />
                    <span>Địa điểm tiêm</span>
                  </Space>
                }
                rules={[{ required: true, message: 'Vui lòng nhập địa điểm' }]}
              >
                <Input placeholder='Nhập địa điểm tiêm chủng' className='rounded-lg' />
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
                name='dateRange'
                label={
                  <Space>
                    <CalendarOutlined />
                    <span>Thời gian đăng ký</span>
                  </Space>
                }
                rules={[
                  { required: true, message: 'Vui lòng chọn thời gian đăng ký' },
                  () => ({
                    validator(_, value) {
                      if (!value || !value[0]) return Promise.resolve()
                      const now = dayjs()
                      if (value[0].isBefore(now, 'minute')) {
                        return Promise.reject('Ngày bắt đầu đăng ký không được nhỏ hơn hiện tại!')
                      }
                      return Promise.resolve()
                    }
                  })
                ]}
              >
                <DatePicker.RangePicker
                  showTime
                  format='DD/MM/YYYY HH:mm'
                  className='w-full rounded-lg'
                  placeholder={['Ngày bắt đầu', 'Ngày kết thúc']}
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
                      const dateRange = getFieldValue('dateRange')
                      if (!value || !dateRange || !dateRange[1]) return Promise.resolve()
                      if (value.isAfter(dateRange[1])) {
                        return Promise.resolve()
                      }
                      return Promise.reject('Ngày diễn ra sự kiện phải lớn hơn thời gian đăng ký kết thúc!')
                    }
                  })
                ]}
              >
                <DatePicker
                  showTime
                  format='DD/MM/YYYY HH:mm'
                  className='w-full rounded-lg'
                  placeholder='Chọn ngày và giờ diễn ra'
                  disabledDate={disabledDate}
                  disabledTime={(date) => disabledDateTime(date)}
                />
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
                  placeholder='Nhập mô tả chi tiết về sự kiện tiêm chủng, lưu ý quan trọng, yêu cầu chuẩn bị...'
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
                {loading ? (isEdit ? 'Đang cập nhật...' : 'Đang tạo...') : isEdit ? 'Cập nhật' : 'Tạo kế hoạch'}
              </Button>
            </Space>
          </div>
        </Form>
      </Card>
    </div>
  )
}

export default CreateVaccineEvent
