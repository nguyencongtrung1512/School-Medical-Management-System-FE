'use client'

import {
  BookOutlined,
  CalendarOutlined,
  DeleteOutlined,
  EyeOutlined,
  HomeOutlined,
  IdcardOutlined,
  ManOutlined,
  PlusOutlined,
  TeamOutlined,
  UserOutlined,
  WomanOutlined,
  DownloadOutlined
} from '@ant-design/icons'
import {
  Avatar,
  Breadcrumb,
  Button,
  Card,
  Col,
  Divider,
  message,
  Popconfirm,
  Row,
  Space,
  Spin,
  Statistic,
  Table,
  Tag,
  Tooltip,
  Typography,
  Form,
  Select,
  Descriptions
} from 'antd'
import type React from 'react'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getClassByIdAPI } from '../../../api/classes.api'
import { deleteStudentAPI, getStudentByIdAPI } from '../../../api/student.api'
import { formatDate } from '../../../utils/utils'
import CreateClass from './Create'
import StudentDetail from './Studentdetail'
import * as XLSX from 'xlsx'

const { Title, Text } = Typography

interface Student {
  _id: string
  fullName: string
  studentIdCode: string
  studentCode: string
  gender: string
  dob: string
  classId: string
  avatar: string
  position: number
  parentName?: string
  parentPhone?: string
  isDeleted?: boolean
  status: 'active' | 'graduated' | 'transferred' | 'reserved'
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
      console.log('res.data trung', res.data)
      const activeStudents = (res.data.students || []).filter((student: Student) => !student.isDeleted)
      setStudentList(activeStudents)
    } catch (error: unknown) {
      console.log('error', error)
      const err = error as { message?: string }
      if (err.message) {
        message.error(err.message)
      } else {
        message.error('Không thể tải lại thông tin lớp học.')
      }
      setCurrentClassroom(null)
      setStudentList([])
    }
  }

  const handleViewDetail = async (student: Student) => {
    setIsDetailModalVisible(true)
    setLoadingDetail(true)
    try {
      const res = await getStudentByIdAPI(student._id)
      setStudentDetail(res.data as Student)
      console.log('res.data', res.data)
    } catch (error: unknown) {
      console.log('error', error)
      const err = error as { message?: string }
      if (err.message) {
        message.error(err.message)
      } else {
        message.error('Không thể tải lại thông tin học sinh sau cập nhật.')
      }
      setStudentDetail(null)
    }
    setLoadingDetail(false)
  }

  const handleStudentUpdated = async (updatedStudentId: string) => {
    setLoadingDetail(true)
    try {
      const res = await getStudentByIdAPI(updatedStudentId)
      setStudentDetail(res.data)
      await fetchClassData(); // Thêm dòng này để cập nhật lại danh sách
    } catch (error: unknown) {
      console.log('error', error)
      const err = error as { message?: string }
      if (err.message) {
        message.error(err.message)
      } else {
        message.error('Không thể tải lại thông tin học sinh sau cập nhật.')
      }
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
      message.success('Xóa học sinh thành công!')
      fetchClassData() // Refresh the list
    } catch (error: unknown) {
      console.log('error', error)
      const err = error as { message?: string }
      if (err.message) {
        message.error(err.message)
      } else {
        message.error('Không thể xóa học sinh.')
      }
    }
  }

  // Thêm hàm xuất excel
  const handleExportExcel = () => {
    if (!studentList.length) {
      message.warning('Không có học sinh để xuất!')
      return
    }
    // Chuẩn bị dữ liệu
    const data = studentList.map((s) => ({
      'Họ tên': s.fullName,
      'Mã SV': s.studentIdCode,
      'Giới tính': s.gender === 'male' ? 'Nam' : 'Nữ',
      'Ngày sinh': formatDate(s.dob)
    }))
    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Danh sách học sinh')
    XLSX.writeFile(wb, `Danh_sach_hoc_sinh_${currentClassroom?.name || ''}.xlsx`)
    message.success('Xuất file Excel thành công!')
  }

  // Statistics
  const stats = {
    totalStudents: studentList.length,
    maleStudents: studentList.filter((s) => s.gender === 'male').length,
    femaleStudents: studentList.filter((s) => s.gender === 'female').length
  }

  const columns = [
    {
      title: (
        <Space>
          <IdcardOutlined />
          <span>Thông tin học sinh</span>
        </Space>
      ),
      key: 'studentInfo',
      render: (_, record: Student) => (
        <div className='flex items-center space-x-3'>
          <Avatar size={40} icon={<UserOutlined />} src={record.avatar} className='bg-blue-500' />
          <div>
            <div className='font-semibold text-gray-800'>{record.fullName}</div>
            <Text type='secondary' className='text-sm'>
              Mã SV: {record.studentIdCode}
            </Text>
          </div>
        </div>
      )
    },
    {
      title: (
        <Space>
          <CalendarOutlined />
          <span>Ngày sinh</span>
        </Space>
      ),
      dataIndex: 'dob',
      key: 'dob',
      width: 140,
      render: (dob: string) => (
        <div className='text-center'>
          <div className='text-sm font-medium'>{formatDate(dob)}</div>
        </div>
      )
    },
    {
      title: (
        <Space>
          <TeamOutlined />
          <span>Giới tính</span>
        </Space>
      ),
      dataIndex: 'gender',
      key: 'gender',
      width: 140,
      render: (gender: string) => (
        <Tag color={gender === 'male' ? 'blue' : 'pink'} icon={gender === 'male' ? <ManOutlined /> : <WomanOutlined />}>
          {gender === 'male' ? 'Nam' : 'Nữ'}
        </Tag>
      ),
      filters: [
        { text: 'Nam', value: 'male' },
        { text: 'Nữ', value: 'female' }
      ],
      onFilter: (value, record) => record.gender === value
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={
          status === 'active'
            ? 'blue'
            : status === 'graduated'
              ? 'green'
              : status === 'transferred'
                ? 'orange'
                : 'red'
        }>
          {status === 'active'
            ? 'Đang học'
            : status === 'graduated'
              ? 'Đã tốt nghiệp'
              : status === 'transferred'
                ? 'Chuyển trường'
                : 'Bảo lưu'}
        </Tag>
      ),
      filters: [
        { text: 'Đang học', value: 'active' },
        { text: 'Đã tốt nghiệp', value: 'graduated' },
        { text: 'Chuyển trường', value: 'transferred' },
        { text: 'Bảo lưu', value: 'reserved' }
      ],
      onFilter: (value, record) => record.status === value
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 150,
      render: (_: unknown, record: Student) => (
        <Space>
          <Tooltip title='Xem chi tiết học sinh'>
            <Button type='primary' size='small' icon={<EyeOutlined />} onClick={() => handleViewDetail(record)}>
              Chi tiết
            </Button>
          </Tooltip>
          <Popconfirm
            title='Xác nhận xóa học sinh'
            description='Bạn có chắc chắn muốn xóa học sinh này không?'
            onConfirm={() => handleDeleteStudent(record._id)}
            okText='Xóa'
            cancelText='Hủy'
            okType='danger'
          >
            <Tooltip title='Xóa học sinh'>
              <Button type='primary' danger size='small' icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      )
    }
  ]

  if (!currentClassroom) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <Spin tip='Đang tải thông tin lớp học...' size='large' />
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
              href: `/admin/student-management/grades/${currentClassroom.gradeId}/classes`,
              title: (
                <Space>
                  <HomeOutlined />
                  <span>Quản lý lớp</span>
                </Space>
              )
            },
            {
              title: (
                <Space>
                  <UserOutlined />
                  <span>{currentClassroom.name}</span>
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
                <UserOutlined className='mr-3 text-blue-500' />
                Quản lý Học sinh - {currentClassroom.name}
              </Title>
              <Text type='secondary' className='text-base'>
                Quản lý danh sách học sinh trong lớp {currentClassroom.name}
              </Text>
            </div>
          </Col>
          <Col xs={24} md={8} className='text-right'>
            <Space>
              <Button
                type='primary'
                icon={<PlusOutlined />}
                size='large'
                onClick={() => setIsCreateModalVisible(true)}
                className='shadow-sm'
                style={{ borderRadius: '8px' }}
              >
                Thêm học sinh
              </Button>
              <Button
                icon={<DownloadOutlined />}
                size='large'
                onClick={handleExportExcel}
                className='shadow-sm'
                style={{ borderRadius: '8px' }}
              >
                Xuất Excel
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Statistics Section */}
      <Row gutter={[16, 16]} className='mb-6'>
        <Col xs={12} sm={8} md={8}>
          <Card className='text-center shadow-sm' style={{ borderRadius: '8px' }}>
            <Statistic
              title='Tổng số học sinh'
              value={stats.totalStudents}
              valueStyle={{ color: '#1890ff', fontSize: '24px', fontWeight: 'bold' }}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={8}>
          <Card className='text-center shadow-sm' style={{ borderRadius: '8px' }}>
            <Statistic
              title='Học sinh nam'
              value={stats.maleStudents}
              valueStyle={{ color: '#52c41a', fontSize: '24px', fontWeight: 'bold' }}
              prefix={<ManOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8} md={8}>
          <Card className='text-center shadow-sm' style={{ borderRadius: '8px' }}>
            <Statistic
              title='Học sinh nữ'
              value={stats.femaleStudents}
              valueStyle={{ color: '#eb2f96', fontSize: '24px', fontWeight: 'bold' }}
              prefix={<WomanOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Table Section */}
      <Card className='shadow-sm' style={{ borderRadius: '12px' }}>
        <div className='mb-4'>
          <Title level={4} className='mb-2'>
            <UserOutlined className='mr-2' />
            Danh sách học sinh
          </Title>
          <Divider className='mt-2 mb-4' />
        </div>

        <Table
          columns={columns}
          dataSource={studentList}
          rowKey='_id'
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} học sinh`,
            pageSizeOptions: ['5', '10', '20', '50']
          }}
          className='custom-table'
          scroll={{ x: 800 }}
          locale={{
            emptyText: (
              <div className='py-8'>
                <UserOutlined className='text-4xl text-gray-300 mb-4' />
                <div className='text-gray-500'>Chưa có học sinh nào trong lớp này</div>
                <Button type='link' onClick={() => setIsCreateModalVisible(true)} className='mt-2'>
                  Thêm học sinh đầu tiên
                </Button>
              </div>
            )
          }}
        />
      </Card>

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

        /* Popconfirm styling */
        .ant-popover-inner-content {
          padding: 16px;
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

export default StudentList
