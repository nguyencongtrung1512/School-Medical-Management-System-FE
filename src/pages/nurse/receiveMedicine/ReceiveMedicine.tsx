import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  InboxOutlined,
  MedicineBoxOutlined
} from '@ant-design/icons'
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
  getMedicineSubmissionsByNurseId,
  MedicineDetail,
  MedicineSubmissionData,
  updateMedicineSlotStatus,
  updateMedicineSubmissionStatus,
  UpdateMedicineSubmissionStatusRequest,
  getMedicineSubmissionById
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
  isDeleted: boolean
  _id: string
  createdAt: string
  updatedAt: string
  __v: number
  nurseNotes?: string
}

interface MedicineDetailWithSlotStatus extends MedicineDetail {
  _id: string
  createdAt: string
  updatedAt: string
  slotStatus?: Array<{
    time: string
    status: string
    note?: string
    image?: string
    _id?: string
  }>
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
          message.error('Vui lòng đăng nhập lại!')
          setLoading(false)
          return
        }

        const user = JSON.parse(userStr)
        if (!user || !user.id) {
          message.error('Thông tin người dùng không hợp lệ!')
          setLoading(false)
          return
        }

        const response = await getMedicineSubmissionsByNurseId(user.id, currentPage, pageSize)
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
            } catch (error: unknown) {
              console.log('error', error)
              const err = error as { message?: string }
              if (err.message) {
                message.error(err.message)
              }
              return request
            }
          })
        )
        setMedicineRequests(requestsWithStudentInfo as PopulatedMedicineSubmissionData[])
        setTotalItems(response.pageInfo.totalItems)
      } catch (error: unknown) {
        console.log('error', error)
        const err = error as { message?: string }
        if (err.message) {
          message.error(err.message)
        } else {
          message.error('Không thể lấy danh sách yêu cầu thuốc!')
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
      render: (_status: PopulatedMedicineSubmissionData['status'], record) => {
        // Kiểm tra có slot nào đã trễ không
        const now = new Date()
        const hasLateSlot = record.medicines.some((med) =>
          (med.timeSlots || []).some(
            (time, idx) => new Date(time) < now && (med.slotStatus?.[idx]?.status ?? 'pending') === 'pending'
          )
        )
        if (hasLateSlot) {
          return <Tag color='default'>Đã trễ</Tag>
        }
        let color = 'blue',
          text = 'Chờ xác nhận',
          icon = <ClockCircleOutlined />
        switch (_status) {
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
          {/* {record.status === 'pending' && (
            <Button type='primary' onClick={() => handleUpdateStatus(record._id, 'approved')}>
              Duyệt đơn
            </Button>
          )}
          {record.status === 'pending' && (
            <Button danger onClick={() => handleUpdateStatus(record._id, 'rejected')}>
              Từ chối
            </Button>
          )} */}
          {/* {record.status === 'approved' && (
            <Button type='primary' onClick={() => handleUpdateStatus(record._id, 'completed')}>
              Hoàn thành
            </Button>
          )} */}
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
    time: string
    status: string
    note?: string
    image?: string
    medicineDetailId: string
    submissionId: string
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
      title: 'Thời gian uống',
      dataIndex: 'time',
      key: 'time',
      render: (time: string) => new Date(time).toLocaleString('vi-VN')
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string, record: SlotRow) => {
        const now = new Date()
        const slotTime = new Date(record.time)
        if (status === 'pending' && slotTime < now) {
          return <Tag color='default'>Đã trễ</Tag>
        }
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
        if (status === 'compensated') {
          color = 'orange'
          text = 'Uống bù'
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
        const now = new Date()
        const slotTime = new Date(record.time)
        // Chỉ hiển thị nút hoàn thành nếu slot chưa trễ và đang ở trạng thái pending và đơn đã được duyệt
        if (record.status === 'pending' && selectedRequest?.status === 'approved' && slotTime >= now) {
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
      await updateMedicineSlotStatus(selectedSubmissionId, {
        medicineDetailId: selectedSlot.medicineDetailId,
        time: selectedSlot.time,
        status: 'taken',
        note: slotNote,
        image: slotImage
      })
      message.success('Cập nhật thành công!')
      setSlotModalOpen(false)
      setSelectedSlot(null)
      setSlotNote('')
      setSlotImage('')
      // reload data
      setCurrentPage(1)
      // fetch lại chi tiết đơn thuốc nếu đang mở modal chi tiết
      if (selectedRequest) {
        try {
          const detailRes = await getMedicineSubmissionById(selectedRequest._id)
          console.log('detailRes', detailRes)
          const [studentResponse, parentResponse] = await Promise.all([
            getStudentByIdAPI(detailRes.data.student._id as string),
            getUserByIdAPI(detailRes.data.parent._id)
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
        } catch {
          // ignore
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
                <Statistic title='Đã duyệt' value={stats.approved} valueStyle={{ color: '#52c41a' }} />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic title='Đã hoàn thành' value={stats.completed} valueStyle={{ color: '#16a085' }} />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
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
                  dataSource={record.medicines.flatMap((med: MedicineDetailWithSlotStatus) =>
                    (med.timeSlots || []).map((time: string, idx: number) => ({
                      medicineName: med.name,
                      dosage: med.dosage || '',
                      time,
                      status: med.slotStatus?.[idx]?.status || 'pending',
                      note: med.slotStatus?.[idx]?.note || '',
                      image: med.slotStatus?.[idx]?.image || '',
                      medicineDetailId: med._id,
                      submissionId: record._id
                    }))
                  )}
                  rowKey={(row: SlotRow) => row.medicineDetailId + '-' + row.time}
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
                <Descriptions bordered column={2}>
                  <Descriptions.Item label='Học sinh' span={2}>
                    {selectedRequest.studentId.fullName} - Mã số: {selectedRequest.studentId.studentCode}
                    {selectedRequest.studentId.classInfo && (
                      <div>
                        <Text type='secondary'>Lớp: {selectedRequest.studentId.classInfo?.name}</Text>
                      </div>
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item label='Phụ huynh' span={2}>
                    {selectedRequest.parentInfo?.fullName || 'N/A'}
                    <div>
                      <Text type='secondary'>Số điện thoại: {selectedRequest.parentInfo?.phone || 'N/A'}</Text>
                    </div>
                  </Descriptions.Item>
                </Descriptions>
                {/* Hiển thị danh sách slot uống thuốc */}
                <div style={{ marginTop: 24 }}>
                  <Title level={5}>Lịch uống thuốc</Title>
                  <Table
                    columns={slotColumns}
                    dataSource={selectedRequest.medicines.flatMap((med: MedicineDetailWithSlotStatus) =>
                      (med.timeSlots || []).map((time: string, idx: number) => ({
                        medicineName: med.name,
                        dosage: med.dosage || '',
                        time,
                        status: med.slotStatus?.[idx]?.status || 'pending',
                        note: med.slotStatus?.[idx]?.note || '',
                        image: med.slotStatus?.[idx]?.image || '',
                        medicineDetailId: med._id,
                        submissionId: selectedRequest._id
                      }))
                    )}
                    rowKey={(row: SlotRow) => row.medicineDetailId + '-' + row.time}
                    pagination={false}
                    size='small'
                  />
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
                  <b>Thời gian:</b> {new Date(selectedSlot.time).toLocaleString('vi-VN')}
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
