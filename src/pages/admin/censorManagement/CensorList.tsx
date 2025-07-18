import type React from 'react'

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
import { useEffect, useState } from 'react'
import {
  deleteVaccineEvent,
  getAllVaccineEvents,
  updateVaccineEventStatus,
  VaccineEventStatus
} from '../../../api/vaccineEvent.api'
import CreateVaccineEvent from './createVaccineEvent'

const { Title, Text, Paragraph } = Typography
const { Search } = Input

interface VaccineEvent {
  _id: string
  title: string
  gradeId: string
  description: string
  vaccineName: string
  location: string
  startDate: string
  eventDate: string
  status: VaccineEventStatus
  startRegistrationDate: string
  endRegistrationDate: string
  isDeleted?: boolean
  schoolYear: string
}

// Hàm format ngày giờ chuẩn dd/MM/yyyy HH:mm theo giờ Việt Nam (GMT+7)
const formatDateTime = (dateString: any) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  // Cộng thêm 7 tiếng cho múi giờ Việt Nam
  date.setHours(date.getHours() + 7)
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  return `${day}/${month}/${year} ${hour}:${minute}`
}

const CensorList: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState<VaccineEvent | null>(null)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const [vaccineEvents, setVaccineEvents] = useState<VaccineEvent[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalItems, setTotalItems] = useState(0)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [statusFilter] = useState<VaccineEventStatus | undefined>(undefined)
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false)
  const [isEditModalVisible, setIsEditModalVisible] = useState(false)
  const [editEvent, setEditEvent] = useState<VaccineEvent | null>(null)

  useEffect(() => {
    fetchVaccineEvents()
  }, [currentPage, pageSize])

  const fetchVaccineEvents = async () => {
    setLoading(true)
    try {
      const response = await getAllVaccineEvents(currentPage, pageSize)
      setVaccineEvents(response.pageData)
      setTotalItems(response.totalPage * pageSize)
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
      [VaccineEventStatus.ONGOING]: {
        color: 'processing',
        text: 'Đang diễn ra',
        icon: <ClockCircleOutlined />
      },
      [VaccineEventStatus.COMPLETED]: {
        color: 'success',
        text: 'Hoàn thành',
        icon: <CheckCircleOutlined />
      },
      [VaccineEventStatus.CANCELLED]: {
        color: 'error',
        text: 'Đã hủy',
        icon: <StopOutlined />
      }
    }
    return configs[status] || { color: 'default', text: status, icon: <ExclamationCircleOutlined /> }
  }

  const columns: ColumnsType<VaccineEvent> = [
    {
      title: 'Sự kiện tiêm chủng',
      key: 'event',
      render: (_, record) => (
        <Space>
          <Avatar
            icon={<MedicineBoxOutlined />}
            style={{
              backgroundColor: getStatusConfig(record.status).color === 'success' ? '#52c41a' : '#1890ff'
            }}
          />
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
        // Nếu đã hết hạn đăng ký thì bôi đỏ
        const isExpired = record.endRegistrationDate && new Date(record.endRegistrationDate) < new Date()
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
      render: (status: VaccineEventStatus) => {
        const config = getStatusConfig(status)
        return (
          <Badge
            status={config.color as any}
            text={
              <Tag color={config.color} icon={config.icon}>
                {config.text}
              </Tag>
            }
          />
        )
      },
      filters: [
        { text: 'Đang diễn ra', value: VaccineEventStatus.ONGOING },
        { text: 'Hoàn thành', value: VaccineEventStatus.COMPLETED },
        { text: 'Đã hủy', value: VaccineEventStatus.CANCELLED }
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
                e.stopPropagation() // Ngăn event bubble lên row
                setSelectedPlan(record)
                setIsModalVisible(true)
              }}
            />
          </Tooltip>
          {record.status === VaccineEventStatus.ONGOING && (
            <>
              <Tooltip title='Cập nhật'>
                <Button
                  type='text'
                  icon={<EditOutlined />}
                  onClick={(e) => {
                    e.stopPropagation() // Ngăn event bubble lên row
                    setEditEvent(record)
                    setIsEditModalVisible(true)
                  }}
                  className='text-blue-600 hover:text-blue-700'
                />
              </Tooltip>
              <Tooltip title='Xóa sự kiện'>
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
                          await deleteVaccineEvent(record._id)
                          message.success('Xóa sự kiện thành công!')
                          fetchVaccineEvents()
                        } catch {
                          message.error('Không thể xóa sự kiện!')
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

  // const handleViewDetails = (plan: VaccineEvent) => {
  //   setSelectedPlan(plan)
  //   setIsModalVisible(true)
  // }

  const handleUpdateStatus = async (id: string, newStatus: VaccineEventStatus) => {
    try {
      await updateVaccineEventStatus(id, newStatus)
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

  const stats = {
    total: vaccineEvents.length,
    ongoing: vaccineEvents.filter((p) => p.status === VaccineEventStatus.ONGOING).length,
    completed: vaccineEvents.filter((p) => p.status === VaccineEventStatus.COMPLETED).length,
    cancelled: vaccineEvents.filter((p) => p.status === VaccineEventStatus.CANCELLED).length
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

  // Callback khi tạo thành công
  const handleCreateSuccess = () => {
    setIsCreateModalVisible(false)
    fetchVaccineEvents()
  }

  // Callback khi cập nhật thành công
  const handleEditSuccess = () => {
    setIsEditModalVisible(false)
    setEditEvent(null)
    fetchVaccineEvents()
  }

  return (
    <div className=''>
      <Space direction='vertical' size='large' style={{ width: '100%' }}>
        {/* Header */}
        <Card className='shadow-sm'>
          <div className='flex justify-between items-center'>
            <div>
              <Title level={2} className='m-0 flex items-center gap-2'>
                <MedicineBoxOutlined className='text-blue-600' />
                Quản lý sự kiện tiêm chủng
              </Title>
              <Text type='secondary'>Duyệt và quản lý các sự kiện tiêm vaccine trong trường</Text>
            </div>
            <Space>
              <Button icon={<ExportOutlined />}>Xuất báo cáo</Button>
              <Button icon={<ReloadOutlined />} onClick={fetchVaccineEvents} loading={loading}>
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
                placeholder='Tìm kiếm tên sự kiện, vaccine, địa điểm...'
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
                  description='Không có sự kiện tiêm chủng nào'
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
              record.status === VaccineEventStatus.ONGOING
                ? 'hover:bg-blue-50 transition-colors cursor-pointer'
                : 'hover:bg-gray-50 transition-colors cursor-pointer'
            }
            // Bỏ onRow event handler để tránh conflict với button clicks
            // onRow={(record) => ({
            //   onClick: () => handleViewDetails(record)
            // })}
          />
        </Card>

        {/* Detail Modal */}
        <Modal
          title={
            <Space>
              <MedicineBoxOutlined />
              Chi tiết sự kiện tiêm chủng
            </Space>
          }
          open={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          width={900}
          footer={
            selectedPlan?.status === VaccineEventStatus.ONGOING
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
                        content: `Bạn có chắc chắn muốn hủy sự kiện "${selectedPlan?.title}"?`,
                        okText: 'Xác nhận',
                        cancelText: 'Hủy',
                        onOk: () => {
                          handleUpdateStatus(selectedPlan._id, VaccineEventStatus.CANCELLED)
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
                      handleUpdateStatus(selectedPlan._id, VaccineEventStatus.COMPLETED)
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
          {selectedPlan && (
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
                        {selectedPlan.title}
                      </Title>
                      <Text type='secondary' className='text-lg'>
                        {selectedPlan.vaccineName}
                      </Text>
                      <div className='mt-2'>{getStatusConfig(selectedPlan.status).icon}</div>
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
                    {selectedPlan.eventDate ? formatDateTime(selectedPlan.eventDate) : '-'}
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={
                      <Space>
                        <EnvironmentOutlined />
                        Địa điểm
                      </Space>
                    }
                  >
                    {selectedPlan.location}
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={
                      <Space>
                        <ClockCircleOutlined />
                        Hạn đăng ký
                      </Space>
                    }
                  >
                    {(selectedPlan.startRegistrationDate ? formatDateTime(selectedPlan.startRegistrationDate) : '-') +
                      ' - ' +
                      (selectedPlan.endRegistrationDate ? formatDateTime(selectedPlan.endRegistrationDate) : '-')}
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={
                      <Space>
                        <BookOutlined /> Năm học
                      </Space>
                    }
                  >
                    {selectedPlan.schoolYear}
                  </Descriptions.Item>
                </Descriptions>
              </Card>

              {/* Description */}
              <Card title='Mô tả chi tiết' size='small'>
                <Paragraph>{selectedPlan.description}</Paragraph>
              </Card>
            </div>
          )}
        </Modal>

        {/* Modal tạo mới sự kiện */}
        <Modal
          title={
            <span>
              <MedicineBoxOutlined /> Tạo sự kiện tiêm chủng mới
            </span>
          }
          open={isCreateModalVisible}
          onCancel={() => setIsCreateModalVisible(false)}
          footer={null}
          width={800}
          destroyOnClose
        >
          <CreateVaccineEvent onSuccess={handleCreateSuccess} />
        </Modal>

        {/* Modal cập nhật sự kiện */}
        <Modal
          title={
            <span>
              <MedicineBoxOutlined /> Cập nhật sự kiện tiêm chủng
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
          {editEvent && <CreateVaccineEvent onSuccess={handleEditSuccess} eventData={editEvent} isEdit />}
        </Modal>
      </Space>
    </div>
  )
}

export default CensorList
