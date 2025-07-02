'use client'

import type React from 'react'

import { useState, useEffect } from 'react'
import { Card, Table, Button, Space, Typography, Row, Col, Statistic, message, Divider, Tag, Tooltip } from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  BookOutlined,
  TeamOutlined,
  HomeOutlined,
  NumberOutlined
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import CreateGrade from './Create'
import UpdateGrade from './Update'
import DeleteGrade from './Delete'
import { getGradesAPI } from '../../../api/grade.api'

const { Title, Text } = Typography

interface Grade {
  _id: string
  name: string
  positionOrder: number
  isDeleted: boolean
  classIds: string[]
  description?: string
  totalClasses?: number
  totalStudents?: number
  status?: string
}

const GradeList: React.FC = () => {
  const navigate = useNavigate()
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false)
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false)
  const [editingGrade, setEditingGrade] = useState<Grade | null>(null)
  const [deletingGrade, setDeletingGrade] = useState<Grade | null>(null)
  const [grades, setGrades] = useState<Grade[]>([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  })

  const fetchGrades = async () => {
    try {
      setLoading(true)
      const response = await getGradesAPI(pagination.pageSize, pagination.current)
      const responseData = response?.pageData || {}

      if (!responseData || !Array.isArray(responseData)) {
        console.error(
          'Invalid API response structure: Expected responseData and responseData.pageData to be an array.',
          responseData
        )
        message.error('API response format is invalid')
        setGrades([])
        return
      }

      const gradesData = responseData

      const transformedGrades = gradesData.map((grade: Grade) => ({
        ...grade,
        positionOrder:
          typeof grade.positionOrder === 'string' ? Number.parseInt(grade.positionOrder) : grade.positionOrder,
        totalClasses: grade.classIds ? grade.classIds.length : 0,
        description: grade.description || `Khối ${grade.name}`
      }))

      // Filter out grades where isDeleted is true
      const activeGrades = transformedGrades.filter((grade) => !grade.isDeleted)

      setGrades(activeGrades)

      if (response.pageInfo) {
        setPagination({
          current: Number.parseInt(response.pageInfo.pageNum) || 1,
          pageSize: Number.parseInt(response.pageInfo.pageSize) || 10,
          total: response.pageInfo.totalItems || transformedGrades.length
        })
      } else {
        console.warn('API response did not contain pageInfo')
      }
    } catch (error) {
      console.error('Error fetching grades:', error)
      message.error('Không thể tải danh sách khối')
      setGrades([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGrades()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.current, pagination.pageSize])

  const handleViewClasses = (grade: Grade) => {
    navigate(`/admin/student-management/grades/${grade._id}/classes`)
  }

  const handleAddGrade = () => {
    setIsCreateModalVisible(true)
  }

  const handleEditGrade = (grade: Grade) => {
    setEditingGrade(grade)
    setIsUpdateModalVisible(true)
  }

  const handleDeleteGrade = (grade: Grade) => {
    setDeletingGrade(grade)
  }

  const handleCreateOk = () => {
    fetchGrades()
    setIsCreateModalVisible(false)
  }

  const handleUpdateOk = () => {
    fetchGrades()
    setIsUpdateModalVisible(false)
    setEditingGrade(null)
  }

  const handleDeleteOk = () => {
    fetchGrades()
    setDeletingGrade(null)
  }

  const handleTableChange = (pagination: any) => {
    setPagination((prev) => ({
      ...prev,
      current: pagination.current,
      pageSize: pagination.pageSize
    }))
  }

  // Statistics
  const stats = {
    totalGrades: grades.length,
    totalClasses: grades.reduce((sum, grade) => sum + (grade.totalClasses || 0), 0),
    averageClassesPerGrade:
      grades.length > 0
        ? Math.round((grades.reduce((sum, grade) => sum + (grade.totalClasses || 0), 0) / grades.length) * 10) / 10
        : 0
  }

  const columns = [
    {
      title: (
        <Space>
          <BookOutlined />
          <span>Thông tin khối</span>
        </Space>
      ),
      key: 'gradeInfo',
      render: (_, record: Grade) => (
        <div>
          <div className='font-semibold text-gray-800 mb-1'>Khối {record.name}</div>
        </div>
      )
    },
    {
      title: (
        <Space>
          <NumberOutlined />
          <span>Thứ tự</span>
        </Space>
      ),
      dataIndex: 'positionOrder',
      key: 'positionOrder',
      width: 140,
      render: (order: number) => (
        <Tag color='blue' className='text-center min-w-[40px]'>
          {order}
        </Tag>
      ),
      sorter: (a: Grade, b: Grade) => a.positionOrder - b.positionOrder
    },
    {
      title: (
        <Space>
          <HomeOutlined />
          <span>Số lớp</span>
        </Space>
      ),
      dataIndex: 'totalClasses',
      key: 'totalClasses',
      width: 140,
      render: (totalClasses: number) => (
        <div className='text-center'>
          <div className='text-lg font-semibold text-blue-600'>{totalClasses || 0}</div>
        </div>
      ),
      sorter: (a: Grade, b: Grade) => (a.totalClasses || 0) - (b.totalClasses || 0)
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 200,
      render: (_: unknown, record: Grade) => (
        <Space>
          <Tooltip title='Xem danh sách lớp'>
            <Button type='primary' size='small' icon={<EyeOutlined />} onClick={() => handleViewClasses(record)}>
              Xem lớp
            </Button>
          </Tooltip>
          <Tooltip title='Chỉnh sửa khối'>
            <Button type='default' size='small' icon={<EditOutlined />} onClick={() => handleEditGrade(record)}>
              Sửa
            </Button>
          </Tooltip>
          <Tooltip title='Xóa khối'>
            <Button
              type='primary'
              danger
              size='small'
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteGrade(record)}
            >
              Xóa
            </Button>
          </Tooltip>
        </Space>
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
                <BookOutlined className='mr-3 text-blue-500' />
                Quản lý Khối học
              </Title>
              <Text type='secondary' className='text-base'>
                Quản lý các khối học và lớp học trong hệ thống
              </Text>
            </div>
          </Col>
          <Col xs={24} md={8} className='text-right'>
            <Button
              type='primary'
              icon={<PlusOutlined />}
              size='large'
              onClick={handleAddGrade}
              className='shadow-sm'
              style={{ borderRadius: '8px' }}
            >
              Thêm khối mới
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Statistics Section */}
      <Row gutter={[16, 16]} className='mb-6'>
        <Col xs={12} sm={8} md={8}>
          <Card className='text-center shadow-sm' style={{ borderRadius: '8px' }}>
            <Statistic
              title='Tổng số khối'
              value={stats.totalGrades}
              valueStyle={{ color: '#1890ff', fontSize: '24px', fontWeight: 'bold' }}
              prefix={<BookOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={8}>
          <Card className='text-center shadow-sm' style={{ borderRadius: '8px' }}>
            <Statistic
              title='Tổng số lớp'
              value={stats.totalClasses}
              valueStyle={{ color: '#52c41a', fontSize: '24px', fontWeight: 'bold' }}
              prefix={<HomeOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8} md={8}>
          <Card className='text-center shadow-sm' style={{ borderRadius: '8px' }}>
            <Statistic
              title='TB lớp/khối'
              value={stats.averageClassesPerGrade}
              precision={1}
              valueStyle={{ color: '#722ed1', fontSize: '24px', fontWeight: 'bold' }}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Table Section */}
      <Card className='shadow-sm' style={{ borderRadius: '12px' }}>
        <div className='mb-4'>
          <Title level={4} className='mb-2'>
            <BookOutlined className='mr-2' />
            Danh sách khối học
          </Title>
          <Divider className='mt-2 mb-4' />
        </div>

        <Table
          columns={columns}
          dataSource={grades}
          rowKey='_id'
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} khối`,
            pageSizeOptions: ['5', '10', '20', '50']
          }}
          onChange={handleTableChange}
          className='custom-table'
          scroll={{ x: 800 }}
          locale={{
            emptyText: (
              <div className='py-8'>
                <BookOutlined className='text-4xl text-gray-300 mb-4' />
                <div className='text-gray-500'>Chưa có khối học nào</div>
                <Button type='link' onClick={handleAddGrade} className='mt-2'>
                  Tạo khối học đầu tiên
                </Button>
              </div>
            )
          }}
        />
      </Card>

      <CreateGrade
        isModalVisible={isCreateModalVisible}
        onCancel={() => setIsCreateModalVisible(false)}
        onOk={handleCreateOk}
      />

      <UpdateGrade
        isModalVisible={isUpdateModalVisible}
        onCancel={() => {
          setIsUpdateModalVisible(false)
          setEditingGrade(null)
        }}
        onOk={handleUpdateOk}
        editingGrade={editingGrade}
      />

      <DeleteGrade grade={deletingGrade} onOk={handleDeleteOk} onCancel={() => setDeletingGrade(null)} />

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

export default GradeList
