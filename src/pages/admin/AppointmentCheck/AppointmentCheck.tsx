import { useEffect, useState } from 'react'
import {
  Table,
  Button,
  Select,
  Modal,
  Input,
  Card,
  Tag,
  Typography,
  Space,
  Descriptions,
  Avatar,
  Tooltip,
  Empty,
  Divider,
  Form,
  Badge
} from 'antd'
import {
  UserOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  MedicineBoxOutlined
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { getAppointments, approveAppointment } from '../../../api/appointment.api'
import { searchNurseUsersAPI } from '../../../api/user.api'
import { toast } from 'react-toastify'

const { Title, Text, Paragraph } = Typography
const { TextArea } = Input
const { Option } = Select

// Mock interfaces - replace with your actual types
interface Appointment {
  _id: string
  studentId: string
  appointmentTime: string
  studentCode: string
  reason: string
  note?: string
  status: string
  studentName?: string
  parentName?: string
  phone?: string
}

interface Nurse {
  _id: string
  fullName: string
  email: string
  avatar?: string
  department?: string
}

function AppointmentCheck() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [nurses, setNurses] = useState<Nurse[]>([])
  const [selectedNurse, setSelectedNurse] = useState<string>('')
  const [assigning, setAssigning] = useState(false)
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [cancelNote, setCancelNote] = useState('')

  const fetchAppointments = async () => {
    setLoading(true)
    try {
      const res = await getAppointments(1, 20)
      const mapped = (res.pageData || []).map((item: any) => ({
        ...item,
        studentCode: item.student?.studentCode || '',
        studentName: item.student?.fullName || '',
        parentName: item.parent?.fullName || '',
        phone: item.parent?.phone || ''
      }))
      setAppointments(mapped)
    } catch {
      setAppointments([])
    } finally {
      setLoading(false)
    }
  }

  const fetchNurses = async (search?: string) => {
    try {
      const res = await searchNurseUsersAPI(1, 10, search)
      setNurses(res.pageData || res.pageData || [])
    } catch {
      setNurses([])
    }
  }

  useEffect(() => {
    fetchAppointments()
  }, [])

  const getStatusTag = (status: string) => {
    const statusConfig = {
      pending: { color: 'orange', text: 'Chờ duyệt', icon: <CalendarOutlined /> },
      approved: { color: 'green', text: 'Đã xác nhận', icon: <CheckCircleOutlined /> },
      confirmed: { color: 'blue', text: 'Đã xác nhận', icon: <CheckCircleOutlined /> },
      done: { color: 'success', text: 'Hoàn thành', icon: <CheckCircleOutlined /> },
      cancelled: { color: 'red', text: 'Đã hủy', icon: <CloseCircleOutlined /> }
    }

    const config = statusConfig[status.toLowerCase() as keyof typeof statusConfig] || {
      color: 'default',
      text: status,
      icon: null
    }

    return (
      <Tag color={config.color} icon={config.icon}>
        {config.text}
      </Tag>
    )
  }

  const handleAssignClick = (appt: Appointment) => {
    setSelectedAppointment(appt)
    setModalOpen(true)
    fetchNurses()
  }

  const handleDetailClick = (appt: Appointment) => {
    setSelectedAppointment(appt)
    setDetailModalOpen(true)
  }

  const handleAssign = async () => {
    if (!selectedAppointment || !selectedNurse) return
    setAssigning(true)
    try {
      await approveAppointment(selectedAppointment._id, {
        status: 'approved',
        schoolNurseId: selectedNurse
      })
      toast.success('Giao y tá thành công!')
      setModalOpen(false)
      setSelectedNurse('')
      fetchAppointments()
    } catch (error) {
      console.log(error)
    } finally {
      setAssigning(false)
    }
  }

  const handleCancelClick = (appt: Appointment) => {
    setSelectedAppointment(appt)
    setCancelModalOpen(true)
    setCancelReason('')
    setCancelNote('')
  }

  const handleCancel = async () => {
    if (!selectedAppointment || !cancelReason.trim()) {
      toast.error('Vui lòng nhập lý do hủy!')
      return
    }
    setAssigning(true)
    try {
      await approveAppointment(selectedAppointment._id, {
        status: 'cancelled',
        schoolNurseId: '',
        cancellationReason: cancelReason,
        note: cancelNote
      })
      toast.success('Hủy lịch thành công!')
      setCancelModalOpen(false)
      fetchAppointments()
    } catch {
      toast.error('Hủy lịch thất bại!')
    } finally {
      setAssigning(false)
    }
  }

  const columns: ColumnsType<Appointment> = [
    {
      title: 'Học sinh',
      dataIndex: 'studentName',
      key: 'studentName',
      render: (text, record) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <div>
            <div className='font-medium'>{text || record.studentId}</div>
            <Text type='secondary' className='text-xs'>
              PH: {record.parentName}
            </Text>
          </div>
        </Space>
      )
    },
    {
      title: 'Thời gian hẹn',
      dataIndex: 'appointmentTime',
      key: 'appointmentTime',
      render: (time) => (
        <Space direction='vertical' size={0}>
          <Text>{new Date(time).toLocaleDateString('vi-VN')}</Text>
          <Text type='secondary' className='text-xs'>
            {new Date(time).toLocaleTimeString('vi-VN', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Text>
        </Space>
      )
    },
    {
      title: 'Lý do khám',
      dataIndex: 'reason',
      key: 'reason',
      ellipsis: {
        showTitle: false
      },
      render: (reason) => (
        <Tooltip placement='topLeft' title={reason}>
          <Text className='max-w-xs'>{reason}</Text>
        </Tooltip>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status),
      filters: [
        { text: 'Chờ duyệt', value: 'pending' },
        { text: 'Đã xác nhận', value: 'approved' },
        { text: 'Hoàn thành', value: 'done' },
        { text: 'Đã hủy', value: 'cancelled' }
      ],
      onFilter: (value, record) => record.status === value
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Tooltip title='Xem chi tiết'>
            <Button type='text' icon={<EyeOutlined />} onClick={() => handleDetailClick(record)} />
          </Tooltip>
          {record.status === 'pending' && (
            <>
              <Tooltip title='Giao cho y tá'>
                <Button
                  type='primary'
                  icon={<CheckCircleOutlined />}
                  onClick={() => handleAssignClick(record)}
                  size='small'
                >
                  Duyệt
                </Button>
              </Tooltip>
              <Tooltip title='Hủy lịch hẹn'>
                <Button danger icon={<CloseCircleOutlined />} onClick={() => handleCancelClick(record)} size='small'>
                  Hủy
                </Button>
              </Tooltip>
            </>
          )}
        </Space>
      )
    }
  ]

  const pendingCount = appointments.filter((apt) => apt.status === 'pending').length

  return (
    <div className=''>
      <Card className='shadow-sm'>
        <div className=''>
          <Space align='center' className='mb-4'>
            <MedicineBoxOutlined className='text-2xl text-blue-600' />
            <Title level={2} className='m-0'>
              Quản lý lịch hẹn tư vấn
            </Title>
            {pendingCount > 0 && (
              <Badge count={pendingCount} className='ml-2'>
                <Tag color='orange'>Chờ duyệt</Tag>
              </Badge>
            )}
          </Space>
          <Paragraph type='secondary'>
            Quản lý và phê duyệt các lịch hẹn tư vấn sức khỏe từ phụ huynh học sinh
          </Paragraph>
        </div>

        <Table
          columns={columns}
          dataSource={appointments}
          rowKey='_id'
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} lịch hẹn`
          }}
          locale={{
            emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description='Chưa có lịch hẹn nào' />
          }}
          className='bg-white'
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title={
          <Space>
            <EyeOutlined />
            Chi tiết lịch hẹn
          </Space>
        }
        open={detailModalOpen}
        onCancel={() => setDetailModalOpen(false)}
        footer={[
          <Button key='close' onClick={() => setDetailModalOpen(false)}>
            Đóng
          </Button>
        ]}
        width={600}
      >
        {selectedAppointment && (
          <div>
            <Descriptions column={1} bordered size='small'>
              <Descriptions.Item label='Mã học sinh'>{selectedAppointment.studentCode}</Descriptions.Item>
              <Descriptions.Item label='Tên học sinh'>{selectedAppointment.studentName}</Descriptions.Item>
              <Descriptions.Item label='Phụ huynh'>{selectedAppointment.parentName}</Descriptions.Item>
              <Descriptions.Item label='Số điện thoại'>{selectedAppointment.phone}</Descriptions.Item>
              <Descriptions.Item label='Thời gian hẹn'>
                {new Date(selectedAppointment.appointmentTime).toLocaleString('vi-VN')}
              </Descriptions.Item>
              <Descriptions.Item label='Trạng thái'>{getStatusTag(selectedAppointment.status)}</Descriptions.Item>
            </Descriptions>

            <Divider />

            <div className='space-y-4'>
              <div>
                <Text strong>Lý do khám:</Text>
                <Paragraph className='mt-2 p-3 bg-blue-50 rounded'>{selectedAppointment.reason}</Paragraph>
              </div>

              {selectedAppointment.note && (
                <div>
                  <Text strong>Ghi chú:</Text>
                  <Paragraph className='mt-2 p-3 bg-yellow-50 rounded'>{selectedAppointment.note}</Paragraph>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Assign Nurse Modal */}
      <Modal
        title={
          <Space>
            <CheckCircleOutlined />
            Giao lịch hẹn cho y tá
          </Space>
        }
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleAssign}
        confirmLoading={assigning}
        okText='Xác nhận'
        cancelText='Hủy'
        okButtonProps={{ disabled: !selectedNurse }}
      >
        <div className='space-y-4'>
          <div>
            <Text strong>Lịch hẹn:</Text>
            <div className='mt-2 p-3 bg-gray-50 rounded'>
              <Text>
                {selectedAppointment?.studentName} - {selectedAppointment?.reason}
              </Text>
            </div>
          </div>

          <div>
            <Text strong>Chọn y tá phụ trách:</Text>
            <Select
              showSearch
              placeholder='Chọn y tá...'
              value={selectedNurse}
              onChange={setSelectedNurse}
              onSearch={fetchNurses}
              style={{ width: '100%', marginTop: 8 }}
              filterOption={false}
              optionLabelProp='label'
            >
              {nurses.map((nurse) => (
                <Option key={nurse._id} value={nurse._id} label={nurse.fullName}>
                  <Space>
                    <Avatar size='small' icon={<UserOutlined />} />
                    <div>
                      <div>{nurse.fullName}</div>
                      <Text type='secondary' className='text-xs'>
                        {nurse.email}
                      </Text>
                    </div>
                  </Space>
                </Option>
              ))}
            </Select>
          </div>
        </div>
      </Modal>

      {/* Cancel Modal */}
      <Modal
        title={
          <Space>
            <CloseCircleOutlined />
            Hủy lịch hẹn
          </Space>
        }
        open={cancelModalOpen}
        onCancel={() => setCancelModalOpen(false)}
        onOk={handleCancel}
        confirmLoading={assigning}
        okText='Xác nhận hủy'
        cancelText='Đóng'
        okButtonProps={{
          disabled: !cancelReason.trim(),
          danger: true
        }}
      >
        <div className='space-y-4'>
          <div>
            <Text strong>Lịch hẹn sẽ bị hủy:</Text>
            <div className='mt-2 p-3 bg-red-50 rounded border border-red-200'>
              <Text>
                {selectedAppointment?.studentName} - {selectedAppointment?.reason}
              </Text>
            </div>
          </div>

          <Form.Item
            label='Lý do hủy'
            required
            help={!cancelReason.trim() ? 'Vui lòng nhập lý do hủy' : ''}
            validateStatus={!cancelReason.trim() ? 'error' : ''}
          >
            <TextArea
              rows={3}
              placeholder='Nhập lý do hủy lịch hẹn...'
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
          </Form.Item>

          <Form.Item label='Ghi chú thêm'>
            <TextArea
              rows={2}
              placeholder='Ghi chú bổ sung (không bắt buộc)'
              value={cancelNote}
              onChange={(e) => setCancelNote(e.target.value)}
            />
          </Form.Item>
        </div>
      </Modal>
    </div>
  )
}

export default AppointmentCheck
