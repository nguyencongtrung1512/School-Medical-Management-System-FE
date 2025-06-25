import React, { useEffect, useState } from 'react'
import { Table, TableProps, Input, Space, Button, Modal, Dropdown, Menu } from 'antd'
import { categoryApi, Category } from '../../../api/category.api'
import CreateCategory from './Create'
import EditCategory from './Update'
import { MoreOutlined } from '@ant-design/icons'
import type { MenuProps } from 'antd'
import { toast } from 'react-hot-toast'
import { message } from 'antd'
import { useNavigate } from 'react-router-dom'

const { Search } = Input

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

  const menu = (record: Category) => (
    <Menu onClick={(e) => handleMenuClick(e, record)}>
      <Menu.Item key='view'>Xem chi tiết</Menu.Item>
      <Menu.Item key='edit'>Sửa</Menu.Item>
      <Menu.Item key='delete'>Xóa</Menu.Item>
    </Menu>
  )

  const columns: TableProps<Category>['columns'] = [
    {
      title: 'Tên Category',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description'
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isDeleted',
      key: 'isDeleted',
      render: (isDeleted: boolean) => <span>{isDeleted ? 'Ẩn' : 'Đang hoạt động'}</span>
    },
    {
      title: 'Action',
      key: 'action',
      render: (text, record) => (
        <Space size='middle'>
          <Dropdown overlay={() => menu(record)} trigger={['click']}>
            <MoreOutlined />
          </Dropdown>
        </Space>
      )
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

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Danh sách Category</h1>
      <Space style={{ marginBottom: 16, justifyContent: 'space-between', width: '100%' }}>
        <Search
          placeholder='Tìm kiếm theo tên...'
          onSearch={handleSearch}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 200 }}
          enterButton
        />
        <Button type='primary' onClick={showCreateModal}>
          Thêm Danh mục Mới
        </Button>
      </Space>

      <Table columns={columns} dataSource={categories} loading={loading} rowKey='id' />

      <Modal open={isCreateModalVisible} onCancel={handleCreateModalCancel} footer={null} destroyOnClose={true}>
        <CreateCategory onCategoryCreated={handleCategoryCreated} />
      </Modal>

      <Modal
        title='Sửa Danh mục'
        open={isEditModalVisible}
        onCancel={handleEditModalCancel}
        footer={null}
        destroyOnClose={true}
      >
        <EditCategory categoryId={selectedCategoryId} onCategoryUpdated={handleCategoryUpdated} />
      </Modal>

      <Modal
        title='Xác nhận xóa danh mục'
        open={isDeleteModalVisible}
        onOk={handleDeleteOk}
        onCancel={handleDeleteCancel}
        okText='Xóa'
        okType='danger'
        cancelText='Hủy'
      >
        <p>Bạn có chắc chắn muốn xóa danh mục này không?</p>
        <p className='text-red-500'>Lưu ý: Hành động này không thể hoàn tác!</p>
      </Modal>
    </div>
  )
}

export default CategoryList
