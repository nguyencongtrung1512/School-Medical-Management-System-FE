import React, { useState, useEffect } from 'react'
import { Button, Table, Tag, Space, Card, Typography, Tabs, Input, Row, Col, Modal, message, Select } from 'antd'
import { SearchOutlined, FilterOutlined } from '@ant-design/icons'
import type { TabsProps } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { getAllVaccineEvents, updateVaccineEvent } from '../../../api/vaccineEvent'
import { getGradesAPI } from '../../../api/grade.api'
import dayjs from 'dayjs'
import CreateVaccineEvent from './CreateVaccineEvent'
import UpdateVaccineEvent from './UpdateVaccineEvent'
import { VaccineEventStatus } from '../../../api/vaccineEvent'
import { toast } from 'react-toastify'

const { Title } = Typography
const { Search } = Input
const { Option } = Select

interface Grade {
  _id: string
  name: string
}

interface ApiResponse<T> {
  pageData: T[]
  pageInfo: {
    pageNum: string
    pageSize: string
    totalItems: number
    totalPages: number
  }
}

interface VaccineEvent {
  _id: string
  title: string
  gradeId: string
  description: string
  vaccineName: string
  location: string
  startDate: string
  endDate: string
  status: VaccineEventStatus
  registrationDeadline: string
  totalStudents?: number
  confirmed?: number
  rejected?: number
  pending?: number
  isDeleted?: boolean
}

