import { DeleteOutlined, EditOutlined, EyeOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons'
import type { TabsProps } from 'antd'
import { Button, Card, Col, Form, Input, Modal, Row, Select, Space, Table, Tabs, Tag, Typography, message } from 'antd'
import dayjs from 'dayjs'
import React, { useEffect, useState } from 'react'
import { healthRecordApi, type CreateHealthRecordDTO, type HealthRecord, type UpdateHealthRecordDTO } from '../../../api/healthRecord.api'
import { getStudentByIdAPI } from '../../../api/student.api'

interface StudentProfile {
  _id: string
  fullName: string
  studentCode: string
  studentIdCode: string
  gender: 'male' | 'female' | 'other'
  dob: string
  avatar?: string
  classInfo?: {
    _id: string
    name: string
    isDeleted: boolean
  }
  parentInfos?: Array<{
    type: string
    fullName: string
    phone: string
    email: string
    role: string
    _id?: string
  }>
}
const { Title, Text } = Typography
const { Option } = Select

interface PopulatedHealthRecord extends HealthRecord {
  student?: StudentProfile
}

const HealthRecordCensorship: React.FC = () => {
  const [healthRecords, setHealthRecords] = useState<PopulatedHealthRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalItems, setTotalItems] = useState(0)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [schoolYearFilter, setSchoolYearFilter] = useState<string>('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<PopulatedHealthRecord | null>(null)
  const [editingRecord, setEditingRecord] = useState<PopulatedHealthRecord | null>(null)
  const [createForm] = Form.useForm()
  const [editForm] = Form.useForm()

  useEffect(() => {
    fetchHealthRecords()
  }, [currentPage, pageSize])

  const fetchHealthRecords = async () => {
    setLoading(true)
    try {
      const response = await healthRecordApi.search({
        pageNum: currentPage,
        pageSize,
        query: searchKeyword,
        schoolYear: schoolYearFilter
      })
      const responseData = (response as unknown as { pageData: HealthRecord[] })
      const pageInfo = (response as unknown as { pageInfo?: { totalItems: number } })

      // Lấy thông tin học sinh cho mỗi hồ sơ sức khỏe
      const populatedRecords: PopulatedHealthRecord[] = await Promise.all(
        (responseData.pageData || []).map(async (record) => {
          try {
            const studentResponse = await getStudentByIdAPI(record.studentId)
            const studentData = (studentResponse as unknown as { data: StudentProfile }).data
            return {
              ...record,
              student: studentData
            }
          } catch {
            // Nếu không lấy được thông tin học sinh, vẫn hiển thị hồ sơ
            return {
              ...record,
              student: undefined
            }
          }
        })
      )

      setHealthRecords(populatedRecords)
      setTotalItems(pageInfo.pageInfo?.totalItems || 0)
    } catch {
      message.error('Không thể tải danh sách hồ sơ sức khỏe')
    } finally {
      setLoading(false)
    }
  }

  const handleTableChange = (page: number, pageSize?: number) => {
    setCurrentPage(page)
    if (pageSize) setPageSize(pageSize)
  }

  const handleSearch = () => {
    setCurrentPage(1)
    fetchHealthRecords()
  }

  const showModal = (record: PopulatedHealthRecord) => {
    setSelectedRecord(record)
    setIsModalOpen(true)
  }

  const showCreateModal = () => {
    createForm.resetFields()
    setIsCreateModalOpen(true)
  }

  const showEditModal = (record: PopulatedHealthRecord) => {
    setEditingRecord(record)
    editForm.setFieldsValue({
      studentId: record.studentId,
      chronicDiseases: record.chronicDiseases,
      allergies: record.allergies,
      pastTreatments: record.pastTreatments,
      vision: record.vision,
      hearing: record.hearing,
      vaccinationHistory: record.vaccinationHistory,
      schoolYear: record.schoolYear,
      height: record.height,
      weight: record.weight
    })
    setIsEditModalOpen(true)
  }

  const handleCreate = async (values: CreateHealthRecordDTO) => {
    try {
      await healthRecordApi.create(values)
      message.success('Tạo hồ sơ sức khỏe thành công!')
      setIsCreateModalOpen(false)
      fetchHealthRecords()
    } catch {
      message.error('Tạo hồ sơ sức khỏe thất bại!')
    }
  }

  const handleUpdate = async (values: UpdateHealthRecordDTO) => {
    if (!editingRecord) return
    try {
      await healthRecordApi.update(editingRecord._id, values)
      message.success('Cập nhật hồ sơ sức khỏe thành công!')
      setIsEditModalOpen(false)
      fetchHealthRecords()
    } catch {
      message.error('Cập nhật hồ sơ sức khỏe thất bại!')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await healthRecordApi.delete(id)
      message.success('Xóa hồ sơ sức khỏe thành công!')
      fetchHealthRecords()
    } catch {
      message.error('Xóa hồ sơ sức khỏe thất bại!')
    }
  }

  const formatDate = (date: string | Date) => {
    if (!date) return '-'
    return dayjs(date).format('DD/MM/YYYY')
  }

  const items: TabsProps['items'] = [
    {
      key: '1',
      label: 'Thông tin cơ bản',
      children: (
        <div className='space-y-4'>
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <Text strong>Họ và tên:</Text>
              <Text className='ml-2'>{selectedRecord?.student?.fullName || selectedRecord?.studentName}</Text>
            </div>
            <div>
              <Text strong>Mã học sinh:</Text>
              <Text className='ml-2'>{selectedRecord?.student?.studentIdCode || selectedRecord?.studentIdCode}</Text>
            </div>
            <div>
              <Text strong>Giới tính:</Text>
              <Text className='ml-2'>{selectedRecord?.student?.gender === 'male' ? 'Nam' : 'Nữ'}</Text>
            </div>
            <div>
              <Text strong>Ngày sinh:</Text>
              <Text className='ml-2'>{formatDate(selectedRecord?.student?.dob || '')}</Text>
            </div>
            <div>
              <Text strong>Lớp:</Text>
              <Text className='ml-2'>{selectedRecord?.student?.classInfo?.name || '-'}</Text>
            </div>
            <div>
              <Text strong>Chiều cao:</Text>
              <Text className='ml-2'>{selectedRecord?.height}</Text>
            </div>
            <div>
              <Text strong>Cân nặng:</Text>
              <Text className='ml-2'>{selectedRecord?.weight}</Text>
            </div>
            <div>
              <Text strong>Năm học:</Text>
              <Text className='ml-2'>{selectedRecord?.schoolYear}</Text>
            </div>
          </div>
        </div>
      )
    },
    {
      key: '2',
      label: 'Thông tin y tế',
      children: (
        <div className='space-y-4'>
          <div>
            <Title level={5}>Bệnh mãn tính</Title>
            {selectedRecord?.chronicDiseases && selectedRecord.chronicDiseases.length > 0 ? (
              <div className='flex flex-wrap gap-2'>
                {selectedRecord.chronicDiseases.map((disease, index) => (
                  <Tag key={index} color='red'>
                    {disease}
                  </Tag>
                ))}
              </div>
            ) : (
              <Text type='secondary'>Không có</Text>
            )}
          </div>
          <div>
            <Title level={5}>Dị ứng</Title>
            {selectedRecord?.allergies && selectedRecord.allergies.length > 0 ? (
              <div className='flex flex-wrap gap-2'>
                {selectedRecord.allergies.map((allergy, index) => (
                  <Tag key={index} color='orange'>
                    {allergy}
                  </Tag>
                ))}
              </div>
            ) : (
              <Text type='secondary'>Không có</Text>
            )}
          </div>
          <div>
            <Title level={5}>Tiền sử điều trị</Title>
            {selectedRecord?.pastTreatments && selectedRecord.pastTreatments.length > 0 ? (
              <div className='flex flex-wrap gap-2'>
                {selectedRecord.pastTreatments.map((treatment, index) => (
                  <Tag key={index} color='blue'>
                    {treatment}
                  </Tag>
                ))}
              </div>
            ) : (
              <Text type='secondary'>Không có</Text>
            )}
          </div>
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <Text strong>Thị lực:</Text>
              <Text className='ml-2'>{selectedRecord?.vision || '-'}</Text>
            </div>
            <div>
              <Text strong>Thính lực:</Text>
              <Text className='ml-2'>{selectedRecord?.hearing || '-'}</Text>
            </div>
          </div>
        </div>
      )
    },
    {
      key: '3',
      label: 'Lịch sử tiêm chủng',
      children: (
        <div className='space-y-4'>
          {selectedRecord?.vaccinationHistory && selectedRecord.vaccinationHistory.length > 0 ? (
            <div className='flex flex-wrap gap-2'>
              {selectedRecord.vaccinationHistory.map((vaccine, index) => (
                <Tag key={index} color='green'>
                  {vaccine}
                </Tag>
              ))}
            </div>
          ) : (
            <Text type='secondary'>Không có lịch sử tiêm chủng</Text>
          )}
        </div>
      )
    }
  ]

  const columns = [
    {
      title: 'Họ tên học sinh',
      dataIndex: 'student',
      key: 'studentName',
      render: (_: unknown, record: PopulatedHealthRecord) =>
        record.student?.fullName || record.studentName || '-'
    },
    {
      title: 'Mã học sinh',
      dataIndex: 'student',
      key: 'studentCode',
      render: (_: unknown, record: PopulatedHealthRecord) =>
        record.student?.studentIdCode || record.studentIdCode || '-'
    },
    {
      title: 'Giới tính',
      dataIndex: 'gender',
      key: 'gender',
      render: (_: unknown, record: PopulatedHealthRecord) =>
        record.student?.gender === 'male' ? 'Nam' : 'Nữ'
    },
    {
      title: 'Ngày sinh',
      dataIndex: 'birthday',
      key: 'birthday',
      render: (_: unknown, record: PopulatedHealthRecord) =>
        formatDate(record.student?.dob || record.dob || '')
    },
    {
      title: 'Chiều cao',
      dataIndex: 'height',
      key: 'height'
    },
    {
      title: 'Cân nặng',
      dataIndex: 'weight',
      key: 'weight'
    },
    {
      title: 'Năm học',
      dataIndex: 'schoolYear',
      key: 'schoolYear'
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: unknown, record: PopulatedHealthRecord) => (
        <Space>
          <Button type='text' icon={<EyeOutlined />} onClick={() => showModal(record)}>
            Xem
          </Button>
          {/* <Button type='text' icon={<EditOutlined />} onClick={() => showEditModal(record)}>
            Sửa
          </Button>
          <Button
            type='text'
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record._id)}
          >
            Xóa
          </Button> */}
        </Space>
      )
    }
  ]

  return (
    <div className='p-6'>
      <Card className='shadow-sm'>
        <Row justify='space-between' align='middle' className='mb-4'>
          <Col>
            <Title level={2} className='m-0'>
              Quản lý hồ sơ sức khỏe học sinh
            </Title>
          </Col>
          {/* <Col>
            <Button type='primary' icon={<PlusOutlined />} onClick={showCreateModal}>
              Thêm hồ sơ
            </Button>
          </Col> */}
        </Row>

        <Row gutter={[16, 16]} className='mb-4'>
          <Col xs={24} md={12}>
            <Input
              placeholder='Tìm kiếm theo tên học sinh...'
              allowClear
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onPressEnter={handleSearch}
              suffix={<SearchOutlined />}
            />
          </Col>
          <Col xs={24} md={8}>
            <Select
              placeholder='Lọc theo năm học'
              allowClear
              style={{ width: '100%' }}
              value={schoolYearFilter}
              onChange={setSchoolYearFilter}
            >
              <Option value='2024-2025'>2024-2025</Option>
              <Option value='2023-2024'>2023-2024</Option>
              <Option value='2022-2023'>2022-2023</Option>
            </Select>
          </Col>
          <Col xs={24} md={4}>
            <Button type='primary' onClick={handleSearch} loading={loading}>
              Tìm kiếm
            </Button>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={healthRecords}
          rowKey='_id'
          loading={loading}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: totalItems,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} hồ sơ`,
            onChange: handleTableChange,
          }}
        />
      </Card>

      {/* Modal xem chi tiết */}
      <Modal
        title='Chi tiết hồ sơ sức khỏe'
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        width={800}
        footer={[
          <Button key='close' onClick={() => setIsModalOpen(false)}>
            Đóng
          </Button>
        ]}
      >
        {selectedRecord && <Tabs defaultActiveKey='1' items={items} />}
      </Modal>

      {/* Modal tạo mới */}
      <Modal
        title='Thêm hồ sơ sức khỏe'
        open={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
        footer={null}
        width={600}
      >
        <Form form={createForm} layout='vertical' onFinish={handleCreate}>
          <Form.Item
            name='studentId'
            label='ID học sinh'
            rules={[{ required: true, message: 'Vui lòng nhập ID học sinh!' }]}
          >
            <Input placeholder='Nhập ID học sinh' />
          </Form.Item>
          <Form.Item name='schoolYear' label='Năm học' rules={[{ required: true, message: 'Vui lòng nhập năm học!' }]}>
            <Input placeholder='VD: 2024-2025' />
          </Form.Item>
          <Form.Item name='height' label='Chiều cao' rules={[{ required: true, message: 'Vui lòng nhập chiều cao!' }]}>
            <Input placeholder='VD: 150cm' />
          </Form.Item>
          <Form.Item name='weight' label='Cân nặng' rules={[{ required: true, message: 'Vui lòng nhập cân nặng!' }]}>
            <Input placeholder='VD: 45kg' />
          </Form.Item>
          <Form.Item name='vision' label='Thị lực'>
            <Input placeholder='VD: 10/10' />
          </Form.Item>
          <Form.Item name='hearing' label='Thính lực'>
            <Input placeholder='VD: Bình thường' />
          </Form.Item>
          <Form.Item name='chronicDiseases' label='Bệnh mãn tính'>
            <Select mode='tags' placeholder='Nhập bệnh mãn tính' />
          </Form.Item>
          <Form.Item name='allergies' label='Dị ứng'>
            <Select mode='tags' placeholder='Nhập dị ứng' />
          </Form.Item>
          <Form.Item name='pastTreatments' label='Tiền sử điều trị'>
            <Select mode='tags' placeholder='Nhập tiền sử điều trị' />
          </Form.Item>
          <Form.Item name='vaccinationHistory' label='Lịch sử tiêm chủng'>
            <Select mode='tags' placeholder='Nhập các mũi đã tiêm' />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type='primary' htmlType='submit'>
                Tạo
              </Button>
              <Button onClick={() => setIsCreateModalOpen(false)}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal chỉnh sửa */}
      <Modal
        title='Chỉnh sửa hồ sơ sức khỏe'
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        footer={null}
        width={600}
      >
        <Form form={editForm} layout='vertical' onFinish={handleUpdate}>
          <Form.Item name='studentId' label='ID học sinh'>
            <Input placeholder='Nhập ID học sinh' />
          </Form.Item>
          <Form.Item name='schoolYear' label='Năm học'>
            <Input placeholder='VD: 2024-2025' />
          </Form.Item>
          <Form.Item name='height' label='Chiều cao'>
            <Input placeholder='VD: 150cm' />
          </Form.Item>
          <Form.Item name='weight' label='Cân nặng'>
            <Input placeholder='VD: 45kg' />
          </Form.Item>
          <Form.Item name='vision' label='Thị lực'>
            <Input placeholder='VD: 10/10' />
          </Form.Item>
          <Form.Item name='hearing' label='Thính lực'>
            <Input placeholder='VD: Bình thường' />
          </Form.Item>
          <Form.Item name='chronicDiseases' label='Bệnh mãn tính'>
            <Select mode='tags' placeholder='Nhập bệnh mãn tính' />
          </Form.Item>
          <Form.Item name='allergies' label='Dị ứng'>
            <Select mode='tags' placeholder='Nhập dị ứng' />
          </Form.Item>
          <Form.Item name='pastTreatments' label='Tiền sử điều trị'>
            <Select mode='tags' placeholder='Nhập tiền sử điều trị' />
          </Form.Item>
          <Form.Item name='vaccinationHistory' label='Lịch sử tiêm chủng'>
            <Select mode='tags' placeholder='Nhập các mũi đã tiêm' />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type='primary' htmlType='submit'>
                Cập nhật
              </Button>
              <Button onClick={() => setIsEditModalOpen(false)}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default HealthRecordCensorship
