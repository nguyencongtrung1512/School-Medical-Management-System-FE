import React, { useState, useEffect } from 'react'
import { Card, Table, Typography, Space, Tag, Button, Form, message, Popconfirm, Row, Col, Statistic } from 'antd'
import { DeleteOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons'
import { getUserByIdAPI, searchUsersAPI, deleteUserAPI } from '../../../api/user.api'
import Detail from './Detail'
import { toast } from 'react-toastify'
import Update from './Update'
import { TablePaginationConfig } from 'antd/lib/table/interface'

const { Title } = Typography

interface User {
  _id: string
  username: string
  fullName: string
  email: string
  phone: string
  role: 'school-nurse' | 'parent' | 'student'
  status?: 'active' | 'inactive'
  createdAt: string
  lastLogin?: string
  isDeleted?: boolean
}

const UserList: React.FC = () => {
  const [form] = Form.useForm()
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isDetailVisible, setIsDetailVisible] = useState(false)
  const [userDetail, setUserDetail] = useState<User | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  })
  const [searchRole, setSearchRole] = useState<string | undefined>(undefined)
  const [searchKeyword, setSearchKeyword] = useState<string>('')

  useEffect(() => {
    fetchUsers(1, pagination.pageSize)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchRole])

  const fetchUsers = async (pageNum = 1, pageSize = 10) => {
    setLoading(true)
    try {
      const res = await searchUsersAPI(pageNum, pageSize, searchKeyword, searchRole)
      const allUsers = res.pageData || []
      const filteredUsers = allUsers.filter((user: User) => user.role !== 'student')
      setUsers(filteredUsers)
      setPagination((prev) => ({
        ...prev,
        total: res.pageInfo?.totalItems || 0
      }))
    } catch (error) {
      console.error('Error fetching users:', error)
      setUsers([])
      setPagination((prev) => ({ ...prev, total: 0 }))
    }
    setLoading(false)
  }

  const columns = [
    {
      title: 'Họ và tên',
      dataIndex: 'fullName',
      key: 'fullName',
      className: 'text-base'
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      className: 'text-base'
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
      className: 'text-base'
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      className: 'text-base',
      render: (role: string) => {
        const roles = {
          'school-nurse': { color: 'blue', text: 'Y tá' },
          parent: { color: 'green', text: 'Phụ huynh' }
        }
        const { color, text } = roles[role as keyof typeof roles] || { color: 'purple', text: role }
        return (
          <Tag color={color} className='text-base px-3 py-1'>
            {text}
          </Tag>
        )
      }
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isDeleted',
      key: 'isDeleted',
      className: 'text-base',
      render: (isDeleted: boolean) => (
        <Tag color={isDeleted === false ? 'green' : 'red'} className='text-base px-3 py-1'>
          {isDeleted === false ? 'Hoạt động' : 'Ngưng hoạt động'}
        </Tag>
      )
    },
    {
      title: 'Thao tác',
      key: 'action',
      className: 'text-base',
      render: (record: User) => (
        <Space size='middle'>
          <Button type='link' icon={<EditOutlined />} onClick={() => handleEditUser(record)} className='text-base' />
          <Popconfirm
            title='Xóa người dùng'
            description='Bạn có chắc chắn muốn xóa người dùng này?'
            onConfirm={() => handleDeleteUser(record)}
            okText='Xóa'
            cancelText='Hủy'
          >
            <Button type='link' danger icon={<DeleteOutlined />} className='text-base' />
          </Popconfirm>
          <Button type='link' icon={<EyeOutlined />} onClick={() => handleViewDetail(record)} className='text-base' />
        </Space>
      )
    }
  ]

  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    form.setFieldsValue({
      fullName: user.fullName,
      phone: user.phone
    })
    setIsModalVisible(true)
  }

  const handleViewDetail = async (user: User) => {
    setIsDetailVisible(true)
    setLoadingDetail(true)
    try {
      const res = await getUserByIdAPI(user._id)
      setUserDetail(res.data)
    } catch {
      setUserDetail(null)
    }
    setLoadingDetail(false)
  }

  const handleDeleteUser = async (user: User) => {
    try {
      await deleteUserAPI(user._id)
      toast.success('Đã xóa người dùng thành công!')
      fetchUsers(pagination.current, pagination.pageSize)
    } catch {
      message.error('Xóa người dùng thất bại!')
    }
  }

  const stats = {
    total: pagination.total,
    active: users.filter((u) => u.status === 'active').length,
    inactive: users.filter((u) => u.status === 'inactive').length
  }

  const handleTableChange = (pag: TablePaginationConfig) => {
    setPagination((prev) => ({
      ...prev,
      current: pag.current || prev.current,
      pageSize: pag.pageSize || prev.pageSize
    }))
    fetchUsers(pag.current, pag.pageSize)
  }

  return (
    <div className='p-8'>
      <Space direction='vertical' size='large' style={{ width: '100%' }}>
        <Card className='shadow-md rounded-xl'>
          <Title level={4} className='text-2xl !mb-6'>
            Quản lý người dùng
          </Title>
          <Row gutter={[24, 24]}>
            <Col span={8}>
              <Card className='shadow-sm hover:shadow-md transition-shadow'>
                <Statistic
                  title={<span className='text-lg'>Tổng số người dùng</span>}
                  value={stats.total}
                  valueStyle={{ fontSize: '24px' }}
                />
              </Card>
            </Col>
          </Row>
        </Card>

        <Card title={<span className='text-xl'>Danh sách người dùng</span>} className='shadow-md rounded-xl'>
          <div className='flex flex-wrap gap-4 mb-6'>
            <select
              className='border rounded-lg px-4 py-2 text-base min-w-[200px] focus:outline-none focus:ring-2 focus:ring-blue-500'
              value={searchRole || ''}
              onChange={(e) => setSearchRole(e.target.value || undefined)}
            >
              <option value=''>Tất cả vai trò</option>
              <option value='school-nurse'>Y tá</option>
              <option value='parent'>Phụ huynh</option>
            </select>
            <input
              className='border rounded-lg px-4 py-2 text-base min-w-[300px] focus:outline-none focus:ring-2 focus:ring-blue-500'
              placeholder='Tìm kiếm tên, email, SĐT...'
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') fetchUsers(1, pagination.pageSize)
              }}
            />
            <Button type='primary' onClick={() => fetchUsers(1, pagination.pageSize)} className='h-10 px-6 text-base'>
              Tìm kiếm
            </Button>
          </div>
          <Table
            columns={columns}
            dataSource={users}
            rowKey='_id'
            loading={loading}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: true,
              className: 'text-base'
            }}
            onChange={handleTableChange}
            className='custom-table'
            rowClassName='hover:bg-blue-50 transition-colors'
          />
        </Card>
      </Space>
      <Detail
        open={isDetailVisible}
        onCancel={() => setIsDetailVisible(false)}
        user={userDetail}
        loading={loadingDetail}
      />
      <Update
        isModalVisible={isModalVisible}
        setIsModalVisible={setIsModalVisible}
        user={selectedUser}
        onUpdated={() => fetchUsers(pagination.current, pagination.pageSize)}
      />
    </div>
  )
}

export default UserList
