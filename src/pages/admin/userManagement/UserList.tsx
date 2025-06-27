'use client'

import type React from 'react'

import { useState, useEffect } from 'react'
import {
  Card,
  Table,
  Typography,
  Space,
  Tag,
  Button,
  Form,
  message,
  Row,
  Col,
  Statistic,
  Input,
  Select,
  Avatar,
  Badge,
  Empty,
  Modal,
  Dropdown,
  Menu
} from 'antd'
import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  UserOutlined,
  SearchOutlined,
  FilterOutlined,
  TeamOutlined,
  UserAddOutlined,
  ReloadOutlined,
  ExportOutlined,
  MoreOutlined
} from '@ant-design/icons'
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table'
import type { FilterValue, SorterResult } from 'antd/es/table/interface'
import { searchUsersAPI, getUserByIdAPI, deleteUserAPI } from '../../../api/user.api'
import Update from './Update'
import Detail from './Detail'
import RegisterNurse from './registerNurse'

const { Title, Text } = Typography
const { Search } = Input
const { Option } = Select

export interface User {
  _id: string
  username: string
  fullName: string
  email: string
  phone: string
  role: 'school-nurse' | 'parent'
  status?: 'active' | 'inactive'
  createdAt: string
  lastLogin?: string
  isDeleted?: boolean
  avatar?: string
  department?: string
}

interface TableParams {
  pagination?: TablePaginationConfig
  sortField?: string
  sortOrder?: string
  filters?: Record<string, FilterValue | null>
}

