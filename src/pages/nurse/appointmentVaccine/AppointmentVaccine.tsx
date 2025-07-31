import React, { useEffect, useState } from 'react'
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Typography,
  Input,
  Modal,
  Descriptions,
  Select,
  message,
  Row,
  Col,
  Form,
  DatePicker
} from 'antd'
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  StopOutlined,
  SearchOutlined,
  EyeOutlined,
  ReloadOutlined,
  MedicineBoxOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'

dayjs.extend(isSameOrAfter)
import {
  vaccineAppointmentApi,
  AppointmentStatus,
  type VaccineAppointment,
  PostVaccinationStatus,
  type SearchVaccineAppointmentDTO
} from '../../../api/vaccineAppointment.api'
import { vaccineEventApi, type VaccineEvent } from '../../../api/vaccineEvent.api'
import type { ColumnsType } from 'antd/es/table'

const { Title } = Typography
const { Search } = Input
const { Option } = Select

const statusOptions = [
  { value: AppointmentStatus.Pending, label: 'Chờ kiểm tra', icon: <ClockCircleOutlined /> },
  { value: AppointmentStatus.Checked, label: 'Đã kiểm tra', icon: <CheckCircleOutlined /> },
  { value: AppointmentStatus.Ineligible, label: 'Không đủ điều kiện', icon: <StopOutlined /> },
  { value: AppointmentStatus.Vaccinated, label: 'Đã tiêm', icon: <MedicineBoxOutlined /> },
  { value: AppointmentStatus.Cancelled, label: 'Đã hủy', icon: <StopOutlined /> }
]

// Extend VaccineAppointment to support populated student and event
interface PopulatedVaccineAppointment extends VaccineAppointment {
  student?: { fullName: string }
  event?: { title: string; eventDate?: string }
}

