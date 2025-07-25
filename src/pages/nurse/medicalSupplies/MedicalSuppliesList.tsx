import type React from 'react'
import { useEffect, useState } from 'react'
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SearchOutlined,
  InfoCircleOutlined,
  FilterOutlined,
  ReloadOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons'
import {
  Button,
  message,
  Modal,
  Table,
  Card,
  Input,
  Typography,
  Space,
  Tag,
  Tooltip,
  Divider,
  Badge,
  Row,
  Col,
  Dropdown,
  Menu
} from 'antd'
import dayjs from 'dayjs'
import type { MedicalSupply } from '../../../api/medicalSupplies.api'
import { deleteMedicalSupply, getAllMedicalSupplies } from '../../../api/medicalSupplies.api'
import CreateMedicalSupplyForm from './Create'
import UpdateMedicalSupplyForm from './Update'

const { Title, Text } = Typography
const { Search } = Input
const { confirm } = Modal

const MedicalSuppliesList: React.FC = () => {
  const [medicalSupplies, setMedicalSupplies] = useState<MedicalSupply[]>([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [total, setTotal] = useState(0)
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false)
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false)
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false)
  const [selectedMedicalSupply, setSelectedMedicalSupply] = useState<MedicalSupply | null>(null)
  const [searchText, setSearchText] = useState('')
  const [expirySort, setExpirySort] = useState<'none' | 'asc' | 'desc'>('none')

  const fetchMedicalSupplies = async () => {
    try {
      setLoading(true)
      const response = await getAllMedicalSupplies(currentPage, pageSize)
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
    message.success('Thêm vật tư y tế thành công')
  }

  const handleUpdateSuccess = () => {
    setIsUpdateModalVisible(false)
    setSelectedMedicalSupply(null)
    fetchMedicalSupplies()
    message.success('Cập nhật vật tư y tế thành công')
  }

  const showDeleteConfirm = (record: MedicalSupply) => {
    confirm({
      title: 'Xác nhận xóa vật tư y tế',
      icon: <ExclamationCircleOutlined />,
      content: `Bạn có chắc chắn muốn xóa vật tư "${record.name}" không?`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk() {
        handleDelete(record._id!)
      }
    })
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

  const getExpiryStatus = (date: string) => {
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

  const columns = [
    {
      title: 'Tên vật tư',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <Text strong>{text}</Text>,
      sorter: (a: MedicalSupply, b: MedicalSupply) => a.name.localeCompare(b.name)
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (quantity: number, record: MedicalSupply) => (
        <Space>
          <Text>{quantity}</Text>
          <Text type='secondary'>{record.unit}</Text>
        </Space>
      ),
      sorter: (a: MedicalSupply, b: MedicalSupply) => a.quantity - b.quantity
    },
    {
      title: 'Hãng sản xuất',
      dataIndex: 'manufacturer',
      key: 'manufacturer',
      render: (text: string) => <Text>{text}</Text>
    },
    {
      title: 'Ngày hết hạn',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      render: (date: string) => {
        const status = getExpiryStatus(date)
        return (
          <Space>
            <Text>{dayjs(date).format('DD/MM/YYYY')}</Text>
            <Badge status={status.color as any} text={status.text} />
          </Space>
        )
      },
      sorter: (a: MedicalSupply, b: MedicalSupply) => dayjs(a.expiryDate).unix() - dayjs(b.expiryDate).unix()
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: unknown, record: MedicalSupply) => (
        <Space size='middle'>
          <Tooltip title='Xem chi tiết'>
            <Button
              type='text'
              icon={<InfoCircleOutlined />}
              onClick={() => {
                setSelectedMedicalSupply(record)
                setIsDetailModalVisible(true)
              }}
            />
          </Tooltip>
          <Tooltip title='Chỉnh sửa'>
            <Button
              type='text'
              icon={<EditOutlined />}
              onClick={() => {
                setSelectedMedicalSupply(record)
                setIsUpdateModalVisible(true)
              }}
            />
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
    // In a real application, you would filter the data or make an API call with the search term
    // For now, we'll just log it
    console.log('Search term:', value)
  }

  const filteredSupplies = searchText
    ? medicalSupplies.filter(
      (item) =>
        item.name.toLowerCase().includes(searchText.toLowerCase()) ||
        item.manufacturer.toLowerCase().includes(searchText.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchText.toLowerCase())
    )
    : medicalSupplies

  const sortedSupplies = (() => {
    if (expirySort === 'asc') {
      return [...filteredSupplies].sort((a, b) => dayjs(a.expiryDate).unix() - dayjs(b.expiryDate).unix())
    } else if (expirySort === 'desc') {
      return [...filteredSupplies].sort((a, b) => dayjs(b.expiryDate).unix() - dayjs(a.expiryDate).unix())
    }
    return filteredSupplies
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
              Quản lý vật tư y tế
            </Title>
          </Col>
          <Col>
            <Button type='primary' icon={<PlusOutlined />} onClick={() => setIsCreateModalVisible(true)} size='large'>
              Thêm vật tư mới
            </Button>
          </Col>
        </Row>

        <Divider />

        <Row gutter={[16, 16]} className='mb-4'>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Search
              placeholder='Tìm kiếm vật tư y tế'
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
                <Button icon={<ReloadOutlined />} onClick={fetchMedicalSupplies} loading={loading} />
              </Tooltip>
            </Space>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={sortedSupplies}
          rowKey='_id'
          loading={loading}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Tổng cộng ${total} vật tư`,
            onChange: (page, pageSize) => {
              setCurrentPage(page)
              setPageSize(pageSize || 10)
            }
          }}
          bordered
          size='middle'
          scroll={{ x: 'max-content' }}
        />
      </Card>

      <Modal
        title={<Title level={4}>Thêm vật tư y tế mới</Title>}
        open={isCreateModalVisible}
        onCancel={() => setIsCreateModalVisible(false)}
        footer={null}
        width={800}
        destroyOnClose
      >
        <CreateMedicalSupplyForm onSuccess={handleCreateSuccess} onCancel={() => setIsCreateModalVisible(false)} />
      </Modal>

      <Modal
        title={<Title level={4}>Cập nhật vật tư y tế</Title>}
        open={isUpdateModalVisible}
        onCancel={() => {
          setIsUpdateModalVisible(false)
          setSelectedMedicalSupply(null)
        }}
        footer={null}
        width={800}
        destroyOnClose
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

      <Modal
        title={<Title level={4}>Chi tiết vật tư y tế</Title>}
        open={isDetailModalVisible}
        onCancel={() => {
          setIsDetailModalVisible(false)
          setSelectedMedicalSupply(null)
        }}
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
        width={600}
      >
        {selectedMedicalSupply && (
          <Card bordered={false}>
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Space direction='vertical' size='large' style={{ width: '100%' }}>
                  <div>
                    <Text type='secondary'>Tên vật tư</Text>
                    <div>
                      <Text strong style={{ fontSize: '16px' }}>
                        {selectedMedicalSupply.name}
                      </Text>
                    </div>
                  </div>

                  <Row gutter={16}>
                    <Col span={12}>
                      <Text type='secondary'>Số lượng</Text>
                      <div>
                        <Text>
                          {selectedMedicalSupply.quantity} {selectedMedicalSupply.unit}
                        </Text>
                      </div>
                    </Col>
                    <Col span={12}>
                      <Text type='secondary'>Hãng sản xuất</Text>
                      <div>
                        <Text>{selectedMedicalSupply.manufacturer}</Text>
                      </div>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col span={12}>
                      <Text type='secondary'>Ngày sản xuất</Text>
                      <div>
                        <Text>{dayjs(selectedMedicalSupply.manufactureDate).format('DD/MM/YYYY')}</Text>
                      </div>
                    </Col>
                    <Col span={12}>
                      <Text type='secondary'>Ngày hết hạn</Text>
                      <div>
                        <Space>
                          <Text>{dayjs(selectedMedicalSupply.expiryDate).format('DD/MM/YYYY')}</Text>
                          <Tag color={getExpiryStatus(selectedMedicalSupply.expiryDate).color}>
                            {getExpiryStatus(selectedMedicalSupply.expiryDate).text}
                          </Tag>
                        </Space>
                      </div>
                    </Col>
                  </Row>

                  <div>
                    <Text type='secondary'>Nhà cung cấp</Text>
                    <div>
                      <Text>{selectedMedicalSupply.supplier}</Text>
                    </div>
                  </div>

                  <div>
                    <Text type='secondary'>Mô tả</Text>
                    <div>
                      <Text>{selectedMedicalSupply.description || 'Không có mô tả'}</Text>
                    </div>
                  </div>
                </Space>
              </Col>
            </Row>
          </Card>
        )}
      </Modal>
    </div>
  )
}

export default MedicalSuppliesList
