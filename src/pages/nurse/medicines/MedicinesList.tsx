import type React from 'react'
import { useEffect, useState } from 'react'
import {
  Table,
  Button,
  Space,
  Modal,
  message,
  Card,
  Input,
  Typography,
  Tag,
  Tooltip,
  Divider,
  Badge,
  Row,
  Col,
  Dropdown,
  Menu,
  Descriptions
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  SearchOutlined,
  FilterOutlined,
  ReloadOutlined,
  ExclamationCircleOutlined,
  MedicineBoxOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'
import { getMedicines, deleteMedicine, getMedicineById } from '../../../api/medicines.api'
import type { Medicine } from '../../../api/medicines.api'
import CreateMedicineForm from './Create'
import UpdateMedicineForm from './Update'

const { Title, Text } = Typography
const { Search } = Input
const { confirm } = Modal

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
  const [searchText, setSearchText] = useState('')
  const [expirySort, setExpirySort] = useState<'none' | 'asc' | 'desc'>('none')

  const fetchMedicines = async (page: number, size: number) => {
    try {
      setLoading(true)
      const response = await getMedicines(page, size)
      if (response && response.pageData) {
        setMedicines(response.pageData)
        setTotalItems(response.pageInfo.totalItems)
      } else {
        message.error('Dữ liệu không đúng định dạng')
      }
    } catch (error: unknown) {
      console.log('error', error)
      const err = error as { message?: string }
      if (err.message) {
        message.error(err.message)
      } else {
        message.error('Không thể tải danh sách thuốc')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMedicines(currentPage, pageSize)
  }, [currentPage, pageSize])

  const showDeleteConfirm = (record: Medicine) => {
    confirm({
      title: 'Xác nhận xóa thuốc',
      icon: <ExclamationCircleOutlined />,
      content: `Bạn có chắc chắn muốn xóa thuốc "${record.name}" không?`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk() {
        handleDelete(record._id)
      }
    })
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteMedicine(id)
      message.success('Xóa thuốc thành công')
      fetchMedicines(currentPage, pageSize)
    } catch (error: unknown) {
      console.log('error', error)
      const err = error as { message?: string }
      if (err.message) {
        message.error(err.message)
      } else {
        message.error('Không thể xóa thuốc')
      }
    }
  }

  const handleViewDetail = async (id: string) => {
    try {
      const medicine = await getMedicineById(id)
      setSelectedMedicine(medicine.data)
      setIsDetailModalVisible(true)
    } catch (error: unknown) {
      console.log('error', error)
      const err = error as { message?: string }
      if (err.message) {
        message.error(err.message)
      } else {
        message.error('Không thể tải thông tin thuốc')
      }
    }
  }

  const handleUpdate = (medicine: Medicine) => {
    setSelectedMedicine(medicine)
    setIsUpdateModalVisible(true)
  }

  const getExpiryStatus = (date: string) => {
    if (!date) return { color: 'default', text: 'Chưa có thông tin' }

    const expiryDate = dayjs(date)
    const today = dayjs()
    const daysUntilExpiry = expiryDate.diff(today, 'day')

    if (daysUntilExpiry < 0) {
      return { color: 'error', text: 'Đã hết hạn' }
    } else if (daysUntilExpiry <= 30) {
      return { color: 'warning', text: 'Sắp hết hạn' }
    } else {
      return { color: 'success', text: 'Còn hạn' }
    }
  }

  const getQuantityStatus = (quantity: number) => {
    if (quantity === 0) {
      return { color: 'error', text: 'Hết hàng' }
    } else if (quantity <= 10) {
      return { color: 'warning', text: 'Sắp hết' }
    } else {
      return { color: 'success', text: 'Còn hàng' }
    }
  }

  const columns = [
    {
      title: 'Tên thuốc',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => (
        <Space>
          <MedicineBoxOutlined style={{ color: '#1890ff' }} />
          <Text strong>{text}</Text>
        </Space>
      ),
      sorter: (a: Medicine, b: Medicine) => a.name.localeCompare(b.name)
    },
    {
      title: 'Liều lượng',
      dataIndex: 'dosage',
      key: 'dosage',
      render: (text: string) => <Tag color='blue'>{text}</Tag>
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (quantity: number, record: Medicine) => {
        const status = getQuantityStatus(quantity)
        return (
          <Space>
            <Text>{quantity}</Text>
            <Text type='secondary'>{record.unit}</Text>
            <Badge status={status.color as any} text={status.text} />
          </Space>
        )
      },
      sorter: (a: Medicine, b: Medicine) => a.quantity - b.quantity
    },
    {
      title: 'Tác dụng phụ',
      dataIndex: 'sideEffects',
      key: 'sideEffects',
      render: (text: string) => (
        <Text ellipsis style={{ maxWidth: 150 }}>
          {text || 'Không có'}
        </Text>
      )
    },
    {
      title: 'Ngày hết hạn',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      render: (date: string) => {
        if (!date) return <Text type='secondary'>Chưa có thông tin</Text>
        const status = getExpiryStatus(date)
        return (
          <Space>
            <Text>{new Date(date).toLocaleDateString('vi-VN')}</Text>
            <Badge status={status.color as any} text={status.text} />
          </Space>
        )
      },
      sorter: (a: Medicine, b: Medicine) => {
        if (!a.expiryDate || !b.expiryDate) return 0
        return dayjs(a.expiryDate).unix() - dayjs(b.expiryDate).unix()
      }
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: unknown, record: Medicine) => (
        <Space size='middle'>
          <Tooltip title='Xem chi tiết'>
            <Button type='text' icon={<EyeOutlined />} onClick={() => handleViewDetail(record._id)} />
          </Tooltip>
          <Tooltip title='Chỉnh sửa'>
            <Button type='text' icon={<EditOutlined />} onClick={() => handleUpdate(record)} />
          </Tooltip>
          <Tooltip title='Xóa'>
            <Button type='text' danger icon={<DeleteOutlined />} onClick={() => showDeleteConfirm(record)} />
          </Tooltip>
        </Space>
      )
    }
  ]

  const handleSearch = (value: string) => {
    setSearchText(value)
  }

  const filteredMedicines = searchText
    ? medicines.filter(
      (item) =>
        item.name.toLowerCase().includes(searchText.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.dosage?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.manufacturer?.toLowerCase().includes(searchText.toLowerCase())
    )
    : medicines

  const sortedMedicines = (() => {
    if (expirySort === 'asc') {
      return [...filteredMedicines].sort((a, b) => {
        if (!a.expiryDate) return 1
        if (!b.expiryDate) return -1
        return dayjs(a.expiryDate).unix() - dayjs(b.expiryDate).unix()
      })
    } else if (expirySort === 'desc') {
      return [...filteredMedicines].sort((a, b) => {
        if (!a.expiryDate) return 1
        if (!b.expiryDate) return -1
        return dayjs(b.expiryDate).unix() - dayjs(a.expiryDate).unix()
      })
    }
    return filteredMedicines
  })()

  const filterMenu = (
    <Menu
      onClick={({ key }) => {
        if (key === 'asc') setExpirySort('asc')
        else if (key === 'desc') setExpirySort('desc')
        else setExpirySort('none')
      }}
      items={[
        { key: 'asc', label: 'Ngày hết hạn: Gần nhất' },
        { key: 'desc', label: 'Ngày hết hạn: Xa nhất' },
        { key: 'reset', label: 'Bỏ lọc ngày hết hạn' },
        { type: 'divider' }
      ]}
    />
  )

  return (
    <div className='p-6'>
      <Card bordered={false} className='shadow-sm'>
        <Row gutter={[16, 16]} align='middle' justify='space-between'>
          <Col>
            <Title level={2} style={{ margin: 0 }}>
              <Space>
                <MedicineBoxOutlined style={{ color: '#1890ff' }} />
                Quản lý thuốc
              </Space>
            </Title>
          </Col>
          <Col>
            <Button type='primary' icon={<PlusOutlined />} onClick={() => setIsCreateModalVisible(true)} size='large'>
              Thêm thuốc mới
            </Button>
          </Col>
        </Row>

        <Divider />

        <Row gutter={[16, 16]} className='mb-4'>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Search
              placeholder='Tìm kiếm thuốc'
              allowClear
              enterButton={<SearchOutlined />}
              size='middle'
              onSearch={handleSearch}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </Col>
          <Col>
            <Space>
              <Dropdown overlay={filterMenu} trigger={['click']}>
                <Button icon={<FilterOutlined />}>Lọc</Button>
              </Dropdown>
              <Tooltip title='Làm mới dữ liệu'>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={() => fetchMedicines(currentPage, pageSize)}
                  loading={loading}
                />
              </Tooltip>
            </Space>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={sortedMedicines}
          rowKey='_id'
          loading={loading}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: totalItems,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Tổng cộng ${total} loại thuốc`,
            onChange: (page, size) => {
              setCurrentPage(page)
              setPageSize(size || 10)
            }
          }}
          bordered
          size='middle'
          scroll={{ x: 'max-content' }}
        />
      </Card>

      {/* Modal thêm thuốc mới */}
      <Modal
        title={
          <Title level={4}>
            <Space>
              <PlusOutlined />
              Thêm thuốc mới
            </Space>
          </Title>
        }
        open={isCreateModalVisible}
        onCancel={() => setIsCreateModalVisible(false)}
        footer={null}
        width={800}
        destroyOnClose
      >
        <CreateMedicineForm
          onSuccess={() => {
            setIsCreateModalVisible(false)
            fetchMedicines(currentPage, pageSize)
            message.success('Thêm thuốc thành công')
          }}
          onCancel={() => setIsCreateModalVisible(false)}
        />
      </Modal>

      {/* Modal cập nhật thuốc */}
      <Modal
        title={
          <Title level={4}>
            <Space>
              <EditOutlined />
              Cập nhật thông tin thuốc
            </Space>
          </Title>
        }
        open={isUpdateModalVisible}
        onCancel={() => setIsUpdateModalVisible(false)}
        footer={null}
        width={800}
        destroyOnClose
      >
        {selectedMedicine && (
          <UpdateMedicineForm
            medicine={selectedMedicine}
            onSuccess={() => {
              setIsUpdateModalVisible(false)
              fetchMedicines(currentPage, pageSize)
              message.success('Cập nhật thuốc thành công')
            }}
            onCancel={() => setIsUpdateModalVisible(false)}
          />
        )}
      </Modal>

      {/* Modal xem chi tiết */}
      <Modal
        title={
          <Title level={4}>
            <Space>
              <EyeOutlined />
              Chi tiết thuốc
            </Space>
          </Title>
        }
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={[
          <Button key='close' onClick={() => setIsDetailModalVisible(false)}>
            Đóng
          </Button>,
          <Button
            key='edit'
            type='primary'
            icon={<EditOutlined />}
            onClick={() => {
              setIsDetailModalVisible(false)
              setIsUpdateModalVisible(true)
            }}
          >
            Chỉnh sửa
          </Button>
        ]}
        width={700}
      >
        {selectedMedicine && (
          <Card bordered={false}>
            <Descriptions bordered column={1} size='middle'>
              <Descriptions.Item
                label={
                  <Text strong>
                    <MedicineBoxOutlined /> Tên thuốc
                  </Text>
                }
              >
                <Text strong style={{ fontSize: '16px', color: '#1890ff' }}>
                  {selectedMedicine.name}
                </Text>
              </Descriptions.Item>

              <Descriptions.Item label={<Text strong>Mô tả</Text>}>
                <Text>{selectedMedicine.description || 'Không có mô tả'}</Text>
              </Descriptions.Item>

              <Descriptions.Item label={<Text strong>Liều lượng</Text>}>
                <Tag color='blue' style={{ fontSize: '14px' }}>
                  {selectedMedicine.dosage}
                </Tag>
              </Descriptions.Item>

              <Descriptions.Item label={<Text strong>Số lượng</Text>}>
                <Space>
                  <Text style={{ fontSize: '16px' }}>
                    {selectedMedicine.quantity} {selectedMedicine.unit}
                  </Text>
                  <Badge
                    status={getQuantityStatus(selectedMedicine.quantity).color as any}
                    text={getQuantityStatus(selectedMedicine.quantity).text}
                  />
                </Space>
              </Descriptions.Item>

              <Descriptions.Item label={<Text strong>Hãng sản xuất</Text>}>
                <Text>{selectedMedicine.manufacturer || 'Không có thông tin'}</Text>
              </Descriptions.Item>

              <Descriptions.Item label={<Text strong>Ngày sản xuất</Text>}>
                <Text>
                  {selectedMedicine.manufactureDate
                    ? new Date(selectedMedicine.manufactureDate).toLocaleDateString('vi-VN')
                    : 'Không có thông tin'}
                </Text>
              </Descriptions.Item>

              <Descriptions.Item label={<Text strong>Ngày hết hạn</Text>}>
                {selectedMedicine.expiryDate ? (
                  <Space>
                    <Text>{new Date(selectedMedicine.expiryDate).toLocaleDateString('vi-VN')}</Text>
                    <Tag color={getExpiryStatus(selectedMedicine.expiryDate).color}>
                      {getExpiryStatus(selectedMedicine.expiryDate).text}
                    </Tag>
                  </Space>
                ) : (
                  <Text type='secondary'>Không có thông tin</Text>
                )}
              </Descriptions.Item>

              {selectedMedicine.sideEffects && (
                <Descriptions.Item label={<Text strong>Tác dụng phụ</Text>}>
                  <Text type='warning'>{selectedMedicine.sideEffects}</Text>
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>
        )}
      </Modal>
    </div>
  )
}

export default MedicinesList
