'use client'

import {
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  EllipsisOutlined,
  MedicineBoxOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined
} from '@ant-design/icons'
import type { MenuProps, TableColumnsType } from 'antd'
import { Button, Card, Col, Dropdown, Input, Popconfirm, Row, Space, Table, Tag, Typography, message } from 'antd'
import type React from 'react'
import { useEffect, useState } from 'react'
import * as XLSX from 'xlsx'
import { deleteVaccineTypeAPI, searchVaccineTypesAPI, type VaccineType } from '../../../api/vaccineType.api'
import Create from './Create'
import Update from './Update'

const { Title } = Typography
const { Search } = Input

const VaccineList: React.FC = () => {
  const [data, setData] = useState<VaccineType[]>([])
  const [loading, setLoading] = useState(false)
  const [isCreateModal, setIsCreateModal] = useState(false)
  const [editing, setEditing] = useState<VaccineType | null>(null)
  const [searchText, setSearchText] = useState('')

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await searchVaccineTypesAPI(1, 20)
      console.log(res)
      setData(res.pageData || [])
    } catch {
      message.error('Không thể tải danh sách loại vaccine')
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleDelete = async (id: string) => {
    try {
      await deleteVaccineTypeAPI(id)
      message.success('Xóa thành công')
      fetchData()
    } catch {
      message.error('Xóa thất bại')
    }
  }

  const handleExportExcel = () => {
    try {
      // Chuẩn bị dữ liệu để xuất
      const exportData = filteredData.map((item, index) => ({
        STT: index + 1,
        'Mã loại vaccine': item.code,
        'Tên loại vaccine': item.name,
        'Mô tả': item.description || 'Chưa có mô tả'
      }))

      // Tạo worksheet
      const ws = XLSX.utils.json_to_sheet(exportData)

      // Tạo workbook
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Danh sách loại vaccine')

      // Tự động điều chỉnh độ rộng cột
      const colWidths = [
        { wch: 5 }, // STT
        { wch: 20 }, // Mã loại vaccine
        { wch: 30 }, // Tên loại vaccine
        { wch: 50 } // Mô tả
      ]
      ws['!cols'] = colWidths

      // Tạo tên file với timestamp
      const now = new Date()
      const timestamp = now.toISOString().slice(0, 19).replace(/:/g, '-')
      const fileName = `danh-sach-loai-vaccine-${timestamp}.xlsx`

      // Xuất file
      XLSX.writeFile(wb, fileName)

      message.success(`Xuất Excel thành công! ${exportData.length} bản ghi đã được xuất.`)
    } catch (error) {
      console.error('Lỗi khi xuất Excel:', error)
      message.error('Có lỗi xảy ra khi xuất Excel')
    }
  }

  const getActionItems = (record: VaccineType): MenuProps['items'] => [
    {
      key: 'edit',
      icon: <EditOutlined />,
      label: 'Chỉnh sửa',
      onClick: () => setEditing(record)
    },
    {
      type: 'divider'
    },
    {
      key: 'delete',
      icon: <DeleteOutlined />,
      label: (
        <Popconfirm
          title='Xác nhận xóa?'
          description='Bạn có chắc chắn muốn xóa loại vaccine này?'
          onConfirm={() => handleDelete(record._id!)}
          okText='Xóa'
          cancelText='Hủy'
          okButtonProps={{ danger: true }}
        >
          <span style={{ color: '#ff4d4f' }}>Xóa loại vaccine</span>
        </Popconfirm>
      ),
      danger: true
    }
  ]

  const filteredData = data.filter(
    (item) =>
      item.name?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.code?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchText.toLowerCase())
  )

  const columns: TableColumnsType<VaccineType> = [
    {
      title: 'Mã loại vaccine',
      dataIndex: 'code',
      key: 'code',
      width: 150,
      render: (text: string) => (
        <Tag color='blue' style={{ fontFamily: 'monospace', fontSize: '12px' }}>
          {text}
        </Tag>
      )
    },
    {
      title: 'Tên loại vaccine',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      ellipsis: true,
      render: (text: string) => (
        <Typography.Text strong style={{ fontSize: '13px' }}>
          {text}
        </Typography.Text>
      )
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      width: 300,
      ellipsis: true,
      render: (text: string) => (
        <Typography.Text type='secondary' style={{ fontSize: '12px' }}>
          {text || 'Chưa có mô tả'}
        </Typography.Text>
      )
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 80,
      fixed: 'right',
      render: (_, record) => (
        <Dropdown menu={{ items: getActionItems(record) }} trigger={['click']} placement='bottomRight'>
          <Button
            type='text'
            icon={<EllipsisOutlined />}
            size='small'
            style={{
              border: 'none',
              boxShadow: 'none'
            }}
          />
        </Dropdown>
      )
    }
  ]

  return (
    <div className=''>
      <Space direction='vertical' size='large' style={{ width: '100%' }}>
        {/* Header */}
        <Card className='shadow-sm'>
          <div className='flex justify-between items-center mb-4'>
            <div>
              <Title level={3} className='m-0 flex items-center gap-2'>
                <MedicineBoxOutlined className='text-blue-600' />
                Quản lý loại vaccine
              </Title>
              <Typography.Text type='secondary' style={{ fontSize: '13px' }}>
                Quản lý danh sách các loại vaccine trong hệ thống
              </Typography.Text>
            </div>
            <Space>
              <Button
                size='small'
                icon={<DownloadOutlined />}
                onClick={handleExportExcel}
                disabled={filteredData.length === 0}
              >
                Xuất Excel
              </Button>
              <Button size='small' icon={<ReloadOutlined />} onClick={fetchData} loading={loading}>
                Làm mới
              </Button>
              <Button size='small' type='primary' icon={<PlusOutlined />} onClick={() => setIsCreateModal(true)}>
                Thêm loại vaccine
              </Button>
            </Space>
          </div>
        </Card>

        {/* Search */}
        <Card className='shadow-sm'>
          <Row gutter={[16, 16]} align='middle'>
            <Col xs={24} sm={16} md={12}>
              <Search
                placeholder='Tìm kiếm theo tên, mã hoặc mô tả...'
                allowClear
                enterButton={<SearchOutlined />}
                size='middle'
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </Col>
            <Col xs={24} sm={8} md={12}>
              <div className='flex justify-end'>
                <Typography.Text type='secondary' style={{ fontSize: '12px' }}>
                  Hiển thị {filteredData.length} loại vaccine
                </Typography.Text>
              </div>
            </Col>
          </Row>
        </Card>

        {/* Table */}
        <Card className='shadow-sm'>
          <Table
            rowKey='_id'
            loading={loading}
            dataSource={filteredData}
            columns={columns}
            size='small'
            pagination={{
              total: filteredData.length,
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} mục`,
              pageSizeOptions: ['10', '20', '50', '100']
            }}
            scroll={{ x: 800 }}
          />
        </Card>
      </Space>

      <Create
        open={isCreateModal}
        onClose={() => {
          setIsCreateModal(false)
          fetchData()
        }}
        destroyOnClose
      />

      {editing && (
        <Update
          open={!!editing}
          vaccineType={editing}
          onClose={() => {
            setEditing(null)
            fetchData()
          }}
        />
      )}
    </div>
  )
}

export default VaccineList
