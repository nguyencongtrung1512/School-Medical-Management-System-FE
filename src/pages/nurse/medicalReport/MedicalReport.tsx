'use client'

import type React from 'react'
import { useEffect, useState } from 'react'
import {
  PlusOutlined,
  SearchOutlined,
  FilterOutlined,
  ReloadOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  DeleteOutlined,
  MedicineBoxOutlined,
  UserOutlined,
  AlertOutlined,
  CalendarOutlined,
  ClockCircleOutlined
} from '@ant-design/icons'
import {
  Button,
  Card,
  message,
  Space,
  Table,
  Typography,
  Modal,
  Input,
  Tag,
  Tooltip,
  Divider,
  Row,
  Col,
  Select,
  DatePicker,
  Badge
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import { type MedicalEvent, medicalEventApi } from '../../../api/medicalEvent.api'
import CreateMedicalEventForm from './Create'
import Detail from './Detail'

const { Title, Text } = Typography
const { Search } = Input
const { confirm } = Modal
const { RangePicker } = DatePicker
const { Option } = Select

// Thêm hàm chuyển đổi enum sang tiếng Việt
const severityLevelVN: Record<string, string> = {
  Mild: 'Nhẹ',
  Moderate: 'Trung bình',
  Severe: 'Nặng'
}

const statusVN: Record<string, string> = {
  treated: 'Đã xử lý',
  monitoring: 'Theo dõi',
  transferred: 'Chuyển viện'
}

// Thêm màu sắc cho các trạng thái
const severityColors: Record<string, string> = {
  Mild: 'green',
  Moderate: 'orange',
  Severe: 'red'
}

const statusColors: Record<string, string> = {
  treated: 'success',
  monitoring: 'processing',
  transferred: 'warning'
}

const MedicalReport: React.FC = () => {
  const [medicalEvents, setMedicalEvents] = useState<MedicalEvent[]>([])
  const [loading, setLoading] = useState(false)
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false)
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false)
  const [selectedEventId, setSelectedEventId] = useState<string>('')

  // Filter states
  const [searchText, setSearchText] = useState('')
  const [timeFilter, setTimeFilter] = useState<string>('all')
  const [eventNameFilter, setEventNameFilter] = useState<string>('all')
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null)

  const fetchMedicalEvents = async () => {
    try {
      setLoading(true)
      const response = await medicalEventApi.search({})
      setMedicalEvents(response.pageData)
    } catch (error: unknown) {
      console.log('error', error)
      const err = error as { message?: string }
      if (err.message) {
        message.error(err.message)
      } else {
        message.error('Có lỗi xảy ra khi tải danh sách sự kiện y tế')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMedicalEvents()
  }, [])

  const showDeleteConfirm = (record: MedicalEvent) => {
    confirm({
      title: 'Xác nhận xóa sự kiện y tế',
      icon: <ExclamationCircleOutlined />,
      content: `Bạn có chắc chắn muốn xóa sự kiện "${record.eventName}" không?`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk() {
        handleDelete(record._id)
      }
    })
  }

  const columns: ColumnsType<MedicalEvent> = [
    {
      title: 'Thời gian',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => (
        <Space direction='vertical' size={0}>
          <Text strong>{dayjs(date).format('DD/MM/YYYY')}</Text>
          <Text type='secondary' style={{ fontSize: '12px' }}>
            {dayjs(date).format('HH:mm')}
          </Text>
        </Space>
      ),
      width: 120
    },
    {
      title: 'Học sinh',
      dataIndex: ['student', 'fullName'],
      key: 'studentName',
      render: (text: string) => (
        <Space>
          <UserOutlined style={{ color: '#1890ff' }} />
          <Text strong>{text}</Text>
        </Space>
      )
    },
    {
      title: 'Tên sự kiện',
      dataIndex: 'eventName',
      key: 'eventName',
      render: (text: string) => (
        <Space>
          <AlertOutlined style={{ color: '#ff4d4f' }} />
          <Text strong>{text}</Text>
        </Space>
      )
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: {
        showTitle: false
      },
      render: (text: string) => (
        <Tooltip placement='topLeft' title={text}>
          <Text ellipsis style={{ maxWidth: 200 }}>
            {text}
          </Text>
        </Tooltip>
      )
    },
    {
      title: 'Biện pháp xử lý',
      dataIndex: 'actionTaken',
      key: 'actionTaken',
      ellipsis: {
        showTitle: false
      },
      render: (text: string) => (
        <Tooltip placement='topLeft' title={text}>
          <Text ellipsis style={{ maxWidth: 200 }}>
            {text}
          </Text>
        </Tooltip>
      )
    },
    {
      title: 'Mức độ nghiêm trọng',
      dataIndex: 'severityLevel',
      key: 'severityLevel',
      render: (severityLevel: string) => (
        <Tag color={severityColors[severityLevel]} style={{ fontWeight: 'bold' }}>
          {severityLevelVN[severityLevel] || 'Không xác định'}
        </Tag>
      ),
      sorter: (a: MedicalEvent, b: MedicalEvent) => {
        const severityOrder = { Mild: 1, Moderate: 2, Severe: 3 }
        return (
          (severityOrder[a.severityLevel as keyof typeof severityOrder] || 0) -
          (severityOrder[b.severityLevel as keyof typeof severityOrder] || 0)
        )
      }
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Badge status={statusColors[status] as any} text={statusVN[status] || 'Không xác định'} />
      ),
      filters: [
        { text: 'Đã xử lý', value: 'treated' },
        { text: 'Theo dõi', value: 'monitoring' },
        { text: 'Chuyển viện', value: 'transferred' }
      ],
      onFilter: (value, record) => record.status === value
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space size='middle'>
          <Tooltip title='Xem chi tiết'>
            <Button type='text' icon={<EyeOutlined />} onClick={() => handleViewDetails(record._id)} />
          </Tooltip>
          <Tooltip title='Xóa'>
            <Button type='text' danger icon={<DeleteOutlined />} onClick={() => showDeleteConfirm(record)} />
          </Tooltip>
        </Space>
      ),
      width: 100
    }
  ]

  const handleViewDetails = (id: string) => {
    setSelectedEventId(id)
    setIsDetailModalVisible(true)
  }

  const handleCreateSuccess = () => {
    setIsCreateModalVisible(false)
    fetchMedicalEvents()
    message.success('Tạo báo cáo sự kiện y tế thành công')
  }

  const handleDetailSuccess = () => {
    setIsDetailModalVisible(false)
    fetchMedicalEvents()
  }

  const handleDelete = async (id: string) => {
    try {
      await medicalEventApi.delete(id)
      message.success('Xóa sự kiện thành công!')
      fetchMedicalEvents()
    } catch (error: unknown) {
      const err = error as { message?: string }
      if (err.message) {
        message.error(err.message)
      } else {
        message.error('Không thể xóa sự kiện!')
      }
    }
  }

  const handleSearch = (value: string) => {
    setSearchText(value)
  }

  // Lọc theo thời gian
  const filterByTime = (events: MedicalEvent[]) => {
    const now = dayjs()

    if (dateRange && dateRange[0] && dateRange[1]) {
      return events.filter((event) => {
        const eventDate = dayjs(event.createdAt)
        return eventDate.isAfter(dateRange[0]) && eventDate.isBefore(dateRange[1])
      })
    }

    switch (timeFilter) {
      case 'today':
        return events.filter((event) => dayjs(event.createdAt).isSame(now, 'day'))
      case 'week':
        return events.filter((event) => dayjs(event.createdAt).isAfter(now.subtract(7, 'day')))
      case 'month':
        return events.filter((event) => dayjs(event.createdAt).isAfter(now.subtract(30, 'day')))
      case 'latest':
        return events.sort((a, b) => dayjs(b.createdAt).unix() - dayjs(a.createdAt).unix())
      default:
        return events
    }
  }

  // Lọc theo tên sự kiện
  const filterByEventName = (events: MedicalEvent[]) => {
    if (eventNameFilter === 'all') return events
    return events.filter((event) => event.eventName === eventNameFilter)
  }

  // Lọc theo tìm kiếm
  const filterBySearch = (events: MedicalEvent[]) => {
    if (!searchText) return events
    return events.filter(
      (item) =>
        item.eventName?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.student?.fullName?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.actionTaken?.toLowerCase().includes(searchText.toLowerCase())
    )
  }

  // Áp dụng tất cả các bộ lọc
  const filteredEvents = filterBySearch(filterByEventName(filterByTime(medicalEvents)))

  // Lấy danh sách tên sự kiện duy nhất
  const uniqueEventNames = Array.from(new Set(medicalEvents.map((event) => event.eventName))).filter(Boolean)

  // Thống kê theo thời gian
  const getTodayEvents = () => {
    const today = dayjs()
    return medicalEvents.filter((event) => dayjs(event.createdAt).isSame(today, 'day')).length
  }

  const getWeekEvents = () => {
    const now = dayjs()
    return medicalEvents.filter((event) => dayjs(event.createdAt).isAfter(now.subtract(7, 'day'))).length
  }

  const handleTimeFilterChange = (value: string) => {
    setTimeFilter(value)
    if (value !== 'custom') {
      setDateRange(null)
    }
  }

  const handleDateRangeChange = (dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null) => {
    setDateRange(dates)
    if (dates && dates[0] && dates[1]) {
      setTimeFilter('custom')
    }
  }

  const clearAllFilters = () => {
    setSearchText('')
    setTimeFilter('all')
    setEventNameFilter('all')
    setDateRange(null)
  }

  return (
    <div style={{ padding: '24px', minHeight: '100vh' }}>
      <Card bordered={false} className='shadow-sm'>
        <Space direction='vertical' style={{ width: '100%' }}>
          {/* Header */}
          <Row
            style={{
              background: 'linear-gradient(135deg, #7c91ef 0%, #2171cc 100%)',
              borderRadius: '10px',
              padding: '16px'
            }}
            gutter={[16, 16]}
            align='middle'
            justify='space-between'
          >
            <Col>
              <Title level={3} style={{ color: 'white', margin: 0 }}>
                <Space>
                  <MedicineBoxOutlined />
                  Báo cáo sự kiện y tế
                </Space>
              </Title>
            </Col>
            <Col>
              <Button
                color='danger'
                variant='solid'
                icon={<PlusOutlined />}
                onClick={() => setIsCreateModalVisible(true)}
                size='large'
              >
                Tạo báo cáo
              </Button>
            </Col>
          </Row>

          <Divider style={{ margin: '16px 0' }} />

          {/* Statistics Cards */}
          <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
            <Col xs={24} sm={8}>
              <Card
                size='small'
                className='text-center'
                style={{ backgroundColor: '#e6f7ff', border: '1px solid #91d5ff' }}
              >
                <Space direction='vertical' size={0}>
                  <Text type='secondary'>Sự kiện hôm nay</Text>
                  <Text strong style={{ fontSize: '24px', color: '#1890ff' }}>
                    <ClockCircleOutlined style={{ marginRight: '8px' }} />
                    {getTodayEvents()}
                  </Text>
                </Space>
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card
                size='small'
                className='text-center'
                style={{ backgroundColor: '#f6ffed', border: '1px solid #b7eb8f' }}
              >
                <Space direction='vertical' size={0}>
                  <Text type='secondary'>Sự kiện tuần này</Text>
                  <Text strong style={{ fontSize: '24px', color: '#52c41a' }}>
                    <CalendarOutlined style={{ marginRight: '8px' }} />
                    {getWeekEvents()}
                  </Text>
                </Space>
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card
                size='small'
                className='text-center'
                style={{ backgroundColor: '#f9f0ff', border: '1px solid #d3adf7' }}
              >
                <Space direction='vertical' size={0}>
                  <Text type='secondary'>Tổng sự kiện</Text>
                  <Text strong style={{ fontSize: '24px', color: '#722ed1' }}>
                    <MedicineBoxOutlined style={{ marginRight: '8px' }} />
                    {medicalEvents.length}
                  </Text>
                </Space>
              </Card>
            </Col>
          </Row>

          {/* Filters */}
          <Card size='small' style={{ backgroundColor: '#fafafa' }}>
            <Row gutter={[16, 16]} align='middle'>
              <Col xs={24} sm={12} md={6}>
                <Search
                  placeholder='Tìm kiếm sự kiện, học sinh...'
                  allowClear
                  enterButton={<SearchOutlined />}
                  size='middle'
                  onSearch={handleSearch}
                  onChange={(e) => setSearchText(e.target.value)}
                  value={searchText}
                />
              </Col>
              <Col xs={24} sm={6} md={4}>
                <Select
                  style={{ width: '100%' }}
                  placeholder='Thời gian'
                  value={timeFilter}
                  onChange={handleTimeFilterChange}
                  suffixIcon={<CalendarOutlined />}
                >
                  <Option value='all'>Tất cả thời gian</Option>
                  <Option value='latest'>Mới nhất</Option>
                  <Option value='today'>Hôm nay</Option>
                  <Option value='week'>Tuần này</Option>
                  <Option value='month'>Tháng này</Option>
                  <Option value='custom'>Tùy chọn</Option>
                </Select>
              </Col>
              {timeFilter === 'custom' && (
                <Col xs={24} sm={8} md={6}>
                  <RangePicker
                    style={{ width: '100%' }}
                    format='DD/MM/YYYY'
                    placeholder={['Từ ngày', 'Đến ngày']}
                    onChange={handleDateRangeChange}
                    value={dateRange}
                  />
                </Col>
              )}
              <Col xs={24} sm={6} md={4}>
                <Select
                  style={{ width: '100%' }}
                  placeholder='Tên sự kiện'
                  value={eventNameFilter}
                  onChange={setEventNameFilter}
                  suffixIcon={<FilterOutlined />}
                >
                  <Option value='all'>Tất cả sự kiện</Option>
                  {uniqueEventNames.map((eventName) => (
                    <Option key={eventName} value={eventName}>
                      {eventName}
                    </Option>
                  ))}
                </Select>
              </Col>
              <Col>
                <Space>
                  <Badge>
                    <Button icon={<FilterOutlined />}>{filteredEvents.length} kết quả</Button>
                  </Badge>
                  <Tooltip title='Xóa tất cả bộ lọc'>
                    <Button onClick={clearAllFilters}>Xóa lọc</Button>
                  </Tooltip>
                  <Tooltip title='Làm mới dữ liệu'>
                    <Button icon={<ReloadOutlined />} onClick={fetchMedicalEvents} loading={loading} />
                  </Tooltip>
                </Space>
              </Col>
            </Row>
          </Card>

          {/* Table */}
          <Table
            columns={columns}
            dataSource={filteredEvents}
            rowKey='_id'
            loading={loading}
            pagination={{
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `Tổng cộng ${total} sự kiện`,
              pageSize: 10
            }}
            bordered
            size='middle'
            scroll={{ x: 'max-content' }}
          />
        </Space>
      </Card>

      {/* Modal tạo sự kiện mới */}
      <Modal
        title={
          <Title level={4}>
            <Space>
              <PlusOutlined />
              Tạo sự kiện y tế mới
            </Space>
          </Title>
        }
        open={isCreateModalVisible}
        onCancel={() => setIsCreateModalVisible(false)}
        footer={null}
        width={800}
        destroyOnClose
      >
        <CreateMedicalEventForm onSuccess={handleCreateSuccess} />
      </Modal>

      {/* Modal chi tiết sự kiện */}
      <Detail
        id={selectedEventId}
        visible={isDetailModalVisible}
        onClose={() => setIsDetailModalVisible(false)}
        onSuccess={handleDetailSuccess}
      />
    </div>
  )
}

export default MedicalReport
