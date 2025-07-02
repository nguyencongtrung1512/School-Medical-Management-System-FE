'use client'

import { useEffect, useState } from 'react'
import { Table, Input, Space, Button, Modal, Dropdown, Card, Typography, Divider, Tag, Row, Col, Statistic } from 'antd'
import type { TableProps, MenuProps } from 'antd'
import {
  SearchOutlined,
  PlusOutlined,
  MoreOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  FolderOutlined,
  AppstoreOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons'
import { categoryApi, type Category } from '../../../api/category.api'
import CreateCategory from './Create'
import EditCategory from './Update'
import { toast } from 'react-hot-toast'
import { message } from 'antd'
import { useNavigate } from 'react-router-dom'

const { Search } = Input
const { Title, Text, Paragraph } = Typography

type MenuItemClickEvent = Parameters<Required<MenuProps>['onClick']>[0]

function CategoryList() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchText, setSearchText] = useState<string>('')
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false)
  const [isEditModalVisible, setIsEditModalVisible] = useState(false)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false)
  const [categoryIdToDelete, setCategoryIdToDelete] = useState<string | null>(null)
  const navigate = useNavigate()

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const response = await categoryApi.searchCategoryApi({
        page: 1,
        size: 10,
        search: searchText
      })
      if (response.pageData) {
        setCategories(response.pageData)
      } else {
        console.error('Invalid category search response:', response)
        setCategories([])
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [searchText])

  const handleSearch = (value: string) => {
    setSearchText(value)
  }

  const showCreateModal = () => {
    setIsCreateModalVisible(true)
  }

  const handleCreateModalCancel = () => {
    setIsCreateModalVisible(false)
  }

  const handleCategoryCreated = () => {
    setIsCreateModalVisible(false)
    fetchCategories()
  }

  const showEditModal = (categoryId: string) => {
    setSelectedCategoryId(categoryId)
    setIsEditModalVisible(true)
  }

  const handleEditModalCancel = () => {
    setIsEditModalVisible(false)
    setSelectedCategoryId(null)
  }

  const handleCategoryUpdated = () => {
    setIsEditModalVisible(false)
    fetchCategories()
  }

  const handleMenuClick = (e: MenuItemClickEvent, record: Category) => {
    console.log('Click on menu item:', e.key, record)
    if (e.key === 'view') {
      navigate(`/admin/category/${record._id}/blogs`)
    } else if (e.key === 'edit') {
      showEditModal(record._id)
    } else if (e.key === 'delete') {
      setCategoryIdToDelete(record._id)
      setIsDeleteModalVisible(true)
    } else if (e.key === 'create-blog') {
      navigate(`/admin/category/${record._id}/blogs/create`)
    }
  }

  const getMenuItems = (record: Category): MenuProps['items'] => [
    {
      key: 'view',
      icon: <EyeOutlined />,
      label: 'Xem chi tiết'
    },
    {
      key: 'edit',
      icon: <EditOutlined />,
      label: 'Chỉnh sửa'
    },
    {
      type: 'divider'
    },
    {
      key: 'delete',
      icon: <DeleteOutlined />,
      label: 'Xóa danh mục',
      danger: true
    }
  ]

  const handleDeleteOk = async () => {
    if (categoryIdToDelete) {
      try {
        await categoryApi.deleteCategoryApi(categoryIdToDelete)
        toast.success('Ẩn danh mục thành công!')
        fetchCategories()
      } catch (error) {
        console.error('Error deleting category:', error)
        message.error('Xóa danh mục thất bại.')
      } finally {
        setIsDeleteModalVisible(false)
        setCategoryIdToDelete(null)
      }
    }
  }

  const handleDeleteCancel = () => {
    setIsDeleteModalVisible(false)
    setCategoryIdToDelete(null)
  }

  // Statistics
  const stats = {
    total: categories.length,
    active: categories.filter((cat) => !cat.isDeleted).length,
    hidden: categories.filter((cat) => cat.isDeleted).length
  }

  const columns: TableProps<Category>['columns'] = [
    {
      title: (
        <Space>
          <FolderOutlined />
          <span>Tên danh mục</span>
        </Space>
      ),
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: Category) => (
        <div>
          <Text strong className='text-gray-800'>
            {name}
          </Text>
          {record.isDeleted && (
            <Tag color='red' size='small' className='ml-2'>
              Đã ẩn
            </Tag>
          )}
        </div>
      )
    },
    {
      title: (
        <Space>
          <EditOutlined />
          <span>Mô tả</span>
        </Space>
      ),
      dataIndex: 'description',
      key: 'description',
      render: (description: string) => (
        <Paragraph ellipsis={{ rows: 2, expandable: true, symbol: 'Xem thêm' }} className='mb-0 text-gray-600'>
          {description || 'Chưa có mô tả'}
        </Paragraph>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isDeleted',
      key: 'isDeleted',
      width: 120,
      render: (isDeleted: boolean) => (
        <Tag color={isDeleted ? 'red' : 'green'} icon={isDeleted ? <ExclamationCircleOutlined /> : undefined}>
          {isDeleted ? 'Đã ẩn' : 'Hoạt động'}
        </Tag>
      ),
      filters: [
        { text: 'Hoạt động', value: false },
        { text: 'Đã ẩn', value: true }
      ],
      onFilter: (value, record) => record.isDeleted === value
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 80,
      render: (_, record) => (
        <Dropdown
          menu={{
            items: getMenuItems(record),
            onClick: (e) => handleMenuClick(e, record)
          }}
          trigger={['click']}
          placement='bottomRight'
        >
          <Button type='text' icon={<MoreOutlined />} className='hover:bg-gray-100' />
        </Dropdown>
      )
    }
  ]

  return (
    <div className='p-6'>
      {/* Header Section */}
      <Card className='mb-6 shadow-sm' style={{ borderRadius: '12px' }}>
        <Row gutter={[24, 16]} align='middle'>
          <Col xs={24} md={16}>
            <div>
              <Title level={2} className='mb-2'>
                <AppstoreOutlined className='mr-3 text-blue-500' />
                Quản lý Danh mục
              </Title>
              <Text type='secondary' className='text-base'>
                Quản lý các danh mục blog và bài viết
              </Text>
            </div>
          </Col>
          <Col xs={24} md={8} className='text-right'>
            <Button
              type='primary'
              icon={<PlusOutlined />}
              size='large'
              onClick={showCreateModal}
              className='shadow-sm'
              style={{ borderRadius: '8px' }}
            >
              Thêm Danh mục
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Statistics Section */}
      {/* <Row gutter={[16, 16]} className='mb-6'>
        <Col xs={8} sm={8} md={8}>
          <Card className='text-center shadow-sm' style={{ borderRadius: '8px' }}>
            <Statistic
              title='Tổng số'
              value={stats.total}
              valueStyle={{ color: '#1890ff', fontSize: '24px', fontWeight: 'bold' }}
              prefix={<AppstoreOutlined />}
            />
          </Card>
        </Col>
        <Col xs={8} sm={8} md={8}>
          <Card className='text-center shadow-sm' style={{ borderRadius: '8px' }}>
            <Statistic
              title='Hoạt động'
              value={stats.active}
              valueStyle={{ color: '#52c41a', fontSize: '24px', fontWeight: 'bold' }}
              prefix={<FolderOutlined />}
            />
          </Card>
        </Col>
        <Col xs={8} sm={8} md={8}>
          <Card className='text-center shadow-sm' style={{ borderRadius: '8px' }}>
            <Statistic
              title='Đã ẩn'
              value={stats.hidden}
              valueStyle={{ color: '#ff4d4f', fontSize: '24px', fontWeight: 'bold' }}
              prefix={<ExclamationCircleOutlined />}
            />
          </Card>
        </Col>
      </Row> */}

      {/* Table Section */}
      <Card className='shadow-sm' style={{ borderRadius: '12px' }}>
        <div className='mb-4'>
          <Row gutter={[16, 16]} align='middle' justify='space-between'>
            <Col>
              <Title level={4} className='mb-0'>
                <FolderOutlined className='mr-2' />
                Danh sách danh mục
              </Title>
            </Col>
            <Col>
              <Search
                placeholder='Tìm kiếm theo tên danh mục...'
                onSearch={handleSearch}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: 300 }}
                enterButton={<SearchOutlined />}
                size='large'
                allowClear
              />
            </Col>
          </Row>
          <Divider className='mt-4 mb-4' />
        </div>

        <Table
          columns={columns}
          dataSource={categories}
          loading={loading}
          rowKey='id'
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} danh mục`,
            pageSizeOptions: ['5', '10', '20', '50']
          }}
          scroll={{ x: 800 }}
          className='custom-table'
          locale={{
            emptyText: (
              <div className='py-8'>
                <AppstoreOutlined className='text-4xl text-gray-300 mb-4' />
                <div className='text-gray-500'>Chưa có danh mục nào</div>
                <Button type='link' onClick={showCreateModal} className='mt-2'>
                  Tạo danh mục đầu tiên
                </Button>
              </div>
            )
          }}
        />
      </Card>

      {/* Create Modal */}
      <Modal
        title={
          <div className='flex items-center'>
            <PlusOutlined className='mr-2 text-blue-500' />
            <span>Tạo Danh mục Mới</span>
          </div>
        }
        open={isCreateModalVisible}
        onCancel={handleCreateModalCancel}
        footer={null}
        destroyOnClose={true}
        width={600}
      >
        <Divider className='mt-4 mb-6' />
        <CreateCategory onCategoryCreated={handleCategoryCreated} />
      </Modal>

      {/* Edit Modal */}
      <Modal
        title={
          <div className='flex items-center'>
            <EditOutlined className='mr-2 text-orange-500' />
            <span>Chỉnh sửa Danh mục</span>
          </div>
        }
        open={isEditModalVisible}
        onCancel={handleEditModalCancel}
        footer={null}
        destroyOnClose={true}
        width={600}
      >
        <Divider className='mt-4 mb-6' />
        <EditCategory categoryId={selectedCategoryId} onCategoryUpdated={handleCategoryUpdated} />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        title={
          <div className='flex items-center'>
            <ExclamationCircleOutlined className='mr-2 text-red-500' />
            <span>Xác nhận xóa danh mục</span>
          </div>
        }
        open={isDeleteModalVisible}
        onOk={handleDeleteOk}
        onCancel={handleDeleteCancel}
        okText='Xóa'
        okType='danger'
        cancelText='Hủy'
        okButtonProps={{ size: 'large' }}
        cancelButtonProps={{ size: 'large' }}
      >
        <Divider className='mt-4 mb-4' />
        <div className='py-4'>
          <p className='text-gray-700 mb-3'>Bạn có chắc chắn muốn xóa danh mục này không?</p>
          <div className='bg-red-50 border border-red-200 rounded-lg p-3'>
            <p className='text-red-600 mb-0 font-medium'>
              <ExclamationCircleOutlined className='mr-2' />
              Lưu ý: Hành động này không thể hoàn tác!
            </p>
          </div>
        </div>
      </Modal>

      <style jsx global>{`
        .custom-table .ant-table-thead > tr > th {
          background-color: #fafafa;
          font-weight: 600;
          border-bottom: 2px solid #f0f0f0;
        }

        .custom-table .ant-table-tbody > tr:hover > td {
          background-color: #f0f9ff;
        }

        .custom-table .ant-table-tbody > tr > td {
          padding: 16px;
        }

        /* Dropdown menu styling */
        .ant-dropdown-menu {
          border-radius: 8px;
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
        }

        .ant-dropdown-menu-item {
          border-radius: 6px;
          margin: 2px 4px;
        }

        /* Custom scrollbar */
        .ant-table-body::-webkit-scrollbar {
          height: 6px;
        }

        .ant-table-body::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 3px;
        }

        .ant-table-body::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }

        .ant-table-body::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }

        /* Modal styling */
        .ant-modal-header {
          border-bottom: 1px solid #f0f0f0;
          padding: 20px 24px 16px;
        }

        .ant-modal-body {
          padding: 0 24px 24px;
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .ant-statistic-content {
            font-size: 18px !important;
          }
        }
      `}</style>
    </div>
  )
}

export default CategoryList
