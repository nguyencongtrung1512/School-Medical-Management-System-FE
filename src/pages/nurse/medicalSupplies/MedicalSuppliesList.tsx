import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons'
import { Button, message, Modal, Popconfirm, Space, Table } from 'antd'
import dayjs from 'dayjs'
import React, { useEffect, useState } from 'react'
import type { MedicalSupply } from '../../../api/medicalSupplies.api'
import { deleteMedicalSupply, getAllMedicalSupplies } from '../../../api/medicalSupplies.api'
import CreateMedicalSupplyForm from './Create'
import UpdateMedicalSupplyForm from './Update'

const MedicalSuppliesList: React.FC = () => {
  const [medicalSupplies, setMedicalSupplies] = useState<MedicalSupply[]>([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [total, setTotal] = useState(0)
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false)
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false)
  const [selectedMedicalSupply, setSelectedMedicalSupply] = useState<MedicalSupply | null>(null)

  const fetchMedicalSupplies = async () => {
    try {
      setLoading(true)
      const response = await getAllMedicalSupplies(currentPage, pageSize)
      console.log('trung ne: ', response)
      setMedicalSupplies(response.pageData)
      setTotal(response.pageInfo.totalItems)
    } catch (error: unknown) {
      console.log('error', error)
      const err = error as { message?: string }
      if (err.message) {
        message.error(err.message)
      } else {
        message.error('Không thể tải danh sách vật tư y tế')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMedicalSupplies()
  }, [currentPage, pageSize])

  const handleCreateSuccess = () => {
    setIsCreateModalVisible(false)
    fetchMedicalSupplies()
  }

  const handleUpdateSuccess = () => {
    setIsUpdateModalVisible(false)
    setSelectedMedicalSupply(null)
    fetchMedicalSupplies()
  }

  const handleDelete = async (_id: number) => {
    try {
      await deleteMedicalSupply(_id)
      message.success('Xóa vật tư y tế thành công')
      fetchMedicalSupplies()
    } catch (error: unknown) {
      console.log('error', error)
      const err = error as { message?: string }
      if (err.message) {
        message.error(err.message)
      } else {
        message.error('Không thể xóa vật tư y tế')
      }
    }
  }

  const columns = [
    {
      title: 'Tên vật tư',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description'
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity'
    },
    {
      title: 'Đơn vị',
      dataIndex: 'unit',
      key: 'unit'
    },
    {
      title: 'Ngày hết hạn',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY')
    },
    {
      title: 'Nhà cung cấp',
      dataIndex: 'supplier',
      key: 'supplier'
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: unknown, record: MedicalSupply) => (
        <Space size='middle'>
          <Button
            type='primary'
            icon={<EditOutlined />}
            onClick={() => {
              setSelectedMedicalSupply(record)
              setIsUpdateModalVisible(true)
            }}
          >
            Sửa
          </Button>
          <Popconfirm
            title='Bạn có chắc chắn muốn xóa vật tư này?'
            onConfirm={() => handleDelete(record._id!)}
            okText='Có'
            cancelText='Không'
          >
            <Button type='primary' danger icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <div className='p-6'>
      <div className='flex justify-between mb-4'>
        <h1 className='text-2xl font-bold'>Quản lý vật tư y tế</h1>
        <Button type='primary' icon={<PlusOutlined />} onClick={() => setIsCreateModalVisible(true)}>
          Thêm vật tư mới
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={medicalSupplies}
        rowKey='_id'
        loading={loading}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: total,
          onChange: (page, pageSize) => {
            setCurrentPage(page)
            setPageSize(pageSize)
          }
        }}
      />

      <Modal
        title='Thêm vật tư y tế mới'
        open={isCreateModalVisible}
        onCancel={() => setIsCreateModalVisible(false)}
        footer={null}
        width={800}
      >
        <CreateMedicalSupplyForm onSuccess={handleCreateSuccess} onCancel={() => setIsCreateModalVisible(false)} />
      </Modal>

      <Modal
        title='Cập nhật vật tư y tế'
        open={isUpdateModalVisible}
        onCancel={() => {
          setIsUpdateModalVisible(false)
          setSelectedMedicalSupply(null)
        }}
        footer={null}
        width={800}
      >
        {selectedMedicalSupply && (
          <UpdateMedicalSupplyForm
            medicalSupply={selectedMedicalSupply}
            onSuccess={handleUpdateSuccess}
            onCancel={() => {
              setIsUpdateModalVisible(false)
              setSelectedMedicalSupply(null)
            }}
          />
        )}
      </Modal>
    </div>
  )
}

export default MedicalSuppliesList
