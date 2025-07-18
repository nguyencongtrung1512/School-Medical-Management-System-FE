import {
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  FilterOutlined,
  MoreOutlined,
  UserOutlined
} from '@ant-design/icons'
import {
  Avatar,
  Badge,
  Button,
  Card,
  Col,
  DatePicker,
  Dropdown,
  Empty,
  Input,
  Menu,
  message,
  Modal,
  Row,
  Select,
  Space,
  Spin,
  Table,
  Tag,
  Tooltip,
  Typography
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'

import { appointmentApi, ParentNurseAppointment, ParentNurseAppointmentStatus } from '../../../api/appointment.api'
import { useAuth } from '../../../contexts/auth.context'

const { Title, Text } = Typography
const { TextArea } = Input
const { Option } = Select

function PrivateConsultation() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState<ParentNurseAppointment[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  // NEW: actions & modal states
  const [selectedAppointment, setSelectedAppointment] = useState<ParentNurseAppointment | null>(null)
  const [doneModalOpen, setDoneModalOpen] = useState(false)
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [doneNote, setDoneNote] = useState('')
  const [cancelReason, setCancelReason] = useState('')
  const [updating, setUpdating] = useState(false)

  // Filter states
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null)
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined)

  // Hàm lấy lịch hẹn – dùng lại sau khi cập nhật
  const fetchAppointments = async () => {
    if (!user) return
    setLoading(true)
    try {
      const res = await appointmentApi.search({ pageNum: 1, pageSize: 50, schoolNurseId: user.id })
      const pageData = res.data?.pageData || []
      setAppointments(pageData)
    } catch (error: unknown) {
      console.log('error', error)
      const err = error as { message?: string }
      if (err.message) {
        message.error(err.message)
      } else {
        message.error('Có lỗi xảy ra khi tải danh sách lịch hẹn')
      }
      setAppointments([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAppointments()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  // Filter appointments
  const filteredAppointments = appointments.filter((item) => {
    const dateMatch = !selectedDate || dayjs(item.appointmentTime).isSame(selectedDate, 'day')
    const statusMatch = !statusFilter || item.status === statusFilter
    return dateMatch && statusMatch
  })

  // Hiển thị trạng thái
  const getStatusTag = (status: string) => {
    const statusConfig: Record<string, { color: string; text: string }> = {
      pending: { color: 'orange', text: 'Chờ duyệt' },
      approved: { color: 'blue', text: 'Đã xác nhận' },
      done: { color: 'green', text: 'Hoàn thành' },
      cancelled: { color: 'red', text: 'Đã hủy' },
      rejected: { color: 'red', text: 'Từ chối' }
    }
    const cfg = statusConfig[status] || { color: 'default', text: status }
    return (
      <Tag color={cfg.color} style={{ fontSize: 14 }}>
        {cfg.text}
      </Tag>
    )
  }

  // Action menu for each appointment
  const getActionMenu = (record: ParentNurseAppointment) => (
    <Menu>
      <Menu.Item key='view' icon={<EyeOutlined />} onClick={() => handleDetailClick(record)}>
        Xem chi tiết
      </Menu.Item>
      {record.status === 'approved' && (
        <>
          <Menu.Item key='done' icon={<CheckCircleOutlined />} onClick={() => handleDoneClick(record)}>
            Hoàn thành
          </Menu.Item>
          <Menu.Item key='cancel' icon={<CloseCircleOutlined />} onClick={() => handleCancelClick(record)} danger>
            Hủy lịch
          </Menu.Item>
        </>
      )}
    </Menu>
  )

  // Table columns
  const columns: ColumnsType<ParentNurseAppointment> = [
    {
      title: 'Học sinh',
      dataIndex: 'student',
      key: 'student',
      width: 200,
      render: (student) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <div>
            <div className='font-medium'>{student.fullName}</div>
            <Text type='secondary' className='text-xs'>
              {student.studentCode}
            </Text>
          </div>
        </Space>
      )
    },
    {
      title: 'Phụ huynh',
      dataIndex: 'parent',
      key: 'parent',
      width: 180,
      render: (parent) => (
        <div>
          <div>{parent.fullName}</div>
          <Text type='secondary' className='text-xs'>
            {parent.phone}
          </Text>
        </div>
      )
    },
    {
      title: 'Thời gian',
      dataIndex: 'appointmentTime',
      key: 'appointmentTime',
      width: 150,
      render: (time) => (
        <div>
          <div>{dayjs(time).format('DD/MM/YYYY')}</div>
          <Text type='secondary' className='text-xs'>
            {dayjs(time).format('HH:mm')}
          </Text>
        </div>
      ),
      sorter: (a, b) => dayjs(a.appointmentTime).unix() - dayjs(b.appointmentTime).unix()
    },
    {
      title: 'Lý do',
      dataIndex: 'reason',
      key: 'reason',
      ellipsis: {
        showTitle: false
      },
      render: (reason) => (
        <Tooltip title={reason}>
          <span>{reason}</span>
        </Tooltip>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
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
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Dropdown overlay={getActionMenu(record)} trigger={['click']}>
          <Button type='text' icon={<MoreOutlined />} />
        </Dropdown>
      )
    }
  ]

  // ====== Action handlers ======
  const handleDetailClick = (appt: ParentNurseAppointment) => {
    setSelectedAppointment(appt)
    setDetailModalOpen(true)
  }

  const handleDoneClick = (appt: ParentNurseAppointment) => {
    setSelectedAppointment(appt)
    setDoneModalOpen(true)
    setDoneNote('')
  }

  const handleCancelClick = (appt: ParentNurseAppointment) => {
    setSelectedAppointment(appt)
    setCancelModalOpen(true)
    setCancelReason('')
  }

  const confirmDone = async () => {
    if (!selectedAppointment) return
    setUpdating(true)
    try {
      await appointmentApi.updateStatus(selectedAppointment._id, {
        status: ParentNurseAppointmentStatus.Done,
        note: doneNote
      })
      message.success('Đánh dấu hoàn thành thành công!')
      setDoneModalOpen(false)
      fetchAppointments()
    } catch (error: unknown) {
      console.log('error', error)
      const err = error as { message?: string }
      if (err.message) {
        message.error(err.message)
      } else {
        message.error('Cập nhật thất bại!')
      }
    } finally {
      setUpdating(false)
    }
  }

  const confirmCancel = async () => {
    if (!selectedAppointment || !cancelReason.trim()) {
      message.error('Vui lòng nhập lý do hủy!')
      return
    }
    setUpdating(true)
    try {
      await appointmentApi.updateStatus(selectedAppointment._id, {
        status: ParentNurseAppointmentStatus.Cancelled,
        cancellationReason: cancelReason
      })
      message.success('Hủy lịch hẹn thành công!')
      setCancelModalOpen(false)
      fetchAppointments()
    } catch (error: unknown) {
      console.log('error', error)
      const err = error as { message?: string }
      if (err.message) {
        message.error(err.message)
      } else {
        message.error('Hủy lịch thất bại!')
      }
      message.error('Hủy lịch thất bại!')
    } finally {
      setUpdating(false)
    }
  }

  // Count appointments by status
  const statusCounts = appointments.reduce(
    (acc, appt) => {
      acc[appt.status] = (acc[appt.status] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px 0' }}>
        <Spin size='large' />
        <div style={{ marginTop: 16 }}>
          <Text>Đang tải dữ liệu...</Text>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '20px', minHeight: '100vh', background: '#f5f5f5' }}>
      <Card>
        {/* Header with stats */}
        <div style={{ marginBottom: 24 }}>
          <Row justify='space-between' align='middle'>
            <Col>
              <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
                <CalendarOutlined style={{ marginRight: 8 }} />
                Lịch Tư Vấn
              </Title>
            </Col>
            <Col>
              <Space size='large'>
                <Badge count={statusCounts.pending || 0} color='orange'>
                  <Tag color='orange'>Chờ duyệt</Tag>
                </Badge>
                <Badge count={statusCounts.approved || 0} color='blue'>
                  <Tag color='blue'>Đã xác nhận</Tag>
                </Badge>
                <Badge count={statusCounts.done || 0} color='green'>
                  <Tag color='green'>Hoàn thành</Tag>
                </Badge>
              </Space>
            </Col>
          </Row>
        </div>

        {/* Filters */}
        <Card size='small' style={{ marginBottom: 16, background: '#fafafa' }}>
          <Row gutter={16} align='middle'>
            <Col>
              <Space>
                <FilterOutlined />
                <Text strong>Bộ lọc:</Text>
              </Space>
            </Col>
            <Col>
              <DatePicker
                placeholder='Chọn ngày'
                value={selectedDate}
                onChange={setSelectedDate}
                allowClear
                format='DD/MM/YYYY'
              />
            </Col>
            <Col>
              <Select
                placeholder='Trạng thái'
                value={statusFilter}
                onChange={setStatusFilter}
                allowClear
                style={{ width: 120 }}
              >
                <Option value='pending'>Chờ duyệt</Option>
                <Option value='approved'>Đã xác nhận</Option>
                <Option value='done'>Hoàn thành</Option>
                <Option value='cancelled'>Đã hủy</Option>
              </Select>
            </Col>
            <Col>
              <Text type='secondary'>
                Hiển thị {filteredAppointments.length}/{appointments.length} lịch hẹn
              </Text>
            </Col>
          </Row>
        </Card>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={filteredAppointments}
          rowKey='_id'
          loading={loading || updating}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} lịch hẹn`
          }}
          locale={{
            emptyText: <Empty description='Không có lịch hẹn nào' />
          }}
          scroll={{ x: 800 }}
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
        width={700}
      >
        {selectedAppointment && (
          <div>
            <Row gutter={[24, 16]}>
              <Col span={12}>
                <Card size='small' title='Thông tin học sinh'>
                  <Space direction='vertical' style={{ width: '100%' }}>
                    <div>
                      <Text strong>Họ tên: </Text>
                      <Text>{selectedAppointment.student?.fullName}</Text>
                    </div>
                    <div>
                      <Text strong>Mã HS: </Text>
                      <Text>{selectedAppointment.student?.studentCode}</Text>
                    </div>
                    <div>
                      <Text strong>Giới tính: </Text>
                      <Text>{selectedAppointment.student?.gender === 'male' ? 'Nam' : 'Nữ'}</Text>
                    </div>
                  </Space>
                </Card>
              </Col>
              <Col span={12}>
                <Card size='small' title='Thông tin phụ huynh'>
                  <Space direction='vertical' style={{ width: '100%' }}>
                    <div>
                      <Text strong>Họ tên: </Text>
                      <Text>{selectedAppointment.parent?.fullName}</Text>
                    </div>
                    <div>
                      <Text strong>Điện thoại: </Text>
                      <Text copyable>{selectedAppointment.parent?.phone}</Text>
                    </div>
                    <div>
                      <Text strong>Email: </Text>
                      <Text>{selectedAppointment.parent?.email}</Text>
                    </div>
                  </Space>
                </Card>
              </Col>
            </Row>

            <Card size='small' title='Chi tiết lịch hẹn' style={{ marginTop: 16 }}>
              <Space direction='vertical' style={{ width: '100%' }}>
                <div>
                  <Text strong>Thời gian: </Text>
                  <Text>{dayjs(selectedAppointment.appointmentTime).format('DD/MM/YYYY HH:mm')}</Text>
                </div>
                <div>
                  <Text strong>Trạng thái: </Text>
                  {getStatusTag(selectedAppointment.status)}
                </div>
                <div>
                  <Text strong>Lý do: </Text>
                  <div style={{ marginTop: 8, padding: 12, background: '#f6f6f6', borderRadius: 6 }}>
                    <Text>{selectedAppointment.reason}</Text>
                  </div>
                </div>
                {selectedAppointment.note && (
                  <div>
                    <Text strong>Ghi chú: </Text>
                    <div style={{ marginTop: 8, padding: 12, background: '#f6f6f6', borderRadius: 6 }}>
                      <Text>{selectedAppointment.note}</Text>
                    </div>
                  </div>
                )}
              </Space>
            </Card>
          </div>
        )}
      </Modal>

      {/* Done Modal */}
      <Modal
        title={
          <Space>
            <CheckCircleOutlined /> Xác nhận hoàn thành
          </Space>
        }
        open={doneModalOpen}
        onCancel={() => setDoneModalOpen(false)}
        onOk={confirmDone}
        okText='Hoàn thành'
        cancelText='Đóng'
        confirmLoading={updating}
      >
        <div className='space-y-2'>
          <Text strong>Ghi chú (tùy chọn)</Text>
          <TextArea rows={3} value={doneNote} onChange={(e) => setDoneNote(e.target.value)} />
        </div>
      </Modal>

      {/* Cancel Modal */}
      <Modal
        title={
          <Space>
            <CloseCircleOutlined /> Hủy lịch hẹn
          </Space>
        }
        open={cancelModalOpen}
        onCancel={() => setCancelModalOpen(false)}
        onOk={confirmCancel}
        okText='Xác nhận hủy'
        cancelText='Đóng'
        confirmLoading={updating}
        okButtonProps={{ danger: true, disabled: !cancelReason.trim() }}
      >
        <div className='space-y-2'>
          <Text strong>Lý do hủy</Text>
          <TextArea
            rows={3}
            placeholder='Nhập lý do hủy...'
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
          />
        </div>
      </Modal>
    </div>
  )
}

export default PrivateConsultation
