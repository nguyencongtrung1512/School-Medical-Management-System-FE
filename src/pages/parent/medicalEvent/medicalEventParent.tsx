import React, { useState, useEffect } from 'react'
import { Card, Table, Typography, Button, Modal, Descriptions, Row, Col, Statistic } from 'antd'
import {
  FileTextOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { getMedicalEvents } from '../../../api/medicalEvent.api'
import type { MedicalEvent, MedicalEventResponse } from '../../../api/medicalEvent.api'
import { useAuth } from '../../../contexts/auth.context'
import { toast } from 'react-toastify'

const { Title } = Typography

const MedicalEventParent: React.FC = () => {
  const { user } = useAuth()
  const [medicalEvents, setMedicalEvents] = useState<MedicalEvent[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<MedicalEvent | null>(null)
  const [isModalVisible, setIsModalVisible] = useState(false)

  const fetchMedicalEventsForChildren = async () => {
    if (!user || !user.studentIds || user.studentIds.length === 0) {
      console.log("Không có user hoặc studentIds:", user);
      setMedicalEvents([])
      return
    }

    try {
      setLoading(true)
      const allEvents: MedicalEvent[] = []
      console.log("Danh sách studentIds:", user.studentIds);

      for (const studentId of user.studentIds) {
        console.log("Đang fetch dữ liệu cho studentId:", studentId);
        const response: MedicalEventResponse = await getMedicalEvents(1, 100, studentId)
        console.log("Response từ API:", response)
        console.log("Dữ liệu pageData:", response.pageData)
        allEvents.push(...response.pageData)
      }
      console.log("Tất cả events sau khi gộp:", allEvents);
      setMedicalEvents(allEvents)
    } catch (error) {
      console.error('Lỗi khi tải sự kiện y tế cho trẻ:', error)
      toast.error('Không thể tải sự kiện y tế cho con của bạn.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMedicalEventsForChildren()
  }, [user])

  const handleViewDetails = (record: MedicalEvent) => {
    setSelectedEvent(record)
    setIsModalVisible(true)
  }

  const columns: ColumnsType<MedicalEvent> = [
    {
      title: 'Học sinh',
      dataIndex: ['student', 'fullName'],
      key: 'studentName'
    },
    {
      title: 'Tên sự kiện',
      dataIndex: 'eventName',
      key: 'eventName'
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true
    },
    {
      title: 'Biện pháp xử lý',
      dataIndex: 'actionTaken',
      key: 'actionTaken',
      ellipsis: true
    },
    {
      title: 'Mức độ nghiêm trọng',
      dataIndex: 'isSerious',
      key: 'isSerious',
      render: (isSerious: boolean) => (
        <span style={{ color: isSerious ? 'red' : 'green' }}>{isSerious ? 'Nghiêm trọng' : 'Không nghiêm trọng'}</span>
      )
    },
    {
      title: 'Người tạo',
      dataIndex: ['schoolNurse', 'fullName'],
      key: 'createdBy'
    },
    {
      title: 'Thời gian tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text: string) => new Date(text).toLocaleString()
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Button type='link' icon={<FileTextOutlined />} onClick={() => handleViewDetails(record)}>
          Xem chi tiết
        </Button>
      )
    }
  ]

  const currentEvents = medicalEvents.filter((event) => !event.isDeleted)
  const historyEvents = medicalEvents.filter((event) => event.isDeleted)

  return (
    <div className='p-6 space-y-8'>
      <div className='bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg shadow-md'>
        <Title level={3} className='mb-6'>
          Báo cáo y tế hiện tại
        </Title>

        <Row gutter={[16, 16]} className='mb-6'>
          <Col span={8}>
            <Card className='bg-red-50'>
              <Statistic
                title='Sốt'
                value={currentEvents.filter((e) => e.eventName.toLowerCase().includes('sốt')).length}
                valueStyle={{ color: '#cf1322' }}
                prefix={<ExclamationCircleOutlined />}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card className='bg-orange-50'>
              <Statistic
                title='Tai nạn'
                value={currentEvents.filter((e) => e.eventName.toLowerCase().includes('tai nạn')).length}
                valueStyle={{ color: '#fa8c16' }}
                prefix={<ExclamationCircleOutlined />}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card className='bg-blue-50'>
              <Statistic
                title='Nghiêm trọng'
                value={currentEvents.filter((e) => e.isSerious).length}
                valueStyle={{ color: '#1890ff' }}
                prefix={<ClockCircleOutlined />}
              />
            </Card>
          </Col>
        </Row>

        <Card className='shadow-md'>
          <Table columns={columns} dataSource={currentEvents} rowKey='_id' loading={loading} pagination={false} />
        </Card>
      </div>

      <div className='bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg shadow-md'>
        <Title level={3} className='mb-6'>
          Lịch sử báo cáo y tế
        </Title>

        <Table columns={columns} dataSource={historyEvents} rowKey='_id' loading={loading} />
      </div>

      <Modal
        title='Chi tiết báo cáo y tế'
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        width={800}
        footer={[
          <Button key='close' onClick={() => setIsModalVisible(false)}>
            Đóng
          </Button>
        ]}
      >
        {selectedEvent && (
          <div className='space-y-6'>
            <Descriptions bordered>
              <Descriptions.Item label='Thời gian tạo' span={3}>
                {new Date(selectedEvent.createdAt).toLocaleString()}
              </Descriptions.Item>
              <Descriptions.Item label='Học sinh' span={3}>
                {selectedEvent.student?.fullName || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label='Tên sự kiện' span={3}>
                {selectedEvent.eventName}
              </Descriptions.Item>
              <Descriptions.Item label='Mô tả' span={3}>
                {selectedEvent.description}
              </Descriptions.Item>
              <Descriptions.Item label='Biện pháp xử lý' span={3}>
                {selectedEvent.actionTaken}
              </Descriptions.Item>
              <Descriptions.Item label='Thuốc sử dụng' span={3}>
                {selectedEvent.medicines && selectedEvent.medicines.length > 0 ? (
                  selectedEvent.medicines.map(medicine => (
                    <div key={medicine._id}>
                      {medicine.name} - {medicine.quantity} {medicine.unit}
                    </div>
                  ))
                ) : (
                  'Không sử dụng'
                )}
              </Descriptions.Item>
              <Descriptions.Item label='Vật tư y tế sử dụng' span={3}>
                {selectedEvent.medicalSupplies && selectedEvent.medicalSupplies.length > 0 ? (
                  selectedEvent.medicalSupplies.map(supply => (
                    <div key={supply._id}>
                      {supply.name} - {supply.quantity} {supply.unit}
                    </div>
                  ))
                ) : (
                  'Không sử dụng'
                )}
              </Descriptions.Item>
              <Descriptions.Item label='Mức độ nghiêm trọng' span={3}>
                {selectedEvent.isSerious ? 'Nghiêm trọng' : 'Không nghiêm trọng'}
              </Descriptions.Item>
              {selectedEvent.notes && (
                <Descriptions.Item label='Ghi chú' span={3}>
                  {selectedEvent.notes}
                </Descriptions.Item>
              )}
              <Descriptions.Item label='Người tạo' span={3}>
                {selectedEvent.schoolNurse?.fullName || 'N/A'}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default MedicalEventParent
