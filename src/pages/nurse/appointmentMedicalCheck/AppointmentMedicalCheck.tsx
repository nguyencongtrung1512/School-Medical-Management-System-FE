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
  EditOutlined,
  FileDoneOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'
import {
  medicalCheckAppointmentApi,
  AppointmentStatus,
  PostMedicalCheckStatus,
  type MedicalCheckAppointment
} from '../../../api/medicalCheckAppointment.api'
import type { ColumnsType } from 'antd/es/table'

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
  event?: { _id: string; eventName?: string }
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
  const [modalType, setModalType] = useState<'check' | 'post' | 'view' | null>(null)
  const [checkForm] = Form.useForm()
  const [postForm] = Form.useForm()

  useEffect(() => {
    fetchAppointments()
  }, [currentPage, pageSize])

  const fetchAppointments = async () => {
    setLoading(true)
    try {
      const response = await medicalCheckAppointmentApi.search({ pageNum: currentPage, pageSize })
      const pageData = (response as unknown as { pageData: PopulatedMedicalCheckAppointment[] }).pageData || []
      const total = (response as unknown as { pageInfo?: { totalItems: number } }).pageInfo?.totalItems || 0
      setAppointments(pageData)
      setTotalItems(total)
    } catch {
      message.error('Không thể tải danh sách lịch hẹn')
    } finally {
      setLoading(false)
    }
  }

  const handleTableChange = (page: number, pageSize?: number) => {
    setCurrentPage(page)
    if (pageSize) setPageSize(pageSize)
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
  const handleOpenPost = (record: PopulatedMedicalCheckAppointment) => {
    setSelected(record)
    setModalType('post')
    postForm.setFieldsValue({
      postMedicalCheckStatus: record.postMedicalCheckStatus,
      postMedicalCheckNotes: record.postMedicalCheckNotes
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
      const values = await checkForm.validateFields()
      await medicalCheckAppointmentApi.nurseCheck(selected._id, {
        ...values,
        checkedAt: values.checkedAt ? values.checkedAt.toDate() : undefined
      })
      message.success('Đánh dấu đã khám thành công!')
      setIsDetailModalVisible(false)
      fetchAppointments()
    } catch {
      message.error('Đánh dấu đã khám thất bại!')
    }
  }
  const handlePost = async () => {
    if (!selected) return
    try {
      const values = await postForm.validateFields()
      await medicalCheckAppointmentApi.updatePostMedicalCheck(selected._id, values)
      message.success('Xác nhận sau khám thành công!')
      setIsDetailModalVisible(false)
      fetchAppointments()
    } catch {
      message.error('Xác nhận sau khám thất bại!')
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
      render: (date: string) => (date ? formatDateTime(date) : '-')
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: unknown, record: PopulatedMedicalCheckAppointment) => (
        <Space>
          {(record.status === AppointmentStatus.Pending || record.status === AppointmentStatus.Checked) && (
            <Button type='primary' onClick={() => handleOpenCheck(record)}>
              Đánh dấu đã khám
            </Button>
          )}
          {record.status === AppointmentStatus.MedicalChecked &&
            (!record.postMedicalCheckStatus || record.postMedicalCheckStatus === PostMedicalCheckStatus.NotChecked) && (
              <Button type='primary' onClick={() => handleOpenPost(record)}>
                Xác nhận sau khám
              </Button>
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

  const filteredAppointments: PopulatedMedicalCheckAppointment[] = appointments.filter((item) => {
    const matchesSearch = searchKeyword
      ? (item.student?.fullName || '').toLowerCase().includes(searchKeyword.toLowerCase()) ||
        (item.event?.title || '').toLowerCase().includes(searchKeyword.toLowerCase())
      : true
    const matchesStatus = statusFilter ? item.status === statusFilter : true
    return matchesSearch && matchesStatus
  })

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
          <Row gutter={[16, 16]} className='mb-4'>
            <Col xs={24} md={12}>
              <Search
                placeholder='Tìm kiếm học sinh, sự kiện...'
                allowClear
                enterButton={<SearchOutlined />}
                onSearch={(value) => setSearchKeyword(value)}
                onChange={(e) => setSearchKeyword(e.target.value)}
              />
            </Col>
            <Col xs={24} md={12}>
              <Select
                placeholder='Lọc theo trạng thái'
                allowClear
                style={{ width: '100%' }}
                onChange={(value) => setStatusFilter(value)}
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
          </Row>
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
            title={
              modalType === 'check'
                ? 'Đánh dấu đã khám'
                : modalType === 'post'
                  ? 'Xác nhận sau khám'
                  : 'Kết quả khám sức khỏe'
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
                <Form.Item name='height' label='Chiều cao (cm)'>
                  <Input type='number' placeholder='Nhập chiều cao' />
                </Form.Item>
                <Form.Item name='weight' label='Cân nặng (kg)'>
                  <Input type='number' placeholder='Nhập cân nặng' />
                </Form.Item>
                <Form.Item name='visionLeft' label='Thị lực mắt trái'>
                  <Input type='number' step='0.1' placeholder='Nhập thị lực mắt trái' />
                </Form.Item>
                <Form.Item name='visionRight' label='Thị lực mắt phải'>
                  <Input type='number' step='0.1' placeholder='Nhập thị lực mắt phải' />
                </Form.Item>
                <Form.Item name='bloodPressure' label='Huyết áp'>
                  <Input placeholder='Nhập huyết áp' />
                </Form.Item>
                <Form.Item name='heartRate' label='Nhịp tim'>
                  <Input type='number' placeholder='Nhập nhịp tim' />
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
                <Form.Item name='reasonIfUnhealthy' label='Lý do nếu không đủ điều kiện'>
                  <Input placeholder='Nhập lý do' />
                </Form.Item>
                <Form.Item name='notes' label='Ghi chú'>
                  <Input.TextArea rows={2} maxLength={300} />
                </Form.Item>
                <Form.Item
                  name='checkedAt'
                  label='Thời gian khám'
                  rules={[{ required: true, message: 'Chọn thời gian khám' }]}
                >
                  <DatePicker showTime format='DD/MM/YYYY HH:mm' className='w-full' />
                </Form.Item>
              </Form>
            )}
            {selected && modalType === 'post' && (
              <Form form={postForm} layout='vertical'>
                <Form.Item
                  name='postMedicalCheckStatus'
                  label='Tình trạng sau khám'
                  rules={[{ required: true, message: 'Chọn tình trạng' }]}
                >
                  <Select>
                    <Option value={PostMedicalCheckStatus.NotChecked}>
                      {postMedicalCheckStatusLabels[PostMedicalCheckStatus.NotChecked]}
                    </Option>
                    <Option value={PostMedicalCheckStatus.Healthy}>
                      {postMedicalCheckStatusLabels[PostMedicalCheckStatus.Healthy]}
                    </Option>
                    <Option value={PostMedicalCheckStatus.NeedFollowUp}>
                      {postMedicalCheckStatusLabels[PostMedicalCheckStatus.NeedFollowUp]}
                    </Option>
                    <Option value={PostMedicalCheckStatus.Sick}>
                      {postMedicalCheckStatusLabels[PostMedicalCheckStatus.Sick]}
                    </Option>
                    <Option value={PostMedicalCheckStatus.Other}>
                      {postMedicalCheckStatusLabels[PostMedicalCheckStatus.Other]}
                    </Option>
                  </Select>
                </Form.Item>
                <Form.Item name='postMedicalCheckNotes' label='Ghi chú sau khám'>
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
