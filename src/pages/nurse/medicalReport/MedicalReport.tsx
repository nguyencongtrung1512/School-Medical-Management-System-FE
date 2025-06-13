import React, { useState, useEffect } from 'react'
import { Card, Typography, Table, Button, Space } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { getMedicalEvents } from '../../../api/medicalEvent'
import type { MedicalEvent } from '../../../api/medicalEvent'
import CreateMedicalEventForm from './Create'
import Detail from './Detail'

const { Title } = Typography

const MedicalReport: React.FC = () => {
  const [medicalEvents, setMedicalEvents] = useState<MedicalEvent[]>([])
  const [loading, setLoading] = useState(false)
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false)
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false)
  const [selectedEventId, setSelectedEventId] = useState<string>('')

  const fetchMedicalEvents = async () => {
    try {
      setLoading(true)
      const response = await getMedicalEvents()
      setMedicalEvents(response.pageData)
    } catch (error) {
      console.error('Error fetching medical events:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMedicalEvents()
  }, [])

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
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Button type='link' onClick={() => handleViewDetails(record._id)}>
          Xem chi tiết
        </Button>
      )
    }
  ]

  const handleViewDetails = (id: string) => {
    setSelectedEventId(id)
    setIsDetailModalVisible(true)
  }

  const handleCreateSuccess = () => {
    setIsCreateModalVisible(false)
    fetchMedicalEvents()
  }

  const handleDetailSuccess = () => {
    setIsDetailModalVisible(false)
    fetchMedicalEvents()
  }

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Space direction='vertical' style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={4}>Báo cáo sự kiện y tế</Title>
            <Button type='primary' icon={<PlusOutlined />} onClick={() => setIsCreateModalVisible(true)}>
              Tạo báo cáo
            </Button>
          </div>

          <Table columns={columns} dataSource={medicalEvents} rowKey='_id' loading={loading} />
        </Space>
      </Card>

      {isCreateModalVisible && (
        <Card style={{ marginTop: '24px' }}>
          <Title level={4}>Tạo sự kiện y tế mới</Title>
          <CreateMedicalEventForm onSuccess={handleCreateSuccess} />
        </Card>
      )}

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
