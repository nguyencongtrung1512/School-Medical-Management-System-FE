import React, { useState, useEffect } from 'react'
import { Button, Table, Tag, Space, Card, Typography, Tabs, Input, Row, Col, Modal, message, Select } from 'antd'
import { SearchOutlined, FilterOutlined } from '@ant-design/icons'
import type { TabsProps } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { searchMedicalCheckEvents, updateMedicalCheckEvent } from '../../../api/medicalCheckEvent.api'
import { getGradesAPI } from '../../../api/grade.api'
import dayjs from 'dayjs'
import CreateMedicalCheckEvent from './CreateMedicalCheckEvent'
import UpdateMedicalCheckEvent from './UpdateMedicalCheckEvent'
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

interface MedicalCheckEvent {
  _id: string
  eventName: string
  gradeId: string
  description: string
  location: string
  eventDate: string
  startRegistrationDate: string
  endRegistrationDate: string
  schoolYear: string
  isDeleted?: boolean
}

const MedicalCheckEvent: React.FC = () => {
  const [activeTab, setActiveTab] = useState('1')
  const [searchText, setSearchText] = useState('')
  const [filters, setFilters] = useState({
    gradeId: undefined,
    schoolYear: undefined
  })
  const [selectedEvent, setSelectedEvent] = useState<MedicalCheckEvent | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [events, setEvents] = useState<MedicalCheckEvent[]>([])
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
      const response = await searchMedicalCheckEvents({ schoolYear: '2025-2026', pageSize: 100, pageNum: 1 })
      console.log('trung', response)
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

  const handleViewDetails = (record: MedicalCheckEvent) => {
    setSelectedEvent(record)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedEvent(null)
    fetchEvents()
  }

  const handleCreateSuccess = () => {
    fetchEvents()
    setActiveTab('2')
  }

  const handleUpdateSuccess = () => {
    fetchEvents()
    setIsModalOpen(false)
    setSelectedEvent(null)
    toast.success('Cập nhật sự kiện khám sức khỏe thành công')
  }

  const handleDeleteEvent = async (_id: string) => {
    try {
      await updateMedicalCheckEvent(_id, { isDeleted: true })
      toast.success('Vô hiệu hóa sự kiện thành công')
      fetchEvents()
    } catch {
      toast.error('Không thể vô hiệu hóa sự kiện')
    }
  }

  const filteredData = events.filter((item) => {
    const matchesSearch =
      item.eventName.toLowerCase().includes(searchText.toLowerCase()) ||
      item.location.toLowerCase().includes(searchText.toLowerCase())

    const matchesFilters =
      (!filters.gradeId || item.gradeId === filters.gradeId) &&
      (!filters.schoolYear || item.schoolYear === filters.schoolYear)

    const notDeleted = !item.isDeleted

    return matchesSearch && matchesFilters && notDeleted
  })

  const columns: ColumnsType<MedicalCheckEvent> = [
    {
      title: 'Tên sự kiện',
      dataIndex: 'eventName',
      key: 'eventName'
    },
    {
      title: 'Địa điểm',
      dataIndex: 'location',
      key: 'location'
    },
    {
      title: 'Khối',
      dataIndex: 'gradeId',
      key: 'gradeId',
      render: (gradeId) => grades.find((g) => g._id === gradeId)?.name || '---'
    },
    {
      title: 'Năm học',
      dataIndex: 'schoolYear',
      key: 'schoolYear'
    },
    {
      title: 'Thời gian',
      dataIndex: 'eventDate',
      key: 'eventDate',
      render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm')
    },
    {
      title: 'Thời gian đăng ký',
      key: 'registration',
      render: (_, record) => (
        <div>
          <div>Bắt đầu: {dayjs(record.startRegistrationDate).format('DD/MM/YYYY HH:mm')}</div>
          <div>Kết thúc: {dayjs(record.endRegistrationDate).format('DD/MM/YYYY HH:mm')}</div>
        </div>
      )
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
      label: 'Tạo sự kiện mới',
      children: <CreateMedicalCheckEvent onSuccess={handleCreateSuccess} />
    },
    {
      key: '2',
      label: 'Danh sách sự kiện',
      children: (
        <div>
          <div className='mb-4 flex justify-between items-center'>
            <Title level={4}>Danh sách sự kiện khám sức khỏe</Title>
            <Button type='primary' onClick={() => setActiveTab('1')}>
              Tạo sự kiện mới
            </Button>
          </div>

          <Card className='mb-4'>
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <Search
                  placeholder='Tìm kiếm theo tên sự kiện, địa điểm...'
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
                    placeholder='Năm học'
                    allowClear
                    style={{ width: 150 }}
                    onChange={(value: string | undefined) => handleFilterChange('schoolYear', value)}
                  >
                    {[...new Set(events.map((e) => e.schoolYear))].map((year) => (
                      <Option key={year} value={year}>
                        {year}
                      </Option>
                    ))}
                  </Select>

                  <Button
                    icon={<FilterOutlined />}
                    onClick={() =>
                      setFilters({
                        gradeId: undefined,
                        schoolYear: undefined
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
              showTotal: (total) => `Tổng số ${total} sự kiện`
            }}
            rowKey='_id'
          />
        </div>
      )
    }
  ]

  return (
    <div>
      <Title level={3} className='mb-6'>
        Quản lý sự kiện khám sức khỏe
      </Title>
      <Tabs activeKey={activeTab} items={items} onChange={setActiveTab} />

      <Modal
        title='Chi tiết sự kiện'
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
          <UpdateMedicalCheckEvent
            eventId={selectedEvent._id}
            onSuccess={handleUpdateSuccess}
            onCancel={handleCloseModal}
          />
        )}
      </Modal>
    </div>
  )
}

export default MedicalCheckEvent
