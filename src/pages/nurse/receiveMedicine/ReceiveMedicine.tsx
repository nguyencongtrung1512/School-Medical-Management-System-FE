import { DeleteOutlined, InboxOutlined, MedicineBoxOutlined } from '@ant-design/icons'
import {
  Button,
  Card,
  Col,
  Descriptions,
  Input,
  message,
  Modal,
  Row,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
  Upload
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import React, { useEffect, useState } from 'react'
import {
  getMedicineSubmissionById,
  getMedicineSubmissionsByNurseId,
  MedicineDetail,
  MedicineSubmissionData,
  updateMedicineSlotStatus,
  updateMedicineSubmissionStatus,
  UpdateMedicineSubmissionStatusRequest
} from '../../../api/medicineSubmissions.api'
import { getStudentByIdAPI, StudentProfile } from '../../../api/student.api'
import { getUserByIdAPI, Profile } from '../../../api/user.api'
import { handleUploadFile } from '../../../utils/upload'

const { Title, Text } = Typography

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
  shiftSendMedicine: string // Added field from updated API
  image: string // Added field from updated API
  isDeleted: boolean
  _id: string
  createdAt: string
  updatedAt: string
  __v: number
  nurseNotes?: string
}

const SHIFT_LABELS: Record<string, string> = {
  morning: 'Sáng',
  noon: 'Trưa',
  afternoon: 'Chiều',
  evening: 'Tối'
}