const ScheduleVaccination: React.FC = () => {
  const [activeTab, setActiveTab] = useState('1')
  const [searchText, setSearchText] = useState('')
  const [filters, setFilters] = useState({
    gradeId: undefined,
    status: undefined
  })
  const [selectedEvent, setSelectedEvent] = useState<VaccineEvent | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [events, setEvents] = useState<VaccineEvent[]>([])
  const [grades, setGrades] = useState<Grade[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchGrades()
    fetchEvents()
  }, [])

  const fetchGrades = async () => {
    try {
      const response = (await getGradesAPI()) as unknown as ApiResponse<Grade>
      setGrades(response.pageData)
    } catch {
      message.error('Không thể tải danh sách khối lớp')
    }
  }

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const response = (await getAllVaccineEvents(1, 10)) as unknown as ApiResponse<VaccineEvent>
      setEvents(response.pageData)
    } catch {
      message.error('Không thể tải danh sách sự kiện')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (value: string) => {
    setSearchText(value)
  }

  const handleFilterChange = (key: string, value: string | undefined) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const handleViewDetails = (record: VaccineEvent) => {
    console.log('Clicked view details for record:', record)
    setSelectedEvent(record)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedEvent(null)
    fetchEvents() // Refresh list after closing modal
  }

  const handleCreateSuccess = () => {
    fetchEvents()
    setActiveTab('2')
  }

  const handleUpdateSuccess = () => {
    fetchEvents()
    setIsModalOpen(false)
    setSelectedEvent(null)
    toast.success('Cập nhật kế hoạch tiêm chủng thành công')
  }

  const handleDeleteEvent = async (_id: string) => {
    try {
      await updateVaccineEvent(_id, { isDeleted: true })
      toast.success('Vô hiệu hóa kế hoạch tiêm chủng thành công')
      fetchEvents()
    } catch {
      toast.error('Không thể vô hiệu hóa kế hoạch tiêm chủng')
    }
  }

  const filteredData = events.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchText.toLowerCase()) ||
      item.vaccineName.toLowerCase().includes(searchText.toLowerCase())

    const matchesFilters =
      (!filters.gradeId || item.gradeId === filters.gradeId) && (!filters.status || item.status === filters.status)

    const notDeleted = !item.isDeleted // Only show if not deleted

    return matchesSearch && matchesFilters && notDeleted
  })

  const columns: ColumnsType<VaccineEvent> = [
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title'
    },
    {
      title: 'Vaccine',
      dataIndex: 'vaccineName',
      key: 'vaccineName'
    },
    {
      title: 'Địa điểm',
      dataIndex: 'location',
      key: 'location'
    },
    {
      title: 'Thời gian',
      dataIndex: 'startDate',
      key: 'startDate',
      render: (_, record) => (
        <div>
          <div>Từ: {dayjs(record.startDate).format('DD/MM/YYYY HH:mm')}</div>
          <div>Đến: {dayjs(record.endDate).format('DD/MM/YYYY HH:mm')}</div>
        </div>
      )
    },
    {
      title: 'Hạn đăng ký',
      dataIndex: 'registrationDeadline',
      key: 'registrationDeadline',
      render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm')
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      filters: [
        { text: 'Chờ Duyệt', value: VaccineEventStatus.ONGOING },
        { text: 'Hoàn thành', value: VaccineEventStatus.COMPLETED },
        { text: 'Đã hủy', value: VaccineEventStatus.CANCELLED }
      ],
      onFilter: (value, record) => record.status === value,
      render: (status: string) => {
        const statusConfig = {
          ongoing: { color: 'blue', text: 'Chờ Duyệt' },
          completed: { color: 'green', text: 'Hoàn thành' },
          cancelled: { color: 'red', text: 'Đã hủy' }
        }
        const config = statusConfig[status as keyof typeof statusConfig]
        return <Tag color={config.color}>{config.text}</Tag>
      }
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type='link' onClick={() => handleViewDetails(record)}>
            Xem chi tiết
          </Button>
          <Button type='link' danger onClick={() => handleDeleteEvent(record._id)}>
            Xóa
          </Button>
        </Space>
      )
    }
  ]

  const items: TabsProps['items'] = [
    {
      key: '1',
      label: 'Lập kế hoạch mới',
      children: <CreateVaccineEvent onSuccess={handleCreateSuccess} />
    },
    {
      key: '2',
      label: 'Danh sách kế hoạch',
      children: (
        <div>
          <div className='mb-4 flex justify-between items-center'>
            <Title level={4}>Danh sách kế hoạch tiêm chủng</Title>
            <Button type='primary' onClick={() => setActiveTab('1')}>
              Lập kế hoạch mới
            </Button>
          </div>

          <Card className='mb-4'>
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <Search
                  placeholder='Tìm kiếm theo tiêu đề, vaccine...'
                  allowClear
                  enterButton={<SearchOutlined />}
                  onSearch={handleSearch}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </Col>
              <Col span={16}>
                <Space>
                  <Select
                    placeholder='Khối'
                    allowClear
                    style={{ width: 150 }}
                    onChange={(value: string | undefined) => handleFilterChange('gradeId', value)}
                  >
                    {grades.map((grade) => (
                      <Option key={grade._id} value={grade._id}>
                        {grade.name}
                      </Option>
                    ))}
                  </Select>

                  <Select
                    placeholder='Trạng thái'
                    allowClear
                    style={{ width: 150 }}
                    onChange={(value: string | undefined) => handleFilterChange('status', value)}
                  >
                    <Option value={VaccineEventStatus.ONGOING}>Chờ Duyệt</Option>
                    <Option value={VaccineEventStatus.COMPLETED}>Hoàn thành</Option>
                    <Option value={VaccineEventStatus.CANCELLED}>Đã hủy</Option>
                  </Select>

                  <Button
                    icon={<FilterOutlined />}
                    onClick={() =>
                      setFilters({
                        gradeId: undefined,
                        status: undefined
                      })
                    }
                  >
                    Xóa bộ lọc
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>

          <Table
            columns={columns}
            dataSource={filteredData}
            loading={loading}
            pagination={{
              pageSize: 5,
              showSizeChanger: true,
              showTotal: (total) => `Tổng số ${total} kế hoạch`
            }}
          />
        </div>
      )
    }
  ]

  return (
    <div>
      <Title level={3} className='mb-6'>
        Quản lý kế hoạch tiêm chủng
      </Title>
      <Tabs activeKey={activeTab} items={items} onChange={setActiveTab} />

      <Modal
        title='Chi tiết kế hoạch'
        open={isModalOpen}
        onCancel={handleCloseModal}
        width={800}
        footer={[
          <Button key='close' onClick={handleCloseModal}>
            Đóng
          </Button>
        ]}
      >
        {selectedEvent && (
          <UpdateVaccineEvent eventId={selectedEvent._id} onSuccess={handleUpdateSuccess} onCancel={handleCloseModal} />
        )}
      </Modal>
    </div>
  )
}

export default ScheduleVaccination
