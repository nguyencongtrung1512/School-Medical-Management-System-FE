import {
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DownloadOutlined,
  EyeOutlined,
  MedicineBoxOutlined,
  UserOutlined
} from '@ant-design/icons'
import {
  Avatar,
  Badge,
  Button,
  Card,
  Descriptions,
  Divider,
  Empty,
  Form,
  Input,
  message,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useEffect, useState } from 'react'
import * as XLSX from 'xlsx'
import { appointmentApi, ParentNurseAppointment, ParentNurseAppointmentStatus } from '../../../api/appointment.api'
import { searchNurseUsersAPI } from '../../../api/user.api'

const { Title, Text, Paragraph } = Typography
const { TextArea } = Input
const { Option } = Select

// Mock interfaces - replace with your actual types
// Xóa interface Appointment, dùng ParentNurseAppointment
interface Nurse {
  _id: string
  fullName: string
  email: string
  avatar?: string
  department?: string
}

function AppointmentCheck() {
  const [appointments, setAppointments] = useState<ParentNurseAppointment[]>([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<ParentNurseAppointment | null>(null)
  const [nurses, setNurses] = useState<Nurse[]>([])
  const [selectedNurse, setSelectedNurse] = useState<string>('')
  const [assigning, setAssigning] = useState(false)
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [cancelNote, setCancelNote] = useState('')
  const [exporting, setExporting] = useState(false)

  const fetchAppointments = async () => {
    setLoading(true)
    try {
      const res = await appointmentApi.search({ pageNum: 1, pageSize: 20 })
      // Nếu API trả về mảng:
      setAppointments(Array.isArray(res) ? res : [])
      // Nếu API trả về object có pageData:
      // setAppointments(res.data.pageData || [])
    } catch {
      setAppointments([])
    } finally {
      setLoading(false)
    }
  }

  const fetchNurses = async (search?: string) => {
    try {
      const res = await searchNurseUsersAPI(1, 10, search)
      setNurses(Array.isArray(res.pageData) ? res.pageData : [])
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

  const getStatusText = (status: string) => {
    const statusConfig = {
      pending: 'Chờ duyệt',
      approved: 'Đã xác nhận',
      confirmed: 'Đã xác nhận',
      done: 'Hoàn thành',
      cancelled: 'Đã hủy'
    }
    return statusConfig[status.toLowerCase() as keyof typeof statusConfig] || status
  }

  const handleAssignClick = (appt: ParentNurseAppointment) => {
    setSelectedAppointment(appt)
    setModalOpen(true)
    fetchNurses()
  }

  const handleDetailClick = (appt: ParentNurseAppointment) => {
    setSelectedAppointment(appt)
    setDetailModalOpen(true)
  }

  const handleAssign = async () => {
    if (!selectedAppointment || !selectedNurse) return
    setAssigning(true)
    try {
      await appointmentApi.approve(selectedAppointment._id, {
        status: ParentNurseAppointmentStatus.Approved,
        schoolNurseId: selectedNurse
      })
      message.success('Giao y tá thành công!')
      setModalOpen(false)
      setSelectedNurse('')
      fetchAppointments()
    } catch (error: unknown) {
      console.log('error', error)
      const err = error as { message?: string }
      if (err.message) {
        message.error(err.message)
      } else {
        message.error('Không thể giao y tá!')
      }
    } finally {
      setAssigning(false)
    }
  }

  const handleCancelClick = (appt: ParentNurseAppointment) => {
    setSelectedAppointment(appt)
    setCancelModalOpen(true)
    setCancelReason('')
    setCancelNote('')
  }

  const handleCancel = async () => {
    if (!selectedAppointment || !cancelReason.trim()) {
      message.error('Vui lòng nhập lý do hủy!')
      return
    }
    setAssigning(true)
    try {
      await appointmentApi.approve(selectedAppointment._id, {
        status: ParentNurseAppointmentStatus.Cancelled,
        schoolNurseId: '',
        cancellationReason: cancelReason,
        note: cancelNote
      })
      message.success('Hủy lịch thành công!')
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
    } finally {
      setAssigning(false)
    }
  }

  const handleExportExcel = async () => {
    setExporting(true)
    try {
      // Prepare data for Excel export
      const excelData = appointments.map((appointment, index) => ({
        STT: index + 1,
        'Mã học sinh': appointment.student?.studentCode || '',
        'Tên học sinh': appointment.student?.fullName || appointment.studentId,
        'Phụ huynh': appointment.parent?.fullName || '',
        'Số điện thoại': appointment.parent?.phone || '',
        'Ngày hẹn': new Date(appointment.appointmentTime).toLocaleDateString('vi-VN'),
        'Giờ hẹn': new Date(appointment.appointmentTime).toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit'
        }),
        'Lý do khám': appointment.reason || '',
        'Trạng thái': getStatusText(appointment.status),
        'Y tá phụ trách': appointment.schoolNurse?.fullName || '',
        'Ghi chú': appointment.note || '',
        'Lý do hủy': appointment.cancellationReason || '',
        'Ngày tạo': appointment.createdAt ? new Date(appointment.createdAt).toLocaleDateString('vi-VN') : '',
        'Ngày cập nhật': appointment.updatedAt ? new Date(appointment.updatedAt).toLocaleDateString('vi-VN') : ''
      }))

      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new()
      const worksheet = XLSX.utils.json_to_sheet(excelData)

      // Set column widths
      const columnWidths = [
        { wch: 5 }, // STT
        { wch: 15 }, // Mã học sinh
        { wch: 20 }, // Tên học sinh
        { wch: 20 }, // Phụ huynh
        { wch: 15 }, // Số điện thoại
        { wch: 12 }, // Ngày hẹn
        { wch: 10 }, // Giờ hẹn
        { wch: 30 }, // Lý do khám
        { wch: 12 }, // Trạng thái
        { wch: 20 }, // Y tá phụ trách
        { wch: 30 }, // Ghi chú
        { wch: 30 }, // Lý do hủy
        { wch: 12 }, // Ngày tạo
        { wch: 12 } // Ngày cập nhật
      ]
      worksheet['!cols'] = columnWidths

      // Add title row
      XLSX.utils.sheet_add_aoa(
        worksheet,
        [
          ['DANH SÁCH LỊCH HẸN TƯ VẤN SỨC KHỎE'],
          [`Ngày xuất: ${new Date().toLocaleDateString('vi-VN')} ${new Date().toLocaleTimeString('vi-VN')}`],
          [`Tổng số lịch hẹn: ${appointments.length}`],
          [] // Empty row
        ],
        { origin: 'A1' }
      )

      // Merge title cells
      if (!worksheet['!merges']) worksheet['!merges'] = []
      worksheet['!merges'].push(
        { s: { r: 0, c: 0 }, e: { r: 0, c: 13 } }, // Title row
        { s: { r: 1, c: 0 }, e: { r: 1, c: 13 } }, // Date row
        { s: { r: 2, c: 0 }, e: { r: 2, c: 13 } } // Count row
      )

      // Style the title
      if (!worksheet['A1'].s) worksheet['A1'].s = {}
      worksheet['A1'].s = {
        font: { bold: true, sz: 16 },
        alignment: { horizontal: 'center', vertical: 'center' }
      }

      // Add data starting from row 5 (after title and headers)
      XLSX.utils.sheet_add_json(worksheet, excelData, {
        origin: 'A5',
        skipHeader: false
      })

      // Style headers
      const headerRow = 4 // 0-indexed, so row 5 is index 4
      for (let col = 0; col < Object.keys(excelData[0] || {}).length; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: headerRow, c: col })
        if (!worksheet[cellAddress]) continue
        if (!worksheet[cellAddress].s) worksheet[cellAddress].s = {}
        worksheet[cellAddress].s = {
          font: { bold: true },
          fill: { fgColor: { rgb: 'E6F3FF' } },
          alignment: { horizontal: 'center', vertical: 'center' },
          border: {
            top: { style: 'thin' },
            bottom: { style: 'thin' },
            left: { style: 'thin' },
            right: { style: 'thin' }
          }
        }
      }

      // Add borders to data cells
      const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1')
      for (let row = headerRow; row <= range.e.r; row++) {
        for (let col = range.s.c; col <= range.e.c; col++) {
          const cellAddress = XLSX.utils.encode_cell({ r: row, c: col })
          if (!worksheet[cellAddress]) continue
          if (!worksheet[cellAddress].s) worksheet[cellAddress].s = {}
          if (!worksheet[cellAddress].s.border) {
            worksheet[cellAddress].s.border = {
              top: { style: 'thin' },
              bottom: { style: 'thin' },
              left: { style: 'thin' },
              right: { style: 'thin' }
            }
          }
        }
      }

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh sách lịch hẹn')

      // Generate filename with current date
      const currentDate = new Date()
      const dateString = currentDate.toISOString().split('T')[0] // YYYY-MM-DD format
      const timeString = currentDate.toTimeString().split(' ')[0].replace(/:/g, '-') // HH-MM-SS format
      const filename = `Danh_sach_lich_hen_${dateString}_${timeString}.xlsx`

      // Write and download file
      XLSX.writeFile(workbook, filename)

      message.success(`Xuất file Excel thành công! File: ${filename}`)
    } catch (error: unknown) {
      console.log('error', error)
      const err = error as { message?: string }
      if (err.message) {
        message.error(`Xuất file Excel thất bại: ${err.message}`)
      } else {
        message.error('Xuất file Excel thất bại!')
      }
    } finally {
      setExporting(false)
    }
  }

  const columns: ColumnsType<ParentNurseAppointment> = [
    {
      title: 'Học sinh',
      dataIndex: ['student', 'fullName'],
      key: 'student',
      render: (_, record) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <div>
            <div className='font-medium'>{record.student?.fullName || record.studentId}</div>
            <Text type='secondary' className='text-xs'>
              PH: {record.parent?.fullName}
            </Text>
          </div>
        </Space>
      )
    },
    {
      title: 'Mã học sinh',
      dataIndex: ['student', 'studentCode'],
      key: 'studentCode',
      render: (_, record) => record.student?.studentCode || ''
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
                <Button type='primary' onClick={() => handleAssignClick(record)} size='small'>
                  Giao cho y tá
                </Button>
              </Tooltip>
              <Tooltip title='Hủy lịch hẹn'>
                <Button danger icon={<CloseCircleOutlined />} onClick={() => handleCancelClick(record)} size='small'>
                  Hủy
                </Button>
              </Tooltip>
            </>
          )}
          {/* Khi trạng thái là 'approved', chỉ hiển thị nút xem chi tiết, các nút khác ẩn */}
        </Space>
      )
    }
  ]

  const pendingCount = appointments.filter((apt) => apt?.status === 'pending')?.length

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
          title={() => (
            <Button
              icon={<DownloadOutlined />}
              loading={exporting}
              onClick={handleExportExcel}
              color='default'
              variant='outlined'
              disabled={appointments.length === 0}
            >
              Xuất Excel ({appointments.length} lịch hẹn)
            </Button>
          )}
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
              <Descriptions.Item label='Mã học sinh'>{selectedAppointment.student?.studentCode}</Descriptions.Item>
              <Descriptions.Item label='Tên học sinh'>{selectedAppointment.student?.fullName}</Descriptions.Item>
              <Descriptions.Item label='Phụ huynh'>{selectedAppointment.parent?.fullName}</Descriptions.Item>
              <Descriptions.Item label='Số điện thoại'>{selectedAppointment.parent?.phone}</Descriptions.Item>
              <Descriptions.Item label='Thời gian hẹn'>
                {new Date(selectedAppointment.appointmentTime).toLocaleString('vi-VN')}
              </Descriptions.Item>
              <Descriptions.Item label='Trạng thái'>{getStatusTag(selectedAppointment.status)}</Descriptions.Item>
              {selectedAppointment.schoolNurse?.fullName && (
                <Descriptions.Item label='Y tá phụ trách'>
                  {selectedAppointment.schoolNurse?.fullName}
                </Descriptions.Item>
              )}
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
                {selectedAppointment?.student?.fullName} - {selectedAppointment?.reason}
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
                {selectedAppointment?.student?.fullName} - {selectedAppointment?.reason}
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
