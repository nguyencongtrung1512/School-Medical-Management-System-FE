import React, { useState, useEffect } from 'react'
import { Card, Table, Button, Tag, Typography, Row, Col, Statistic, Descriptions, Space } from 'antd'
import { InfoCircleOutlined, PhoneOutlined, PlusOutlined } from '@ant-design/icons'
import { useParams } from 'react-router-dom'
import { getClassByIdAPI } from '../../../api/classes.api'
import { getStudentByIdAPI } from '../../../api/student.api'
import StudentDetail from './Studentdetail'
import CreateClass from './Create'

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
      setStudentList(res.data.students || [])
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

  const handleCreateOk = () => {
    setIsCreateModalVisible(false)
    fetchClassData()
  }

  const columns = [
    {
      title: 'Mã học sinh',
      dataIndex: 'studentCode',
      key: 'studentCode'
    },
    {
      title: 'Họ và tên',
      dataIndex: 'fullName',
      key: 'fullName'
    },
    {
      title: 'Ngày sinh',
      dataIndex: 'dob',
      key: 'dob'
    },
    {
      title: 'Giới tính',
      dataIndex: 'gender',
      key: 'gender',
      render: (gender: string) => (
        <Tag color={gender === 'male' ? 'blue' : 'pink'}>{gender === 'male' ? 'Nam' : 'Nữ'}</Tag>
      )
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: unknown, record: Student) => (
        <Button type='primary' icon={<InfoCircleOutlined />} onClick={() => handleViewDetail(record)}>
          Xem chi tiết
        </Button>
      )
    }
  ]

  if (!currentClassroom) {
    return <div>Không tìm thấy thông tin lớp</div>
  }

  return (
    <div className='p-6 space-y-6'>
      <div className='bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg shadow-md'>
        <div className='flex justify-between items-center mb-6'>
          <Title level={3}>Danh sách học sinh - {currentClassroom.name}</Title>
          <Button type='primary' icon={<PlusOutlined />} onClick={() => setIsCreateModalVisible(true)}>
            Thêm học sinh
          </Button>
        </div>

        <Row gutter={[16, 16]} className='mb-6'>
          <Col span={8}>
            <Card className='bg-blue-50'>
              <Statistic title='Tổng số học sinh' value={studentList.length} valueStyle={{ color: '#1890ff' }} />
            </Card>
          </Col>
        </Row>

        <Card className='shadow-md'>
          <Table columns={columns} dataSource={studentList} rowKey='_id' pagination={false} />
        </Card>
      </div>
      <StudentDetail
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        student={studentDetail}
        loading={loadingDetail}
        onUpdated={fetchClassData}
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