const ReceiveMedicine: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<PopulatedMedicineSubmissionData | null>(null)
  const [medicineRequests, setMedicineRequests] = useState<PopulatedMedicineSubmissionData[]>([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalItems, setTotalItems] = useState(0)
  const [slotModalOpen, setSlotModalOpen] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<SlotRow | null>(null)
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string>('')
  const [slotNote, setSlotNote] = useState('')
  const [slotImage, setSlotImage] = useState('')
  const [slotUploading, setSlotUploading] = useState(false)
  const [slotLoading, setSlotLoading] = useState(false)
  const [confirmModal, setConfirmModal] = useState<{ open: boolean; type: 'approve' | 'reject'; id: string }>({
    open: false,
    type: 'approve',
    id: ''
  })
  const [rejectReason, setRejectReason] = useState('')
  const [confirmLoading, setConfirmLoading] = useState(false)

  useEffect(() => {
    const fetchMedicineRequests = async () => {
      setLoading(true)
      try {
        const userStr = localStorage.getItem('user')
        if (!userStr) {
          message.error('Không tìm thấy thông tin người dùng')
          return
        }
        const user = JSON.parse(userStr)
        const response = await getMedicineSubmissionsByNurseId(user._id, currentPage, pageSize)
        const populatedRequests = await Promise.all(
          response.pageData.map(async (request) => {
            try {
              if (!request.studentId || !request.parentId) {
                throw new Error('Missing student or parent ID')
              }
              const [studentResponse, parentResponse] = await Promise.all([
                getStudentByIdAPI(request.studentId),
                getUserByIdAPI(request.parentId)
              ])
              return {
                ...request,
                studentId: studentResponse.data,
                parentInfo: parentResponse.data,
                medicines: request.medicines.map((med) => ({
                  ...med,
                  _id: med._id || '',
                  createdAt: med.createdAt || '',
                  updatedAt: med.updatedAt || ''
                }))
              }
            } catch (error) {
              console.error('Error fetching details for request:', request._id, error)
              return {
                ...request,
                studentId: {} as StudentProfile,
                parentInfo: {} as Profile,
                medicines: request.medicines.map((med) => ({
                  ...med,
                  _id: med._id || '',
                  createdAt: med.createdAt || '',
                  updatedAt: med.updatedAt || ''
                }))
              }
            }
          })
        )
        setMedicineRequests(populatedRequests)
        setTotalItems(response.pageInfo.totalItems)
      } catch (error: unknown) {
        console.error('Error fetching medicine requests:', error)
        const err = error as { message?: string }
        if (err.message) {
          message.error(err.message)
        } else {
          message.error('Có lỗi xảy ra khi tải danh sách đơn thuốc!')
        }
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
      dataIndex: 'studentId',
      key: 'studentId',
      render: (student: StudentProfile) => (
        <div>
          <div>{student.fullName}</div>
          <Text type='secondary'>Mã số: {student.studentIdCode}</Text>
        </div>
      )
    },
    {
      title: 'Phụ huynh',
      dataIndex: 'parentInfo',
      key: 'parentInfo',
      render: (parent: Profile) => (
        <div>
          <div>{parent.fullName}</div>
          <Text type='secondary'>{parent.phone}</Text>
        </div>
      )
    },
    {
      title: 'Ca gửi thuốc',
      dataIndex: 'shiftSendMedicine',
      key: 'shiftSendMedicine',
      render: (shift: string) => SHIFT_LABELS[shift] || shift
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusConfig = {
          pending: { color: 'blue', text: 'Chờ duyệt' },
          approved: { color: 'green', text: 'Đã duyệt' },
          rejected: { color: 'red', text: 'Từ chối' },
          completed: { color: 'purple', text: 'Hoàn thành' }
        }
        const config = statusConfig[status as keyof typeof statusConfig] || { color: 'default', text: status }
        return <Tag color={config.color}>{config.text}</Tag>
      }
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: unknown, record: PopulatedMedicineSubmissionData) => (
        <Space>
          <Button type='primary' size='small' onClick={() => handleViewDetails(record)}>
            Chi tiết
          </Button>
          {record.status === 'pending' && (
            <>
              <Button
                type='primary'
                size='small'
                onClick={() => setConfirmModal({ open: true, type: 'approve', id: record._id })}
              >
                Duyệt
              </Button>
              <Button
                danger
                size='small'
                onClick={() => setConfirmModal({ open: true, type: 'reject', id: record._id })}
              >
                Từ chối
              </Button>
            </>
          )}
        </Space>
      )
    }
  ]

  const handleViewDetails = (record: PopulatedMedicineSubmissionData) => {
    setSelectedRequest(record)
    setIsModalVisible(true)
  }

  const handleUpdateStatus = async (id: string, newStatus: MedicineSubmissionData['status'], reason?: string) => {
    try {
      let payload: UpdateMedicineSubmissionStatusRequest = {
        status: newStatus as UpdateMedicineSubmissionStatusRequest['status']
      }
      if (newStatus === 'rejected') {
        payload = { status: 'rejected', cancellationReason: reason }
      }
      await updateMedicineSubmissionStatus(id, payload)
      message.success('Cập nhật trạng thái thành công!')
      setMedicineRequests((prevRequests) =>
        prevRequests.map((req) => (req._id === id ? { ...req, status: newStatus } : req))
      )
      // Nếu đang xem chi tiết đúng đơn này thì cập nhật luôn trạng thái trong selectedRequest
      setSelectedRequest((prev) => (prev && prev._id === id ? { ...prev, status: newStatus } : prev))
    } catch (error: unknown) {
      console.log('error', error)
      const err = error as { message?: string }
      if (err.message) {
        message.error(err.message)
      } else {
        message.error('Có lỗi xảy ra khi cập nhật trạng thái!')
      }
    }
  }

  // Thống kê
  const stats = {
    total: medicineRequests.length,
    pending: medicineRequests.filter((r) => r.status === 'pending').length,
    approved: medicineRequests.filter((r) => r.status === 'approved').length,
    completed: medicineRequests.filter((r) => r.status === 'completed').length,
    rejected: medicineRequests.filter((r) => r.status === 'rejected').length
  }

  // Table columns for slots inside each medicine submission
  interface SlotRow {
    medicineName: string
    dosage: string
    shift: string // Changed from time to shift to match BE
    status: string
    note?: string
    image?: string
    medicineDetailId: string
    submissionId: string
  }

  interface SlotStatusItem {
    shift: string
    status: string
    note?: string
    image?: string
    _id?: string
  }
  const slotColumns: ColumnsType<SlotRow> = [
    {
      title: 'Tên thuốc',
      dataIndex: 'medicineName',
      key: 'medicineName',
      render: (_: unknown, record: SlotRow) => record.medicineName
    },
    {
      title: 'Liều lượng',
      dataIndex: 'dosage',
      key: 'dosage',
      render: (_: unknown, record: SlotRow) => record.dosage
    },
    {
      title: 'Ca uống',
      dataIndex: 'shift',
      key: 'shift',
      render: (shift: string) => SHIFT_LABELS[shift] || shift
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = 'blue',
          text = 'Chờ uống'
        if (status === 'taken') {
          color = 'green'
          text = 'Đã uống'
        }
        if (status === 'missed') {
          color = 'red'
          text = 'Bỏ lỡ'
        }
        return <Tag color={color}>{text}</Tag>
      }
    },
    {
      title: 'Ảnh minh họa',
      dataIndex: 'image',
      key: 'image',
      render: (image: string) => (image ? <img src={image} alt='minh họa' style={{ maxWidth: 80 }} /> : null)
    },
    {
      title: 'Ghi chú',
      dataIndex: 'note',
      key: 'note',
      render: (note: string) => note || ''
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: unknown, record: SlotRow) => {
        // Chỉ hiển thị nút hoàn thành nếu slot đang ở trạng thái pending và đơn đã được duyệt
        if (record.status === 'pending' && selectedRequest?.status === 'approved') {
          return (
            <Button type='primary' size='small' onClick={() => openSlotModal(record)}>
              Hoàn thành
            </Button>
          )
        }
        return null
      }
    }
  ]

  const openSlotModal = (slot: SlotRow) => {
    setSelectedSlot(slot)
    setSlotNote('')
    setSlotImage('')
    setSlotModalOpen(true)
    setSelectedSubmissionId(slot.submissionId)
  }

  const handleSlotUpload = async (file: File) => {
    setSlotUploading(true)
    const url = await handleUploadFile(file, 'image')
    if (url) setSlotImage(url)
    setSlotUploading(false)
    return false // prevent default upload
  }

  const handleCompleteSlot = async () => {
    if (!selectedSlot) return
    setSlotLoading(true)
    try {
      const updatedData = await updateMedicineSlotStatus(selectedSubmissionId, {
        medicineDetailId: selectedSlot.medicineDetailId,
        shift: selectedSlot.shift, // Changed from time to shift
        status: 'taken',
        note: slotNote,
        image: slotImage
      })

      message.success('Cập nhật thành công!')
      setSlotModalOpen(false)
      setSelectedSlot(null)
      setSlotNote('')
      setSlotImage('')

      // Cập nhật selectedRequest với data mới
      if (selectedRequest && updatedData) {
        try {
          // Populate student and parent info
          const [studentResponse, parentResponse] = await Promise.all([
            getStudentByIdAPI(updatedData?.data?.studentId),
            getUserByIdAPI(updatedData?.data?.parentId)
          ])

          const updatedSelectedRequest = {
            ...updatedData,
            studentId: studentResponse.data,
            parentInfo: parentResponse.data,
            medicines: updatedData.medicines.map((med) => ({
              ...med,
              _id: med._id || '',
              createdAt: med.createdAt || '',
              updatedAt: med.updatedAt || ''
            }))
          }

          setSelectedRequest(updatedSelectedRequest)
        } catch (error) {
          console.error('Error populating updated data:', error)
          // Fallback: refresh the main list
          setCurrentPage((prev) => prev)
        }
      }

      // Cập nhật danh sách chính
      if (updatedData) {
        setMedicineRequests((prevRequests) => {
          return prevRequests.map((req) => {
            if (req._id === selectedSubmissionId) {
              return {
                ...updatedData,
                studentId: req.studentId, // Giữ nguyên thông tin đã populate
                parentInfo: req.parentInfo, // Giữ nguyên thông tin đã populate
                medicines: updatedData.medicines.map((med) => ({
                  ...med,
                  _id: med._id || '',
                  createdAt: med.createdAt || '',
                  updatedAt: med.updatedAt || ''
                }))
              }
            }
            return req
          })
        })
      } else {
        // Fallback: refresh data nếu API không trả về data
        const userStr = localStorage.getItem('user')
        if (userStr) {
          const user = JSON.parse(userStr)
          const response = await getMedicineSubmissionsByNurseId(user._id, currentPage, pageSize)
          const populatedRequests = await Promise.all(
            response.pageData.map(async (request) => {
              try {
                if (!request.studentId || !request.parentId) {
                  throw new Error('Missing student or parent ID')
                }
                const [studentResponse, parentResponse] = await Promise.all([
                  getStudentByIdAPI(request.studentId),
                  getUserByIdAPI(request.parentId)
                ])
                return {
                  ...request,
                  studentId: studentResponse.data,
                  parentInfo: parentResponse.data,
                  medicines: request.medicines.map((med) => ({
                    ...med,
                    _id: med._id || '',
                    createdAt: med.createdAt || '',
                    updatedAt: med.updatedAt || ''
                  }))
                }
              } catch (error) {
                console.error('Error fetching details for request:', request._id, error)
                return {
                  ...request,
                  studentId: {} as StudentProfile,
                  parentInfo: {} as Profile,
                  medicines: request.medicines.map((med) => ({
                    ...med,
                    _id: med._id || '',
                    createdAt: med.createdAt || '',
                    updatedAt: med.updatedAt || ''
                  }))
                }
              }
            })
          )
          setMedicineRequests(populatedRequests)
          setTotalItems(response.pageInfo.totalItems)
        }

        // Refresh the selected request details if modal is open
        if (selectedRequest) {
          try {
            const detailRes = await getMedicineSubmissionById(selectedRequest._id)
            console.log('detailRes', detailRes)
            if (!detailRes.studentId || !detailRes.parentId) {
              throw new Error('Missing student or parent ID')
            }
            const [studentResponse, parentResponse] = await Promise.all([
              getStudentByIdAPI(detailRes.studentId),
              getUserByIdAPI(detailRes.parentId)
            ])
            setSelectedRequest({
              ...detailRes,
              studentId: studentResponse.data,
              parentInfo: parentResponse.data,
              medicines: detailRes.medicines.map((med) => ({
                ...med,
                _id: med._id || '',
                createdAt: med.createdAt || '',
                updatedAt: med.updatedAt || ''
              }))
            })
          } catch (error) {
            console.error('Error refreshing modal details:', error)
            // If we can't fetch the new details, at least refresh the main list
            // Trigger useEffect to reload data
            setCurrentPage((prev) => prev)
          }
        }
      }
    } catch (error: unknown) {
      console.log('error', error)
      const err = error as { message?: string }
      if (err.message) {
        message.error(err.message)
      } else {
        message.error('Cập nhật thất bại!')
      }
    } finally {
      setSlotLoading(false)
    }
  }

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Space direction='vertical' style={{ width: '100%' }}>
          {/* header */}
          <Card style={{ background: 'linear-gradient(135deg, #06b6d4 100%)' }}>
            <Row justify='space-between' align='middle'>
              <Col>
                <Title level={3} style={{ color: 'white', margin: 0 }}>
                  <MedicineBoxOutlined style={{ marginRight: 12 }} />
                  Nhận thuốc từ phụ huynh
                </Title>
              </Col>
            </Row>
          </Card>

          {/* Thống kê */}
          <Row className='mt-6' gutter={16} style={{ marginBottom: 24 }} justify='space-between'>
            <Col flex='1'>
              <Card hoverable>
                <Statistic title='Tổng số đơn' value={stats.total} prefix={<MedicineBoxOutlined />} />
              </Card>
            </Col>
            <Col flex='1'>
              <Card hoverable>
                <Statistic title='Chờ xác nhận' value={stats.pending} valueStyle={{ color: '#1890ff' }} />
              </Card>
            </Col>
            <Col flex='1'>
              <Card hoverable>
                <Statistic title='Đã duyệt' value={stats.approved} valueStyle={{ color: '#52c41a' }} />
              </Card>
            </Col>
            <Col flex='1'>
              <Card hoverable>
                <Statistic title='Đã hoàn thành' value={stats.completed} valueStyle={{ color: '#16a085' }} />
              </Card>
            </Col>
            <Col flex='1'>
              <Card hoverable>
                <Statistic title='Từ chối' value={stats.rejected} valueStyle={{ color: '#a42e2e' }} />
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
            expandable={{
              expandedRowRender: (record: PopulatedMedicineSubmissionData) => (
                <Table
                  columns={slotColumns}
                  dataSource={record.medicines.flatMap((med: MedicineDetail) =>
                    (med.timeShifts || []).map((shift: string, idx: number) => ({
                      // Changed from timeSlots to timeShifts
                      medicineName: med.name,
                      dosage: med.dosage || '',
                      shift, // Changed from time to shift
                      status: med.slotStatus?.[idx]?.status || 'pending',
                      note: med.slotStatus?.[idx]?.note || '',
                      image: med.slotStatus?.[idx]?.image || '',
                      medicineDetailId: med._id || '',
                      submissionId: record._id
                    }))
                  )}
                  rowKey={(row: SlotRow) => row.medicineDetailId + '-' + row.shift} // Changed from time to shift
                  pagination={false}
                />
              )
            }}
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
              <div className='max-h-[70vh] overflow-y-auto'>
                {/* Ảnh minh họa thuốc */}
                {selectedRequest.image && (
                  <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <img
                      src={selectedRequest.image}
                      alt='Ảnh thuốc'
                      style={{ maxWidth: 300, borderRadius: 12, boxShadow: '0 2px 12px #ccc', marginBottom: 8 }}
                    />
                    <div style={{ color: '#888', fontSize: 13 }}>Ảnh minh họa thuốc do phụ huynh cung cấp</div>
                  </div>
                )}
                {/* Thông tin chung đơn thuốc */}
                <Descriptions bordered column={2} style={{ marginBottom: 24 }}>
                  <Descriptions.Item label='Học sinh' span={2}>
                    {selectedRequest.studentId.fullName} - Mã số: {selectedRequest.studentId.studentIdCode}
                  </Descriptions.Item>
                  <Descriptions.Item label='Phụ huynh' span={2}>
                    {selectedRequest.parentInfo?.fullName || 'N/A'} - {selectedRequest.parentInfo?.phone || 'N/A'}
                  </Descriptions.Item>
                  <Descriptions.Item label='Trạng thái duyệt của đơn' span={2}>
                    {(() => {
                      const statusConfig = {
                        pending: 'Chờ duyệt',
                        approved: 'Đã duyệt',
                        rejected: 'Từ chối',
                        completed: 'Hoàn thành'
                      }
                      return statusConfig[selectedRequest.status] || selectedRequest.status
                    })()}
                  </Descriptions.Item>
                  <Descriptions.Item label='Thời gian gửi đơn' span={2}>
                    {SHIFT_LABELS[selectedRequest.shiftSendMedicine] || selectedRequest.shiftSendMedicine}
                  </Descriptions.Item>
                  <Descriptions.Item label='Ngày tạo' span={1}>
                    {new Date(selectedRequest.createdAt).toLocaleString('vi-VN')}
                  </Descriptions.Item>
                  <Descriptions.Item label='Ngày cập nhật' span={1}>
                    {new Date(selectedRequest.updatedAt).toLocaleString('vi-VN')}
                  </Descriptions.Item>
                </Descriptions>
                {/* Danh sách thuốc */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  {selectedRequest.medicines.map((med, idx) => (
                    <div
                      key={med._id || idx}
                      style={{ border: '1px solid #eee', borderRadius: 10, padding: 20, background: '#fafcff' }}
                    >
                      <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 8 }}>
                        Thuốc #{idx + 1}: {med.name}
                      </div>
                      <div>
                        <b>Liều lượng uống 1 lần:</b> {med.dosage}
                      </div>
                      <div>
                        <b>Hướng dẫn uống:</b> {med.usageInstructions}
                      </div>
                      <div>
                        <b>Tổng số lượng nộp thuốc:</b> {med.quantity}
                      </div>
                      <div>
                        <b>Số lần uống trong ngày:</b> {med.timesPerDay}
                      </div>
                      <div>
                        <b>Ca uống:</b> {med.timeShifts.map((shift) => SHIFT_LABELS[shift] || shift).join(', ')}
                      </div>
                      <div>
                        <b>Lý do sử dụng thuốc:</b> {med.reason}
                      </div>
                      <div>
                        <b>Ghi chú của thuốc:</b> {med.note}
                      </div>
                      {/* Lịch uống thuốc (slotStatus) */}
                      {med.slotStatus && med.slotStatus.length > 0 && (
                        <div style={{ marginTop: 16 }}>
                          <div style={{ fontWeight: 500, marginBottom: 4 }}>Lịch uống thuốc:</div>
                          <Table
                            columns={[
                              {
                                title: 'Ca y tá cho uống',
                                dataIndex: 'shift',
                                key: 'shift',
                                render: (shift) => SHIFT_LABELS[shift] || shift
                              },
                              {
                                title: 'Trạng thái slot',
                                dataIndex: 'status',
                                key: 'status',
                                render: (status) => {
                                  const statusMap: Record<string, string> = {
                                    pending: 'Chờ uống',
                                    taken: 'Đã uống',
                                    missed: 'Bỏ lỡ',
                                    compensated: 'Uống bù'
                                  }
                                  return statusMap[status] || status
                                }
                              },
                              { title: 'Ghi chú slot', dataIndex: 'note', key: 'note' },
                              {
                                title: 'Ảnh xác nhận',
                                dataIndex: 'image',
                                key: 'image',
                                render: (image: string) => {
                                  if (image) {
                                    return (
                                      <img
                                        src={image}
                                        alt='Ảnh xác nhận uống thuốc'
                                        style={{
                                          maxWidth: 60,
                                          maxHeight: 60,
                                          borderRadius: 4,
                                          cursor: 'pointer',
                                          objectFit: 'cover'
                                        }}
                                        onClick={() => {
                                          // Mở ảnh trong modal lớn hơn
                                          Modal.info({
                                            title: 'Ảnh xác nhận uống thuốc',
                                            content: (
                                              <div style={{ textAlign: 'center' }}>
                                                <img
                                                  src={image}
                                                  alt='Ảnh xác nhận uống thuốc'
                                                  style={{
                                                    maxWidth: '100%',
                                                    maxHeight: '400px',
                                                    borderRadius: 8
                                                  }}
                                                />
                                              </div>
                                            ),
                                            width: 600,
                                            okText: 'Đóng'
                                          })
                                        }}
                                      />
                                    )
                                  }
                                  return <span style={{ color: '#ccc' }}>Không có ảnh</span>
                                }
                              },
                              {
                                title: 'Thao tác',
                                key: 'action',
                                render: (_, record: SlotStatusItem) => {
                                  // Chỉ hiển thị nút hoàn thành nếu slot đang ở trạng thái pending và đơn đã được duyệt
                                  if (record.status === 'pending' && selectedRequest?.status === 'approved') {
                                    return (
                                      <Button
                                        type='primary'
                                        size='small'
                                        onClick={() => {
                                          setSelectedSlot({
                                            medicineName: med.name,
                                            dosage: med.dosage || '',
                                            shift: record.shift,
                                            status: record.status,
                                            note: record.note || '',
                                            image: record.image || '',
                                            medicineDetailId: med._id || '',
                                            submissionId: selectedRequest._id
                                          })
                                          setSlotNote('')
                                          setSlotImage('')
                                          setSlotModalOpen(true)
                                          setSelectedSubmissionId(selectedRequest._id)
                                        }}
                                      >
                                        Hoàn thành
                                      </Button>
                                    )
                                  }
                                  return null
                                }
                              }
                            ]}
                            dataSource={med.slotStatus}
                            rowKey={(row) => row._id || row.shift}
                            size='small'
                            pagination={false}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {selectedRequest.status === 'pending' && (
                  <div className='flex justify-end gap-2 mt-6'>
                    <Button
                      type='primary'
                      onClick={() => setConfirmModal({ open: true, type: 'approve', id: selectedRequest._id })}
                    >
                      Duyệt đơn
                    </Button>
                    <Button
                      danger
                      onClick={() => setConfirmModal({ open: true, type: 'reject', id: selectedRequest._id })}
                    >
                      Từ chối
                    </Button>
                  </div>
                )}
              </div>
            )}
          </Modal>

          {/* Modal hoàn thành slot */}
          <Modal
            title='Xác nhận hoàn thành uống thuốc'
            open={slotModalOpen}
            onCancel={() => setSlotModalOpen(false)}
            onOk={handleCompleteSlot}
            okText='Xác nhận'
            confirmLoading={slotLoading}
          >
            {selectedSlot && (
              <div>
                <div>
                  <b>Thuốc:</b> {selectedSlot.medicineName}
                </div>
                <div>
                  <b>Ca uống:</b>{' '}
                  {(() => {
                    return SHIFT_LABELS[selectedSlot.shift] || selectedSlot.shift
                  })()}
                </div>
                <Input.TextArea
                  value={slotNote}
                  onChange={(e) => setSlotNote(e.target.value)}
                  placeholder='Ghi chú (nếu có)'
                  rows={3}
                  style={{ marginTop: 12 }}
                />
                <div className='mt-4'>
                  <Upload.Dragger
                    name='file'
                    multiple={false}
                    showUploadList={false}
                    beforeUpload={handleSlotUpload}
                    accept='image/*'
                    disabled={slotUploading}
                    style={{ padding: 16, borderRadius: 8 }}
                  >
                    <p className='ant-upload-drag-icon'>
                      <InboxOutlined style={{ fontSize: 32, color: '#1890ff' }} />
                    </p>
                    <p className='ant-upload-text'>Kéo & thả hoặc bấm để chọn ảnh minh họa</p>
                    <p className='ant-upload-hint'>Chỉ nhận file ảnh, dung lượng tối đa 5MB.</p>
                  </Upload.Dragger>
                  {slotImage && (
                    <div className='flex flex-col items-center mt-4'>
                      <img src={slotImage} alt='preview' className='rounded shadow max-h-60 mb-2' />
                      <Button icon={<DeleteOutlined />} danger size='small' onClick={() => setSlotImage('')}>
                        Xóa ảnh
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </Modal>

          {/* Modal xác nhận duyệt/từ chối */}
          <Modal
            open={confirmModal.open}
            onCancel={() => {
              setConfirmModal({ ...confirmModal, open: false })
              setRejectReason('')
            }}
            onOk={async () => {
              setConfirmLoading(true)
              if (confirmModal.type === 'approve') {
                await handleUpdateStatus(confirmModal.id, 'approved')
                setConfirmModal({ ...confirmModal, open: false })
              } else {
                if (!rejectReason.trim()) {
                  message.warning('Vui lòng nhập lý do từ chối!')
                  setConfirmLoading(false)
                  return
                }
                await handleUpdateStatus(confirmModal.id, 'rejected', rejectReason)
                setRejectReason('')
                setConfirmModal({ ...confirmModal, open: false })
              }
              setConfirmLoading(false)
            }}
            okText={confirmModal.type === 'approve' ? 'Xác nhận duyệt' : 'Xác nhận từ chối'}
            cancelText='Hủy'
            confirmLoading={confirmLoading}
          >
            {confirmModal.type === 'approve' ? (
              <div>
                Bạn chắc chắn muốn <b>duyệt</b> đơn thuốc này?
              </div>
            ) : (
              <div>
                <div>Vui lòng nhập lý do từ chối:</div>
                <Input.TextArea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={3}
                  placeholder='Nhập lý do từ chối...'
                  style={{ marginTop: 8 }}
                />
              </div>
            )}
          </Modal>
        </Space>
      </Card>
    </div>
  )
}

export default ReceiveMedicine
