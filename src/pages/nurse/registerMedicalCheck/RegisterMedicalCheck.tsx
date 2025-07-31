import {
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  EditOutlined,
  EyeOutlined,
  FileExcelOutlined,
  ReloadOutlined,
  SearchOutlined,
  StopOutlined
} from '@ant-design/icons'
import {
  Avatar,
  Button,
  Card,
  Col,
  Descriptions,
  Input,
  message,
  Modal,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  Form
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import React, { useEffect, useState } from 'react'
import {
  medicalCheckRegistrationApi,
  RegistrationStatus,
  type MedicalCheckRegistration
} from '../../../api/medicalCheckRegistration.api'

const { Title } = Typography
const { Search } = Input
const { Option } = Select

const statusOptions = [
  { value: RegistrationStatus.Pending, label: 'Chờ duyệt', icon: <ClockCircleOutlined /> },
  { value: RegistrationStatus.Approved, label: 'Đã duyệt', icon: <CheckCircleOutlined /> },
  { value: RegistrationStatus.Rejected, label: 'Từ chối', icon: <StopOutlined /> },
  { value: RegistrationStatus.Cancelled, label: 'Đã hủy', icon: <StopOutlined /> },
  { value: RegistrationStatus.Expired, label: 'Hết hạn', icon: <StopOutlined /> }
]

const statusLabels: Record<string, string> = {
  pending: 'Chờ duyệt',
  approved: 'Đã duyệt',
  rejected: 'Từ chối',
  cancelled: 'Đã hủy',
  expired: 'Hết hạn'
}

interface PopulatedMedicalCheckRegistration extends MedicalCheckRegistration {
  parent?: { _id: string; fullName?: string; email?: string }
  student?: { _id: string; fullName?: string; avatar?: string }
  event?: { _id: string; eventName?: string }
}

const RegisterMedicalCheck: React.FC = () => {
  const [registrations, setRegistrations] = useState<PopulatedMedicalCheckRegistration[]>([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalItems, setTotalItems] = useState(0)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [statusFilter, setStatusFilter] = useState<RegistrationStatus | undefined>(undefined)
  const [selected, setSelected] = useState<PopulatedMedicalCheckRegistration | null>(null)
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false)
  const [isRejectModalVisible, setIsRejectModalVisible] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [rejectForm] = Form.useForm()

  useEffect(() => {
    fetchRegistrations()
  }, [currentPage, pageSize])

  const fetchRegistrations = async () => {
    setLoading(true)
    try {
      const response = await medicalCheckRegistrationApi.search({ pageNum: currentPage, pageSize })
      const pageData = (response as unknown as { pageData: PopulatedMedicalCheckRegistration[] }).pageData || []
      const total = (response as unknown as { pageInfo?: { totalItems: number } }).pageInfo?.totalItems || 0
      setRegistrations(pageData)
      setTotalItems(total)
    } catch {
      message.error('Không thể tải danh sách đơn đăng ký')
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

  const getStatusTag = (status: RegistrationStatus) => {
    const found = statusOptions.find((s) => s.value === status)
    if (!found) return <Tag>{status}</Tag>
    return <Tag icon={found.icon}>{found.label}</Tag>
  }

  const handleExportExcel = async () => {
    setExporting(true)
    try {
      const response = await medicalCheckRegistrationApi.exportExcel({ pageNum: currentPage, pageSize })
      const blob = new Blob([response as unknown as BlobPart], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `medical-check-registrations-${dayjs().format('YYYY-MM-DD')}.xlsx`
      link.click()
      window.URL.revokeObjectURL(url)
      message.success('Xuất Excel thành công!')
    } catch {
      message.error('Xuất Excel thất bại!')
    } finally {
      setExporting(false)
    }
  }

  const handleApprove = async () => {
    if (!selected) return
    try {
      await medicalCheckRegistrationApi.updateStatus(selected._id, { status: RegistrationStatus.Approved })
      message.success('Duyệt đơn thành công!')
      setIsDetailModalVisible(false)
      fetchRegistrations()
    } catch {
      message.error('Duyệt đơn thất bại!')
    }
  }

  const handleReject = async (values: { cancellationReason: string }) => {
    if (!selected) return
    try {
      await medicalCheckRegistrationApi.updateStatus(selected._id, {
        status: RegistrationStatus.Rejected,
        cancellationReason: values.cancellationReason
      })
      message.success('Từ chối đơn thành công!')
      setIsRejectModalVisible(false)
      setIsDetailModalVisible(false)
      rejectForm.resetFields()
      fetchRegistrations()
    } catch {
      message.error('Từ chối đơn thất bại!')
    }
  }

  const columns: ColumnsType<PopulatedMedicalCheckRegistration> = [
    {
      title: 'Học sinh',
      dataIndex: 'student',
      key: 'student',
      render: (_: unknown, record: PopulatedMedicalCheckRegistration) => record.student?.fullName || record.studentId
    },
    {
      title: 'Sự kiện',
      dataIndex: 'event',
      key: 'event',
      render: (_: unknown, record: PopulatedMedicalCheckRegistration) => record.event?.eventName || record.eventId
    },
    {
      title: 'Phụ huynh',
      dataIndex: 'parent',
      key: 'parent',
      render: (_: unknown, record: PopulatedMedicalCheckRegistration) => record.parent?.fullName || record.parentId
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: RegistrationStatus) => getStatusTag(status),
      filters: statusOptions.map((s) => ({ text: s.label, value: s.value })),
      onFilter: (value, record) => record.status === value
    },
    {
      title: 'Lý do',
      dataIndex: 'cancellationReason',
      key: 'cancellationReason',
      render: (val: string) => val || '-'
    },
    {
      title: 'Ghi chú',
      dataIndex: 'note',
      key: 'note',
      render: (val: string) => val || '-'
    },
    {
      title: 'Năm học',
      dataIndex: 'schoolYear',
      key: 'schoolYear'
    },
    {
      title: 'Ngày duyệt',
      dataIndex: 'approvedAt',
      key: 'approvedAt',
      render: (val: string) => (val ? formatDateTime(val) : '-')
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: unknown, record: PopulatedMedicalCheckRegistration) => (
        <Space>
          <Button
            type='text'
            icon={<EyeOutlined />}
            onClick={() => {
              setSelected(record)
              setIsDetailModalVisible(true)
            }}
          />
        </Space>
      )
    }
  ]

  const filteredRegistrations: PopulatedMedicalCheckRegistration[] = registrations.filter((item) => {
    const matchesSearch = searchKeyword
      ? (item.student?.fullName || '').toLowerCase().includes(searchKeyword.toLowerCase()) ||
        (item.event?.eventName || '').toLowerCase().includes(searchKeyword.toLowerCase()) ||
        (item.parent?.fullName || '').toLowerCase().includes(searchKeyword.toLowerCase())
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
                <CalendarOutlined style={{ marginRight: 12 }} />
                Quản lý đơn đăng ký khám sức khỏe
              </Title>
            </Col>
          </Row>
        </Card>
        <Card className='shadow-sm mt-6'>
          <Row justify='space-between' align='middle' className='mb-4'>
            <Col>
              <Space>
                <Button icon={<ReloadOutlined />} onClick={fetchRegistrations} loading={loading}>
                  Làm mới
                </Button>
                <Button icon={<FileExcelOutlined />} loading={exporting} onClick={handleExportExcel}>
                  Xuất Excel
                </Button>
              </Space>
            </Col>
          </Row>
          <Row gutter={[16, 16]} className='mb-4'>
            <Col xs={24} md={12}>
              <Search
                placeholder='Tìm kiếm học sinh, sự kiện, phụ huynh...'
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
            dataSource={filteredRegistrations}
            rowKey='_id'
            loading={loading}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: totalItems,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} đơn đăng ký`,
              onChange: handleTableChange
            }}
            scroll={{ x: 1000 }}
          />
          <Modal
            title={
              <Space>
                <EditOutlined className='text-blue-500' />
                Chi tiết đơn đăng ký khám sức khỏe
              </Space>
            }
            open={isDetailModalVisible}
            onCancel={() => setIsDetailModalVisible(false)}
            footer={[
              selected?.status === RegistrationStatus.Pending && (
                <Button key='approve' type='primary' onClick={handleApprove}>
                  Duyệt đơn
                </Button>
              ),
              selected?.status === RegistrationStatus.Pending && (
                <Button key='reject' danger onClick={() => setIsRejectModalVisible(true)}>
                  Từ chối
                </Button>
              ),
              <Button key='close' onClick={() => setIsDetailModalVisible(false)}>
                Đóng
              </Button>
            ]}
            width={700}
          >
            {selected && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                  {selected.student?.avatar && (
                    <Avatar src={selected.student.avatar} size={64} style={{ marginRight: 16 }} />
                  )}
                  <div>
                    <span style={{ fontWeight: 600, fontSize: 18 }}>
                      {selected.student?.fullName || selected.studentId}
                    </span>
                  </div>
                </div>
                <Descriptions bordered column={1} size='small'>
                  <Descriptions.Item label='Sự kiện'>{selected.event?.eventName || selected.eventId}</Descriptions.Item>
                  <Descriptions.Item label='Phụ huynh'>
                    {selected.parent?.fullName || selected.parentId}
                  </Descriptions.Item>
                  <Descriptions.Item label='Trạng thái'>{statusLabels[selected.status]}</Descriptions.Item>
                  <Descriptions.Item label='Lý do'>{selected.cancellationReason || '-'}</Descriptions.Item>
                  <Descriptions.Item label='Ghi chú'>{selected.note || '-'}</Descriptions.Item>
                  <Descriptions.Item label='Năm học'>{selected.schoolYear}</Descriptions.Item>
                  <Descriptions.Item label='Ngày duyệt'>
                    {selected.approvedAt ? formatDateTime(selected.approvedAt) : '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label='Ngày tạo'>
                    {selected.createdAt ? formatDateTime(selected.createdAt) : '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label='Ngày cập nhật'>
                    {selected.updatedAt ? formatDateTime(selected.updatedAt) : '-'}
                  </Descriptions.Item>
                </Descriptions>
              </>
            )}
          </Modal>
          <Modal
            title={
              <Space>
                <StopOutlined className='text-red-500' />
                Từ chối đơn đăng ký
              </Space>
            }
            open={isRejectModalVisible}
            onCancel={() => {
              setIsRejectModalVisible(false)
              rejectForm.resetFields()
            }}
            footer={[
              <Button
                key='cancel'
                onClick={() => {
                  setIsRejectModalVisible(false)
                  rejectForm.resetFields()
                }}
              >
                Hủy
              </Button>,
              <Button key='submit' type='primary' danger onClick={() => rejectForm.submit()}>
                Từ chối
              </Button>
            ]}
            width={500}
          >
            <Form form={rejectForm} onFinish={handleReject} layout='vertical'>
              <Form.Item
                label='Lý do từ chối'
                name='cancellationReason'
                rules={[{ required: true, message: 'Vui lòng nhập lý do từ chối!' }]}
              >
                <Input.TextArea rows={4} placeholder='Nhập lý do từ chối đơn đăng ký...' />
              </Form.Item>
            </Form>
          </Modal>
        </Card>
      </Card>
    </div>
  )
}

export default RegisterMedicalCheck
