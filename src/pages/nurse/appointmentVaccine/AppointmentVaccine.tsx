import React, { useEffect, useState } from 'react'
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Typography,
  Input,
  Modal,
  Descriptions,
  Select,
  message,
  Row,
  Col,
  Form
} from 'antd'
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  StopOutlined,
  SearchOutlined,
  EyeOutlined,
  ReloadOutlined,
  MedicineBoxOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'
import {
  vaccineAppointmentApi,
  AppointmentStatus,
  type VaccineAppointment,
  PostVaccinationStatus
} from '../../../api/vaccineAppointment.api'
import type { ColumnsType } from 'antd/es/table'

const { Title } = Typography
const { Search } = Input
const { Option } = Select

const statusOptions = [
  { value: AppointmentStatus.Pending, label: 'Chờ kiểm tra', icon: <ClockCircleOutlined /> },
  { value: AppointmentStatus.Checked, label: 'Đã kiểm tra', icon: <CheckCircleOutlined /> },
  { value: AppointmentStatus.Ineligible, label: 'Không đủ điều kiện', icon: <StopOutlined /> },
  { value: AppointmentStatus.Vaccinated, label: 'Đã tiêm', icon: <MedicineBoxOutlined /> },
  { value: AppointmentStatus.Cancelled, label: 'Đã hủy', icon: <StopOutlined /> }
]

// Extend VaccineAppointment to support populated student and event
interface PopulatedVaccineAppointment extends VaccineAppointment {
  student?: { fullName: string }
  event?: { title: string }
}

