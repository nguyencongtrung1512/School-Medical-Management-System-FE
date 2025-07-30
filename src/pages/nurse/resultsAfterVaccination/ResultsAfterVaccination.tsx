import {
  BookOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  ExperimentOutlined,
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
import { vaccineEventApi, VaccineEventStatus, type VaccineEvent } from '../../../api/vaccineEvent.api'

const { Title, Text, Paragraph } = Typography
const { Search } = Input
const { Option } = Select

const ResultsAfterVaccination: React.FC = () => {
  const [vaccineEvents, setVaccineEvents] = useState<VaccineEvent[]>([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalItems, setTotalItems] = useState(0)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [statusFilter, setStatusFilter] = useState<VaccineEventStatus | undefined>(undefined)
  const [selectedEvent, setSelectedEvent] = useState<VaccineEvent | null>(null)
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false)

  useEffect(() => {
    fetchVaccineEvents()
  }, [currentPage, pageSize])

  const fetchVaccineEvents = async () => {
    setLoading(true)
    try {
      const response = await vaccineEventApi.search({ pageNum: currentPage, pageSize })
      const pageData = (response as unknown as { pageData: VaccineEvent[] }).pageData || []
      const total = (response as unknown as { pageInfo?: { totalItems: number } }).pageInfo?.totalItems || 0
      setVaccineEvents(pageData)
      setTotalItems(total)
    } catch (error: unknown) {
      console.log('error', error)
      const err = error as { message?: string }
      if (err.message) {
        message.error(err.message)
      } else {
        message.error('Không thể tải danh sách sự kiện tiêm chủng')
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

  const getStatusConfig = (status: VaccineEventStatus) => {
    const configs = {
      [VaccineEventStatus.Ongoing]: {
        color: 'processing',
        text: 'Đang diễn ra',
        icon: <ClockCircleOutlined />
      },
      [VaccineEventStatus.Completed]: {
        color: 'success',
        text: 'Hoàn thành',
        icon: <CheckCircleOutlined />
      },
      [VaccineEventStatus.Cancelled]: {
        color: 'error',
        text: 'Đã hủy',
        icon: <StopOutlined />
      }
    }
    return configs[status] || { color: 'default', text: status, icon: <ClockCircleOutlined /> }
  }

  const handleUpdateStatus = async (id: string, newStatus: VaccineEventStatus) => {
    try {
      await vaccineEventApi.updateStatus(id, newStatus)
      message.success('Cập nhật trạng thái thành công!')
      fetchVaccineEvents() // Refresh danh sách
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

  const formatDateTime = (dateValue: string | Date) => {
    if (!dateValue) return ''
    const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue
    return dayjs(date).format('DD/MM/YYYY HH:mm')
  }

  const showDetailModal = (event: VaccineEvent) => {
    setSelectedEvent(event)
    setIsDetailModalVisible(true)
  }

  const columns: ColumnsType<VaccineEvent> = [
    {
      title: 'Sự kiện tiêm chủng',
      key: 'event',
      render: (_, record) => (
        <Space>
          <Badge status={getStatusConfig(record.status).color as 'success' | 'error' | 'processing' | 'default'} />
          <div>
            <div className='font-medium text-gray-900'>{record.title}</div>
            <Text type='secondary' className='text-sm'>
              {record.vaccineName}
            </Text>
          </div>
        </Space>
      ),
      sorter: (a, b) => a.title.localeCompare(b.title)
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
      title: 'Đơn vị cung cấp',
      dataIndex: 'provider',
      key: 'provider',
      render: (provider: string) => provider || '-'
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: VaccineEventStatus) => {
        const config = getStatusConfig(status)
        return (
          <Tag color={config.color} icon={config.icon}>
            {config.text}
          </Tag>
        )
      },
      filters: [
        { text: 'Đang diễn ra', value: VaccineEventStatus.Ongoing },
        { text: 'Hoàn thành', value: VaccineEventStatus.Completed },
        { text: 'Đã hủy', value: VaccineEventStatus.Cancelled }
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
              value={record.status}
              style={{ width: 120 }}
              onChange={(value) => {
                Modal.confirm({
                  title: 'Xác nhận cập nhật trạng thái',
                  content: `Bạn có chắc chắn muốn thay đổi trạng thái sự kiện "${record.title}" thành "${getStatusConfig(value as VaccineEventStatus).text}"?`,
                  okText: 'Cập nhật',
                  cancelText: 'Hủy',
                  onOk: () => handleUpdateStatus(record._id, value as VaccineEventStatus)
                })
              }}
            >
              <Option value={VaccineEventStatus.Ongoing}>
                <Space>
                  <ClockCircleOutlined />
                  Đang diễn ra
                </Space>
              </Option>
              <Option value={VaccineEventStatus.Completed}>
                <Space>
                  <CheckCircleOutlined />
                  Hoàn thành
                </Space>
              </Option>
              <Option value={VaccineEventStatus.Cancelled}>
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
    total: vaccineEvents.length,
    ongoing: vaccineEvents.filter((p) => p.status === VaccineEventStatus.Ongoing).length,
    completed: vaccineEvents.filter((p) => p.status === VaccineEventStatus.Completed).length,
    cancelled: vaccineEvents.filter((p) => p.status === VaccineEventStatus.Cancelled).length
  }

  const filteredEvents = vaccineEvents.filter((event) => {
    const matchesSearch = searchKeyword
      ? event.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      event.vaccineName.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      event.location.toLowerCase().includes(searchKeyword.toLowerCase())
      : true

    const matchesStatus = statusFilter ? event.status === statusFilter : true

    return matchesSearch && matchesStatus
  })

  return (
    <div className='p-6'>
      <Card>
      <Card style={{ background: 'linear-gradient(135deg, #06b6d4 100%)' }}>
        <Row justify='space-between' align='middle'>
          <Col>
            <Title level={3} style={{ color: 'white', margin: 0 }}>
              <ExperimentOutlined style={{ marginRight: 12 }} />
              Quản lý sự kiện tiêm chủng
            </Title>
            <Text style={{ color: 'rgba(255,255,255,0.8)' }}>Cập nhật trạng thái các sự kiện tiêm vaccine trong trường</Text>
          </Col>
          <Space>
            <Button icon={<ReloadOutlined />} onClick={fetchVaccineEvents} loading={loading}>
              Làm mới
            </Button>
          </Space>
        </Row>
      </Card>
      <Card className='shadow-sm mt-6'>

        {/* Statistics */}
        <Row gutter={[16, 16]} className='mb-6 '>
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
              placeholder='Tìm kiếm theo tên sự kiện, vaccine, địa điểm...'
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
              <Option value={VaccineEventStatus.Ongoing}>
                <Space>
                  <ClockCircleOutlined />
                  Đang diễn ra
                </Space>
              </Option>
              <Option value={VaccineEventStatus.Completed}>
                <Space>
                  <CheckCircleOutlined />
                  Hoàn thành
                </Space>
              </Option>
              <Option value={VaccineEventStatus.Cancelled}>
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
              Chi tiết sự kiện tiêm chủng
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
                  <Text strong>{selectedEvent.title}</Text>
                </Descriptions.Item>

                <Descriptions.Item label='Tên vaccine'>
                  <Space>
                    <MedicineBoxOutlined className='text-blue-500' />
                    {selectedEvent.vaccineName}
                  </Space>
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

                <Descriptions.Item label='Đơn vị cung cấp'>
                  <Space>
                    <MedicineBoxOutlined className='text-blue-500' />
                    {selectedEvent.provider}
                  </Space>
                </Descriptions.Item>

                <Descriptions.Item label='Trạng thái'>
                  <Tag
                    color={getStatusConfig(selectedEvent.status).color}
                    icon={getStatusConfig(selectedEvent.status).icon}
                  >
                    {getStatusConfig(selectedEvent.status).text}
                  </Tag>
                </Descriptions.Item>
              </Descriptions>

              <div className='mt-6 text-center'>
                <Text type='secondary'>
                  <ClockCircleOutlined className='mr-2' />
                  Cập nhật lần cuối: {dayjs().format('DD/MM/YYYY HH:mm')}
                </Text>
              </div>
            </div>
          )}
        </Modal>
        </Card>
        </Card>
    </div>
  )
}

export default ResultsAfterVaccination
