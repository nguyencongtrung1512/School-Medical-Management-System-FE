import React, { useState, useEffect } from 'react'
import { Card, Table, Button, Space, Typography, Row, Col, Statistic, message } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import CreateGrade from './Create'
import UpdateGrade from './Update'
import DeleteGrade from './Delete'
import { getGradesAPI } from '../../../api/grade.api'

const { Title } = Typography

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

      const transformedGrades = gradesData.map((grade: any) => ({
        ...grade,
        totalClasses: grade.classIds ? grade.classIds.length : 0,
        description: grade.description || `Khối ${grade.name}`,
        status: grade.isDeleted ? 'Đã xóa' : 'Hoạt động'
      }))

      setGrades(transformedGrades)

      if (response.pageInfo) {
        setPagination({
          current: parseInt(response.pageInfo.pageNum) || 1,
          pageSize: parseInt(response.pageInfo.pageSize) || 10,
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

  const columns = [
    {
      title: 'Tên khối',
      dataIndex: 'name',
      key: 'name',
      className: 'text-base'
    },
    {
      title: 'Thứ tự',
      dataIndex: 'positionOrder',
      key: 'positionOrder',
      className: 'text-base'
    },
    {
      title: 'Số lớp',
      className: 'text-base',
      dataIndex: 'totalClasses',
      key: 'totalClasses'
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      className: 'text-base',
      key: 'status'
    },
    {
      title: 'Thao tác',
      className: 'text-base',
      key: 'action',
      render: (_: unknown, record: Grade) => (
        <Space>
          <Button type='link' icon={<EyeOutlined />} onClick={() => handleViewClasses(record)}>
            Xem lớp
          </Button>
          <Button type='link' icon={<EditOutlined />} onClick={() => handleEditGrade(record)}>
            Sửa
          </Button>
          <Button type='link' danger icon={<DeleteOutlined />} onClick={() => handleDeleteGrade(record)}>
            Xóa
          </Button>
        </Space>
      )
    }
  ]

  return (
    <div className='p-6 space-y-6'>
      <div className='bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg shadow-md'>
        <div className='flex justify-between items-center mb-6'>
          <Title level={3} className='text-2xl'>Quản lý khối</Title>
          <Button type='primary' icon={<PlusOutlined />} onClick={handleAddGrade} className='text-base h-10 px-6'>
            Thêm khối mới
          </Button>
        </div>

        <Row gutter={[16, 16]} className='mb-6'>
          <Col span={8}>
            <Card className='bg-blue-50'>
              <Statistic
                title={<span className='text-base'>Tổng số khối</span>}
                value={grades.length}
                valueStyle={{ color: '#1890ff', fontSize: '24px' }}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card className='bg-green-50'>
              <Statistic
                title={<span className='text-base'>Tổng số lớp</span>}
                value={grades.reduce((sum, grade) => sum + (grade.totalClasses || 0), 0)}
                valueStyle={{ color: '#3f8600', fontSize: '24px' }}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card className='bg-purple-50'>
              <Statistic
                title={<span className='text-base'>Tổng số học sinh</span>}
                value={grades.reduce((sum, grade) => sum + (grade.totalStudents || 0), 0)}
                valueStyle={{ color: '#722ed1', fontSize: '24px' }}
              />
            </Card>
          </Col>
        </Row>

        <Card className='shadow-md'>
          <Table
            columns={columns}
            dataSource={grades}
            rowKey='_id'
            loading={loading}
            pagination={{
              ...pagination,
              className: 'text-base'
            }}
            onChange={handleTableChange}
            className='custom-table'
            rowClassName='hover:bg-blue-50 transition-colors'
          />
        </Card>
      </div>

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
    </div>
  )
}

export default GradeList
