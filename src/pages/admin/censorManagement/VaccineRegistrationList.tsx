import React, { useEffect, useState } from 'react'
import { Table, Button, Modal, Tag, Input, Select, message, Space, Typography, Descriptions } from 'antd'
import { ExportOutlined, EyeOutlined, ReloadOutlined, CheckCircleOutlined, CloseOutlined } from '@ant-design/icons'
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
  event?: { title?: string }
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
      dataIndex: ['studentId', 'student', 'fullName'],
      key: 'student',
      render: (_: unknown, record) => record.student?.fullName || record.studentId
    },
    {
      title: 'Phụ huynh',
      dataIndex: ['parentId', 'parent', 'fullName'],
      key: 'parent',
      render: (_: unknown, record) => record.parent?.fullName || record.parentId
    },
    {
      title: 'Sự kiện',
      dataIndex: ['eventId', 'event', 'title'],
      key: 'event',
      render: (_: unknown, record) => record.event?.title || record.eventId
    },
    {
      title: 'Năm học',
      dataIndex: 'schoolYear',
      key: 'schoolYear'
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
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
      title: 'Ghi chú',
      dataIndex: 'note',
      key: 'note',
      ellipsis: true
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: unknown, record) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            onClick={() => {
              setSelected(record)
              setDetailModal(true)
            }}
          />
          {record.status === 'pending' && (
            <>
              <Button icon={<CheckCircleOutlined />} onClick={() => handleUpdateStatus(record._id, 'approved')} />
              <Button icon={<CloseOutlined />} danger onClick={() => handleUpdateStatus(record._id, 'rejected')} />
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
          pagination={{
            current: pageNum,
            pageSize,
            total,
            showSizeChanger: true,
            onChange: (page, size) => {
              setPageNum(page)
              setPageSize(size || 10)
            },
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} đơn đăng ký`
          }}
          scroll={{ x: 1000 }}
        />
        <Modal
          open={detailModal}
          onCancel={() => setDetailModal(false)}
          title='Chi tiết đơn đăng ký'
          footer={<Button onClick={() => setDetailModal(false)}>Đóng</Button>}
        >
          {selected && (
            <div style={{ textAlign: 'center' }}>
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
