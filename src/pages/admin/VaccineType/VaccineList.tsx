'use client'

import type React from 'react'
import { useEffect, useState } from 'react'
import { Table, Button, Popconfirm, message, Dropdown, Card, Typography, Tag, Input, Row, Col, Divider } from 'antd'
import {
  EllipsisOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined
} from '@ant-design/icons'
import type { MenuProps, TableColumnsType } from 'antd'
import { searchVaccineTypesAPI, deleteVaccineTypeAPI, type VaccineType } from '../../../api/vaccineType.api'
import Update from './Update'
import Create from './Create'

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
        <Tag color='blue' style={{ fontFamily: 'monospace' }}>
          {text}
        </Tag>
      )
    },
    {
      title: 'Tên loại vaccine',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
      render: (text: string) => <Typography.Text strong>{text}</Typography.Text>
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (text: string) => <Typography.Text type='secondary'>{text || 'Chưa có mô tả'}</Typography.Text>
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 80,
      align: 'center',
      render: (_, record) => (
        <Dropdown menu={{ items: getActionItems(record) }} trigger={['click']} placement='bottomRight'>
          <Button
            type='text'
            icon={<EllipsisOutlined />}
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
    <div style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
      <Card>
        <div style={{ marginBottom: '24px' }}>
          <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
            Quản lý loại vaccine
          </Title>
          <Typography.Text type='secondary'>Quản lý danh sách các loại vaccine trong hệ thống</Typography.Text>
        </div>

        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={12} md={8}>
            <Search
              placeholder='Tìm kiếm theo tên, mã hoặc mô tả...'
              allowClear
              enterButton={<SearchOutlined />}
              size='large'
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </Col>
          <Col xs={24} sm={12} md={16}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <Button icon={<ReloadOutlined />} onClick={fetchData} loading={loading} size='large'>
                Làm mới
              </Button>
              <Button type='primary' icon={<PlusOutlined />} onClick={() => setIsCreateModal(true)} size='large'>
                Thêm loại vaccine
              </Button>
            </div>
          </Col>
        </Row>

        <Divider />

        <Table
          rowKey='_id'
          loading={loading}
          dataSource={filteredData}
          columns={columns}
          pagination={{
            total: filteredData.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} mục`
          }}
          scroll={{ x: 800 }}
          size='middle'
          bordered
          style={{
            background: '#fff',
            borderRadius: '8px'
          }}
        />
      </Card>

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
