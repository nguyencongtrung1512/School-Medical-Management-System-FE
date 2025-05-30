import React, { useState } from 'react'
import { Card, Table, Button, Tag, Space, Typography, Modal, Form, Input, Select, Row, Col, Statistic } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'

const { Title } = Typography
const { Option } = Select

interface Grade {
  id: string
  name: string
  description: string
  totalClasses: number
  totalStudents: number
  status: string
}

const mockData: Grade[] = [
  {
    id: '1',
    name: 'Khối 1',
    description: 'Khối lớp 1 - Năm học 2023-2024',
    totalClasses: 4,
    totalStudents: 120,
    status: 'active'
  },
  {
    id: '2',
    name: 'Khối 2',
    description: 'Khối lớp 2 - Năm học 2023-2024',
    totalClasses: 4,
    totalStudents: 115,
    status: 'active'
  },
  {
    id: '3',
    name: 'Khối 3',
    description: 'Khối lớp 3 - Năm học 2023-2024',
    totalClasses: 4,
    totalStudents: 120,
    status: 'active'
  },
  {
    id: '4',
    name: 'Khối 4',
    description: 'Khối lớp 4 - Năm học 2023-2024',
    totalClasses: 4,
    totalStudents: 118,
    status: 'active'
  },
  {
    id: '5',
    name: 'Khối 5',
    description: 'Khối lớp 5 - Năm học 2023-2024',
    totalClasses: 4,
    totalStudents: 122,
    status: 'active'
  }
]

const GradeList: React.FC = () => {
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingGrade, setEditingGrade] = useState<Grade | null>(null)

  const handleViewClasses = (grade: Grade) => {
    navigate(`/admin/student-management/grades/${grade.id}/classes`)
  }

  const handleAddGrade = () => {
    setEditingGrade(null)
    form.resetFields()
    setIsModalVisible(true)
  }

  const handleEditGrade = (grade: Grade) => {
    setEditingGrade(grade)
    form.setFieldsValue(grade)
    setIsModalVisible(true)
  }

  const handleDeleteGrade = (grade: Grade) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: `Bạn có chắc chắn muốn xóa khối ${grade.name}?`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: () => {
        // Xử lý xóa khối
        console.log('Xóa khối:', grade)
      }
    })
  }

  const handleModalOk = () => {
    form.validateFields().then((values) => {
      if (editingGrade) {
        // Xử lý cập nhật khối
        console.log('Cập nhật khối:', { ...editingGrade, ...values })
      } else {
        // Xử lý thêm khối mới
        console.log('Thêm khối mới:', values)
      }
      setIsModalVisible(false)
    })
  }

  const columns = [
    {
      title: 'Tên khối',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description'
    },
    {
      title: 'Số lớp',
      dataIndex: 'totalClasses',
      key: 'totalClasses'
    },
    {
      title: 'Tổng học sinh',
      dataIndex: 'totalStudents',
      key: 'totalStudents'
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: unknown, record: Grade) => (
        <Space>
          <Button color='cyan' variant='outlined' icon={<EyeOutlined />} onClick={() => handleViewClasses(record)}>
            Xem lớp
          </Button>
          <Button color='purple' variant='outlined' icon={<EditOutlined />} onClick={() => handleEditGrade(record)}>
            Sửa
          </Button>
          <Button color='danger' variant='outlined' icon={<DeleteOutlined />} onClick={() => handleDeleteGrade(record)}>
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
          <Title level={3}>Quản lý khối</Title>
          <Button color='cyan' variant='outlined' icon={<PlusOutlined />} onClick={handleAddGrade}>
            Thêm khối mới
          </Button>
        </div>

        <Row gutter={[16, 16]} className='mb-6'>
          <Col span={8}>
            <Card className='bg-blue-50'>
              <Statistic title='Tổng số khối' value={mockData.length} valueStyle={{ color: '#1890ff' }} />
            </Card>
          </Col>
          <Col span={8}>
            <Card className='bg-green-50'>
              <Statistic
                title='Tổng số lớp'
                value={mockData.reduce((sum, grade) => sum + grade.totalClasses, 0)}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card className='bg-purple-50'>
              <Statistic
                title='Tổng số học sinh'
                value={mockData.reduce((sum, grade) => sum + grade.totalStudents, 0)}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
        </Row>

        <Card className='shadow-md'>
          <Table columns={columns} dataSource={mockData} rowKey='id' pagination={false} />
        </Card>
      </div>

      <Modal
        title={editingGrade ? 'Sửa khối' : 'Thêm khối mới'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        width={600}
      >
        <Form form={form} layout='vertical' initialValues={{ status: 'active' }}>
          <Form.Item name='name' label='Tên khối' rules={[{ required: true, message: 'Vui lòng nhập tên khối!' }]}>
            <Input placeholder='Nhập tên khối' />
          </Form.Item>

          <Form.Item name='description' label='Mô tả' rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}>
            <Input.TextArea rows={4} placeholder='Nhập mô tả khối' />
          </Form.Item>

          <Form.Item name='totalClasses' label='Số lớp' rules={[{ required: true, message: 'Vui lòng nhập số lớp!' }]}>
            <Input type='number' min={1} placeholder='Nhập số lớp' />
          </Form.Item>

          <Form.Item
            name='totalStudents'
            label='Tổng học sinh'
            rules={[{ required: true, message: 'Vui lòng nhập tổng số học sinh!' }]}
          >
            <Input type='number' min={0} placeholder='Nhập tổng số học sinh' />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default GradeList
