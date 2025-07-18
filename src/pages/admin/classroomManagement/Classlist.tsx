import {
  BookOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  HomeOutlined,
  PlusOutlined,
  TeamOutlined,
  UserOutlined
} from '@ant-design/icons'
import {
  Breadcrumb,
  Button,
  Card,
  Col,
  Divider,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  Tooltip,
  Typography,
  message
} from 'antd'
import type React from 'react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getGradeByIdAPI } from '../../../api/grade.api'
// Đã bỏ getClassesAPI vì chỉ lấy lớp từ currentGrade
import type { Key } from 'react'
import CreateClass from './Create'
import DeleteClass from './Delete'
import UpdateClass from './Update'

const { Title, Text } = Typography

interface Classes {
  _id: string
  gradeId: string
  name: string
  isDeleted: boolean
  studentIds: string[]
  createdAt: string
  updatedAt: string
  students: { _id: string; name: string }[]
  grade: {
    name: string
    positionOrder: number
    deleted: boolean
  }
  totalStudents?: number
  status?: string
  schoolYear: string
}

interface Grade {
  _id: string
  name: string
  positionOrder: number
  isDeleted: boolean
  classIds: string[]
  createdAt: string
  updatedAt: string
}

const ClassList: React.FC = () => {
  const { gradeId } = useParams<{ gradeId: string }>()
  const navigate = useNavigate()
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false)
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false)
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false)
  const [editingClass, setEditingClass] = useState<Classes | null>(null)
  const [deletingClass, setDeletingClass] = useState<Classes | null>(null)
  const [currentGrade, setCurrentGrade] = useState<Grade | null>(null)
  const [classList, setClassList] = useState<Classes[]>([])
  const [selectedYear, setSelectedYear] = useState<string>('')
  // Đã bỏ setLoading, setSchoolYears vì không còn dùng

  const fetchGradeInfo = async () => {
    if (!gradeId) return

    try {
      const response = await getGradeByIdAPI(gradeId)
      if (response && response.data) {
        setCurrentGrade(response.data)
        // Lấy danh sách lớp từ khối và cập nhật vào classList, thêm trường status dựa vào isDeleted
        setClassList(
          (response.data.classes || []).map((cls: Classes) => ({
            ...cls,
            status: cls.isDeleted ? 'Dừng hoạt động' : 'Hoạt động'
          }))
        )
      }
    } catch (error: unknown) {
      console.log('error', error)
      const err = error as { message?: string }
      if (err.message) {
        message.error(err.message)
      } else {
        message.error('Không thể tải thông tin khối')
      }
    }
  }

  useEffect(() => {
    if (gradeId) {
      fetchGradeInfo()
    }
  }, [gradeId])

  const handleAddClass = () => {
    setIsCreateModalVisible(true)
  }

  const handleEditClass = (classes: Classes) => {
    setEditingClass(classes)
    setIsUpdateModalVisible(true)
  }

  const handleDeleteClass = (classes: Classes) => {
    setDeletingClass(classes)
    setIsDeleteModalVisible(true)
  }

  const handleViewStudents = (classes: Classes) => {
    navigate(`/admin/student-management/classes/${classes._id}`)
  }

  const handleCreateOk = () => {
    setIsCreateModalVisible(false)
    fetchGradeInfo() // Refresh lại danh sách lớp bằng cách fetch lại grade
  }

  const handleDeleteOk = () => {
    setIsDeleteModalVisible(false)
    fetchGradeInfo() // Refresh lại danh sách lớp bằng cách fetch lại grade
  }

  const handleUpdateOk = () => {
    setIsUpdateModalVisible(false)
    fetchGradeInfo() // Refresh lại danh sách lớp bằng cách fetch lại grade
  }

  // Statistics
  const stats = {
    totalClasses: classList.length,
    totalStudents: classList.reduce((sum, classItem) => sum + (classItem.totalStudents || 0), 0),
    averageStudentsPerClass:
      classList.length > 0
        ? Math.round(
            (classList.reduce((sum, classItem) => sum + (classItem.totalStudents || 0), 0) / classList.length) * 10
          ) / 10
        : 0,
    activeClasses: classList.filter((c) => !c.isDeleted).length
  }

  // Lọc danh sách lớp theo năm học
  const filteredClassList = useMemo(() => {
    if (!selectedYear) return classList
    return classList.filter((cls) => cls.schoolYear === selectedYear)
  }, [classList, selectedYear])

  const columns = [
    {
      title: (
        <Space>
          <HomeOutlined />
          <span>Thông tin lớp</span>
        </Space>
      ),
      key: 'classInfo',
      render: (_: unknown, record: Classes) => (
        <div>
          <div className='font-semibold text-gray-800 mb-1'>Lớp {record.name}</div>
          <Text type='secondary' className='text-sm'>
            Năm học: {record.schoolYear || 'Chưa xác định'}
          </Text>
        </div>
      )
    },
    {
      title: (
        <Space>
          <UserOutlined />
          <span>Số học sinh</span>
        </Space>
      ),
      dataIndex: 'totalStudents',
      key: 'totalStudents',
      width: 160,
      render: (totalStudents: number) => (
        <div className='text-center'>
          <div className='text-lg font-semibold text-blue-600'>{totalStudents || 0}</div>
          <div className='text-xs text-gray-500'>học sinh</div>
        </div>
      ),
      sorter: (a: Classes, b: Classes) => (a.totalStudents || 0) - (b.totalStudents || 0)
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string, record: Classes) => <Tag color={record.isDeleted ? 'red' : 'green'}>{status}</Tag>,
      filters: [
        { text: 'Hoạt động', value: 'Hoạt động' },
        { text: 'Dừng hoạt động', value: 'Dừng hoạt động' }
      ],
      onFilter: (value: boolean | Key, record: Classes) => record.status === String(value)
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 200,
      render: (_: unknown, record: Classes) => (
        <Space>
          <Tooltip title='Xem danh sách học sinh'>
            <Button type='primary' size='small' icon={<EyeOutlined />} onClick={() => handleViewStudents(record)}>
              Học sinh
            </Button>
          </Tooltip>
          <Tooltip title='Chỉnh sửa lớp'>
            <Button type='default' size='small' icon={<EditOutlined />} onClick={() => handleEditClass(record)}>
              Sửa
            </Button>
          </Tooltip>
          <Tooltip title='Xóa lớp'>
            <Button
              type='primary'
              danger
              size='small'
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteClass(record)}
            >
              Xóa
            </Button>
          </Tooltip>
        </Space>
      )
    }
  ]

  if (!gradeId) {
    return (
      <div className='p-6'>
        <Card className='text-center py-8'>
          <Text type='danger'>Không tìm thấy ID khối</Text>
        </Card>
      </div>
    )
  }

  return (
    <div className='p-6'>
      {/* Breadcrumb */}
      <Card className='mb-4 shadow-sm' style={{ borderRadius: '8px' }}>
        <Breadcrumb
          items={[
            {
              href: '/admin/student-management/grades',
              title: (
                <Space>
                  <BookOutlined />
                  <span>Quản lý khối</span>
                </Space>
              )
            },
            {
              title: (
                <Space>
                  <HomeOutlined />
                  <span>Khối {currentGrade?.name || '...'}</span>
                </Space>
              )
            }
          ]}
        />
      </Card>

      {/* Header Section */}
      <Card className='mb-6 shadow-sm' style={{ borderRadius: '12px' }}>
        <Row gutter={[24, 16]} align='middle'>
          <Col xs={24} md={16}>
            <div>
              <Title level={2} className='mb-2'>
                <HomeOutlined className='mr-3 text-blue-500' />
                Quản lý Lớp học - Khối {currentGrade?.name || 'Đang tải...'}
              </Title>
              <Text type='secondary' className='text-base'>
                Quản lý các lớp học trong khối {currentGrade?.name}
              </Text>
            </div>
          </Col>
          <Col xs={24} md={8} className='text-right'>
            <Button
              type='primary'
              icon={<PlusOutlined />}
              size='large'
              onClick={handleAddClass}
              className='shadow-sm'
              style={{ borderRadius: '8px' }}
            >
              Thêm lớp mới
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Filter Section */}

      {/* Statistics Section */}
      <Row gutter={[16, 16]} className='mb-6'>
        <Col xs={12} sm={6} md={6}>
          <Card className='text-center shadow-sm' style={{ borderRadius: '8px' }}>
            <Statistic
              title='Tổng số lớp'
              value={stats.totalClasses}
              valueStyle={{ color: '#1890ff', fontSize: '24px', fontWeight: 'bold' }}
              prefix={<HomeOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6} md={6}>
          <Card className='text-center shadow-sm' style={{ borderRadius: '8px' }}>
            <Statistic
              title='Tổng học sinh'
              value={stats.totalStudents}
              valueStyle={{ color: '#52c41a', fontSize: '24px', fontWeight: 'bold' }}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6} md={6}>
          <Card className='text-center shadow-sm' style={{ borderRadius: '8px' }}>
            <Statistic
              title='TB HS/lớp'
              value={stats.averageStudentsPerClass}
              precision={1}
              valueStyle={{ color: '#722ed1', fontSize: '24px', fontWeight: 'bold' }}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6} md={6}>
          <Card className='text-center shadow-sm' style={{ borderRadius: '8px' }}>
            <Statistic
              title='Lớp hoạt động'
              value={stats.activeClasses}
              valueStyle={{ color: '#13c2c2', fontSize: '24px', fontWeight: 'bold' }}
              prefix={<BookOutlined />}
            />
          </Card>
        </Col>
      </Row>
      <Card className='mb-6 shadow-sm' style={{ borderRadius: '8px' }}>
        <Row gutter={[16, 16]} align='middle'>
          <Col>
            <span style={{ fontWeight: 600 }}>Năm học: </span>
          </Col>
          <Col>
            <Select
              style={{ width: 200 }}
              placeholder='Chọn năm học'
              allowClear
              value={selectedYear || undefined}
              onChange={(value) => setSelectedYear(value || '')}
            >
              {[...new Set(classList.map((cls) => cls.schoolYear).filter(Boolean))].map((year) => (
                <Select.Option key={year} value={year}>
                  {year}
                </Select.Option>
              ))}
            </Select>
          </Col>
        </Row>
      </Card>
      {/* Table Section */}
      <Card className='shadow-sm' style={{ borderRadius: '12px' }}>
        <div className='mb-4'>
          <Title level={4} className='mb-2'>
            <HomeOutlined className='mr-2' />
            Danh sách lớp học
          </Title>
          <Divider className='mt-2 mb-4' />
        </div>

        <Table
          columns={columns}
          dataSource={filteredClassList}
          rowKey='_id'
          pagination={false}
          className='custom-table'
          scroll={{ x: 800 }}
          locale={{
            emptyText: (
              <div className='py-8'>
                <HomeOutlined className='text-4xl text-gray-300 mb-4' />
                <div className='text-gray-500'>Chưa có lớp học nào trong khối này</div>
                <Button type='link' onClick={handleAddClass} className='mt-2'>
                  Tạo lớp học đầu tiên
                </Button>
              </div>
            )
          }}
        />
      </Card>

      <CreateClass
        isModalVisible={isCreateModalVisible}
        onCancel={() => setIsCreateModalVisible(false)}
        onOk={handleCreateOk}
      />

      <DeleteClass
        isModalVisible={isDeleteModalVisible}
        onCancel={() => setIsDeleteModalVisible(false)}
        onOk={handleDeleteOk}
        deletingClass={deletingClass}
      />

      <UpdateClass
        isModalVisible={isUpdateModalVisible}
        onCancel={() => setIsUpdateModalVisible(false)}
        onOk={handleUpdateOk}
        editingClass={editingClass}
      />

      <style>{`
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

        /* Breadcrumb styling */
        .ant-breadcrumb {
          font-size: 14px;
        }

        .ant-breadcrumb-link {
          color: #666;
        }

        .ant-breadcrumb-link:hover {
          color: #1890ff;
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

export default ClassList
