import { PlusOutlined } from '@ant-design/icons'
import { Button, Card, message, Space, Table, Typography, Modal } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import React, { useEffect, useState } from 'react'
import { MedicalEvent, medicalEventApi } from '../../../api/medicalEvent.api'
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
      const response = await medicalEventApi.search({})
      // response.data.pageData is correct if backend returns { pageData, ... }
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
      dataIndex: 'severityLevel',
      key: 'severityLevel',
      render: (severityLevel: string) => <span>{severityLevel || 'Không xác định'}</span>
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
        <Space>
          <Button type='link' onClick={() => handleViewDetails(record._id)}>
            Xem chi tiết
          </Button>
          <Button type='link' danger onClick={() => handleDelete(record._id)}>
            Xóa
          </Button>
        </Space>
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

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: 'Xác nhận xóa sự kiện',
      content: 'Bạn có chắc chắn muốn xóa sự kiện này?',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
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
    })
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
