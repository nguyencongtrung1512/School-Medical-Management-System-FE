import React, { useState, useEffect } from 'react'
import { Card, Table, Button, Space, Typography, Row, Col, Statistic, message, Select } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import { getGradeByIdAPI } from '../../../api/grade.api'
import { getClassesAPI } from '../../../api/classes.api'
import CreateClass from './Create'
import DeleteClass from './Delete'
import UpdateClass from './Update'
import { TablePaginationConfig } from 'antd/lib/table/interface'

const { Title } = Typography

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
  _id: string;
  name: string;
  positionOrder: number;
  isDeleted: boolean;
  classIds: string[];
  createdAt: string;
  updatedAt: string;
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
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  })
  const [selectedYear, setSelectedYear] = useState<string>('')
  const [schoolYears, setSchoolYears] = useState<string[]>([])

  const fetchGradeInfo = async () => {
    if (!gradeId) return

    try {
      const response = await getGradeByIdAPI(gradeId)
      if (response && response.data) {
        setCurrentGrade(response.data)
      }
    } catch (e) {
      console.error('Error fetching grade info:', e)
      message.error('Không thể tải thông tin khối')
    }
  }

  const fetchClasses = async () => {
    if (!gradeId) return

    try {
      setLoading(true)
      const response = await getClassesAPI(10, 1, gradeId, selectedYear || undefined)
      const classesData = response.pageData || []
      console.log('ttt', response.pageData)
      const years = Array.from(new Set((classesData as Classes[]).map((c: Classes) => c.schoolYear).filter(Boolean))) as string[]
      setSchoolYears(years)
      if (Array.isArray(classesData)) {
        const transformedClasses: Classes[] = classesData.map((classItem: Classes) => ({
          ...classItem,
          totalStudents: classItem.totalStudents || 0,
          status: classItem.isDeleted ? 'Đã xóa' : 'Hoạt động'
        }))
        setClassList(transformedClasses)
        setPagination((prev) => ({
          ...prev,
          total: transformedClasses.length
        }))
      }
    } catch (error) {
      console.error('Error fetching classes:', error)
      message.error('Không thể tải danh sách lớp')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (gradeId) {
      fetchGradeInfo()
      fetchClasses()
    }
  }, [gradeId, pagination.current, pagination.pageSize, selectedYear])

  useEffect(() => {
    fetchClasses()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.current, pagination.pageSize, selectedYear])

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

  const handleTableChange = (pagination: TablePaginationConfig) => {
    setPagination((prev) => ({
      ...prev,
      current: pagination.current || prev.current,
      pageSize: pagination.pageSize || prev.pageSize
    }))
    fetchClasses()
  }

  const handleCreateOk = () => {
    setIsCreateModalVisible(false)
    fetchClasses() // Refresh lại danh sách lớp
  }

  const handleDeleteOk = () => {
    setIsDeleteModalVisible(false)
    fetchClasses() // Refresh lại danh sách lớp
  }

  const handleUpdateOk = () => {
    setIsUpdateModalVisible(false)
    fetchClasses() // Refresh lại danh sách lớp
  }

  const columns = [
    {
      title: 'Tên lớp',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Số học sinh',
      dataIndex: 'totalStudents',
      key: 'totalStudents'
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status'
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: unknown, record: Classes) => (
        <Space>
          <Button type='link' icon={<EyeOutlined />} onClick={() => handleViewStudents(record)}>
            Xem học sinh
          </Button>
          <Button type='link' icon={<EditOutlined />} onClick={() => handleEditClass(record)}>
            Sửa
          </Button>
          <Button type='link' danger icon={<DeleteOutlined />} onClick={() => handleDeleteClass(record)}>
            Xóa
          </Button>
        </Space>
      )
    }
  ]

  if (!gradeId) {
    return <div>Không tìm thấy ID khối</div>
  }

  return (
    <div className='p-6 space-y-6'>
      <div className='bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg shadow-md'>
        <div className='flex justify-between items-center mb-6'>
          <div>
            <Title level={3} className='text-2xl'>
              Danh sách lớp - {currentGrade?.name || 'Đang tải...'}
            </Title>
          </div>
          <Button type='primary' icon={<PlusOutlined />} onClick={handleAddClass} className='text-base h-10 px-6'>
            Thêm lớp mới
          </Button>
        </div>

        <div className='mb-4'>
          <Select
            style={{ width: 200 }}
            placeholder='Chọn năm học'
            allowClear
            value={selectedYear || undefined}
            onChange={value => setSelectedYear(value || '')}
          >
            {schoolYears.map(year => (
              <Select.Option key={year} value={year}>{year}</Select.Option>
            ))}
          </Select>
        </div>

        <Row gutter={[16, 16]} className='mb-6'>
          <Col span={8}>
            <Card className='bg-blue-50'>
              <Statistic
                title={<span className='text-base'>Tổng số lớp</span>}
                value={classList.length}
                valueStyle={{ color: '#1890ff', fontSize: '24px' }}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card className='bg-green-50'>
              <Statistic
                title={<span className='text-base'>Tổng số học sinh</span>}
                value={classList.reduce((sum, classItem) => sum + (classItem.totalStudents || 0), 0)}
                valueStyle={{ color: '#3f8600', fontSize: '24px' }}
              />
            </Card>
          </Col>
        </Row>

        <Card className='shadow-md'>
          <Table
            columns={columns}
            dataSource={classList}
            rowKey='_id'
            loading={loading}
            pagination={{
              ...pagination
            }}
            onChange={handleTableChange}
            className='custom-table'
            rowClassName='hover:bg-blue-50 transition-colors'
          />
        </Card>
      </div>

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
    </div>
  )
}

export default ClassList
