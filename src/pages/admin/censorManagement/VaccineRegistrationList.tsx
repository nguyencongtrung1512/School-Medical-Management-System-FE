import React, { useEffect, useState } from 'react'
import { Table, Button, Modal, Tag, Input, Select, message, Space, Typography, Descriptions } from 'antd'
import { ExportOutlined, EyeOutlined, ReloadOutlined, CheckCircleOutlined, CloseOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'

const { Text } = Typography
import {
  vaccineRegistrationApi,
  VaccineRegistration,
  SearchVaccineRegistrationParams
} from '../../../api/vaccineRegistration.api'
import type { ColumnsType } from 'antd/es/table'

const { Option } = Select
const { Title } = Typography

const statusColors = {
  pending: 'warning',
  approved: 'success',
  rejected: 'error',
  cancelled: 'default'
}

const statusLabels = {
  pending: 'Chờ duyệt',
  approved: 'Đã duyệt',
  rejected: 'Từ chối',
  cancelled: 'Đã hủy'
}

// Có thể lấy danh sách năm học từ API hoặc từ dữ liệu, ở đây giả lập static
const SCHOOL_YEARS = ['2023-2024', '2024-2025', '2025-2026']

// Extend VaccineRegistration type to allow dynamic fields for student, parent, event (populated from backend)
type VaccineRegistrationWithPopulated = VaccineRegistration & {
  student?: {
    fullName?: string
    avatar?: string
    studentCode?: string
    dob?: string
    gender?: string
  }
  parent?: {
    fullName?: string
    email?: string
    phone?: string
  }
  event?: {
    title?: string
    endRegistrationDate?: string | Date
  }
}

const VaccineRegistrationList: React.FC = () => {
  const [data, setData] = useState<VaccineRegistrationWithPopulated[]>([])
  const [loading, setLoading] = useState(false)
  const [pageNum, setPageNum] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [total, setTotal] = useState(0)
  const [schoolYear, setSchoolYear] = useState<string | undefined>()
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<VaccineRegistrationWithPopulated | null>(null)
  const [detailModal, setDetailModal] = useState(false)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNum, pageSize, search])

  const fetchData = async () => {
    setLoading(true)
    try {
      const params: SearchVaccineRegistrationParams = {
        pageNum,
        pageSize,
        query: search || undefined
      }
      const res = await vaccineRegistrationApi.search(params)
      let items = res.data?.items || res.pageData || []
      // Filter by school year on frontend if not supported by backend
      if (schoolYear) {
        items = items.filter((item: VaccineRegistrationWithPopulated) => item.schoolYear === schoolYear)
      }
      setData(items)
      setTotal(res.data?.pageInfo?.totalItems || res.data?.totalItems || items.length)
    } catch {
      message.error('Không thể tải danh sách đơn đăng ký')
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async () => {
    setExporting(true)
    try {
      // Export all data for selected school year (filter on frontend if needed)
      const params: SearchVaccineRegistrationParams = {}
      const res = await vaccineRegistrationApi.exportExcel(params)
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `danh_sach_dang_ky_vaccine.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.parentNode?.removeChild(link)
    } catch {
      message.error('Xuất Excel thất bại')
    } finally {
      setExporting(false)
    }
  }

  const handleUpdateStatus = async (id: string, status: 'approved' | 'rejected' | 'cancelled') => {
    try {
      await vaccineRegistrationApi.updateStatus(id, { status })
      message.success('Cập nhật trạng thái thành công!')
      fetchData()
    } catch {
      message.error('Không thể cập nhật trạng thái!')
    }
  }

  const columns: ColumnsType<VaccineRegistrationWithPopulated> = [
    {
      title: 'Học sinh',
      key: 'student',
      width: 150,
      render: (_: unknown, record) => (
        <div>
          <div style={{ fontSize: '13px', fontWeight: '500' }}>{record.student?.fullName || record.studentId}</div>
          <Text type='secondary' style={{ fontSize: '11px' }}>
            {record.student?.studentCode || 'N/A'}
          </Text>
        </div>
      )
    },
    {
      title: 'Phụ huynh',
      key: 'parent',
      width: 150,
      render: (_: unknown, record) => (
        <div>
          <div style={{ fontSize: '13px', fontWeight: '500' }}>{record.parent?.fullName || record.parentId}</div>
          <Text type='secondary' style={{ fontSize: '11px' }}>
            {record.parent?.phone || 'N/A'}
          </Text>
        </div>
      )
    },
    {
      title: 'Sự kiện',
      key: 'event',
      width: 200,
      render: (_: unknown, record) => (
        <div>
          <div style={{ fontSize: '13px', fontWeight: '500' }}>{record.event?.title || record.eventId}</div>
          <Text type='secondary' style={{ fontSize: '11px' }}>
            {record.schoolYear}
          </Text>
        </div>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => (
        <Tag color={statusColors[status as keyof typeof statusColors] || 'default'}>
          {statusLabels[status as keyof typeof statusLabels] || status}
        </Tag>
      ),
      filters: [
        { text: 'Chờ duyệt', value: 'pending' },
        { text: 'Đã duyệt', value: 'approved' },
        { text: 'Từ chối', value: 'rejected' },
        { text: 'Đã hủy', value: 'cancelled' }
      ],
      onFilter: (value, record) => record.status === value
    },
    {
      title: 'Hạn đăng ký',
      key: 'deadline',
      width: 120,
      render: (_: unknown, record) => {
        if (!record.event?.endRegistrationDate) return '-'
        const isExpired = dayjs(record.event.endRegistrationDate).isBefore(dayjs())
        return <Tag color={isExpired ? 'red' : 'green'}>{isExpired ? 'Đã hết hạn' : 'Còn hạn'}</Tag>
      }
    },
    {
      title: 'Ghi chú',
      dataIndex: 'note',
      key: 'note',
      width: 150,
      ellipsis: true,
      render: (note: string) => <Text style={{ fontSize: '12px' }}>{note || '-'}</Text>
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 100,
      fixed: 'right',
      render: (_: unknown, record) => (
        <Space size='small'>
          <Button
            size='small'
            icon={<EyeOutlined />}
            onClick={() => {
              setSelected(record)
              setDetailModal(true)
            }}
          />
          {record.status === 'pending' && (
            <>
              {/* Kiểm tra xem đã quá hạn đăng ký chưa */}
              {record.event?.endRegistrationDate && dayjs(record.event.endRegistrationDate).isAfter(dayjs()) && (
                <>
                  <Button
                    size='small'
                    icon={<CheckCircleOutlined />}
                    onClick={() => handleUpdateStatus(record._id, 'approved')}
                  />
                  <Button
                    size='small'
                    icon={<CloseOutlined />}
                    danger
                    onClick={() => handleUpdateStatus(record._id, 'rejected')}
                  />
                </>
              )}
            </>
          )}
        </Space>
      )
    }
  ]

  return (
    <div>
      <Space direction='vertical' size='large' style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={3}>Quản lý đơn đăng ký tiêm vắc xin</Title>
          <Space>
            <Select
              placeholder='Lọc theo năm học'
              allowClear
              style={{ minWidth: 160 }}
              value={schoolYear}
              onChange={setSchoolYear}
            >
              {SCHOOL_YEARS.map((year) => (
                <Option key={year} value={year}>
                  {year}
                </Option>
              ))}
            </Select>
            <Input.Search
              placeholder='Tìm kiếm học sinh, phụ huynh, sự kiện...'
              allowClear
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: 240 }}
              onSearch={() => {
                setPageNum(1)
                fetchData()
              }}
            />
            <Button icon={<ExportOutlined />} loading={exporting} onClick={handleExport}>
              Xuất Excel
            </Button>
            <Button icon={<ReloadOutlined />} onClick={fetchData} loading={loading}>
              Làm mới
            </Button>
          </Space>
        </div>
        <Table
          columns={columns}
          dataSource={data}
          rowKey='_id'
          loading={loading}
          size='small'
          pagination={{
            current: pageNum,
            pageSize,
            total,
            showSizeChanger: true,
            onChange: (page, size) => {
              setPageNum(page)
              setPageSize(size || 10)
            },
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} đơn đăng ký`,
            pageSizeOptions: ['10', '20', '50', '100']
          }}
          scroll={{ x: 900 }}
        />
        <Modal
          open={detailModal}
          onCancel={() => setDetailModal(false)}
          title='Chi tiết đơn đăng ký'
          footer={<Button onClick={() => setDetailModal(false)}>Đóng</Button>}
        >
          {selected && (
            <div style={{ textAlign: 'center' }}>
              {/* Warning if registration is overdue */}
              {selected.event?.endRegistrationDate && dayjs(selected.event.endRegistrationDate).isBefore(dayjs()) && (
                <div
                  style={{
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '6px',
                    padding: '12px',
                    marginBottom: '16px',
                    textAlign: 'left'
                  }}
                >
                  <Space>
                    <span style={{ color: '#ef4444' }}>⚠️</span>
                    <span style={{ color: '#dc2626', fontWeight: 'bold' }}>
                      Đơn đăng ký này đã quá hạn và không thể duyệt/từ chối
                    </span>
                  </Space>
                </div>
              )}

              {/* Avatar học sinh phía trên */}
              <img
                src={
                  selected.student?.avatar ||
                  'https://ui-avatars.com/api/?name=' + encodeURIComponent(selected.student?.fullName || 'Học sinh')
                }
                alt='avatar'
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '1px solid #eee',
                  marginBottom: 12
                }}
              />
              <Typography.Paragraph copyable={{ text: selected._id }} style={{ marginBottom: 8, textAlign: 'center' }}>
                <b>Mã đơn đăng ký:</b> {selected._id}
              </Typography.Paragraph>
              <Descriptions column={1} size='small' bordered>
                <Descriptions.Item label='Học sinh'>
                  {selected.student?.fullName || selected.studentId}
                </Descriptions.Item>
                <Descriptions.Item label='Mã học sinh'>{selected.student?.studentCode}</Descriptions.Item>
                <Descriptions.Item label='Ngày sinh'>
                  {selected.student?.dob ? new Date(selected.student.dob).toLocaleDateString() : ''}
                </Descriptions.Item>
                <Descriptions.Item label='Giới tính'>
                  {selected.student?.gender === 'male' ? 'Nam' : selected.student?.gender === 'female' ? 'Nữ' : ''}
                </Descriptions.Item>
                <Descriptions.Item label='Phụ huynh'>
                  {selected.parent?.fullName || selected.parentId}
                </Descriptions.Item>
                <Descriptions.Item label='Email phụ huynh'>{selected.parent?.email}</Descriptions.Item>
                <Descriptions.Item label='SĐT phụ huynh'>{selected.parent?.phone}</Descriptions.Item>
                <Descriptions.Item label='Sự kiện'>{selected.event?.title || selected.eventId}</Descriptions.Item>
                <Descriptions.Item label='Năm học'>{selected.schoolYear}</Descriptions.Item>
                <Descriptions.Item label='Trạng thái'>
                  <Tag color={statusColors[selected.status as keyof typeof statusColors]}>
                    {statusLabels[selected.status as keyof typeof statusLabels]}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label='Ghi chú'>{selected.note}</Descriptions.Item>
                <Descriptions.Item label='Lý do hủy'>{selected.cancellationReason}</Descriptions.Item>
                <Descriptions.Item label='Ngày tạo'>
                  {selected.createdAt ? new Date(selected.createdAt).toLocaleString() : ''}
                </Descriptions.Item>
              </Descriptions>
            </div>
          )}
        </Modal>
      </Space>
    </div>
  )
}

export default VaccineRegistrationList
