import React, { useEffect, useState } from 'react'
import { Table, Button, Space, Modal, Popconfirm, Descriptions } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons'
import { getMedicines, deleteMedicine, getMedicineById } from '../../../api/medicines.api'
import type { Medicine } from '../../../api/medicines.api'
import CreateMedicineForm from './Create'
import UpdateMedicineForm from './update'
import { toast } from 'react-toastify'

const MedicinesList: React.FC = () => {
  const [medicines, setMedicines] = useState<Medicine[]>([])
  const [loading, setLoading] = useState(false)
  const [totalItems, setTotalItems] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false)
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false)
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false)
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null)

  const fetchMedicines = async (page: number, size: number) => {
    try {
      setLoading(true)
      const response = await getMedicines(page, size)

      if (response && response.pageData) {
        setMedicines(response.pageData)
        setTotalItems(response.pageInfo.totalItems)
      } else {
        console.error('Invalid response format:', response)
        toast.error('Dữ liệu không đúng định dạng')
      }
    } catch (error) {
      console.error('Error fetching medicines:', error)
      toast.error('Không thể tải danh sách thuốc')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMedicines(currentPage, pageSize)
  }, [currentPage, pageSize])

  const handleDelete = async (id: string) => {
    try {
      await deleteMedicine(id)
      toast.success('Xóa thuốc thành công')
      fetchMedicines(currentPage, pageSize)
    } catch (error) {
      console.error('Error deleting medicine:', error)
      toast.error('Không thể xóa thuốc')
    }
  }

  const handleViewDetail = async (id: string) => {
    try {
      const medicine = await getMedicineById(id)
      setSelectedMedicine(medicine.data)
      setIsDetailModalVisible(true)
    } catch (error) {
      console.error('Error fetching medicine detail:', error)
      toast.error('Không thể tải thông tin thuốc')
    }
  }

  const handleUpdate = (medicine: Medicine) => {
    setSelectedMedicine(medicine)
    setIsUpdateModalVisible(true)
  }

  const columns = [
    {
      title: 'Tên thuốc',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description'
    },
    {
      title: 'Liều lượng',
      dataIndex: 'dosage',
      key: 'dosage'
    },
    {
      title: 'Tác dụng phụ',
      dataIndex: 'sideEffects',
      key: 'sideEffects'
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: unknown, record: Medicine) => (
        <Space size='middle'>
          <Button type='primary' icon={<EyeOutlined />} onClick={() => handleViewDetail(record._id)}>
            Chi tiết
          </Button>
          <Button type='primary' icon={<EditOutlined />} onClick={() => handleUpdate(record)}>
            Sửa
          </Button>
          <Popconfirm
            title='Bạn có chắc chắn muốn xóa thuốc này?'
            onConfirm={() => handleDelete(record._id)}
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
      <div className='flex justify-between items-center mb-4'>
        <h1 className='text-2xl font-bold'>Quản lý thuốc</h1>
        <Button type='primary' icon={<PlusOutlined />} onClick={() => setIsCreateModalVisible(true)}>
          Thêm thuốc mới
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={medicines}
        rowKey='_id'
        loading={loading}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: totalItems,
          onChange: (page, size) => {
            setCurrentPage(page)
            setPageSize(size)
          }
        }}
      />

      {/* Modal thêm thuốc mới */}
      <Modal
        title='Thêm thuốc mới'
        open={isCreateModalVisible}
        onCancel={() => setIsCreateModalVisible(false)}
        footer={null}
        width={800}
      >
        <CreateMedicineForm
          onSuccess={() => {
            setIsCreateModalVisible(false)
            fetchMedicines(currentPage, pageSize)
          }}
          onCancel={() => setIsCreateModalVisible(false)}
        />
      </Modal>

      {/* Modal cập nhật thuốc */}
      <Modal
        title='Cập nhật thông tin thuốc'
        open={isUpdateModalVisible}
        onCancel={() => setIsUpdateModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedMedicine && (
          <UpdateMedicineForm
            medicine={selectedMedicine}
            onSuccess={() => {
              setIsUpdateModalVisible(false)
              fetchMedicines(currentPage, pageSize)
            }}
            onCancel={() => setIsUpdateModalVisible(false)}
          />
        )}
      </Modal>

      {/* Modal xem chi tiết */}
      <Modal
        title='Chi tiết thuốc'
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={[
          <Button key='close' onClick={() => setIsDetailModalVisible(false)}>
            Đóng
          </Button>
        ]}
      >
        {selectedMedicine && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label='Tên thuốc'>{selectedMedicine.name}</Descriptions.Item>
            <Descriptions.Item label='Mô tả'>{selectedMedicine.description}</Descriptions.Item>
            <Descriptions.Item label='Liều lượng'>{selectedMedicine.dosage}</Descriptions.Item>
            {selectedMedicine.sideEffects && (
              <Descriptions.Item label='Tác dụng phụ'>{selectedMedicine.sideEffects}</Descriptions.Item>
            )}
            <Descriptions.Item label='Ngày tạo'>
              {new Date(selectedMedicine.createdAt).toLocaleDateString('vi-VN')}
            </Descriptions.Item>
            <Descriptions.Item label='Cập nhật lần cuối'>
              {new Date(selectedMedicine.updatedAt).toLocaleDateString('vi-VN')}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  )
}

export default MedicinesList
