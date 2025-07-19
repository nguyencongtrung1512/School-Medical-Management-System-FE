import {
  BookOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  EyeOutlined,
  MedicineBoxOutlined,
  ReloadOutlined,
  SearchOutlined,
  StopOutlined
} from '@ant-design/icons'
import {
  Badge,
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
  Statistic,
  Table,
  Tag,
  Tooltip,
  Typography
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import { medicalCheckEventApi, type MedicalCheckEvent, EventStatus } from '../../../api/medicalCheckEvent.api'

const { Title, Text, Paragraph } = Typography
const { Search } = Input
const { Option } = Select

const ResultsAfterMedicalEvent: React.FC = () => {
  const [medicalEvents, setMedicalEvents] = useState<MedicalCheckEvent[]>([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalItems, setTotalItems] = useState(0)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [statusFilter, setStatusFilter] = useState<EventStatus | undefined>(undefined)
  const [selectedEvent, setSelectedEvent] = useState<MedicalCheckEvent | null>(null)
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false)

  useEffect(() => {
    fetchMedicalEvents()
  }, [currentPage, pageSize])

  const fetchMedicalEvents = async () => {
    setLoading(true)
    try {
      const response = await medicalCheckEventApi.search({ pageNum: currentPage, pageSize })
      setMedicalEvents((response as any).pageData || [])
      setTotalItems((response as any).pageInfo?.totalItems || 0)
    } catch (error: unknown) {
      console.log('error', error)
      const err = error as { message?: string }
      if (err.message) {
        message.error(err.message)
      } else {
        message.error('Không thể tải danh sách sự kiện khám sức khỏe')
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

  const getStatusConfig = (status: EventStatus) => {
    const configs = {
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
    return configs[status] || { color: 'default', text: status, icon: <ClockCircleOutlined /> }
  }

  const handleUpdateStatus = async (id: string, newStatus: EventStatus) => {
    try {
      await medicalCheckEventApi.updateStatus(id, newStatus)
      message.success('Cập nhật trạng thái thành công!')
      fetchMedicalEvents() // Refresh danh sách
    } catch (error: unknown) {
      console.log('error', error)
      const err = error as { message?: string }
      if (err.message) {
        message.error(err.message)
      } else {
        message.error('Không thể cập nhật trạng thái')
      }
    }
  }

  const formatDateTime = (dateString: string) => {
    if (!dateString) return ''
    const date = dayjs(dateString)
    return date.format('DD/MM/YYYY HH:mm')
  }

  const showDetailModal = (event: MedicalCheckEvent) => {
    setSelectedEvent(event)
    setIsDetailModalVisible(true)
  }

  const columns: ColumnsType<MedicalCheckEvent> = [
    {
      title: 'Sự kiện khám sức khỏe',
      key: 'event',
      render: (_, record) => (
        <Space>
          <Badge
            status={
              getStatusConfig(record.status || EventStatus.Ongoing).color as
                | 'success'
                | 'error'
                | 'processing'
                | 'default'
            }
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
      sorter: (a, b) => dayjs(a.eventDate).valueOf() - dayjs(b.eventDate).valueOf(),
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
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: EventStatus) => {
        const config = getStatusConfig(status || EventStatus.Ongoing)
        return (
          <Tag color={config.color} icon={config.icon}>
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
      title: 'Thao tác',
      key: 'action',
      width: 180,
      render: (_, record) => (
        <Space>
          <Tooltip title='Xem chi tiết'>
            <Button
              type='text'
              icon={<EyeOutlined />}
              onClick={() => showDetailModal(record)}
              className='text-blue-600 hover:text-blue-700'
            />
          </Tooltip>
          <Tooltip title='Cập nhật trạng thái'>
            <Select
              value={record.status || EventStatus.Ongoing}
              style={{ width: 120 }}
              onChange={(value) => {
                Modal.confirm({
                  title: 'Xác nhận cập nhật trạng thái',
                  content: `Bạn có chắc chắn muốn thay đổi trạng thái sự kiện "${record.eventName}" thành "${getStatusConfig(value as EventStatus).text}"?`,
                  okText: 'Cập nhật',
                  cancelText: 'Hủy',
                  onOk: () => handleUpdateStatus(record._id, value as EventStatus)
                })
              }}
            >
              <Option value={EventStatus.Ongoing}>
                <Space>
                  <ClockCircleOutlined />
                  Đang diễn ra
                </Space>
              </Option>
              <Option value={EventStatus.Completed}>
                <Space>
                  <CheckCircleOutlined />
                  Hoàn thành
                </Space>
              </Option>
              <Option value={EventStatus.Cancelled}>
                <Space>
                  <StopOutlined />
                  Đã hủy
                </Space>
              </Option>
            </Select>
          </Tooltip>
        </Space>
      )
    }
  ]

  const stats = {
    total: medicalEvents.length,
    ongoing: medicalEvents.filter((p) => p.status === EventStatus.Ongoing).length,
    completed: medicalEvents.filter((p) => p.status === EventStatus.Completed).length,
    cancelled: medicalEvents.filter((p) => p.status === EventStatus.Cancelled).length
  }

  const filteredEvents = medicalEvents.filter((event) => {
    const matchesSearch = searchKeyword
      ? event.eventName.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        (event.description && event.description.toLowerCase().includes(searchKeyword.toLowerCase())) ||
        event.location.toLowerCase().includes(searchKeyword.toLowerCase())
      : true

    const matchesStatus = statusFilter ? event.status === statusFilter : true

    return matchesSearch && matchesStatus
  })

  return (
    <div className='p-6'>
      <Card className='shadow-sm'>
        <div className='flex justify-between items-center mb-6'>
          <div>
            <Title level={2} className='m-0 flex items-center gap-2'>
              <MedicineBoxOutlined className='text-blue-600' />
              Quản lý sự kiện khám sức khỏe
            </Title>
            <Text type='secondary'>Cập nhật trạng thái các sự kiện khám sức khỏe trong trường</Text>
          </div>
          <Space>
            <Button icon={<ReloadOutlined />} onClick={fetchMedicalEvents} loading={loading}>
              Làm mới
            </Button>
          </Space>
        </div>

        {/* Statistics */}
        <Row gutter={[16, 16]} className='mb-6'>
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
                title='Đang diễn ra'
                value={stats.ongoing}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card size='small' className='text-center'>
              <Statistic
                title='Hoàn thành'
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

        {/* Filters */}
        <Row gutter={[16, 16]} className='mb-4'>
          <Col xs={24} md={12}>
            <Search
              placeholder='Tìm kiếm theo tên sự kiện, mô tả, địa điểm...'
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
              <Option value={EventStatus.Ongoing}>
                <Space>
                  <ClockCircleOutlined />
                  Đang diễn ra
                </Space>
              </Option>
              <Option value={EventStatus.Completed}>
                <Space>
                  <CheckCircleOutlined />
                  Hoàn thành
                </Space>
              </Option>
              <Option value={EventStatus.Cancelled}>
                <Space>
                  <StopOutlined />
                  Đã hủy
                </Space>
              </Option>
            </Select>
          </Col>
        </Row>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={filteredEvents}
          rowKey='_id'
          loading={loading}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: totalItems,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} sự kiện`,
            onChange: handleTableChange
          }}
          scroll={{ x: 800 }}
        />

        {/* Detail Modal */}
        <Modal
          title={
            <Space>
              <MedicineBoxOutlined className='text-blue-500' />
              Chi tiết sự kiện khám sức khỏe
            </Space>
          }
          open={isDetailModalVisible}
          onCancel={() => setIsDetailModalVisible(false)}
          footer={[
            <Button key='close' onClick={() => setIsDetailModalVisible(false)}>
              Đóng
            </Button>
          ]}
          width={700}
        >
          {selectedEvent && (
            <div className='mt-4'>
              <Descriptions bordered column={1} size='small'>
                <Descriptions.Item label='Tên sự kiện' span={1}>
                  <Text strong>{selectedEvent.eventName}</Text>
                </Descriptions.Item>

                <Descriptions.Item label='Mô tả'>
                  <Paragraph className='mb-0'>{selectedEvent.description || 'Không có mô tả'}</Paragraph>
                </Descriptions.Item>

                <Descriptions.Item label='Địa điểm'>
                  <Space>
                    <EnvironmentOutlined className='text-green-500' />
                    {selectedEvent.location}
                  </Space>
                </Descriptions.Item>

                <Descriptions.Item label='Ngày diễn ra sự kiện'>
                  <Space>
                    <CalendarOutlined className='text-blue-500' />
                    {selectedEvent.eventDate ? formatDateTime(selectedEvent.eventDate) : '-'}
                  </Space>
                </Descriptions.Item>

                <Descriptions.Item label='Thời gian đăng ký'>
                  <Space direction='vertical' size={0}>
                    <Space size='small'>
                      <ClockCircleOutlined className='text-orange-500' />
                      <Text>
                        Bắt đầu:{' '}
                        {selectedEvent.startRegistrationDate
                          ? formatDateTime(selectedEvent.startRegistrationDate)
                          : '-'}
                      </Text>
                    </Space>
                    <Space size='small'>
                      <ClockCircleOutlined className='text-red-500' />
                      <Text>
                        Kết thúc:{' '}
                        {selectedEvent.endRegistrationDate ? formatDateTime(selectedEvent.endRegistrationDate) : '-'}
                      </Text>
                    </Space>
                  </Space>
                </Descriptions.Item>

                <Descriptions.Item label='Năm học'>
                  <Space>
                    <BookOutlined className='text-purple-500' />
                    {selectedEvent.schoolYear}
                  </Space>
                </Descriptions.Item>

                <Descriptions.Item label='Trạng thái'>
                  <Tag
                    color={getStatusConfig(selectedEvent.status || EventStatus.Ongoing).color}
                    icon={getStatusConfig(selectedEvent.status || EventStatus.Ongoing).icon}
                  >
                    {getStatusConfig(selectedEvent.status || EventStatus.Ongoing).text}
                  </Tag>
                </Descriptions.Item>

                {selectedEvent.createdAt && (
                  <Descriptions.Item label='Ngày tạo'>
                    <Text>{formatDateTime(selectedEvent.createdAt)}</Text>
                  </Descriptions.Item>
                )}

                {selectedEvent.updatedAt && (
                  <Descriptions.Item label='Cập nhật lần cuối'>
                    <Text>{formatDateTime(selectedEvent.updatedAt)}</Text>
                  </Descriptions.Item>
                )}
              </Descriptions>

              <div className='mt-6 text-center'>
                <Text type='secondary'>
                  <ClockCircleOutlined className='mr-2' />
                  Xem chi tiết lúc: {dayjs().format('DD/MM/YYYY HH:mm')}
                </Text>
              </div>
            </div>
          )}
        </Modal>
      </Card>
    </div>
  )
}

export default ResultsAfterMedicalEvent
