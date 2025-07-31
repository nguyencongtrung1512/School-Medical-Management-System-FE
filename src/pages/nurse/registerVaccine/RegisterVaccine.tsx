import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  EditOutlined,
  EyeOutlined,
  FileExcelOutlined,
  FormOutlined,
  ReloadOutlined,
  SearchOutlined,
  StopOutlined
} from '@ant-design/icons'
import {
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
  Avatar,
  Form
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import React, { useEffect, useState } from 'react'
import {
  RegistrationStatus,
  vaccineRegistrationApi,
  type VaccineRegistration,
  type SearchVaccineRegistrationParams
} from '../../../api/vaccineRegistration.api'

const { Title, Text } = Typography
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

interface PopulatedVaccineRegistration extends VaccineRegistration {
  parent?: { _id: string; fullName?: string; email?: string }
  student?: { _id: string; fullName?: string; avatar?: string }
  event?: { _id: string; title?: string }
}

const RegisterVaccine: React.FC = () => {
  const [registrations, setRegistrations] = useState<PopulatedVaccineRegistration[]>([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalItems, setTotalItems] = useState(0)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [statusFilter, setStatusFilter] = useState<RegistrationStatus | undefined>(undefined)
  const [selected, setSelected] = useState<PopulatedVaccineRegistration | null>(null)
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false)
  const [isRejectModalVisible, setIsRejectModalVisible] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [rejectForm] = Form.useForm()
  const [selectedEventId, setSelectedEventId] = useState<string | undefined>(undefined)
  const [schoolYearFilter, setSchoolYearFilter] = useState<string | undefined>(undefined)

  useEffect(() => {
    fetchRegistrations()
  }, [currentPage, pageSize, selectedEventId, schoolYearFilter, statusFilter])

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      // Fetch events for filter dropdown - no need to store separately
      await vaccineRegistrationApi.search({ pageNum: 1, pageSize: 1000 })
    } catch {
      message.error('Không thể tải danh sách sự kiện')
    }
  }

  const fetchRegistrations = async () => {
    setLoading(true)
    try {
      const searchParams: SearchVaccineRegistrationParams = {
        pageNum: currentPage,
        pageSize,
        status: statusFilter,
        eventId: selectedEventId
      }

      // Loại bỏ các giá trị undefined
      const cleanParams = Object.fromEntries(
        Object.entries(searchParams).filter(([, value]) => value !== undefined)
      ) as SearchVaccineRegistrationParams

      const response = await vaccineRegistrationApi.search(cleanParams)
      const pageData = (response as unknown as { pageData: PopulatedVaccineRegistration[] }).pageData || []
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

  const handleSearch = (value: string) => {
    setSearchKeyword(value)
    setCurrentPage(1)
  }

  const handleResetFilters = () => {
    setSearchKeyword('')
    setStatusFilter(undefined)
    setSelectedEventId(undefined)
    setSchoolYearFilter(undefined)
    setCurrentPage(1)
    fetchRegistrations()
  }

  // Lấy danh sách năm học từ registrations
  const schoolYears = [...new Set(registrations.map((reg) => reg.schoolYear))].sort().reverse()

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
      const response = await vaccineRegistrationApi.exportExcel({ pageNum: currentPage, pageSize })
      const blob = new Blob([response as unknown as BlobPart], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `vaccine-registrations-${dayjs().format('YYYY-MM-DD')}.xlsx`
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
      await vaccineRegistrationApi.updateStatus(selected._id, { status: RegistrationStatus.Approved })
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
      await vaccineRegistrationApi.updateStatus(selected._id, {
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

  const columns: ColumnsType<PopulatedVaccineRegistration> = [
    {
      title: 'Học sinh',
      dataIndex: 'student',
      key: 'student',
      render: (_: unknown, record: PopulatedVaccineRegistration) => record.student?.fullName || record.studentId
    },
    {
      title: 'Sự kiện',
      dataIndex: 'event',
      key: 'event',
      render: (_: unknown, record: PopulatedVaccineRegistration) => record.event?.title || record.eventId
    },
    {
      title: 'Phụ huynh',
      dataIndex: 'parent',
      key: 'parent',
      render: (_: unknown, record: PopulatedVaccineRegistration) => record.parent?.fullName || record.parentId
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
      render: (_: unknown, record: PopulatedVaccineRegistration) => (
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

  const filteredRegistrations: PopulatedVaccineRegistration[] = registrations.filter((item) => {
    const matchesSearch = searchKeyword
      ? (item.student?.fullName || '').toLowerCase().includes(searchKeyword.toLowerCase()) ||
        (item.event?.title || '').toLowerCase().includes(searchKeyword.toLowerCase()) ||
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
                <FormOutlined style={{ marginRight: 12 }} />
                Quản lý đơn đăng ký tiêm chủng
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
            <Col xs={24} md={8}>
              <Search
                placeholder='Tìm kiếm học sinh, sự kiện, phụ huynh...'
                allowClear
                enterButton={<SearchOutlined />}
                onSearch={handleSearch}
                onChange={(e) => setSearchKeyword(e.target.value)}
              />
            </Col>
            <Col xs={24} md={4}>
              <Select
                placeholder='Chọn năm học'
                allowClear
                style={{ width: '100%' }}
                onChange={(value) => {
                  setSchoolYearFilter(value)
                  setCurrentPage(1)
                  fetchRegistrations()
                }}
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
                onChange={(value) => {
                  setSelectedEventId(value)
                  setCurrentPage(1)
                  fetchRegistrations()
                }}
              >
                {registrations.map((reg) => (
                  <Option key={reg.eventId} value={reg.eventId}>
                    {reg.event?.title || reg.eventId}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} md={4}>
              <Select
                placeholder='Lọc theo trạng thái'
                allowClear
                style={{ width: '100%' }}
                onChange={(value) => {
                  setStatusFilter(value)
                  setCurrentPage(1)
                  fetchRegistrations()
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
              <Button onClick={handleResetFilters} style={{ width: '100%' }}>
                Xóa bộ lọc
              </Button>
            </Col>
          </Row>

          {/* Current Filters */}
          {(searchKeyword || statusFilter || selectedEventId || schoolYearFilter) && (
            <Row className='mb-4'>
              <Col span={24}>
                <Space wrap>
                  <Text strong>Bộ lọc hiện tại:</Text>
                  {searchKeyword && (
                    <Tag closable onClose={() => setSearchKeyword('')}>
                      Tìm kiếm: {searchKeyword}
                    </Tag>
                  )}
                  {statusFilter && (
                    <Tag closable onClose={() => setStatusFilter(undefined)}>
                      Trạng thái: {statusOptions.find((s) => s.value === statusFilter)?.label}
                    </Tag>
                  )}
                  {selectedEventId && (
                    <Tag closable onClose={() => setSelectedEventId(undefined)}>
                      Sự kiện:{' '}
                      {registrations.find((r) => r.eventId === selectedEventId)?.event?.title || selectedEventId}
                    </Tag>
                  )}
                  {schoolYearFilter && (
                    <Tag closable onClose={() => setSchoolYearFilter(undefined)}>
                      Năm học: {schoolYearFilter}
                    </Tag>
                  )}
                </Space>
              </Col>
            </Row>
          )}
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
                Chi tiết đơn đăng ký tiêm chủng
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
                  {/* Bỏ dòng Học sinh vì đã hiển thị avatar + tên ở trên */}
                  <Descriptions.Item label='Sự kiện'>{selected.event?.title || selected.eventId}</Descriptions.Item>
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

export default RegisterVaccine
