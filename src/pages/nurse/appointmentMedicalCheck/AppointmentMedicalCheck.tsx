import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  FileDoneOutlined,
  ReloadOutlined,
  SearchOutlined,
  StopOutlined
} from '@ant-design/icons'
import {
  Button,
  Card,
  Col,
  DatePicker,
  Descriptions,
  Form,
  Input,
  message,
  Modal,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Typography
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'

dayjs.extend(isSameOrAfter)
import React, { useEffect, useState } from 'react'
import {
  AppointmentStatus,
  medicalCheckAppointmentApi,
  PostMedicalCheckStatus,
  type MedicalCheckAppointment,
  type SearchMedicalCheckAppointmentDTO
} from '../../../api/medicalCheckAppointment.api'
import { medicalCheckEventApi, type MedicalCheckEvent } from '../../../api/medicalCheckEvent.api'

const { Title } = Typography
const { Search } = Input
const { Option } = Select

const statusOptions = [
  { value: AppointmentStatus.Pending, label: 'Chờ khám', icon: <ClockCircleOutlined /> },
  { value: AppointmentStatus.Checked, label: 'Đã kiểm tra', icon: <CheckCircleOutlined /> },
  { value: AppointmentStatus.Ineligible, label: 'Không đủ điều kiện', icon: <StopOutlined /> },
  { value: AppointmentStatus.Cancelled, label: 'Đã hủy', icon: <StopOutlined /> },
  { value: AppointmentStatus.MedicalChecked, label: 'Đã khám sức khỏe', icon: <CheckCircleOutlined /> }
]

const postMedicalCheckStatusLabels: Record<string, string> = {
  not_checked: 'Chưa đánh giá',
  healthy: 'Bình thường, khỏe mạnh',
  need_follow_up: 'Cần theo dõi thêm',
  sick: 'Phát hiện bệnh',
  other: 'Khác'
}

interface PopulatedMedicalCheckAppointment extends MedicalCheckAppointment {
  student?: { _id: string; fullName?: string; avatar?: string }
  event?: { _id: string; eventName?: string; eventDate?: string }
}

const AppointmentMedicalCheck: React.FC = () => {
  const [appointments, setAppointments] = useState<PopulatedMedicalCheckAppointment[]>([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalItems, setTotalItems] = useState(0)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | undefined>(undefined)
  const [selected, setSelected] = useState<PopulatedMedicalCheckAppointment | null>(null)
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false)
  const [modalType, setModalType] = useState<'check' | 'view' | null>(null)
  const [checkForm] = Form.useForm()

  // Thêm state cho filter
  const [events, setEvents] = useState<MedicalCheckEvent[]>([])
  const [eventsLoading, setEventsLoading] = useState(false)
  const [selectedEventId, setSelectedEventId] = useState<string | undefined>(undefined)
  const [schoolYearFilter, setSchoolYearFilter] = useState<string | undefined>(undefined)

  useEffect(() => {
    fetchEvents()
  }, [])

  useEffect(() => {
    fetchAppointments()
  }, [currentPage, pageSize, selectedEventId, schoolYearFilter, statusFilter])

  const fetchEvents = async () => {
    setEventsLoading(true)
    try {
      const response = await medicalCheckEventApi.search({ pageSize: 100 })
      const eventsData = response?.pageData || []
      setEvents(eventsData)
    } catch (error) {
      console.error('Error fetching events:', error)
      message.error('Không thể tải danh sách sự kiện')
    } finally {
      setEventsLoading(false)
    }
  }

  const fetchAppointments = async () => {
    setLoading(true)
    try {
      const searchParams: SearchMedicalCheckAppointmentDTO = {
        pageNum: currentPage,
        pageSize,
        status: statusFilter,
        eventId: selectedEventId,
        schoolYear: schoolYearFilter
      }

      // Loại bỏ các giá trị undefined
      const cleanParams = Object.fromEntries(
        Object.entries(searchParams).filter(([, value]) => value !== undefined)
      ) as SearchMedicalCheckAppointmentDTO

      const response = await medicalCheckAppointmentApi.search(cleanParams)
      const pageData = (response as unknown as { pageData: PopulatedMedicalCheckAppointment[] }).pageData || []
      const total = (response as unknown as { pageInfo?: { totalItems: number } }).pageInfo?.totalItems || 0
      setAppointments(pageData)
      setTotalItems(total)
    } catch (error) {
      console.error('Error fetching appointments:', error)
      message.error('Không thể tải danh sách lịch hẹn')
    } finally {
      setLoading(false)
    }
  }

  const handleTableChange = (page: number, pageSize?: number) => {
    setCurrentPage(page)
    if (pageSize) setPageSize(pageSize)
  }

  const handleSearch = () => {
    setCurrentPage(1)
    // Không cần fetch lại vì searchKeyword được xử lý ở client-side
  }

  const handleResetFilters = () => {
    setSearchKeyword('')
    setStatusFilter(undefined)
    setSelectedEventId(undefined)
    setSchoolYearFilter(undefined)
    setCurrentPage(1)
    // Trigger fetch lại khi reset filters
    fetchAppointments()
  }

  const formatDateTime = (dateValue: string | Date) => {
    if (!dateValue) return ''
    const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue
    return dayjs(date).format('DD/MM/YYYY HH:mm')
  }

  const getStatusTag = (status: AppointmentStatus) => {
    const found = statusOptions.find((s) => s.value === status)
    if (!found) return <Tag>{status}</Tag>
    return <Tag icon={found.icon}>{found.label}</Tag>
  }

  const handleOpenCheck = (record: PopulatedMedicalCheckAppointment) => {
    setSelected(record)
    setModalType('check')
    checkForm.setFieldsValue({
      height: record.height,
      weight: record.weight,
      visionLeft: record.visionLeft,
      visionRight: record.visionRight,
      bloodPressure: record.bloodPressure,
      heartRate: record.heartRate,
      isHealthy: record.isHealthy,
      reasonIfUnhealthy: record.reasonIfUnhealthy,
      notes: record.notes,
      checkedAt: record.checkedAt ? dayjs(record.checkedAt) : dayjs()
    })
    setIsDetailModalVisible(true)
  }

  const handleOpenView = (record: PopulatedMedicalCheckAppointment) => {
    setSelected(record)
    setModalType('view')
    setIsDetailModalVisible(true)
  }
  const handleCheck = async () => {
    if (!selected) return
    try {
      console.log('🔍 Bắt đầu validate form...')
      const values = await checkForm.validateFields()
      console.log('✅ Validate thành công, values:', values)

      const submitData = {
        ...values,
        checkedAt: values.checkedAt ? values.checkedAt.toDate() : undefined
      }
      console.log('📤 Dữ liệu gửi đi:', submitData)

      await medicalCheckAppointmentApi.nurseCheck(selected._id, submitData)
      message.success('Đánh dấu đã khám thành công!')
      setIsDetailModalVisible(false)
      fetchAppointments()
    } catch (error: unknown) {
      console.error('❌ Lỗi validation hoặc API:', error)
      if (error && typeof error === 'object' && 'errorFields' in error) {
        const validationError = error as { errorFields: Array<{ name: string[]; errors: string[] }> }
        console.error('🔍 Chi tiết lỗi validation:', validationError.errorFields)
        validationError.errorFields.forEach((field) => {
          console.error(`Field: ${field.name.join('.')}, Error: ${field.errors.join(', ')}`)
        })
      }
      message.error('Đánh dấu đã khám thất bại!')
    }
  }

  const columns: ColumnsType<PopulatedMedicalCheckAppointment> = [
    {
      title: 'Học sinh',
      dataIndex: 'student',
      key: 'student',
      render: (_: unknown, record: PopulatedMedicalCheckAppointment) => record.student?.fullName
    },
    {
      title: 'Sự kiện',
      dataIndex: 'event',
      key: 'event',
      render: (_: unknown, record: PopulatedMedicalCheckAppointment) => record.event?.eventName
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: AppointmentStatus) => getStatusTag(status),
      filters: statusOptions.map((s) => ({ text: s.label, value: s.value })),
      onFilter: (value, record) => record.status === value
    },
    {
      title: 'Ngày khám',
      dataIndex: 'checkedAt',
      key: 'checkedAt',
      render: (_: unknown, record: PopulatedMedicalCheckAppointment) => formatDateTime(record.medicalCheckedAt || '')
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: unknown, record: PopulatedMedicalCheckAppointment) => (
        <Space>
          <Button type='text' icon={<EyeOutlined />} onClick={() => handleOpenView(record)}>
            Chi tiết
          </Button>
          {(record.status === AppointmentStatus.Pending || record.status === AppointmentStatus.Checked) &&
            record.event?.eventDate &&
            dayjs().isSameOrAfter(dayjs(record.event.eventDate), 'day') && (
              <Button type='primary' onClick={() => handleOpenCheck(record)}>
                Đánh dấu đã khám
              </Button>
            )}

          {(record.status === AppointmentStatus.Pending || record.status === AppointmentStatus.Checked) &&
            record.event?.eventDate &&
            !dayjs().isSameOrAfter(dayjs(record.event.eventDate), 'day') && (
              <Tag color='orange'>Chưa tới ngày khám ({dayjs(record.event.eventDate).format('DD/MM/YYYY')})</Tag>
            )}

          {record.postMedicalCheckStatus && record.postMedicalCheckStatus !== PostMedicalCheckStatus.NotChecked && (
            <Button type='text' icon={<EyeOutlined />} onClick={() => handleOpenView(record)}>
              Xem kết quả
            </Button>
          )}
        </Space>
      )
    }
  ]

  // Client-side search cho searchKeyword vì API có thể không hỗ trợ query parameter
  const filteredAppointments: PopulatedMedicalCheckAppointment[] = appointments.filter((item) => {
    if (!searchKeyword) return true
    return (
      (item.student?.fullName || '').toLowerCase().includes(searchKeyword.toLowerCase()) ||
      (item.event?.eventName || '').toLowerCase().includes(searchKeyword.toLowerCase())
    )
  })

  // Lấy danh sách năm học từ events
  const schoolYears = [...new Set(events.map((event) => event.schoolYear))].sort().reverse()

  return (
    <div className='p-6'>
      <Card>
        <Card style={{ background: 'linear-gradient(135deg, #06b6d4 100%)' }}>
          <Row justify='space-between' align='middle'>
            <Col>
              <Title level={3} style={{ color: 'white', margin: 0 }}>
                <FileDoneOutlined style={{ marginRight: 12 }} />
                Quản lý lịch hẹn khám sức khỏe
              </Title>
            </Col>
          </Row>
        </Card>
        <Card className='shadow-sm mt-6'>
          <Row justify='space-between' align='middle' className='mb-4'>
            <Col>
              <Button icon={<ReloadOutlined />} onClick={fetchAppointments} loading={loading}>
                Làm mới
              </Button>
            </Col>
          </Row>

          {/* Bộ filter mới */}
          <Row gutter={[16, 16]} className='mb-4'>
            <Col xs={24} md={8}>
              <Search
                placeholder='Tìm kiếm học sinh, sự kiện...'
                allowClear
                enterButton={<SearchOutlined />}
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onSearch={handleSearch}
              />
            </Col>
            <Col xs={24} md={4}>
              <Select
                placeholder='Lọc theo trạng thái'
                allowClear
                style={{ width: '100%' }}
                value={statusFilter}
                onChange={(value) => {
                  setStatusFilter(value)
                  setCurrentPage(1)
                  fetchAppointments()
                }}
              >
                {statusOptions.map((s) => (
                  <Option key={s.value} value={s.value}>
                    <Space>
                      {s.icon}
                      {s.label}
                    </Space>
                  </Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} md={4}>
              <Select
                placeholder='Chọn năm học'
                allowClear
                style={{ width: '100%' }}
                value={schoolYearFilter}
                onChange={(value) => {
                  setSchoolYearFilter(value)
                  setSelectedEventId(undefined) // Reset event khi đổi năm học
                  setCurrentPage(1)
                  fetchAppointments()
                }}
                loading={eventsLoading}
              >
                {schoolYears.map((year) => (
                  <Option key={year} value={year}>
                    {year}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} md={4}>
              <Select
                placeholder='Chọn sự kiện'
                allowClear
                style={{ width: '100%' }}
                value={selectedEventId}
                onChange={(value) => {
                  setSelectedEventId(value)
                  setCurrentPage(1)
                  fetchAppointments()
                }}
                loading={eventsLoading}
                showSearch
                filterOption={(input, option) =>
                  (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                }
              >
                {events
                  .filter((event) => !schoolYearFilter || event.schoolYear === schoolYearFilter)
                  .map((event) => (
                    <Option key={event._id} value={event._id}>
                      {event.eventName} - {dayjs(event.eventDate).format('DD/MM/YYYY')}
                    </Option>
                  ))}
              </Select>
            </Col>
            <Col xs={24} md={4}>
              <Button onClick={handleResetFilters} style={{ width: '100%' }}>
                Xóa bộ lọc
              </Button>
            </Col>
          </Row>

          {/* Thông tin filter hiện tại */}
          {(searchKeyword || statusFilter || selectedEventId || schoolYearFilter) && (
            <Row className='mb-4'>
              <Col span={24}>
                <Space wrap>
                  <span style={{ fontWeight: 'bold' }}>Bộ lọc hiện tại:</span>
                  {searchKeyword && (
                    <Tag closable onClose={() => setSearchKeyword('')}>
                      Tìm kiếm: {searchKeyword}
                    </Tag>
                  )}
                  {statusFilter && (
                    <Tag
                      closable
                      onClose={() => {
                        setStatusFilter(undefined)
                        setCurrentPage(1)
                        fetchAppointments()
                      }}
                    >
                      Trạng thái: {statusOptions.find((s) => s.value === statusFilter)?.label}
                    </Tag>
                  )}
                  {schoolYearFilter && (
                    <Tag
                      closable
                      onClose={() => {
                        setSchoolYearFilter(undefined)
                        setCurrentPage(1)
                        fetchAppointments()
                      }}
                    >
                      Năm học: {schoolYearFilter}
                    </Tag>
                  )}
                  {selectedEventId && (
                    <Tag
                      closable
                      onClose={() => {
                        setSelectedEventId(undefined)
                        setCurrentPage(1)
                        fetchAppointments()
                      }}
                    >
                      Sự kiện: {events.find((e) => e._id === selectedEventId)?.eventName}
                    </Tag>
                  )}
                </Space>
              </Col>
            </Row>
          )}

          <Table
            columns={columns}
            dataSource={filteredAppointments}
            rowKey='_id'
            loading={loading}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: totalItems,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} lịch hẹn`,
              onChange: handleTableChange
            }}
            scroll={{ x: 1000 }}
          />
          <Modal
            title={modalType === 'check' ? 'Đánh dấu đã khám' : 'Kết quả khám sức khỏe'}
            open={isDetailModalVisible}
            onCancel={() => setIsDetailModalVisible(false)}
            footer={
              modalType === 'check'
                ? [
                    <Button key='cancel' onClick={() => setIsDetailModalVisible(false)}>
                      Hủy
                    </Button>,
                    <Button key='save' type='primary' onClick={handleCheck}>
                      Lưu
                    </Button>
                  ]
                : [
                    <Button key='close' onClick={() => setIsDetailModalVisible(false)}>
                      Đóng
                    </Button>
                  ]
            }
            width={600}
          >
            {selected && modalType === 'check' && (
              <Form form={checkForm} layout='vertical' className='max-h-[65vh] overflow-y-auto'>
                <Form.Item
                  name='height'
                  label='Chiều cao (cm)'
                  rules={[
                    { required: true, message: 'Vui lòng nhập chiều cao' },
                    {
                      validator: (_, value) => {
                        const numValue = Number(value)
                        if (isNaN(numValue)) {
                          return Promise.reject(new Error('Chiều cao phải là số'))
                        }
                        if (numValue < 50 || numValue > 250) {
                          return Promise.reject(new Error('Chiều cao phải từ 50-250cm'))
                        }
                        return Promise.resolve()
                      }
                    }
                  ]}
                >
                  <Input type='number' placeholder='Nhập chiều cao' min={50} max={250} />
                </Form.Item>
                <Form.Item
                  name='weight'
                  label='Cân nặng (kg)'
                  rules={[
                    { required: true, message: 'Vui lòng nhập cân nặng' },
                    {
                      validator: (_, value) => {
                        const numValue = Number(value)
                        if (isNaN(numValue)) {
                          return Promise.reject(new Error('Cân nặng phải là số'))
                        }
                        if (numValue < 20 || numValue > 100) {
                          return Promise.reject(new Error('Cân nặng phải từ 20-100kg'))
                        }
                        return Promise.resolve()
                      }
                    }
                  ]}
                >
                  <Input type='number' placeholder='Nhập cân nặng' min={20} max={100} step={0.1} />
                </Form.Item>
                <Form.Item
                  name='visionLeft'
                  label='Thị lực mắt trái'
                  rules={[
                    { required: true, message: 'Vui lòng nhập thị lực mắt trái' },
                    {
                      validator: (_, value) => {
                        const numValue = Number(value)
                        if (isNaN(numValue)) {
                          return Promise.reject(new Error('Thị lực phải là số'))
                        }
                        if (numValue < 0 || numValue > 10) {
                          return Promise.reject(new Error('Thị lực phải từ 0-10/10'))
                        }
                        return Promise.resolve()
                      }
                    }
                  ]}
                >
                  <Input type='number' step='0.1' placeholder='Nhập thị lực mắt trái' min={0} max={10} />
                </Form.Item>
                <Form.Item
                  name='visionRight'
                  label='Thị lực mắt phải'
                  rules={[
                    { required: true, message: 'Vui lòng nhập thị lực mắt phải' },
                    {
                      validator: (_, value) => {
                        const numValue = Number(value)
                        if (isNaN(numValue)) {
                          return Promise.reject(new Error('Thị lực phải là số'))
                        }
                        if (numValue < 0 || numValue > 10) {
                          return Promise.reject(new Error('Thị lực phải từ 0-10/10'))
                        }
                        return Promise.resolve()
                      }
                    }
                  ]}
                >
                  <Input type='number' step='0.1' placeholder='Nhập thị lực mắt phải' min={0} max={10} />
                </Form.Item>
                <Form.Item
                  name='bloodPressure'
                  label='Huyết áp'
                  rules={[
                    { required: true, message: 'Vui lòng nhập huyết áp' },
                    { pattern: /^\d+\/\d+$/, message: 'Huyết áp phải có định dạng số/số (VD: 120/80)' }
                  ]}
                >
                  <Input placeholder='Nhập huyết áp (VD: 120/80)' />
                </Form.Item>
                <Form.Item
                  name='heartRate'
                  label='Nhịp tim'
                  rules={[
                    { required: true, message: 'Vui lòng nhập nhịp tim' },
                    {
                      validator: (_, value) => {
                        const numValue = Number(value)
                        if (isNaN(numValue)) {
                          return Promise.reject(new Error('Nhịp tim phải là số'))
                        }
                        if (numValue < 40 || numValue > 200) {
                          return Promise.reject(new Error('Nhịp tim phải từ 40-200 bpm'))
                        }
                        return Promise.resolve()
                      }
                    }
                  ]}
                >
                  <Input type='number' placeholder='Nhập nhịp tim' min={40} max={200} />
                </Form.Item>
                <Form.Item
                  name='isHealthy'
                  label='Đủ điều kiện khám'
                  rules={[{ required: true, message: 'Chọn đủ điều kiện' }]}
                >
                  <Select>
                    <Option value={true}>Có</Option>
                    <Option value={false}>Không</Option>
                  </Select>
                </Form.Item>
                <Form.Item
                  name='reasonIfUnhealthy'
                  label='Lý do nếu không đủ điều kiện'
                  rules={[
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (getFieldValue('isHealthy') === false && !value) {
                          return Promise.reject(new Error('Vui lòng nhập lý do khi không đủ điều kiện'))
                        }
                        return Promise.resolve()
                      }
                    })
                  ]}
                >
                  <Input placeholder='Nhập lý do' />
                </Form.Item>
                <Form.Item name='notes' label='Ghi chú'>
                  <Input.TextArea rows={2} maxLength={300} />
                </Form.Item>
                <Form.Item
                  name='checkedAt'
                  label='Thời gian khám'
                  extra={
                    selected?.event?.eventDate
                      ? `Ngày sự kiện: ${dayjs(selected.event.eventDate).format('DD/MM/YYYY')}`
                      : undefined
                  }
                  rules={[
                    { required: true, message: 'Chọn thời gian khám' },
                    () => ({
                      validator(_, value) {
                        if (!value) {
                          return Promise.resolve()
                        }

                        if (!selected?.event?.eventDate) {
                          return Promise.resolve()
                        }

                        const eventDate = dayjs(selected.event.eventDate)
                        const selectedDate = dayjs(value)

                        // Check if the selected date is on the same day as the event date
                        if (!selectedDate.isSame(eventDate, 'day')) {
                          return Promise.reject(new Error('Thời gian khám phải trong ngày diễn ra sự kiện'))
                        }

                        return Promise.resolve()
                      }
                    })
                  ]}
                >
                  <DatePicker
                    showTime
                    format='DD/MM/YYYY HH:mm'
                    className='w-full'
                    disabledDate={(current) => {
                      if (!selected?.event?.eventDate) return false
                      const eventDate = dayjs(selected.event.eventDate)
                      return !current.isSame(eventDate, 'day')
                    }}
                    placeholder='Chọn thời gian khám trong ngày sự kiện'
                  />
                </Form.Item>
              </Form>
            )}

            {selected && modalType === 'view' && (
              <Descriptions bordered column={1} size='small'>
                <Descriptions.Item label='Học sinh'>
                  {selected.student?.fullName || selected.studentId}
                </Descriptions.Item>
                <Descriptions.Item label='Sự kiện'>{selected.event?.eventName || selected.eventId}</Descriptions.Item>
                <Descriptions.Item label='Ngày sự kiện'>
                  {selected.event?.eventDate ? dayjs(selected.event.eventDate).format('DD/MM/YYYY') : '-'}
                </Descriptions.Item>
                <Descriptions.Item label='Trạng thái'>{getStatusTag(selected.status)}</Descriptions.Item>
                <Descriptions.Item label='Chiều cao'>{selected.height || '-'}</Descriptions.Item>
                <Descriptions.Item label='Cân nặng'>{selected.weight || '-'}</Descriptions.Item>
                <Descriptions.Item label='Thị lực trái'>{selected.visionLeft || '-'}</Descriptions.Item>
                <Descriptions.Item label='Thị lực phải'>{selected.visionRight || '-'}</Descriptions.Item>
                <Descriptions.Item label='Huyết áp'>{selected.bloodPressure || '-'}</Descriptions.Item>
                <Descriptions.Item label='Nhịp tim'>{selected.heartRate || '-'}</Descriptions.Item>
                <Descriptions.Item label='Đủ điều kiện khám'>{selected.isHealthy ? 'Có' : 'Không'}</Descriptions.Item>
                <Descriptions.Item label='Lý do nếu không đủ điều kiện'>
                  {selected.reasonIfUnhealthy || '-'}
                </Descriptions.Item>
                <Descriptions.Item label='Ghi chú'>{selected.notes || '-'}</Descriptions.Item>
                <Descriptions.Item label='Tình trạng sau khám'>
                  {postMedicalCheckStatusLabels[selected.postMedicalCheckStatus || 'not_checked']}
                </Descriptions.Item>
                <Descriptions.Item label='Ghi chú sau khám'>{selected.postMedicalCheckNotes || '-'}</Descriptions.Item>
                <Descriptions.Item label='Năm học'>{selected.schoolYear}</Descriptions.Item>
              </Descriptions>
            )}
          </Modal>
        </Card>
      </Card>
    </div>
  )
}

export default AppointmentMedicalCheck
