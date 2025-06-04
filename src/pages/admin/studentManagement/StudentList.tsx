import React, { useState, useEffect } from 'react'
import { Card, Table, Button, Tag, Typography, Row, Col, Spin, Popconfirm, Space } from 'antd'
import { InfoCircleOutlined, PlusOutlined, UserOutlined, DeleteOutlined } from '@ant-design/icons'
import { useParams } from 'react-router-dom'
import { getClassByIdAPI } from '../../../api/classes.api'
import { getStudentByIdAPI, deleteStudentAPI } from '../../../api/student.api'
import StudentDetail from './Studentdetail'
import CreateClass from './Create'
import { formatDate } from '../../../utils/utils'
import { toast } from 'react-hot-toast'

const { Title } = Typography

interface Student {
  _id: string
  fullName: string
  studentCode: string
  gender: string
  dob: string
  classId: string
  avatar: string
  position: number
  parentName?: string
  parentPhone?: string
  isDeleted?: boolean
}

interface Classroom {
  id: string
  gradeId: string
  name: string
  teacher: string
  totalStudents: number
}

const StudentList: React.FC = () => {
  const { classId } = useParams<{ classId: string }>()
  const [studentList, setStudentList] = useState<Student[]>([])
  const [currentClassroom, setCurrentClassroom] = useState<Classroom | null>(null)
  const [studentDetail, setStudentDetail] = useState<Student | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false)
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false)

  useEffect(() => {
    fetchClassData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId])

  const fetchClassData = async () => {
    if (!classId) return
    try {
      const res = await getClassByIdAPI(classId)
      setCurrentClassroom(res.data)
      const activeStudents = (res.data.students || []).filter((student: Student) => !student.isDeleted)
      setStudentList(activeStudents)
    } catch {
      setCurrentClassroom(null)
      setStudentList([])
    }
  }

  const handleViewDetail = async (student: Student) => {
    setIsDetailModalVisible(true)
    setLoadingDetail(true)
    try {
      const res = await getStudentByIdAPI(student._id)
      setStudentDetail(res.data)
    } catch {
      setStudentDetail(null)
    }
    setLoadingDetail(false)
  }

  const handleStudentUpdated = async (updatedStudentId: string) => {
    setLoadingDetail(true)
    try {
      const res = await getStudentByIdAPI(updatedStudentId)
      setStudentDetail(res.data)
    } catch {
      toast.error('Không thể tải lại thông tin học sinh sau cập nhật.')
    } finally {
      setLoadingDetail(false)
    }
  }

  const handleCreateOk = () => {
    setIsCreateModalVisible(false)
    fetchClassData()
  }

  const handleDeleteStudent = async (studentId: string) => {
    try {
      await deleteStudentAPI(studentId)
      toast.success('Xóa học sinh thành công!')
      fetchClassData() // Refresh the list
    } catch (error) {
      console.error('Error deleting student:', error)
      toast.error('Không thể xóa học sinh.')
    }
  }

  const columns = [
    {
      title: 'Họ và tên',
      dataIndex: 'fullName',
      key: 'fullName',
      className: 'text-base'
    },
    {
      title: 'Ngày sinh',
      dataIndex: 'dob',
      key: 'dob',
      className: 'text-base',
      render: (dob: string) => <span className='text-gray-700'>{formatDate(dob)}</span>
    },
    {
      title: 'Giới tính',
      dataIndex: 'gender',
      className: 'text-base',
      key: 'gender',
      render: (gender: string) => (
        <Tag color={gender === 'male' ? 'blue' : 'pink'}>{gender === 'male' ? 'Nam' : 'Nữ'}</Tag>
      )
    },
    {
      title: 'Thao tác',
      key: 'action',
      className: 'text-base',
      render: (_: unknown, record: Student) => (
        <Space>
          <Button type='primary' icon={<InfoCircleOutlined />} onClick={() => handleViewDetail(record)}>
            Xem chi tiết
          </Button>
          <Popconfirm
            title='Bạn có chắc chắn muốn xóa học sinh này không?'
            onConfirm={() => handleDeleteStudent(record._id)}
            okText='Có'
            cancelText='Không'
          >
            <Button type='link' danger icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  if (!currentClassroom) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <Spin tip='Loading...' size='large' />
      </div>
    )
  }

  return (
    <div className='p-6 space-y-6'>
      <div className='bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-xl shadow-lg'>
        <div className='flex justify-between items-center mb-8'>
          <div className='space-y-1'>
            <Title level={3} className=' text-base !mb-0 text-gray-800'>
              Danh sách học sinh
            </Title>
            <p className='text-gray-500 text-lg'>{currentClassroom.name}</p>
          </div>
          <Button
            type='primary'
            icon={<PlusOutlined />}
            onClick={() => setIsCreateModalVisible(true)}
            className='h-10 px-6 flex items-center text-base hover:scale-105 transition-transform'
          >
            Thêm học sinh
          </Button>
        </div>

        <Row gutter={[24, 24]} className='mb-8'>
          <Col span={8}>
            <div className='bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-blue-100'>
              <div className='flex items-center space-x-4'>
                <div className='w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center'>
                  <UserOutlined className='text-2xl text-blue-600' />
                </div>
                <div>
                  <div className='text-gray-500 text-sm font-medium'>Tổng số học sinh</div>
                  <div className='text-3xl font-bold text-blue-600'>{studentList.length}</div>
                </div>
              </div>
            </div>
          </Col>
        </Row>

        <Card className='shadow-md rounded-xl border-0'>
          <Table
            columns={columns}
            dataSource={studentList}
            rowKey='_id'
            pagination={false}
            className='custom-table'
            rowClassName='hover:bg-blue-50 transition-colors'
          />
        </Card>
      </div>

      <StudentDetail
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        student={studentDetail}
        loading={loadingDetail}
        onUpdated={handleStudentUpdated}
      />
      <CreateClass
        isModalVisible={isCreateModalVisible}
        onCancel={() => setIsCreateModalVisible(false)}
        onOk={handleCreateOk}
      />
    </div>
  )
}

export default StudentList
