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
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  StopOutlined
} from '@ant-design/icons'
import {
  Avatar,
  Badge,
  Button,
  Card,
  Col,
  Descriptions,
  Empty,
  Input,
  message,
  Modal,
  Row,
  Space,
  Statistic,
  Table,
  Tag,
  Tooltip,
  Typography
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import React, { useEffect, useState } from 'react'
import { EventStatus, medicalCheckEventApi, type MedicalCheckEvent } from '../../../api/medicalCheckEvent.api'
import CreateMedicalCheckEvent from './CreateMedicalCheckEvent'
import UpdateMedicalCheckEvent from './UpdateMedicalCheckEvent'

const { Title, Text, Paragraph } = Typography
const { Search } = Input

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

  useEffect(() => {
    fetchEvents()
  }, [currentPage, pageSize])

  const fetchEvents = async () => {
    setLoading(true)
    try {
      const response = await medicalCheckEventApi.search({ pageSize, pageNum: currentPage })
      setEvents((response as any)?.pageData || [])
      setTotalItems((response as any)?.pageInfo?.totalItems || 0)
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

  const handleTableChange = (page: number, pageSize?: number) => {
    setCurrentPage(page)
    if (pageSize) {
      setPageSize(pageSize)
    }
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
      render: (_, record) => (
        <Space>
          <Avatar
            icon={<MedicineBoxOutlined />}
            style={{ backgroundColor: getStatusConfig(record.status).color === 'success' ? '#52c41a' : '#1890ff' }}
          />
          <div>
            <div className='font-medium text-gray-900'>{record.eventName}</div>
            <Text type='secondary' className='text-sm'>
              {record.description || 'Không có mô tả'}
            </Text>
          </div>
        </Space>
      ),
      sorter: (a, b) => a.eventName.localeCompare(b.eventName)
    },
    {
      title: 'Thời gian & Địa điểm',
      key: 'schedule',
      sorter: (a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime(),
      render: (_, record) => (
        <Space direction='vertical' size={0}>
          <Space size='small'>
            <CalendarOutlined className='text-blue-500' />
            <Text className='text-sm'>{record.eventDate ? formatDateTime(record.eventDate) : '-'}</Text>
          </Space>
          <Space size='small'>
            <EnvironmentOutlined className='text-green-500' />
            <Text type='secondary' className='text-sm'>
              {record.location}
            </Text>
          </Space>
        </Space>
      )
    },
    {
      title: 'Hạn đăng ký',
      key: 'deadline',
      render: (_, record) => {
        const start = record.startRegistrationDate ? formatDateTime(record.startRegistrationDate) : '-'
        const end = record.endRegistrationDate ? formatDateTime(record.endRegistrationDate) : '-'
        const isExpired = record.endRegistrationDate && dayjs(record.endRegistrationDate).isBefore(dayjs())
        return (
          <Space>
            <ClockCircleOutlined className={isExpired ? 'text-red-500' : 'text-orange-500'} />
            <Text type={isExpired ? 'danger' : 'warning'} className='text-sm'>
              {start + ' - ' + end}
            </Text>
          </Space>
        )
      }
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: EventStatus) => {
        const config = getStatusConfig(status)
        return (
          <Badge
            status={config.color as unknown as 'success' | 'error' | 'processing' | 'default'}
            text={
              <Tag color={config.color} icon={config.icon}>
                {config.text}
              </Tag>
            }
          />
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
      title: 'Thao tác',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Space>
          <Tooltip title='Xem chi tiết'>
            <Button
              type='text'
              icon={<EyeOutlined />}
              onClick={(e) => {
                e.stopPropagation()
                setSelectedEvent(record)
                setIsModalVisible(true)
              }}
            />
          </Tooltip>
          {record.status === EventStatus.Ongoing && (
            <>
              <Tooltip title='Cập nhật'>
                <Button
                  type='text'
                  icon={<EditOutlined />}
                  onClick={(e) => {
                    e.stopPropagation()
                    setEditEvent(record)
                    setIsEditModalVisible(true)
                  }}
                  className='text-blue-600 hover:text-blue-700'
                />
              </Tooltip>
              <Tooltip title='Xóa'>
                <Button
                  type='text'
                  icon={<DeleteOutlined />}
                  onClick={async (e) => {
                    e.stopPropagation()
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
                  className='text-red-600 hover:text-red-700'
                />
              </Tooltip>
            </>
          )}
        </Space>
      )
    }
  ]

  const stats = {
    total: events.length,
    ongoing: events.filter((p) => p.status === EventStatus.Ongoing).length,
    completed: events.filter((p) => p.status === EventStatus.Completed).length,
    cancelled: events.filter((p) => p.status === EventStatus.Cancelled).length
  }

  const filteredEvents = events.filter((event) => {
    const matchesSearch = searchKeyword
      ? event.eventName.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        event.description.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        event.location.toLowerCase().includes(searchKeyword.toLowerCase())
      : true
    return matchesSearch
  })

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

  function formatDateTime(dateString: string) {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleString('vi-VN', { hour12: false })
  }

  return (
    <div className=''>
      <Card className='shadow-sm'>
        <div className='flex justify-between items-center'>
          <div>
            <Title level={2} className='m-0 flex items-center gap-2'>
              <MedicineBoxOutlined className='text-blue-600' />
              Quản lý sự kiện khám sức khỏe
            </Title>
            <Text type='secondary'>Duyệt và quản lý các sự kiện khám sức khỏe trong trường</Text>
          </div>
          <Space>
            <Button icon={<ExportOutlined />}>Xuất báo cáo</Button>
            <Button icon={<ReloadOutlined />} onClick={fetchEvents} loading={loading}>
              Làm mới
            </Button>
            <Button type='primary' icon={<PlusOutlined />} onClick={() => setIsCreateModalVisible(true)}>
              Tạo sự kiện mới
            </Button>
          </Space>
        </div>

        {/* Statistics */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Card size='small' className='text-center'>
              <Statistic
                title='Tổng số sự kiện'
                value={stats.total}
                prefix={<MedicineBoxOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card size='small' className='text-center'>
              <Statistic
                title='Chờ duyệt'
                value={stats.ongoing}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card size='small' className='text-center'>
              <Statistic
                title='Đã duyệt'
                value={stats.completed}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card size='small' className='text-center'>
              <Statistic
                title='Đã hủy'
                value={stats.cancelled}
                prefix={<StopOutlined />}
                valueStyle={{ color: '#ff4d4f' }}
              />
            </Card>
          </Col>
        </Row>
      </Card>

      {/* Filters */}
      <Card className='shadow-sm'>
        <Row gutter={[16, 16]} align='middle'>
          <Col xs={24} sm={12} md={10}>
            <Search
              placeholder='Tìm kiếm tên sự kiện, mô tả, địa điểm...'
              allowClear
              enterButton={<SearchOutlined />}
              size='large'
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
            />
          </Col>
          <Col xs={24} sm={24} md={8}>
            <div className='flex justify-end'>
              <Space>
                <Text type='secondary'>
                  Hiển thị {filteredEvents.length} / {stats.total} sự kiện
                </Text>
              </Space>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Main Table */}
      <Card className='shadow-sm'>
        <Table
          columns={columns}
          dataSource={filteredEvents}
          rowKey='_id'
          loading={loading}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: totalItems,
            onChange: handleTableChange,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} sự kiện`,
            pageSizeOptions: ['5', '10', '20', '50']
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
          scroll={{ x: 1200 }}
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
                >
                  Duyệt sự kiện
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
