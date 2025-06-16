import React, { useEffect, useState } from 'react'
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  message,
  Card,
  Typography,
  Space,
  Tag,
  Descriptions,
  Row,
  Col,
  Statistic
} from 'antd'
import { CheckCircleOutlined, ClockCircleOutlined, MedicineBoxOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import {
  getAllMedicineSubmissions,
  updateMedicineSubmission,
  MedicineSubmissionData
} from '../../../api/medicineSubmissions'
import { getStudentByIdAPI, StudentProfile } from '../../../api/student.api'
import { getUserByIdAPI, Profile } from '../../../api/user.api'

const { Title, Text } = Typography
const { TextArea } = Input

interface PopulatedMedicineSubmissionData {
  parentId: string
  parentInfo?: Profile
  studentId: StudentProfile
  schoolNurseId: string
  medicines: (MedicineSubmissionData['medicines'][number] & {
    _id: string
    createdAt: string
    updatedAt: string
  })[]
  status: MedicineSubmissionData['status']
  isDeleted: boolean
  _id: string
  createdAt: string
  updatedAt: string
  __v: number
  nurseNotes?: string
}

const ReceiveMedicine: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<PopulatedMedicineSubmissionData | null>(null)
  const [form] = Form.useForm()
  const [medicineRequests, setMedicineRequests] = useState<PopulatedMedicineSubmissionData[]>([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalItems, setTotalItems] = useState(0)

  useEffect(() => {
    const fetchMedicineRequests = async () => {
      setLoading(true)
      try {
        const response = await getAllMedicineSubmissions(currentPage, pageSize)
        const requestsWithStudentInfo = await Promise.all(
          response.pageData.map(async (request) => {
            try {
              const [studentResponse, parentResponse] = await Promise.all([
                getStudentByIdAPI(request.studentId as string),
                getUserByIdAPI(request.parentId)
              ])
              return {
                ...request,
                studentId: studentResponse.data,
                parentInfo: parentResponse.data
              }
            } catch (error) {
              console.error('Error fetching info:', error)
              return request
            }
          })
        )
        setMedicineRequests(requestsWithStudentInfo as PopulatedMedicineSubmissionData[])
        setTotalItems(response.totalPage * pageSize)
      } catch (error) {
        message.error('Không thể lấy danh sách yêu cầu thuốc!')
        console.error('Fetch medicine requests error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMedicineRequests()
  }, [currentPage, pageSize])

  const handleTableChange = (page: number, pageSize?: number) => {
    setCurrentPage(page)
    if (pageSize) {
      setPageSize(pageSize)
    }
  }

  const columns: ColumnsType<PopulatedMedicineSubmissionData> = [
    {
      title: 'Học sinh',
      dataIndex: ['studentId', 'fullName'],
      key: 'studentName',
      render: (text, record) => (
        <div>
          <div>{record.studentId.fullName}</div>
          <Text type='secondary'>Mã số: {record.studentId.studentCode}</Text>
        </div>
      )
    },
    {
      title: 'Thuốc',
      dataIndex: ['medicines', 0, 'name'],
      key: 'medicineName',
      render: (text, record) => (
        <div>
          <div>{record.medicines[0]?.name}</div>
          <Text type='secondary'>Liều lượng: {record.medicines[0]?.dosage}</Text>
        </div>
      )
    },
    {
      title: 'Người gửi',
      dataIndex: 'parentId',
      key: 'senderName',
      render: (text, record) => (
        <div>
          <div>{record.parentInfo?.fullName || 'N/A'}</div>
          <Text type='secondary'>Số điện thoại: {record.parentInfo?.phone || 'N/A'}</Text>
        </div>
      )
    },
    {
      title: 'Ngày gửi',
      dataIndex: 'createdAt',
      key: 'sendDate',
      render: (text: string) => new Date(text).toLocaleDateString('vi-VN')
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: PopulatedMedicineSubmissionData['status']) => {
        let color = 'blue'
        let text = 'Chờ xác nhận'
        let icon = <ClockCircleOutlined />

        switch (status) {
          case 'completed':
            color = 'green'
            text = 'Đã hoàn thành'
            icon = <CheckCircleOutlined />
            break
          case 'approved':
            color = 'lime'
            text = 'Đã duyệt'
            icon = <CheckCircleOutlined />
            break
          case 'rejected':
            color = 'red'
            text = 'Đã từ chối'
            icon = <CheckCircleOutlined />
            break
          case 'pending':
          default:
            color = 'blue'
            text = 'Chờ xác nhận'
            icon = <ClockCircleOutlined />
        }

        return (
          <Tag color={color} icon={icon}>
            {text}
          </Tag>
        )
      }
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space size='middle'>
          <Button type='link' onClick={() => handleViewDetails(record)}>
            Xem chi tiết
          </Button>
          {record.status === 'pending' && (
            <Button type='primary' onClick={() => handleUpdateStatus(record._id, 'received')}>
              Nhận thuốc
            </Button>
          )}
          {record.status === 'received' && (
            <Button type='primary' onClick={() => handleUpdateStatus(record._id, 'in_progress')}>
              Bắt đầu thực hiện
            </Button>
          )}
          {record.status === 'in_progress' && (
            <Button type='primary' onClick={() => handleUpdateStatus(record._id, 'completed')}>
              Hoàn thành
            </Button>
          )}
        </Space>
      )
    }
  ]

  const handleViewDetails = (record: PopulatedMedicineSubmissionData) => {
    setSelectedRequest(record)
    setIsModalVisible(true)
  }

  const handleUpdateStatus = async (id: string, newStatus: MedicineSubmissionData['status']) => {
    try {
      const response = await updateMedicineSubmission(id) // Assuming updateMedicineSubmission takes id and newStatus as body
      if (response.success) {
        message.success('Cập nhật trạng thái thành công!')
        setMedicineRequests((prevRequests) =>
          prevRequests.map((req) => (req._id === id ? { ...req, status: newStatus } : req))
        )
      } else {
        message.error('Cập nhật trạng thái thất bại!')
      }
    } catch (error) {
      message.error('Có lỗi xảy ra khi cập nhật trạng thái!')
      console.error('Update status error:', error)
    }
  }

  const handleAddNote = () => {
    if (selectedRequest) {
      // Sau này sẽ gọi API để thêm ghi chú
      message.success('Thêm ghi chú thành công!')
      setIsModalVisible(false)
    }
  }

  // Thống kê
  const stats = {
    total: medicineRequests.length,
    pending: medicineRequests.filter((r) => r.status === 'pending').length,
    inProgress: medicineRequests.filter((r) => r.status === 'in_progress').length,
    completed: medicineRequests.filter((r) => r.status === 'completed').length,
    received: medicineRequests.filter((r) => r.status === 'received').length
  }

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Space direction='vertical' style={{ width: '100%' }}>
          <Title level={4}>Quản lý thuốc</Title>

          {/* Thống kê */}
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col span={6}>
              <Card>
                <Statistic title='Tổng số đơn' value={stats.total} prefix={<MedicineBoxOutlined />} />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic title='Chờ xác nhận' value={stats.pending} valueStyle={{ color: '#1890ff' }} />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic title='Đã nhận thuốc' value={stats.received} valueStyle={{ color: '#16a085' }} />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic title='Đang thực hiện' value={stats.inProgress} valueStyle={{ color: '#faad14' }} />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic title='Đã hoàn thành' value={stats.completed} valueStyle={{ color: '#52c41a' }} />
              </Card>
            </Col>
          </Row>

          {/* Bảng danh sách */}
          <Table
            columns={columns}
            dataSource={medicineRequests}
            rowKey='_id'
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: totalItems,
              onChange: handleTableChange,
              showSizeChanger: true,
              pageSizeOptions: ['5', '10', '20', '50']
            }}
            loading={loading}
          />

          {/* Modal chi tiết */}
          <Modal
            title='Chi tiết đơn thuốc'
            open={isModalVisible}
            onCancel={() => setIsModalVisible(false)}
            width={800}
            footer={null}
          >
            {selectedRequest && (
              <div>
                <Descriptions bordered column={2}>
                  <Descriptions.Item label='Học sinh' span={2}>
                    {selectedRequest.studentId.fullName} - Mã số: {selectedRequest.studentId.studentCode}
                    {selectedRequest.studentId.classId && (
                      <div>
                        <Text type='secondary'>Lớp: {selectedRequest.studentId.classId}</Text>
                      </div>
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item label='Phụ huynh' span={2}>
                    {selectedRequest.parentInfo?.fullName || 'N/A'}
                    <div>
                      <Text type='secondary'>Số điện thoại: {selectedRequest.parentInfo?.phone || 'N/A'}</Text>
                    </div>
                  </Descriptions.Item>
                  <Descriptions.Item label='Tên thuốc'>{selectedRequest.medicines[0]?.name}</Descriptions.Item>
                  <Descriptions.Item label='Liều lượng'>{selectedRequest.medicines[0]?.dosage}</Descriptions.Item>
                  <Descriptions.Item label='Số lần uống'>{selectedRequest.medicines[0]?.timesPerDay}</Descriptions.Item>
                  <Descriptions.Item label='Thời gian uống'>
                    {selectedRequest.medicines[0]?.usageInstructions}
                  </Descriptions.Item>
                  <Descriptions.Item label='Thời gian sử dụng' span={2}>
                    {new Date(selectedRequest.medicines[0].startDate).toLocaleDateString('vi-VN')} -{' '}
                    {new Date(selectedRequest.medicines[0].endDate).toLocaleDateString('vi-VN')}
                  </Descriptions.Item>
                  <Descriptions.Item label='Lý do dùng thuốc' span={2}>
                    {selectedRequest.medicines[0]?.reason}
                  </Descriptions.Item>
                  {selectedRequest.medicines[0]?.note && (
                    <Descriptions.Item label='Ghi chú đặc biệt' span={2}>
                      {selectedRequest.medicines[0]?.note}
                    </Descriptions.Item>
                  )}
                </Descriptions>

                {/* Hình ảnh thuốc - hiện tại không có trong API, giữ lại nếu muốn thêm sau */}
                {/* {selectedRequest.images && selectedRequest.images.length > 0 && (
                  <div style={{ marginTop: 16 }}>
                    <Title level={5}>Hình ảnh thuốc</Title>
                    <Image.PreviewGroup>
                      <Row gutter={[8, 8]}>
                        {selectedRequest.images.map((image, index) => (
                          <Col span={8} key={index}>
                            <Image src={image} alt={`Thuốc ${index + 1}`} />
                          </Col>
                        ))}
                      </Row>
                    </Image.PreviewGroup>
                  </div>
                )} */}

                <Form form={form} layout='vertical' onFinish={handleAddNote} style={{ marginTop: 16 }}>
                  <Form.Item name='nurseNotes' label='Ghi chú của y tá' initialValue={selectedRequest.nurseNotes}>
                    <TextArea rows={4} placeholder='Nhập ghi chú của y tá...' />
                  </Form.Item>
                  <Form.Item>
                    <Button type='primary' htmlType='submit'>
                      Lưu ghi chú
                    </Button>
                  </Form.Item>
                </Form>
              </div>
            )}
          </Modal>
        </Space>
      </Card>
    </div>
  )
}

export default ReceiveMedicine
