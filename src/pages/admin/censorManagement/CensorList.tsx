import React, { useState, useEffect } from 'react'
import { Card, Table, Typography, Space, Tag, Button, Modal, Row, Col, message, Statistic } from 'antd'
import { CheckOutlined, CloseOutlined, EyeOutlined } from '@ant-design/icons'
import { getAllVaccineEvents, updateVaccineEventStatus, VaccineEventStatus } from '../../../api/vaccineEvent.api'

const { Title } = Typography

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
  isDeleted?: boolean
}

const CensorList: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState<VaccineEvent | null>(null)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const [vaccineEvents, setVaccineEvents] = useState<VaccineEvent[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalItems, setTotalItems] = useState(0)

  useEffect(() => {
    fetchVaccineEvents()
  }, [currentPage, pageSize])

  const fetchVaccineEvents = async () => {
    setLoading(true)
    try {
      const response = await getAllVaccineEvents(currentPage, pageSize)
      setVaccineEvents(response.pageData)
      setTotalItems(response.totalPage * pageSize)
    } catch (error) {
      message.error('Không thể lấy danh sách sự kiện tiêm vaccine!')
      console.error('Fetch vaccine events error:', error)
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

  const columns = [
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title'
    },
    {
      title: 'Tên vaccine',
      dataIndex: 'vaccineName',
      key: 'vaccineName'
    },
    {
      title: 'Thời gian',
      key: 'time',
      render: (record: VaccineEvent) => (
        <div>
          <div>Từ: {new Date(record.startDate).toLocaleDateString('vi-VN')}</div>
          <div>Đến: {new Date(record.endDate).toLocaleDateString('vi-VN')}</div>
        </div>
      )
    },
    {
      title: 'Địa điểm',
      dataIndex: 'location',
      key: 'location'
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: VaccineEventStatus) => {
        const statuses = {
          [VaccineEventStatus.ONGOING]: { color: 'blue', text: 'Chờ Duyệt' },
          [VaccineEventStatus.COMPLETED]: { color: 'green', text: 'Đã Duyệt' },
          [VaccineEventStatus.CANCELLED]: { color: 'red', text: 'Đã hủy' }
        }
        const { color, text } = statuses[status]
        return <Tag color={color}>{text}</Tag>
      }
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (record: VaccineEvent) => (
        <Space>
          <Button type='link' icon={<EyeOutlined />} onClick={() => handleViewDetails(record)}>
            Xem chi tiết
          </Button>
          {record.status === VaccineEventStatus.ONGOING && (
            <>
              <Button
                type='link'
                icon={<CheckOutlined />}
                onClick={() => handleUpdateStatus(record._id, VaccineEventStatus.COMPLETED)}
                style={{ color: 'green' }}
              >
                Duyệt
              </Button>
              <Button
                type='link'
                icon={<CloseOutlined />}
                onClick={() => handleUpdateStatus(record._id, VaccineEventStatus.CANCELLED)}
                style={{ color: 'red' }}
              >
                Hủy
              </Button>
            </>
          )}
        </Space>
      )
    }
  ]

  const handleViewDetails = (plan: VaccineEvent) => {
    setSelectedPlan(plan)
    setIsModalVisible(true)
  }

  const handleUpdateStatus = async (id: string, newStatus: VaccineEventStatus) => {
    try {
      await updateVaccineEventStatus(id, newStatus)
      message.success('Cập nhật trạng thái thành công!')
      fetchVaccineEvents() // Refresh danh sách
    } catch (error) {
      message.error('Có lỗi xảy ra khi cập nhật trạng thái!')
      console.error('Update status error:', error)
    }
  }

  const stats = {
    total: vaccineEvents.length,
    ongoing: vaccineEvents.filter((p) => p.status === VaccineEventStatus.ONGOING).length,
    completed: vaccineEvents.filter((p) => p.status === VaccineEventStatus.COMPLETED).length,
    cancelled: vaccineEvents.filter((p) => p.status === VaccineEventStatus.CANCELLED).length
  }

  return (
    <div style={{ padding: '24px' }}>
      <Space direction='vertical' size='large' style={{ width: '100%' }}>
        <Card>
          <Title level={4}>Quản lý sự kiện tiêm vaccine</Title>
          <Row gutter={16} style={{ marginTop: '24px' }}>
            <Col span={6}>
              <Card>
                <Statistic title='Tổng số sự kiện' value={stats.total} />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic title='Chờ Duyệt' value={stats.ongoing} valueStyle={{ color: '#1890ff' }} />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic title='Đã Duyệt' value={stats.completed} valueStyle={{ color: '#52c41a' }} />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic title='Đã hủy' value={stats.cancelled} valueStyle={{ color: '#ff4d4f' }} />
              </Card>
            </Col>
          </Row>
        </Card>

        <Card title='Danh sách sự kiện'>
          <Table
            columns={columns}
            dataSource={vaccineEvents}
            rowKey='_id'
            loading={loading}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: totalItems,
              onChange: handleTableChange,
              showSizeChanger: true,
              pageSizeOptions: ['5', '10', '20', '50']
            }}
          />
        </Card>

        <Modal
          title='Chi tiết sự kiện'
          open={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          width={800}
          footer={null}
        >
          {selectedPlan && (
            <div>
              <Title level={5}>{selectedPlan.title}</Title>
              <Row gutter={16}>
                <Col span={12}>
                  <p>
                    <strong>Tên vaccine:</strong> {selectedPlan.vaccineName}
                  </p>
                  <p>
                    <strong>Thời gian:</strong>{' '}
                    {new Date(selectedPlan.startDate).toLocaleDateString('vi-VN')} -{' '}
                    {new Date(selectedPlan.endDate).toLocaleDateString('vi-VN')}
                  </p>
                  <p>
                    <strong>Địa điểm:</strong> {selectedPlan.location}
                  </p>
                </Col>
                <Col span={12}>
                  <p>
                    <strong>Trạng thái:</strong>{' '}
                    {selectedPlan.status === VaccineEventStatus.ONGOING
                      ? 'Chờ Duyệt'
                      : selectedPlan.status === VaccineEventStatus.COMPLETED
                        ? 'Đã Duyệt'
                        : 'Đã hủy'}
                  </p>
                  <p>
                    <strong>Hạn đăng ký:</strong>{' '}
                    {new Date(selectedPlan.registrationDeadline).toLocaleDateString('vi-VN')}
                  </p>
                </Col>
              </Row>
              <div style={{ marginTop: '16px' }}>
                <strong>Mô tả chi tiết:</strong>
                <p>{selectedPlan.description}</p>
              </div>
            </div>
          )}
        </Modal>
      </Space>
    </div>
  )
}

export default CensorList