const AppointmentVaccine: React.FC = () => {
  const [appointments, setAppointments] = useState<PopulatedVaccineAppointment[]>([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalItems, setTotalItems] = useState(0)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | undefined>(undefined)
  const [selected, setSelected] = useState<PopulatedVaccineAppointment | null>(null)
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false)
  const [createModalVisible, setCreateModalVisible] = useState(false)
  const [createForm] = Form.useForm()
  const [modalType, setModalType] = useState<'check' | 'post' | 'view' | null>(null)
  const [checkForm] = Form.useForm()
  const [postForm] = Form.useForm()

  // Thêm state cho filter
  const [events, setEvents] = useState<VaccineEvent[]>([])
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
      const response = await vaccineEventApi.search({ pageSize: 100 })
      const eventsData = (response as unknown as { pageData: VaccineEvent[] }).pageData || []
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
      const searchParams: SearchVaccineAppointmentDTO = {
        pageNum: currentPage,
        pageSize,
        status: statusFilter,
        eventId: selectedEventId,
        schoolYear: schoolYearFilter
      }

      // Loại bỏ các giá trị undefined
      const cleanParams = Object.fromEntries(
        Object.entries(searchParams).filter(([, value]) => value !== undefined)
      ) as SearchVaccineAppointmentDTO

      const response = await vaccineAppointmentApi.search(cleanParams)
      const pageData = (response as unknown as { pageData: VaccineAppointment[] }).pageData || []
      const total = (response as unknown as { pageInfo?: { totalItems: number } }).pageInfo?.totalItems || 0
      setAppointments(pageData)
      setTotalItems(total)
    } catch (error) {
      console.error('Error fetching appointments:', error)
      message.error('Không thể tải danh sách lịch hẹn tiêm')
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

  const handleOpenCreate = () => {
    createForm.resetFields()
    setCreateModalVisible(true)
  }

  const handleCreateResult = async () => {
    try {
      const values = await createForm.validateFields()
      // Gọi API updatePostVaccination cho lịch hẹn đã chọn
      await vaccineAppointmentApi.updatePostVaccination(values.appointmentId, {
        postVaccinationStatus: values.postVaccinationStatus,
        postVaccinationNotes: values.postVaccinationNotes
      })
      message.success('Tạo kết quả sau tiêm thành công!')
      setCreateModalVisible(false)
      fetchAppointments()
    } catch {
      message.error('Tạo kết quả thất bại!')
    }
  }

  const handleOpenCheck = (record: PopulatedVaccineAppointment) => {
    setSelected(record)
    setModalType('check')
    checkForm.setFieldsValue({
      bloodPressure: record.bloodPressure,
      isEligible: record.isEligible,
      reasonIfIneligible: record.reasonIfIneligible,
      notes: record.notes,
      vaccinatedAt: record.vaccinatedAt ? dayjs(record.vaccinatedAt) : dayjs()
    })
    setIsDetailModalVisible(true)
  }
  const handleOpenPost = (record: PopulatedVaccineAppointment) => {
    setSelected(record)
    setModalType('post')
    postForm.setFieldsValue({
      postVaccinationStatus: record.postVaccinationStatus,
      postVaccinationNotes: record.postVaccinationNotes
    })
    setIsDetailModalVisible(true)
  }
  const handleOpenView = (record: PopulatedVaccineAppointment) => {
    setSelected(record)
    setModalType('view')
    setIsDetailModalVisible(true)
  }
  const handleCheck = async () => {
    if (!selected) return
    try {
      const values = await checkForm.validateFields()
      await vaccineAppointmentApi.check(selected._id, {
        ...values,
        vaccinatedAt: values.vaccinatedAt ? values.vaccinatedAt.toDate() : undefined
      })
      message.success('Đánh dấu đã tiêm thành công!')
      setIsDetailModalVisible(false)
      fetchAppointments()
    } catch {
      message.error('Đánh dấu đã tiêm thất bại!')
    }
  }
  const handlePost = async () => {
    if (!selected) return
    try {
      const values = await postForm.validateFields()
      await vaccineAppointmentApi.updatePostVaccination(selected._id, values)
      message.success('Xác nhận sau tiêm thành công!')
      setIsDetailModalVisible(false)
      fetchAppointments()
    } catch {
      message.error('Xác nhận sau tiêm thất bại!')
    }
  }

  const columns: ColumnsType<PopulatedVaccineAppointment> = [
    {
      title: 'Học sinh',
      dataIndex: 'student',
      key: 'student',
      render: (_: unknown, record: PopulatedVaccineAppointment) => record.student?.fullName
    },
    {
      title: 'Sự kiện',
      dataIndex: 'event',
      key: 'event',
      render: (_: unknown, record: PopulatedVaccineAppointment) => record?.event?.title
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
      title: 'Ngày tiêm',
      dataIndex: 'vaccinatedAt',
      key: 'vaccinatedAt',
      render: (date: Date) => (date ? formatDateTime(date) : '-')
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: unknown, record: PopulatedVaccineAppointment) => (
        <Space>
          <Button type='text' icon={<EyeOutlined />} onClick={() => handleOpenView(record)}>
            Chi tiết
          </Button>
          {(record.status === AppointmentStatus.Pending ||
            record.status === AppointmentStatus.Checked ||
            record.status === AppointmentStatus.Ineligible) &&
            record.event?.eventDate &&
            dayjs().isSameOrAfter(dayjs(record.event.eventDate), 'day') && (
              <Button type='primary' onClick={() => handleOpenCheck(record)}>
                Đánh dấu đã tiêm
              </Button>
            )}

          {(record.status === AppointmentStatus.Pending ||
            record.status === AppointmentStatus.Checked ||
            record.status === AppointmentStatus.Ineligible) &&
            record.event?.eventDate &&
            !dayjs().isSameOrAfter(dayjs(record.event.eventDate), 'day') && (
              <Tag color='orange'>Chưa tới ngày tiêm ({dayjs(record.event.eventDate).format('DD/MM/YYYY')})</Tag>
            )}

          {record.status === AppointmentStatus.Vaccinated &&
            (!record.postVaccinationStatus || record.postVaccinationStatus === PostVaccinationStatus.NotChecked) && (
              <Button type='primary' onClick={() => handleOpenPost(record)}>
                Xác nhận sau tiêm
              </Button>
            )}
          {record.postVaccinationStatus && record.postVaccinationStatus !== PostVaccinationStatus.NotChecked && (
            <Button type='text' icon={<EyeOutlined />} onClick={() => handleOpenView(record)}>
              Xem kết quả
            </Button>
          )}
        </Space>
      )
    }
  ]

  // Client-side search cho searchKeyword vì API có thể không hỗ trợ query parameter
  const filteredAppointments: PopulatedVaccineAppointment[] = appointments.filter((item) => {
    if (!searchKeyword) return true
    return (
      (item.student?.fullName || '').toLowerCase().includes(searchKeyword.toLowerCase()) ||
      (item.event?.title || '').toLowerCase().includes(searchKeyword.toLowerCase())
    )
  })

  // Lấy danh sách năm học từ events
  const schoolYears = [...new Set(events.map((event) => event.schoolYear))].sort().reverse()

  const postVaccinationStatusLabels: Record<string, string> = {
    not_checked: 'Chưa kiểm tra',
    healthy: 'Bình thường, khỏe mạnh',
    mild_reaction: 'Phản ứng nhẹ',
    severe_reaction: 'Phản ứng nghiêm trọng',
    other: 'Khác'
  }

  return (
    <div className='p-6'>
      <Card>
        <Card style={{ background: 'linear-gradient(135deg, #06b6d4 100%)' }}>
          <Row justify='space-between' align='middle'>
            <Col>
              <Title level={3} style={{ color: 'white', margin: 0 }}>
                <CheckCircleOutlined style={{ marginRight: 12 }} />
                Quản lý lịch hẹn tiêm chủng
              </Title>
            </Col>
          </Row>
        </Card>
        <Card className='shadow-sm mt-6'>
          <Row justify='space-between' align='middle' className='mb-4'>
            <Col>
              <Space>
                {/* <Button type='primary' onClick={handleOpenCreate}>
                  Tạo kết quả
                </Button> */}
                <Button icon={<ReloadOutlined />} onClick={fetchAppointments} loading={loading}>
                  Làm mới
                </Button>
              </Space>
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
                      {event.title} - {dayjs(event.eventDate).format('DD/MM/YYYY')}
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
                      Sự kiện: {events.find((e) => e._id === selectedEventId)?.title}
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
            scroll={{ x: 800 }}
          />
          <Modal
            title={
              modalType === 'check'
                ? 'Đánh dấu đã tiêm'
                : modalType === 'post'
                  ? 'Xác nhận sau tiêm'
                  : 'Kết quả tiêm chủng'
            }
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
                : modalType === 'post'
                  ? [
                      <Button key='cancel' onClick={() => setIsDetailModalVisible(false)}>
                        Hủy
                      </Button>,
                      <Button key='save' type='primary' onClick={handlePost}>
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
              <Form form={checkForm} layout='vertical'>
                <Form.Item name='bloodPressure' label='Huyết áp'>
                  <Input placeholder='Nhập huyết áp' />
                </Form.Item>
                <Form.Item
                  name='isEligible'
                  label='Đủ điều kiện tiêm'
                  rules={[{ required: true, message: 'Chọn đủ điều kiện' }]}
                >
                  <Select>
                    <Option value={true}>Có</Option>
                    <Option value={false}>Không</Option>
                  </Select>
                </Form.Item>
                <Form.Item name='reasonIfIneligible' label='Lý do nếu không đủ điều kiện'>
                  <Input placeholder='Nhập lý do' />
                </Form.Item>
                <Form.Item name='notes' label='Ghi chú'>
                  <Input.TextArea rows={2} maxLength={300} />
                </Form.Item>
                <Form.Item
                  name='vaccinatedAt'
                  label='Thời gian tiêm'
                  extra={
                    selected?.event?.eventDate
                      ? `Ngày sự kiện: ${dayjs(selected.event.eventDate).format('DD/MM/YYYY')}`
                      : undefined
                  }
                  rules={[
                    { required: true, message: 'Chọn thời gian tiêm' },
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
                          return Promise.reject(new Error('Thời gian tiêm phải trong ngày diễn ra sự kiện'))
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
                    placeholder='Chọn thời gian tiêm trong ngày sự kiện'
                  />
                </Form.Item>
              </Form>
            )}
            {selected && modalType === 'post' && (
              <Form form={postForm} layout='vertical'>
                <Form.Item
                  name='postVaccinationStatus'
                  label='Tình trạng sau tiêm'
                  rules={[{ required: true, message: 'Chọn tình trạng' }]}
                >
                  <Select>
                    <Option value={PostVaccinationStatus.NotChecked}>Chưa kiểm tra</Option>
                    <Option value={PostVaccinationStatus.Healthy}>Bình thường, khỏe mạnh</Option>
                    <Option value={PostVaccinationStatus.MildReaction}>Phản ứng nhẹ</Option>
                    <Option value={PostVaccinationStatus.SevereReaction}>Phản ứng nghiêm trọng</Option>
                    <Option value={PostVaccinationStatus.Other}>Khác</Option>
                  </Select>
                </Form.Item>
                <Form.Item name='postVaccinationNotes' label='Ghi chú sau tiêm'>
                  <Input.TextArea rows={3} maxLength={500} />
                </Form.Item>
              </Form>
            )}
            {selected && modalType === 'view' && (
              <Descriptions bordered column={1} size='small'>
                <Descriptions.Item label='Học sinh'>
                  {selected.student?.fullName || selected.studentId}
                </Descriptions.Item>
                <Descriptions.Item label='Sự kiện'>{selected.event?.title || selected.eventId}</Descriptions.Item>
                <Descriptions.Item label='Ngày sự kiện'>
                  {selected.event?.eventDate ? dayjs(selected.event.eventDate).format('DD/MM/YYYY') : '-'}
                </Descriptions.Item>
                <Descriptions.Item label='Trạng thái'>{getStatusTag(selected.status)}</Descriptions.Item>
                <Descriptions.Item label='Ngày tiêm'>
                  {selected.vaccinatedAt ? formatDateTime(selected.vaccinatedAt) : '-'}
                </Descriptions.Item>
                <Descriptions.Item label='Huyết áp'>{selected.bloodPressure || '-'}</Descriptions.Item>
                <Descriptions.Item label='Đủ điều kiện tiêm'>{selected.isEligible ? 'Có' : 'Không'}</Descriptions.Item>
                <Descriptions.Item label='Lý do nếu không đủ điều kiện'>
                  {selected.reasonIfIneligible || '-'}
                </Descriptions.Item>
                <Descriptions.Item label='Ghi chú'>{selected.notes || '-'}</Descriptions.Item>
                <Descriptions.Item label='Tình trạng sau tiêm'>
                  {postVaccinationStatusLabels[selected.postVaccinationStatus || 'not_checked']}
                </Descriptions.Item>
                <Descriptions.Item label='Ghi chú sau tiêm'>{selected.postVaccinationNotes || '-'}</Descriptions.Item>
                <Descriptions.Item label='Năm học'>{selected.schoolYear}</Descriptions.Item>
              </Descriptions>
            )}
          </Modal>
          <Modal
            title='Tạo kết quả sau tiêm'
            open={createModalVisible}
            onCancel={() => setCreateModalVisible(false)}
            footer={[
              <Button key='cancel' onClick={() => setCreateModalVisible(false)}>
                Hủy
              </Button>,
              <Button key='save' type='primary' onClick={handleCreateResult}>
                Lưu kết quả
              </Button>
            ]}
            width={500}
          >
            <Form form={createForm} layout='vertical'>
              <Form.Item
                name='appointmentId'
                label='Chọn lịch hẹn tiêm'
                rules={[{ required: true, message: 'Vui lòng chọn lịch hẹn' }]}
              >
                <Select
                  showSearch
                  placeholder='Chọn lịch hẹn tiêm chưa có kết quả'
                  filterOption={(input, option) =>
                    (typeof option?.children === 'string' ? option.children : String(option?.children))
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                >
                  {appointments
                    .filter((a) => !a.postVaccinationStatus)
                    .map((a) => (
                      <Option key={a._id} value={a._id}>
                        {a.student?.fullName || a.studentId} - {a.event?.title || a.eventId}
                      </Option>
                    ))}
                </Select>
              </Form.Item>
              <Form.Item
                name='postVaccinationStatus'
                label='Tình trạng sau tiêm'
                rules={[{ required: true, message: 'Vui lòng chọn tình trạng sau tiêm' }]}
              >
                <Select>
                  <Option value={PostVaccinationStatus.NotChecked}>
                    {postVaccinationStatusLabels[PostVaccinationStatus.NotChecked]}
                  </Option>
                  <Option value={PostVaccinationStatus.Healthy}>
                    {postVaccinationStatusLabels[PostVaccinationStatus.Healthy]}
                  </Option>
                  <Option value={PostVaccinationStatus.MildReaction}>
                    {postVaccinationStatusLabels[PostVaccinationStatus.MildReaction]}
                  </Option>
                  <Option value={PostVaccinationStatus.SevereReaction}>
                    {postVaccinationStatusLabels[PostVaccinationStatus.SevereReaction]}
                  </Option>
                  <Option value={PostVaccinationStatus.Other}>
                    {postVaccinationStatusLabels[PostVaccinationStatus.Other]}
                  </Option>
                </Select>
              </Form.Item>
              <Form.Item name='postVaccinationNotes' label='Ghi chú sau tiêm'>
                <Input.TextArea rows={3} maxLength={500} />
              </Form.Item>
            </Form>
          </Modal>
        </Card>
      </Card>
    </div>
  )
}

export default AppointmentVaccine
