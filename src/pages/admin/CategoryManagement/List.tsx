import React, { useEffect, useState } from 'react'
import { Table, TableProps, Input, Space, Button, Modal, Dropdown, Menu } from 'antd'
import { categoryApi, Category } from '../../../api/category.api'
import CreateCategory from './Create'
import EditCategory from './Update'
import { MoreOutlined } from '@ant-design/icons'
import type { MenuProps } from 'antd'
import { toast } from 'react-hot-toast'
import { message } from 'antd'

const { Search } = Input

type MenuItemClickEvent = Parameters<Required<MenuProps>['onClick']>[0]

function CategoryList() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchText, setSearchText] = useState<string>('')
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false)
  const [isViewModalVisible, setIsViewModalVisible] = useState(false)
  const [isEditModalVisible, setIsEditModalVisible] = useState(false)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)

  // Thêm state cho modal xóa tùy chỉnh
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [categoryIdToDelete, setCategoryIdToDelete] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true)
      // Gọi API tìm kiếm category với phân trang mặc định và thêm từ khóa tìm kiếm
      const response = await categoryApi.searchCategoryApi({
        page: 1,
        size: 10,
        search: searchText
      })
      // Giả sử response.data.content chứa danh sách categories
      if (response.pageData !== null) {
        setCategories(response.pageData)
      } else {
        console.error('Invalid category search response:', response)
        setCategories([]) // Đảm bảo state là mảng rỗng nếu response không hợp lệ
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [searchText]) // Thêm searchText vào dependency array để fetch lại khi từ khóa thay đổi

  // Hàm xử lý khi người dùng nhập vào ô tìm kiếm
  const handleSearch = (value: string) => {
    setSearchText(value)
  }

  // Hàm cho Modal tạo mới
  const showCreateModal = () => {
    setIsCreateModalVisible(true)
  }

  const handleCreateModalCancel = () => {
    setIsCreateModalVisible(false)
  }

  const handleCategoryCreated = () => {
    setIsCreateModalVisible(false)
    fetchCategories() // Fetch lại danh sách category sau khi tạo
  }

  // Hàm cho Modal xem chi tiết
  const showViewModal = (categoryId: string) => {
    setSelectedCategoryId(categoryId)
    setIsViewModalVisible(true)
  }

  const handleViewModalClose = () => {
    setIsViewModalVisible(false)
    setSelectedCategoryId(null) // Reset ID khi đóng modal
  }

  // Hàm cho Modal sửa
  const showEditModal = (categoryId: string) => {
    setSelectedCategoryId(categoryId)
    setIsEditModalVisible(true)
  }

  const handleEditModalCancel = () => {
    setIsEditModalVisible(false)
    setSelectedCategoryId(null) // Reset ID khi đóng modal
  }

  const handleCategoryUpdated = () => {
    setIsEditModalVisible(false)
    fetchCategories() // Fetch lại danh sách category sau khi cập nhật
  }

  // Hàm xử lý khi click vào các mục trong dropdown menu
  const handleMenuClick = (e: MenuItemClickEvent, record: Category) => {
    console.log('Click on menu item:', e.key, record)
    if (e.key === 'view') {
      showViewModal(record._id)
    } else if (e.key === 'edit') {
      showEditModal(record._id)
    } else if (e.key === 'delete') {
      // Mở modal xóa tùy chỉnh và lưu ID
      setCategoryIdToDelete(record._id);
      setIsDeleteModalVisible(true);
    }
  }

  // Định nghĩa menu cho dropdown
  const menu = (record: Category) => (
    <Menu onClick={(e) => handleMenuClick(e, record)}>
      <Menu.Item key='view'>Xem chi tiết</Menu.Item>
      <Menu.Item key='edit'>Sửa</Menu.Item>
      <Menu.Item key='delete'>Xóa</Menu.Item>
    </Menu>
  )

  // Định nghĩa cột cho bảng Ant Design
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
          {/* Sử dụng Dropdown component */}
          <Dropdown overlay={() => menu(record)} trigger={['click']}>
            <MoreOutlined />
          </Dropdown>
        </Space>
      )
    }
  ]

  // Hàm xử lý khi xác nhận xóa
  const handleDeleteOk = async () => {
    if (categoryIdToDelete) {
      try {
        await categoryApi.deleteCategoryApi(categoryIdToDelete);
        toast.success('Ẩn danh mục thành công!');
        fetchCategories(); // Fetch lại danh sách sau khi xóa
      } catch (error) {
        console.error('Error deleting category:', error);
        message.error('Xóa danh mục thất bại.');
      } finally {
        setIsDeleteModalVisible(false);
        setCategoryIdToDelete(null);
      }
    }
  };

  // Hàm xử lý khi hủy xóa
  const handleDeleteCancel = () => {
    setIsDeleteModalVisible(false);
    setCategoryIdToDelete(null);
  };

  return (
    <div>
      <h1>Danh sách Category</h1>
      <Space style={{ marginBottom: 16, justifyContent: 'space-between', width: '100%' }}>
        {' '}
        {/* Sử dụng justifyContent để đẩy nút sang phải */}
        <Search
          placeholder='Tìm kiếm theo tên...'
          onSearch={handleSearch}
          onChange={(e) => setSearchText(e.target.value)} // Cập nhật state ngay khi gõ
          style={{ width: 200 }}
          enterButton
        />
        <Button type='primary' onClick={showCreateModal}>
          {' '}
          {/* Thêm nút tạo mới */}
          Thêm Danh mục Mới
        </Button>
      </Space>
      <Table columns={columns} dataSource={categories} loading={loading} rowKey='id' />

      {/* Modal tạo danh mục mới */}
      <Modal
        title='Tạo Danh mục Mới'
        visible={isCreateModalVisible}
        onCancel={handleCreateModalCancel}
        footer={null} // Ẩn footer mặc định của Modal
        destroyOnClose={true} // Tự động destroy form khi đóng modal
      >
        <CreateCategory onCategoryCreated={handleCategoryCreated} /> {/* Render component tạo mới và truyền callback */}
      </Modal>

      {/* Modal sửa danh mục */}
      <Modal
        title='Sửa Danh mục'
        visible={isEditModalVisible}
        onCancel={handleEditModalCancel}
        footer={null}
        destroyOnClose={true}
      >
        <EditCategory categoryId={selectedCategoryId} onCategoryUpdated={handleCategoryUpdated} />
      </Modal>

      {/* Modal xóa danh mục tùy chỉnh */}
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