const AppointmentVaccine: React.FC = () => {
  const [appointments, setAppointments] = useState<PopulatedVaccineAppointment[]>([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalItems, setTotalItems] = useState(0)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | undefined>(undefined)
  const [selected, setSelected] = useState<PopulatedVaccineAppointment | null>(null)
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [form] = Form.useForm()
  const [createModalVisible, setCreateModalVisible] = useState(false)
  const [createForm] = Form.useForm()

  useEffect(() => {
    fetchAppointments()
  }, [currentPage, pageSize])

  // Khi mở modal, nếu chưa có kết quả sau tiêm thì bật editMode mặc định
  useEffect(() => {
    if (isDetailModalVisible && selected && !selected.postVaccinationStatus) {
      setTimeout(() => handleEditResult(), 0)
    }
    // eslint-disable-next-line
  }, [isDetailModalVisible, selected])

  const fetchAppointments = async () => {
    setLoading(true)
    try {
      const response = await vaccineAppointmentApi.search({ pageNum: currentPage, pageSize })
      const pageData = (response as unknown as { pageData: VaccineAppointment[] }).pageData || []
      const total = (response as unknown as { pageInfo?: { totalItems: number } }).pageInfo?.totalItems || 0
      setAppointments(pageData)
      setTotalItems(total)
    } catch {
      message.error('Không thể tải danh sách lịch hẹn tiêm')
    } finally {
      setLoading(false)
    }
  }

  const handleTableChange = (page: number, pageSize?: number) => {
    setCurrentPage(page)
    if (pageSize) setPageSize(pageSize)
  }

  const formatDateTime = (dateValue: string | Date) => {
    if (!dateValue) return ''
    const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue
    return dayjs(date).format('DD/MM/YYYY HH:mm')
  }

  const getStatusTag = (status: AppointmentStatus) => {
    const found = statusOptions.find((s) => s.value === status)
    if (!found) return <Tag>{status}</Tag>
    return <Tag icon={found.icon}>{found.label}</Tag>
  }

  const handleEditResult = () => {
    if (selected) {
      form.setFieldsValue({
        postVaccinationStatus: selected.postVaccinationStatus || PostVaccinationStatus.NotChecked,
        postVaccinationNotes: selected.postVaccinationNotes || ''
      })
      setEditMode(true)
    }
  }

  const handleSaveResult = async () => {
    if (!selected) return
    try {
      const values = await form.validateFields()
      await vaccineAppointmentApi.updatePostVaccination(selected._id, values)
      message.success('Cập nhật kết quả sau tiêm thành công!')
      setEditMode(false)
      setIsDetailModalVisible(false)
      fetchAppointments()
    } catch {
      message.error('Cập nhật thất bại!')
    }
  }

  const handleOpenCreate = () => {
    createForm.resetFields()
    setCreateModalVisible(true)
  }

  const handleCreateResult = async () => {
    try {
      const values = await createForm.validateFields()
      // Gọi API updatePostVaccination cho lịch hẹn đã chọn
      await vaccineAppointmentApi.updatePostVaccination(values.appointmentId, {
        postVaccinationStatus: values.postVaccinationStatus,
        postVaccinationNotes: values.postVaccinationNotes
      })
      message.success('Tạo kết quả sau tiêm thành công!')
      setCreateModalVisible(false)
      fetchAppointments()
    } catch {
      message.error('Tạo kết quả thất bại!')
    }
  }

  const columns: ColumnsType<PopulatedVaccineAppointment> = [
    {
      title: 'Học sinh',
      dataIndex: 'student',
      key: 'student',
      render: (_: unknown, record: PopulatedVaccineAppointment) => record.student?.fullName || record.studentId
    },
    {
      title: 'Sự kiện',
      dataIndex: 'event',
      key: 'event',
      render: (_: unknown, record: PopulatedVaccineAppointment) => record.event?.title || record.eventId
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: AppointmentStatus) => getStatusTag(status),
      filters: statusOptions.map((s) => ({ text: s.label, value: s.value })),
      onFilter: (value, record) => record.status === value
    },
    {
      title: 'Ngày tiêm',
      dataIndex: 'vaccinatedAt',
      key: 'vaccinatedAt',
      render: (date: Date) => (date ? formatDateTime(date) : '-')
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: unknown, record: PopulatedVaccineAppointment) => (
        <Space>
          {record.postVaccinationStatus ? (
            <Button
              type='text'
              icon={<EyeOutlined />}
              onClick={() => {
                setSelected(record)
                setIsDetailModalVisible(true)
              }}
            />
          ) : (
            <Button
              type='primary'
              onClick={() => {
                setSelected(record)
                setIsDetailModalVisible(true)
                setTimeout(() => handleEditResult(), 0)
              }}
            >
              Tạo kết quả
            </Button>
          )}
        </Space>
      )
    }
  ]

  const filteredAppointments: PopulatedVaccineAppointment[] = appointments.filter((item) => {
    const matchesSearch = searchKeyword
      ? (item.student?.fullName || '').toLowerCase().includes(searchKeyword.toLowerCase()) ||
        (item.event?.title || '').toLowerCase().includes(searchKeyword.toLowerCase())
      : true
    const matchesStatus = statusFilter ? item.status === statusFilter : true
    return matchesSearch && matchesStatus
  })

  const postVaccinationStatusLabels: Record<string, string> = {
    not_checked: 'Chưa kiểm tra',
    healthy: 'Bình thường, khỏe mạnh',
    mild_reaction: 'Phản ứng nhẹ',
    severe_reaction: 'Phản ứng nghiêm trọng',
    other: 'Khác'
  }

  return (
    <div className='p-6'>
      <Card className='shadow-sm'>
        <Row justify='space-between' align='middle' className='mb-4'>
          <Col>
            <Title level={2} className='m-0 flex items-center gap-2'>
              <MedicineBoxOutlined className='text-blue-600' />
              Quản lý lịch hẹn tiêm chủng
            </Title>
          </Col>
          <Col>
            <Space>
              <Button type='primary' onClick={handleOpenCreate}>
                Tạo kết quả
              </Button>
              <Button icon={<ReloadOutlined />} onClick={fetchAppointments} loading={loading}>
                Làm mới
              </Button>
            </Space>
          </Col>
        </Row>
        <Row gutter={[16, 16]} className='mb-4'>
          <Col xs={24} md={12}>
            <Search
              placeholder='Tìm kiếm theo học sinh, sự kiện...'
              allowClear
              enterButton={<SearchOutlined />}
              onSearch={(value) => setSearchKeyword(value)}
              onChange={(e) => setSearchKeyword(e.target.value)}
            />
          </Col>
          <Col xs={24} md={12}>
            <Select
              placeholder='Lọc theo trạng thái'
              allowClear
              style={{ width: '100%' }}
              onChange={(value) => setStatusFilter(value)}
            >
              {statusOptions.map((s) => (
                <Option key={s.value} value={s.value}>
                  <Space>
                    {s.icon}
                    {s.label}
                  </Space>
                </Option>
              ))}
            </Select>
          </Col>
        </Row>
        <Table
          columns={columns}
          dataSource={filteredAppointments}
          rowKey='_id'
          loading={loading}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: totalItems,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} lịch hẹn`,
            onChange: handleTableChange
          }}
          scroll={{ x: 800 }}
        />
        <Modal
          title='Tạo kết quả sau tiêm'
          open={createModalVisible}
          onCancel={() => setCreateModalVisible(false)}
          footer={[
            <Button key='cancel' onClick={() => setCreateModalVisible(false)}>
              Hủy
            </Button>,
            <Button key='save' type='primary' onClick={handleCreateResult}>
              Lưu kết quả
            </Button>
          ]}
          width={500}
        >
          <Form form={createForm} layout='vertical'>
            <Form.Item
              name='appointmentId'
              label='Chọn lịch hẹn tiêm'
              rules={[{ required: true, message: 'Vui lòng chọn lịch hẹn' }]}
            >
              <Select
                showSearch
                placeholder='Chọn lịch hẹn tiêm chưa có kết quả'
                filterOption={(input, option) =>
                  (typeof option?.children === 'string' ? option.children : String(option?.children))
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
              >
                {appointments
                  .filter((a) => !a.postVaccinationStatus)
                  .map((a) => (
                    <Option key={a._id} value={a._id}>
                      {a.student?.fullName || a.studentId} - {a.event?.title || a.eventId}
                    </Option>
                  ))}
              </Select>
            </Form.Item>
            <Form.Item
              name='postVaccinationStatus'
              label='Tình trạng sau tiêm'
              rules={[{ required: true, message: 'Vui lòng chọn tình trạng sau tiêm' }]}
            >
              <Select>
                <Option value={PostVaccinationStatus.NotChecked}>
                  {postVaccinationStatusLabels[PostVaccinationStatus.NotChecked]}
                </Option>
                <Option value={PostVaccinationStatus.Healthy}>
                  {postVaccinationStatusLabels[PostVaccinationStatus.Healthy]}
                </Option>
                <Option value={PostVaccinationStatus.MildReaction}>
                  {postVaccinationStatusLabels[PostVaccinationStatus.MildReaction]}
                </Option>
                <Option value={PostVaccinationStatus.SevereReaction}>
                  {postVaccinationStatusLabels[PostVaccinationStatus.SevereReaction]}
                </Option>
                <Option value={PostVaccinationStatus.Other}>
                  {postVaccinationStatusLabels[PostVaccinationStatus.Other]}
                </Option>
              </Select>
            </Form.Item>
            <Form.Item name='postVaccinationNotes' label='Ghi chú sau tiêm'>
              <Input.TextArea rows={3} maxLength={500} />
            </Form.Item>
          </Form>
        </Modal>
        <Modal
          title={
            <Space>
              <MedicineBoxOutlined className='text-blue-500' />
              Chi tiết lịch hẹn tiêm chủng
            </Space>
          }
          open={isDetailModalVisible}
          onCancel={() => {
            setIsDetailModalVisible(false)
            setEditMode(false)
          }}
          footer={[
            editMode ? (
              <Space key='edit-actions'>
                <Button onClick={() => setEditMode(false)}>Hủy</Button>
                <Button type='primary' onClick={handleSaveResult}>
                  Lưu kết quả
                </Button>
              </Space>
            ) : (
              <Button key='edit' type='primary' onClick={handleEditResult} disabled={!selected}>
                {selected?.postVaccinationStatus ? 'Chỉnh sửa kết quả' : 'Tạo kết quả'}
              </Button>
            ),
            <Button
              key='close'
              onClick={() => {
                setIsDetailModalVisible(false)
                setEditMode(false)
              }}
            >
              Đóng
            </Button>
          ]}
          width={700}
        >
          {selected && (
            <Descriptions bordered column={1} size='small'>
              <Descriptions.Item label='Học sinh'>{selected.student?.fullName}</Descriptions.Item>
              <Descriptions.Item label='Sự kiện'>{selected.event?.title}</Descriptions.Item>
              <Descriptions.Item label='Trạng thái'>{getStatusTag(selected.status)}</Descriptions.Item>
              <Descriptions.Item label='Ngày tiêm'>
                {selected.vaccinatedAt ? formatDateTime(selected.vaccinatedAt) : '-'}
              </Descriptions.Item>
              <Descriptions.Item label='Huyết áp'>{selected.bloodPressure || '-'}</Descriptions.Item>
              <Descriptions.Item label='Đủ điều kiện tiêm'>{selected.isEligible ? 'Có' : 'Không'}</Descriptions.Item>
              <Descriptions.Item label='Lý do nếu không đủ điều kiện'>
                {selected.reasonIfIneligible || '-'}
              </Descriptions.Item>
              <Descriptions.Item label='Ghi chú'>{selected.notes || '-'}</Descriptions.Item>
              <Descriptions.Item label='Năm học'>{selected.schoolYear}</Descriptions.Item>
              <Descriptions.Item label='Kết quả sau tiêm'>
                {editMode ? (
                  <Form form={form} layout='vertical'>
                    <Form.Item
                      name='postVaccinationStatus'
                      label='Tình trạng sau tiêm'
                      rules={[{ required: true, message: 'Vui lòng chọn tình trạng sau tiêm' }]}
                    >
                      <Select>
                        <Option value={PostVaccinationStatus.NotChecked}>
                          {postVaccinationStatusLabels[PostVaccinationStatus.NotChecked]}
                        </Option>
                        <Option value={PostVaccinationStatus.Healthy}>
                          {postVaccinationStatusLabels[PostVaccinationStatus.Healthy]}
                        </Option>
                        <Option value={PostVaccinationStatus.MildReaction}>
                          {postVaccinationStatusLabels[PostVaccinationStatus.MildReaction]}
                        </Option>
                        <Option value={PostVaccinationStatus.SevereReaction}>
                          {postVaccinationStatusLabels[PostVaccinationStatus.SevereReaction]}
                        </Option>
                        <Option value={PostVaccinationStatus.Other}>
                          {postVaccinationStatusLabels[PostVaccinationStatus.Other]}
                        </Option>
                      </Select>
                    </Form.Item>
                    <Form.Item name='postVaccinationNotes' label='Ghi chú sau tiêm'>
                      <Input.TextArea rows={3} maxLength={500} />
                    </Form.Item>
                  </Form>
                ) : (
                  <>
                    <div>
                      <b>Tình trạng:</b> {postVaccinationStatusLabels[selected.postVaccinationStatus || 'not_checked']}
                    </div>
                    <div>
                      <b>Ghi chú:</b> {selected.postVaccinationNotes || '-'}
                    </div>
                  </>
                )}
              </Descriptions.Item>
            </Descriptions>
          )}
        </Modal>
      </Card>
    </div>
  )
}

export default AppointmentVaccine
