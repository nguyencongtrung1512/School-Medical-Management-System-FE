import {
  BookOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  CheckOutlined,
  ClockCircleOutlined,
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  EnvironmentOutlined,
  ExclamationCircleOutlined,
  ExportOutlined,
  EyeOutlined,
  MedicineBoxOutlined,
  MoreOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  StopOutlined,
  FilterOutlined,
  ClearOutlined
} from '@ant-design/icons'
import {
  Avatar,
  Button,
  Card,
  Col,
  Descriptions,
  Dropdown,
  Empty,
  Input,
  message,
  Modal,
  Row,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
  Menu,
  Select,
  Form
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import React, { useEffect, useState } from 'react'
import { EventStatus, medicalCheckEventApi, type MedicalCheckEvent } from '../../../api/medicalCheckEvent.api'
import { getGradesAPI } from '../../../api/grade.api'
import CreateMedicalCheckEvent from './CreateMedicalCheckEvent'
import UpdateMedicalCheckEvent from './UpdateMedicalCheckEvent'

const { Title, Text, Paragraph } = Typography
const { Search } = Input
const { Option } = Select

interface Grade {
  _id: string
  name: string
  positionOrder: string
  description?: string
}

// Filter interface
interface FilterParams {
  query?: string
  gradeId?: string
  schoolYear?: string
  status?: EventStatus
  startDate?: string
  endDate?: string
}

const MedicalCheckEvent: React.FC = () => {
  const [selectedEvent, setSelectedEvent] = useState<MedicalCheckEvent | null>(null)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const [events, setEvents] = useState<MedicalCheckEvent[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalItems, setTotalItems] = useState(0)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false)
  const [isEditModalVisible, setIsEditModalVisible] = useState(false)
  const [editEvent, setEditEvent] = useState<MedicalCheckEvent | null>(null)

  // Filter states
  const [filterParams, setFilterParams] = useState<FilterParams>({})
  const [grades, setGrades] = useState<Grade[]>([])
  const [filterForm] = Form.useForm()

  useEffect(() => {
    fetchEvents()
    fetchGrades()
  }, [currentPage, pageSize, filterParams])

  const fetchEvents = async () => {
    setLoading(true)
    try {
      const searchParams = {
        pageSize,
        pageNum: currentPage,
        ...filterParams
      }
      const response = await medicalCheckEventApi.search(searchParams)
      const pageData = (response as unknown as { pageData: MedicalCheckEvent[] }).pageData || []
      const total = (response as unknown as { pageInfo?: { totalItems: number } }).pageInfo?.totalItems || 0
      setEvents(pageData)
      setTotalItems(total)
    } catch (error: unknown) {
      console.log('error', error)
      const err = error as { message?: string }
      if (err.message) {
        message.error(err.message)
      } else {
        message.error('Không thể tải danh sách sự kiện')
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchGrades = async () => {
    try {
      const response = await getGradesAPI(100, 1)
      const gradesData = (response as { pageData?: Grade[] }).pageData || []
      setGrades(gradesData)
    } catch (error: unknown) {
      console.log('error', error)
      const err = error as { message?: string }
      if (err.message) {
        message.error(err.message)
      } else {
        message.error('Không thể tải danh sách khối lớp')
      }
    }
  }

  const handleTableChange = (page: number, pageSize?: number) => {
    setCurrentPage(page)
    if (pageSize) {
      setPageSize(pageSize)
    }
  }

  // Filter functions
  const handleFilterChange = (values: {
    query?: string
    gradeId?: string
    schoolYear?: string
    status?: EventStatus
    startDate?: dayjs.Dayjs
    endDate?: dayjs.Dayjs
  }) => {
    const newFilterParams: FilterParams = {}

    if (values.query) newFilterParams.query = values.query
    if (values.gradeId) newFilterParams.gradeId = values.gradeId
    if (values.schoolYear) newFilterParams.schoolYear = values.schoolYear
    if (values.status) newFilterParams.status = values.status
    if (values.startDate) newFilterParams.startDate = values.startDate.format('YYYY-MM-DD')
    if (values.endDate) newFilterParams.endDate = values.endDate.format('YYYY-MM-DD')

    setFilterParams(newFilterParams)
    setCurrentPage(1) // Reset to first page when filtering
  }

  const handleClearFilters = () => {
    filterForm.resetFields()
    setFilterParams({})
    setCurrentPage(1)
  }

  const getStatusConfig = (
    status: EventStatus = EventStatus.Ongoing
  ): { color: string; text: string; icon: React.ReactNode } => {
    const configs: Record<EventStatus, { color: string; text: string; icon: React.ReactNode }> = {
      [EventStatus.Ongoing]: {
        color: 'processing',
        text: 'Đang diễn ra',
        icon: <ClockCircleOutlined />
      },
      [EventStatus.Completed]: {
        color: 'success',
        text: 'Hoàn thành',
        icon: <CheckCircleOutlined />
      },
      [EventStatus.Cancelled]: {
        color: 'error',
        text: 'Đã hủy',
        icon: <StopOutlined />
      }
    }
    return configs[status] || { color: 'default', text: status, icon: <ExclamationCircleOutlined /> }
  }

  const columns: ColumnsType<MedicalCheckEvent> = [
    {
      title: 'Sự kiện khám sức khỏe',
      key: 'event',
      width: 280,
      render: (_, record) => (
        <Space>
          <Avatar
            icon={<MedicineBoxOutlined />}
            style={{ backgroundColor: getStatusConfig(record.status).color === 'success' ? '#52c41a' : '#1890ff' }}
          />
          <div>
            <div className='font-medium text-gray-900' style={{ fontSize: '14px', lineHeight: '1.4' }}>
              {record.eventName}
            </div>
            <Text type='secondary' style={{ fontSize: '12px' }}>
              {record.description || 'Không có mô tả'}
            </Text>
          </div>
        </Space>
      ),
      sorter: (a, b) => a.eventName.localeCompare(b.eventName)
    },
    {
      title: 'Thời gian sự kiện',
      key: 'eventDate',
      width: 150,
      sorter: (a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime(),
      render: (_, record) => (
        <div>
          <div style={{ fontSize: '13px', fontWeight: '500' }}>
            {record.eventDate ? formatDateTime(record.eventDate) : '-'}
          </div>
          <Text type='secondary' style={{ fontSize: '11px' }}>
            <EnvironmentOutlined style={{ marginRight: '4px' }} />
            {record.location}
          </Text>
        </div>
      )
    },
    {
      title: 'Hạn đăng ký',
      key: 'deadline',
      width: 180,
      render: (_, record) => {
        const isExpired = record.endRegistrationDate && dayjs(record.endRegistrationDate).isBefore(dayjs())
        return (
          <div>
            <div style={{ fontSize: '13px', fontWeight: '500' }}>
              {record.endRegistrationDate ? dayjs(record.endRegistrationDate).format('DD/MM/YYYY') : '-'}
            </div>
            {isExpired ? (
              <Tag color='red' style={{ marginTop: '4px' }}>
                Đã hết hạn
              </Tag>
            ) : (
              <Tag color='green' style={{ marginTop: '4px' }}>
                Còn hạn
              </Tag>
            )}
          </div>
        )
      }
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: EventStatus) => {
        const config = getStatusConfig(status)
        return (
          <Tag color={config.color} icon={config.icon} style={{ margin: 0 }}>
            {config.text}
          </Tag>
        )
      },
      filters: [
        { text: 'Đang diễn ra', value: EventStatus.Ongoing },
        { text: 'Hoàn thành', value: EventStatus.Completed },
        { text: 'Đã hủy', value: EventStatus.Cancelled }
      ],
      onFilter: (value, record) => record.status === value
    },
    {
      title: 'Đơn vị cung cấp',
      dataIndex: 'provider',
      key: 'provider',
      width: 120,
      render: (provider: string) => <Text style={{ fontSize: '13px' }}>{provider || '-'}</Text>
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 80,
      fixed: 'right',
      render: (_, record) => {
        const menu = (
          <Menu>
            <Menu.Item
              key='view'
              icon={<EyeOutlined />}
              onClick={(e) => {
                e.domEvent.stopPropagation()
                setSelectedEvent(record)
                setIsModalVisible(true)
              }}
            >
              Xem chi tiết
            </Menu.Item>

            {record.status === EventStatus.Ongoing && (
              <>
                {/* Kiểm tra xem đã quá hạn đăng ký chưa */}
                {record.endRegistrationDate && dayjs(record.endRegistrationDate).isAfter(dayjs()) && (
                  <Menu.Item
                    key='edit'
                    icon={<EditOutlined />}
                    onClick={(e) => {
                      e.domEvent.stopPropagation()
                      setEditEvent(record)
                      setIsEditModalVisible(true)
                    }}
                  >
                    Cập nhật
                  </Menu.Item>
                )}

                {/* Chỉ hiển thị nút xóa khi chưa hết hạn đăng ký */}
                {record.endRegistrationDate && dayjs(record.endRegistrationDate).isAfter(dayjs()) && (
                  <Menu.Item
                    key='delete'
                    icon={<DeleteOutlined />}
                    danger
                    onClick={async (e) => {
                      e.domEvent.stopPropagation()
                      Modal.confirm({
                        title: 'Xác nhận xóa sự kiện',
                        content: 'Bạn có chắc chắn muốn xóa sự kiện này? Hành động này không thể hoàn tác.',
                        okText: 'Xóa',
                        okType: 'danger',
                        cancelText: 'Hủy',
                        onOk: async () => {
                          try {
                            await medicalCheckEventApi.delete(record._id)
                            message.success('Xóa sự kiện thành công!')
                            fetchEvents()
                          } catch (error: unknown) {
                            console.log('error', error)
                            const err = error as { message?: string }
                            if (err.message) {
                              message.error(err.message)
                            } else {
                              message.error('Không thể xóa sự kiện!')
                            }
                          }
                        }
                      })
                    }}
                  >
                    Xóa sự kiện
                  </Menu.Item>
                )}
              </>
            )}
            {record.status === EventStatus.Completed && (
              <Menu.Item key='completed' icon={<CheckCircleOutlined />} disabled style={{ color: '#52c41a' }}>
                Đã hoàn thành
              </Menu.Item>
            )}
            {record.status === EventStatus.Cancelled && (
              <Menu.Item key='cancelled' icon={<StopOutlined />} disabled style={{ color: '#ff4d4f' }}>
                Đã hủy
              </Menu.Item>
            )}
          </Menu>
        )

        return (
          <Dropdown overlay={menu} trigger={['click']}>
            <Button type='text' icon={<MoreOutlined />} size='small' />
          </Dropdown>
        )
      }
    }
  ]

  const stats = {
    total: totalItems,
    ongoing: events.filter((p) => p.status === EventStatus.Ongoing).length,
    completed: events.filter((p) => p.status === EventStatus.Completed).length,
    cancelled: events.filter((p) => p.status === EventStatus.Cancelled).length
  }

  // Callback khi tạo thành công
  const handleCreateSuccess = () => {
    setIsCreateModalVisible(false)
    fetchEvents()
  }

  // Callback khi cập nhật thành công
  const handleEditSuccess = () => {
    setIsEditModalVisible(false)
    setEditEvent(null)
    fetchEvents()
  }

  const handleUpdateStatus = async (id: string = '', newStatus: EventStatus = EventStatus.Ongoing) => {
    try {
      await medicalCheckEventApi.updateStatus(id, newStatus)
      message.success('Cập nhật trạng thái thành công!')
      fetchEvents()
    } catch (error: unknown) {
      console.log('error', error)
      const err = error as { message?: string }
      if (err.message) {
        message.error(err.message)
      } else {
        message.error('Không thể cập nhật trạng thái!')
      }
    }
  }

  function formatDateTime(dateValue: string | Date) {
    if (!dateValue) return ''
    const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue
    return date.toLocaleString('vi-VN', { hour12: false })
  }

  return (
    <div className='space-y-4'>
      <Card className='shadow-sm'>
        <div className='flex justify-between items-center mb-4'>
          <div>
            <Title level={3} className='m-0 flex items-center gap-2'>
              <MedicineBoxOutlined className='text-blue-600' />
              Quản lý sự kiện khám sức khỏe
            </Title>
            <Text type='secondary' style={{ fontSize: '13px' }}>
              Duyệt và quản lý các sự kiện khám sức khỏe trong trường
            </Text>
          </div>
          <Space>
            <Button size='small' icon={<ExportOutlined />}>
              Xuất báo cáo
            </Button>
            <Button size='small' icon={<ReloadOutlined />} onClick={fetchEvents} loading={loading}>
              Làm mới
            </Button>
            <Button size='small' type='primary' icon={<PlusOutlined />} onClick={() => setIsCreateModalVisible(true)}>
              Tạo sự kiện mới
            </Button>
          </Space>
        </div>

        {/* Statistics */}
        <Row gutter={[12, 12]}>
          <Col xs={12} sm={6}>
            <Card size='small' className='text-center' style={{ border: '1px solid #f0f0f0' }}>
              <Statistic
                title={<span style={{ fontSize: '12px' }}>Tổng số sự kiện</span>}
                value={stats.total}
                prefix={<MedicineBoxOutlined style={{ fontSize: '14px' }} />}
                valueStyle={{ color: '#1890ff', fontSize: '18px' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size='small' className='text-center' style={{ border: '1px solid #f0f0f0' }}>
              <Statistic
                title={<span style={{ fontSize: '12px' }}>Chờ duyệt</span>}
                value={stats.ongoing}
                prefix={<ClockCircleOutlined style={{ fontSize: '14px' }} />}
                valueStyle={{ color: '#faad14', fontSize: '18px' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size='small' className='text-center' style={{ border: '1px solid #f0f0f0' }}>
              <Statistic
                title={<span style={{ fontSize: '12px' }}>Đã duyệt</span>}
                value={stats.completed}
                prefix={<CheckCircleOutlined style={{ fontSize: '14px' }} />}
                valueStyle={{ color: '#52c41a', fontSize: '18px' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size='small' className='text-center' style={{ border: '1px solid #f0f0f0' }}>
              <Statistic
                title={<span style={{ fontSize: '12px' }}>Đã hủy</span>}
                value={stats.cancelled}
                prefix={<StopOutlined style={{ fontSize: '14px' }} />}
                valueStyle={{ color: '#ff4d4f', fontSize: '18px' }}
              />
            </Card>
          </Col>
        </Row>
      </Card>

      {/* Advanced Filters - Always Visible */}
      <Card className='shadow-sm'>
        <div className='flex justify-between items-center mb-4'>
          <div className='flex items-center gap-2'>
            <FilterOutlined className='text-blue-600' />
            <Text strong>Bộ lọc tìm kiếm</Text>
          </div>
          <div className='flex items-center gap-2'>
            <Text type='secondary' style={{ fontSize: '12px' }}>
              Hiển thị {events.length} / {totalItems} sự kiện
            </Text>
            <Button
              size='small'
              icon={<ClearOutlined />}
              onClick={handleClearFilters}
              disabled={Object.keys(filterParams).length === 0}
            >
              Xóa bộ lọc
            </Button>
          </div>
        </div>

        {/* Quick Search */}
        <div className='mb-4'>
          <Search
            placeholder='Tìm kiếm tên sự kiện, mô tả, địa điểm...'
            allowClear
            enterButton={<SearchOutlined />}
            size='middle'
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onSearch={(value) => {
              setFilterParams((prev) => ({ ...prev, query: value }))
              setCurrentPage(1)
            }}
          />
        </div>

        {/* Filter Form - Always Visible */}
        <Form form={filterForm} layout='vertical' onFinish={handleFilterChange}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8}>
              <Form.Item label='Trạng thái' name='status'>
                <Select placeholder='Chọn trạng thái' allowClear size='middle'>
                  <Option value={EventStatus.Ongoing}>Đang diễn ra</Option>
                  <Option value={EventStatus.Completed}>Hoàn thành</Option>
                  <Option value={EventStatus.Cancelled}>Đã hủy</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item label='Khối lớp' name='gradeId'>
                <Select
                  placeholder='Chọn khối lớp'
                  allowClear
                  size='middle'
                  showSearch
                  filterOption={(input, option) =>
                    (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {grades.map((grade) => (
                    <Option key={grade._id} value={grade._id}>
                      {grade.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item label='Năm học' name='schoolYear'>
                <Select placeholder='Chọn năm học' allowClear size='middle'>
                  <Option value='2023-2024'>2023-2024</Option>
                  <Option value='2024-2025'>2024-2025</Option>
                  <Option value='2025-2026'>2025-2026</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            {/* <Col xs={24} sm={12} md={8}>
              <Form.Item label='Từ ngày' name='startDate'>
                <DatePicker
                  placeholder='Chọn ngày bắt đầu'
                  size='middle'
                  style={{ width: '100%' }}
                  format='DD/MM/YYYY'
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item label='Đến ngày' name='endDate'>
                <DatePicker
                  placeholder='Chọn ngày kết thúc'
                  size='middle'
                  style={{ width: '100%' }}
                  format='DD/MM/YYYY'
                />
              </Form.Item>
            </Col> */}
            <Col xs={24} sm={12} md={8}>
              <Form.Item>
                <Space className='mt-6'>
                  <Button type='primary' htmlType='submit' size='middle'>
                    Áp dụng bộ lọc
                  </Button>
                  <Button size='middle' onClick={handleClearFilters}>
                    Xóa bộ lọc
                  </Button>
                </Space>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>

      {/* Main Table */}
      <Card className='shadow-sm'>
        <Table
          columns={columns}
          dataSource={events}
          rowKey='_id'
          loading={loading}
          size='small'
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: totalItems,
            onChange: handleTableChange,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} sự kiện`,
            pageSizeOptions: ['10', '20', '50', '100']
          }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description='Không có sự kiện khám sức khỏe nào'
                children={
                  <Button type='primary' icon={<MedicineBoxOutlined />} onClick={() => setIsCreateModalVisible(true)}>
                    Tạo sự kiện mới
                  </Button>
                }
              />
            )
          }}
          scroll={{ x: 1000 }}
          rowClassName={(record) =>
            record.status === EventStatus.Ongoing
              ? 'hover:bg-blue-50 transition-colors cursor-pointer'
              : 'hover:bg-gray-50 transition-colors cursor-pointer'
          }
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title={
          <Space>
            <MedicineBoxOutlined />
            Chi tiết sự kiện khám sức khỏe
          </Space>
        }
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        width={900}
        footer={
          selectedEvent?.status === EventStatus.Ongoing
            ? [
              <Button key='cancel' onClick={() => setIsModalVisible(false)}>
                Đóng
              </Button>,
              <Button
                key='reject'
                danger
                icon={<CloseOutlined />}
                onClick={() => {
                  Modal.confirm({
                    title: 'Xác nhận hủy sự kiện',
                    content: `Bạn có chắc chắn muốn hủy sự kiện "${selectedEvent?.eventName || ''}"?`,
                    okText: 'Xác nhận',
                    cancelText: 'Hủy',
                    onOk: () => {
                      handleUpdateStatus(selectedEvent?._id || '', EventStatus.Cancelled)
                      setIsModalVisible(false)
                    }
                  })
                }}
              >
                Hủy sự kiện
              </Button>,
              <Button
                key='approve'
                type='primary'
                icon={<CheckOutlined />}
                onClick={() => {
                  handleUpdateStatus(selectedEvent?._id || '', EventStatus.Completed)
                  setIsModalVisible(false)
                }}
                disabled={selectedEvent && dayjs(selectedEvent.eventDate).isAfter(dayjs())}
              >
                Hoàn thành
              </Button>
            ]
            : [
              <Button key='close' onClick={() => setIsModalVisible(false)}>
                Đóng
              </Button>
            ]
        }
      >
        {selectedEvent && (
          <div className='space-y-6'>
            {/* Event Header */}
            <Card className='bg-gradient-to-r from-blue-50 to-green-50'>
              <Row gutter={[24, 24]} align='middle'>
                <Col>
                  <Avatar size={64} icon={<MedicineBoxOutlined />} className='bg-blue-500' />
                </Col>
                <Col flex='auto'>
                  <Space direction='vertical' size={0}>
                    <Title level={3} className='m-0'>
                      {selectedEvent.eventName}
                    </Title>
                    <Text type='secondary' className='text-lg'>
                      {selectedEvent.description}
                    </Text>
                    <div className='mt-2'>{getStatusConfig(selectedEvent.status).icon}</div>
                  </Space>
                </Col>
              </Row>
            </Card>

            {/* Event Details */}
            <Card title='Thông tin chi tiết' size='small'>
              <Descriptions column={2} size='small'>
                <Descriptions.Item
                  label={
                    <Space>
                      <CalendarOutlined />
                      Thời gian bắt đầu
                    </Space>
                  }
                >
                  {selectedEvent.eventDate ? formatDateTime(selectedEvent.eventDate) : '-'}
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    <Space>
                      <EnvironmentOutlined />
                      Địa điểm
                    </Space>
                  }
                >
                  {selectedEvent.location}
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    <Space>
                      <ClockCircleOutlined />
                      Hạn đăng ký
                    </Space>
                  }
                >
                  {(selectedEvent.startRegistrationDate ? formatDateTime(selectedEvent.startRegistrationDate) : '-') +
                    ' - ' +
                    (selectedEvent.endRegistrationDate ? formatDateTime(selectedEvent.endRegistrationDate) : '-')}
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    <Space>
                      <BookOutlined /> Năm học
                    </Space>
                  }
                >
                  {selectedEvent.schoolYear}
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    <Space>
                      <MedicineBoxOutlined />
                      Đơn vị cung cấp
                    </Space>
                  }
                >
                  {selectedEvent.provider}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Description */}
            <Card title='Mô tả chi tiết' size='small'>
              <Paragraph>{selectedEvent.description}</Paragraph>
            </Card>
          </div>
        )}
      </Modal>

      {/* Modal tạo mới sự kiện */}
      <Modal
        title={
          <span>
            <MedicineBoxOutlined /> Tạo sự kiện khám sức khỏe mới
          </span>
        }
        open={isCreateModalVisible}
        onCancel={() => setIsCreateModalVisible(false)}
        footer={null}
        width={800}
        destroyOnClose
      >
        <CreateMedicalCheckEvent onSuccess={handleCreateSuccess} />
      </Modal>

      {/* Modal cập nhật sự kiện */}
      <Modal
        title={
          <span>
            <MedicineBoxOutlined /> Cập nhật sự kiện khám sức khỏe
          </span>
        }
        open={isEditModalVisible}
        onCancel={() => {
          setIsEditModalVisible(false)
          setEditEvent(null)
        }}
        footer={null}
        width={800}
        destroyOnClose
      >
        {editEvent && (
          <UpdateMedicalCheckEvent
            eventId={editEvent._id}
            onSuccess={handleEditSuccess}
            onCancel={() => setIsEditModalVisible(false)}
          />
        )}
      </Modal>
    </div>
  )
}

export default MedicalCheckEvent
