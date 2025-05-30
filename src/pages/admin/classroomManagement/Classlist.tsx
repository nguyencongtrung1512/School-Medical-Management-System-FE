import React, { useState, useEffect } from 'react'
import { Card, Table, Button, Tag, Space, Typography, Modal, Form, Input, Select, Row, Col, Statistic } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, UserOutlined } from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import { classrooms, grades } from '../studentManagement/fakedata'

const { Title } = Typography
const { Option } = Select

interface Classes {
  id: string
  gradeId: string
  name: string
  teacher: string
  totalStudents: number
  capacity: number
  description: string
  status: string
}

const ClassList: React.FC = () => {
  const { gradeId } = useParams<{ gradeId: string }>()
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingClass, setEditingClass] = useState<Classes | null>(null)
  const [currentGrade, setCurrentGrade] = useState<any>(null)
  const [classList, setClassList] = useState<Classes[]>([])

  useEffect(() => {
    // Lấy thông tin khối hiện tại
    const grade = grades.find((g) => g.id === gradeId)
    if (grade) {
      setCurrentGrade(grade)
    }

    // Lấy danh sách lớp của khối
    const classes = classrooms.filter((c) => c.gradeId === gradeId)
    setClassList(classes)
  }, [gradeId])

  const handleAddClass = () => {
    setEditingClass(null)
    form.resetFields()
    setIsModalVisible(true)
  }

  const handleEditClass = (classes: Classes) => {
    setEditingClass(classes)
    form.setFieldsValue(classes)
    setIsModalVisible(true)
  }

  const handleDeleteClass = (classes: Classes) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: `Bạn có chắc chắn muốn xóa lớp ${classes.name}?`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: () => {
        // Xử lý xóa lớp
        console.log('Xóa lớp:', classes)
      }
    })
  }

  const handleViewStudents = (classes: Classes) => {
    navigate(`/admin/student-management/classrooms/${classes.id}/students`)
  }

  const handleModalOk = () => {
    form.validateFields().then((values) => {
      if (editingClass) {
        // Xử lý cập nhật lớp
        console.log('Cập nhật lớp:', { ...editingClass, ...values })
      } else {
        // Xử lý thêm lớp mới
        console.log('Thêm lớp mới:', { ...values, gradeId })
      }
      setIsModalVisible(false)
    })
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
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description'
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: unknown, record: Classes) => (
        <Space>
          <Button color='cyan' variant='outlined' icon={<UserOutlined />} onClick={() => handleViewStudents(record)}>
            Xem học sinh
          </Button>
          <Button color='purple' variant='outlined' icon={<EditOutlined />} onClick={() => handleEditClass(record)}>
            Sửa
          </Button>
          <Button color='danger' variant='outlined' icon={<DeleteOutlined />} onClick={() => handleDeleteClass(record)}>
            Xóa
          </Button>
        </Space>
      )
    }
  ]

  if (!currentGrade) {
    return <div>Không tìm thấy thông tin khối</div>
  }

  return (
    <div className='p-6 space-y-6'>
      <div className='bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg shadow-md'>
        <div className='flex justify-between items-center mb-6'>
          <div>
            <Title level={3}>Danh sách lớp - {currentGrade.name}</Title>
            <p className='text-gray-600'>{currentGrade.description}</p>
          </div>
          <Button color='cyan' variant='outlined' icon={<PlusOutlined />} onClick={handleAddClass}>
            Thêm lớp mới
          </Button>
        </div>

        <Row gutter={[16, 16]} className='mb-6'>
          <Col span={8}>
            <Card className='bg-blue-50'>
              <Statistic title='Tổng số lớp' value={classList.length} valueStyle={{ color: '#1890ff' }} />
            </Card>
          </Col>
          <Col span={8}>
            <Card className='bg-green-50'>
              <Statistic
                title='Tổng số học sinh'
                value={classList.reduce((sum, classes) => sum + classes.totalStudents, 0)}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
        </Row>

        <Card className='shadow-md'>
          <Table columns={columns} dataSource={classList} rowKey='id' pagination={false} />
        </Card>
      </div>

      <Modal
        title={editingClass ? 'Sửa lớp' : 'Thêm lớp mới'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        width={600}
      >
        <Form form={form} layout='vertical' initialValues={{ status: 'active' }}>
          <Form.Item name='name' label='Tên lớp' rules={[{ required: true, message: 'Vui lòng nhập tên lớp!' }]}>
            <Input placeholder='Nhập tên lớp' />
          </Form.Item>

          <Form.Item
            name='teacher'
            label='Giáo viên chủ nhiệm'
            rules={[{ required: true, message: 'Vui lòng nhập tên giáo viên!' }]}
          >
            <Input placeholder='Nhập tên giáo viên chủ nhiệm' />
          </Form.Item>

          <Form.Item name='capacity' label='Sức chứa' rules={[{ required: true, message: 'Vui lòng nhập sức chứa!' }]}>
            <Input type='number' min={1} placeholder='Nhập sức chứa lớp' />
          </Form.Item>

          <Form.Item name='description' label='Mô tả' rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}>
            <Input.TextArea rows={4} placeholder='Nhập mô tả lớp' />
          </Form.Item>

          <Form.Item
            name='status'
            label='Trạng thái'
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
          >
            <Select placeholder='Chọn trạng thái'>
              <Option value='active'>Hoạt động</Option>
              <Option value='inactive'>Không hoạt động</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default ClassList