const UserList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [tableParams, setTableParams] = useState<TableParams>({
    pagination: {
      current: 1,
      pageSize: 10,
      total: 0
    }
  })
  const [searchRole, setSearchRole] = useState<string | undefined>(undefined)
  const [searchKeyword, setSearchKeyword] = useState<string>('')
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isDetailVisible, setIsDetailVisible] = useState(false)
  const [userDetail, setUserDetail] = useState<User | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showRegisterNurseModal, setShowRegisterNurseModal] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [searchRole, JSON.stringify(tableParams)])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await searchUsersAPI(
        tableParams.pagination?.current || 1,
        tableParams.pagination?.pageSize || 10,
        searchKeyword,
        searchRole
      )
      // Dữ liệu trả về dạng { pageData, total }
      const data = res.pageData || res.data?.data?.pageData || []
      const total = res.total || res.data?.data?.total || 0
      setUsers(data)
      setTableParams({
        ...tableParams,
        pagination: {
          ...tableParams.pagination,
          total: total
        }
      })
    } catch (error) {
      setUsers([])
      message.error('Không thể tải danh sách người dùng')
    }
    setLoading(false)
  }

  const getRoleConfig = (role: string) => {
    const configs = {
      'school-nurse': {
        color: 'blue',
        text: 'Y tá trường',
        icon: <UserOutlined />
      },
      parent: {
        color: 'green',
        text: 'Phụ huynh',
        icon: <TeamOutlined />
      }
    }
    return configs[role as keyof typeof configs] || { color: 'purple', text: role, icon: <UserOutlined /> }
  }

  const handleMenuClick = (key: string, record: User) => {
    switch (key) {
      case 'edit':
        handleEditUser(record)
        break
      case 'view':
        handleViewDetail(record)
        break
      case 'delete':
        handleDeleteUser(record)
        break
    }
  }

  const columns: ColumnsType<User> = [
    {
      title: 'Người dùng',
      key: 'user',
      render: (_, record) => {
        const roleConfig = getRoleConfig(record.role)
        return (
          <Space>
            <Badge dot={record.status === 'active' && !record.isDeleted} color='green'>
              <Avatar
                src={record.avatar}
                icon={<UserOutlined />}
                style={{
                  backgroundColor: record.isDeleted ? '#d9d9d9' : roleConfig.color
                }}
              />
            </Badge>
            <div>
              <div className='font-medium text-gray-900'>{record.fullName}</div>
            </div>
          </Space>
        )
      },
      sorter: (a, b) => a.fullName.localeCompare(b.fullName)
    },
    {
      title: 'Thông tin liên hệ',
      key: 'contact',
      render: (_, record) => (
        <Space direction='vertical' size={0}>
          <Text copyable={{ text: record.email }} className='text-sm'>
            {record.email}
          </Text>
          <Text copyable={{ text: record.phone }} type='secondary' className='text-sm'>
            {record.phone}
          </Text>
        </Space>
      )
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => {
        const config = getRoleConfig(role)
        return (
          <Tag color={config.color} icon={config.icon}>
            {config.text}
          </Tag>
        )
      },
      filters: [
        { text: 'Y tá trường', value: 'school-nurse' },
        { text: 'Phụ huynh', value: 'parent' }
      ],
      onFilter: (value, record) => record.role === value
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 120,
      render: (_, record) => {
        const menu = (
          <Menu
            onClick={e => {
              e.domEvent.stopPropagation();
              handleMenuClick(e.key, record);
            }}
          >
            <Menu.Item key='view' icon={<EyeOutlined />}>Xem chi tiết</Menu.Item>
            <Menu.Item key='edit' icon={<EditOutlined />} disabled={record.isDeleted}>Sửa</Menu.Item>
            <Menu.Item key='delete' icon={<DeleteOutlined />} danger disabled={record.isDeleted}>Khóa</Menu.Item>
          </Menu>
        )
        return (
          <Dropdown overlay={menu} trigger={['click']}>
            <Button type='text' icon={<MoreOutlined />} onClick={e => e.stopPropagation()} />
          </Dropdown>
        )
      }
    }
  ]

  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    setIsModalVisible(true)
  }

  const handleAddUser = () => {
    setShowRegisterNurseModal(true)
  }

  const handleViewDetail = async (user: User) => {
    setIsDetailVisible(true)
    setLoadingDetail(true)
    try {
      const res = await getUserByIdAPI(user._id)
      setUserDetail(res.data)
    } catch {
      setUserDetail(null)
      message.error('Không thể tải thông tin chi tiết')
    }
    setLoadingDetail(false)
  }

  const handleDeleteUser = async (user: User) => {
    Modal.confirm({
      title: 'Xác nhận khóa người dùng',
      content: 'Bạn có chắc chắn muốn khóa người dùng này?',
      okText: 'khóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await deleteUserAPI(user._id)
          message.success('Đã khóa người dùng thành công!')
          fetchUsers()
        } catch {
          message.error('khóa người dùng thất bại!')
        }
      }
    })
  }

  const handleTableChange = (
    pagination: TablePaginationConfig,
    filters: Record<string, FilterValue | null>,
    sorter: SorterResult<User> | SorterResult<User>[]
  ) => {
    setTableParams({
      pagination,
      filters,
      ...sorter
    })
  }

  const stats = {
    total: users.length,
    active: users.filter((u) => !u.isDeleted && u.status === 'active').length,
    inactive: users.filter((u) => !u.isDeleted && u.status === 'inactive').length,
    deleted: users.filter((u) => u.isDeleted).length,
    nurses: users.filter((u) => u.role === 'school-nurse').length,
    parents: users.filter((u) => u.role === 'parent').length
  }

  return (
    <div className='p-6 bg-gray-50 min-h-screen'>
      <Space direction='vertical' size='large' style={{ width: '100%' }}>
        {/* Header */}
        <Card className='shadow-sm'>
          <div className='flex justify-between items-center mb-6'>
            <div>
              <Title level={2} className='m-0 flex items-center gap-2'>
                <TeamOutlined className='text-blue-600' />
                Quản lý người dùng
              </Title>
              <Text type='secondary'>Quản lý thông tin người dùng trong hệ thống</Text>
            </div>
            <Space>
              <Button icon={<UserAddOutlined />} type='primary' onClick={handleAddUser}>
                Thêm y tá
              </Button>
              <Button icon={<ExportOutlined />}>Xuất Excel</Button>
              <Button icon={<ReloadOutlined />} onClick={fetchUsers} loading={loading}>
                Làm mới
              </Button>
            </Space>
          </div>

          {/* Statistics */}
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <Card size='small' className='text-center'>
                <Statistic
                  title='Tổng số'
                  value={stats.total}
                  prefix={<TeamOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card size='small' className='text-center'>
                <Statistic title='Y tá' value={stats.nurses} valueStyle={{ color: '#722ed1' }} />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card size='small' className='text-center'>
                <Statistic title='Phụ huynh' value={stats.parents} valueStyle={{ color: '#fa8c16' }} />
              </Card>
            </Col>
          </Row>
        </Card>

        {/* Filters and Search */}
        <Card className='shadow-sm'>
          <Row gutter={[16, 16]} align='middle'>
            <Col xs={24} sm={12} md={8}>
              <Search
                placeholder='Tìm kiếm tên, email, số điện thoại...'
                allowClear
                enterButton={<SearchOutlined />}
                size='large'
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onSearch={fetchUsers}
              />
            </Col>
            <Col xs={24} sm={12} md={4}>
              <Select
                placeholder='Lọc theo vai trò'
                allowClear
                size='large'
                style={{ width: '100%' }}
                value={searchRole}
                onChange={setSearchRole}
                suffixIcon={<FilterOutlined />}
              >
                <Option value='school-nurse'>Y tá trường</Option>
                <Option value='parent'>Phụ huynh</Option>
              </Select>
            </Col>
            <Col xs={24} sm={24} md={12}>
              <div className='flex justify-end'>
                <Space>
                  <Text type='secondary'>
                    Hiển thị {users.length} / {stats.total} người dùng
                  </Text>
                </Space>
              </div>
            </Col>
          </Row>
        </Card>

        {/* Main Table */}
        <Card className='shadow-sm'>
          <Table
            columns={columns}
            dataSource={users}
            rowKey='_id'
            loading={loading}
            pagination={{
              ...tableParams.pagination,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} người dùng`,
              pageSizeOptions: ['10', '20', '50', '100']
            }}
            onChange={handleTableChange}
            locale={{
              emptyText: (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description='Không tìm thấy người dùng nào'
                  children={
                    <Button type='primary' icon={<UserAddOutlined />}>
                      Thêm y tá
                    </Button>
                  }
                />
              )
            }}
            scroll={{ x: 1200 }}
            rowClassName={(record) =>
              record.isDeleted ? 'opacity-60' : 'hover:bg-blue-50 transition-colors cursor-pointer'
            }
            onRow={() => ({
              onClick: () => handleViewDetail(users[0])
            })}
          />
        </Card>
      </Space>

      {/* Modals */}
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
        onUpdated={fetchUsers}
      />
      <RegisterNurse
        open={showRegisterNurseModal}
        onClose={() => setShowRegisterNurseModal(false)}
        onSuccess={() => {
          setShowRegisterNurseModal(false)
          fetchUsers()
        }}
      />
    </div>
  )
}

export default UserList
