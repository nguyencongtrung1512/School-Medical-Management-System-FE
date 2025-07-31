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
  EyeOutlined,
  MedicineBoxOutlined,
  MoreOutlined,
  PlusOutlined,
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
  Dropdown,
  Empty,
  Input,
  Menu,
  message,
  Modal,
  Row,
  Space,
  Statistic,
  Table,
  Tag,
  Typography
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import { vaccineEventApi, VaccineEventStatus } from '../../../api/vaccineEvent.api'
import { searchVaccineTypesAPI, type VaccineType } from '../../../api/vaccineType.api'
import { getGradeByIdAPI } from '../../../api/grade.api'
import CreateVaccineEvent from './createVaccineEvent'

const { Title, Text, Paragraph } = Typography
const { Search } = Input

interface VaccineEvent {
  _id: string
  title: string
  gradeId: string
  description?: string
  vaccineTypeId: string
  location: string
  provider: string
  startRegistrationDate: Date
  endRegistrationDate: Date
  eventDate: Date
  status: VaccineEventStatus
  schoolYear: string
  isDeleted?: boolean
  createdAt?: string
  updatedAt?: string
}

interface Grade {
  _id: string
  name: string
  positionOrder: string
  description?: string
}

// Hàm format ngày giờ chuẩn dd/MM/yyyy HH:mm theo giờ Việt Nam (GMT+7)
const formatDateTime = (dateValue: string | Date) => {
  if (!dateValue) return ''
  const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue
  // Cộng thêm 7 tiếng cho múi giờ Việt Nam nếu cần, hoặc chỉ dùng date.toLocaleString('vi-VN', { hour12: false })
  return date.toLocaleString('vi-VN', { hour12: false })
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
  const [vaccineTypes, setVaccineTypes] = useState<VaccineType[]>([])
  const [grade, setGrade] = useState<Grade | null>(null)

  useEffect(() => {
    fetchVaccineEvents()
    fetchVaccineTypes()
  }, [currentPage, pageSize])

  const fetchVaccineEvents = async () => {
    setLoading(true)
    try {
      const response = await vaccineEventApi.search({ pageNum: currentPage, pageSize })
      const pageData = (response as any).pageData || []
      const total = (response as any).pageInfo?.totalItems || 0
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

  const fetchVaccineTypes = async () => {
    try {
      const response = await searchVaccineTypesAPI(1, 100)
      const vaccineTypesData = response?.pageData || []
      setVaccineTypes(vaccineTypesData)
    } catch (error: unknown) {
      console.log('error', error)
      const err = error as { message?: string }
      if (err.message) {
        message.error(err.message)
      } else {
        message.error('Không thể tải danh sách loại vaccine')
      }
    }
  }

  const fetchGradeById = async (gradeId: string) => {
    try {
      const response = await getGradeByIdAPI(gradeId)
      setGrade(response.data)
    } catch (error: unknown) {
      console.log('error', error)
      setGrade(null)
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
    return configs[status] || { color: 'default', text: status, icon: <ExclamationCircleOutlined /> }
  }

  const columns: ColumnsType<VaccineEvent> = [
    {
      title: 'Sự kiện tiêm chủng',
      key: 'event',
      width: 280,
      render: (_, record) => (
        <Space>
          <Avatar
            icon={<MedicineBoxOutlined />}
            style={{
              backgroundColor: getStatusConfig(record.status).color === 'success' ? '#52c41a' : '#1890ff'
            }}
          />
          <div>
            <div className='font-medium text-gray-900' style={{ fontSize: '14px', lineHeight: '1.4' }}>
              {record.title}
            </div>
            <Text type='secondary' style={{ fontSize: '12px' }}>
              {(() => {
                const vaccineType = vaccineTypes.find((vt) => vt._id === record.vaccineTypeId)
                return vaccineType
                  ? `${vaccineType.name} (${vaccineType.code})`
                  : `Vaccine Type ID: ${record.vaccineTypeId}`
              })()}
            </Text>
          </div>
        </Space>
      ),
      sorter: (a, b) => a.title.localeCompare(b.title)
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
              {record.endRegistrationDate ? formatDateTime(record.endRegistrationDate) : '-'}
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
      render: (status: VaccineEventStatus) => {
        const config = getStatusConfig(status)
        return (
          <Tag color={config.color} icon={config.icon} style={{ margin: 0 }}>
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
      title: 'Đơn vị cung cấp',
      dataIndex: 'provider',
      key: 'provider',
      width: 120,
      render: (provider: string) => (
        <Text style={{ fontSize: '13px' }}>{provider || '-'}</Text>
      )
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
                setSelectedPlan(record)
                setIsModalVisible(true)
                if (record.gradeId) {
                  fetchGradeById(record.gradeId)
                }
              }}
            >
              Xem chi tiết
            </Menu.Item>

            {record.status === VaccineEventStatus.Ongoing && (
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
                          await vaccineEventApi.delete(record._id)
                          message.success('Xóa sự kiện thành công!')
                          fetchVaccineEvents()
                        } catch {
                          message.error('Không thể xóa sự kiện!')
                        }
                      }
                    })
                  }}
                >
                  Xóa sự kiện
                </Menu.Item>
              </>
            )}
            {record.status === VaccineEventStatus.Completed && (
              <Menu.Item key='completed' icon={<CheckCircleOutlined />} disabled style={{ color: '#52c41a' }}>
                Đã hoàn thành
              </Menu.Item>
            )}
            {record.status === VaccineEventStatus.Cancelled && (
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

  // const handleViewDetails = (plan: VaccineEvent) => {
  //   setSelectedPlan(plan)
  //   setIsModalVisible(true)
  // }

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

  const stats = {
    total: vaccineEvents.length,
    ongoing: vaccineEvents.filter((p) => p.status === VaccineEventStatus.Ongoing).length,
    completed: vaccineEvents.filter((p) => p.status === VaccineEventStatus.Completed).length,
    cancelled: vaccineEvents.filter((p) => p.status === VaccineEventStatus.Cancelled).length
  }

  const filteredEvents = vaccineEvents.filter((event) => {
    const matchesSearch = searchKeyword
      ? event.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      event.vaccineTypeId.toLowerCase().includes(searchKeyword.toLowerCase()) ||
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
          <div className='flex justify-between items-center mb-4'>
            <div>
              <Title level={3} className='m-0 flex items-center gap-2'>
                <MedicineBoxOutlined className='text-blue-600' />
                Quản lý sự kiện tiêm chủng
              </Title>
              <Text type='secondary' style={{ fontSize: '13px' }}>Duyệt và quản lý các sự kiện tiêm vaccine trong trường</Text>
            </div>
            <Space>
              <Button size='small' icon={<ReloadOutlined />} onClick={fetchVaccineEvents} loading={loading}>
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

        {/* Filters */}
        <Card className='shadow-sm'>
          <Row gutter={[16, 16]} align='middle'>
            <Col xs={24} sm={16} md={12}>
              <Search
                placeholder='Tìm kiếm tên sự kiện, vaccine, địa điểm...'
                allowClear
                enterButton={<SearchOutlined />}
                size='middle'
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
              />
            </Col>
            <Col xs={24} sm={8} md={12}>
              <div className='flex justify-end'>
                <Text type='secondary' style={{ fontSize: '12px' }}>
                  Hiển thị {filteredEvents.length} / {stats.total} sự kiện
                </Text>
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
                  description='Không có sự kiện tiêm chủng nào'
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
              record.status === VaccineEventStatus.Ongoing
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
              Chi tiết sự kiện tiêm chủng
            </Space>
          }
          open={isModalVisible}
          onCancel={() => {
            setIsModalVisible(false)
            setGrade(null) // Reset grade when closing modal
          }}
          width={900}
          footer={
            selectedPlan?.status === VaccineEventStatus.Ongoing ? (
              <>
                <Button key='cancel' onClick={() => setIsModalVisible(false)}>
                  Đóng
                </Button>
                ,
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
                        handleUpdateStatus(selectedPlan._id, VaccineEventStatus.Cancelled)
                        setIsModalVisible(false)
                      }
                    })
                  }}
                >
                  Hủy sự kiện
                </Button>
                ,
                {/* Chỉ hiển thị nút duyệt nếu chưa quá hạn đăng ký */}
                {selectedPlan?.endRegistrationDate && dayjs(selectedPlan.endRegistrationDate).isAfter(dayjs()) && (
                  <Button
                    key='approve'
                    type='primary'
                    icon={<CheckOutlined />}
                    onClick={() => {
                      if (selectedPlan) {
                        handleUpdateStatus(selectedPlan._id, VaccineEventStatus.Completed)
                        setIsModalVisible(false)
                      }
                    }}
                    disabled={selectedPlan ? dayjs(selectedPlan.eventDate).isAfter(dayjs()) : true}
                  >
                    Duyệt sự kiện
                  </Button>
                )}
              </>
            ) : (
              <>
                <Button key='close' onClick={() => setIsModalVisible(false)}>
                  Đóng
                </Button>
              </>
            )
          }
        >
          {selectedPlan && (
            <div className='space-y-6 max-h-[65vh] overflow-y-auto'>
              {/* Warning if event is overdue */}
              {selectedPlan.endRegistrationDate && dayjs(selectedPlan.endRegistrationDate).isBefore(dayjs()) && (
                <Card className='bg-red-50 border-red-200'>
                  <Space>
                    <ExclamationCircleOutlined className='text-red-500' />
                    <Text type='danger' strong>
                      Sự kiện này đã quá hạn đăng ký và không thể chỉnh sửa
                    </Text>
                  </Space>
                </Card>
              )}

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
                        {(() => {
                          const vaccineType = vaccineTypes.find((vt) => vt._id === selectedPlan.vaccineTypeId)
                          return vaccineType
                            ? `${vaccineType.name} (${vaccineType.code})`
                            : `Vaccine Type ID: ${selectedPlan.vaccineTypeId}`
                        })()}
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
                        <MedicineBoxOutlined />
                        Đơn vị cung cấp
                      </Space>
                    }
                  >
                    {selectedPlan.provider}
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
                  <Descriptions.Item
                    label={
                      <Space>
                        <BookOutlined /> Lớp
                      </Space>
                    }
                  >
                    {grade ? grade.name : 'Đang tải...'}
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
