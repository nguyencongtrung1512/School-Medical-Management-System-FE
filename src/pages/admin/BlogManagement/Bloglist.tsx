import { BookOutlined, EditOutlined, EyeOutlined, FileTextOutlined, PlusOutlined } from '@ant-design/icons'
import type { TableProps } from 'antd'
import { Button, Card, Col, Divider, message, Modal, Row, Space, Table, Tooltip, Typography } from 'antd'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { blogApi, type Blog } from '../../../api/blog.api'
import path from '../../../constants/path'
import CreateBlog from './Create'

const { Title, Text, Paragraph } = Typography

function BlogList() {
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false)
  const navigate = useNavigate()
  const { categoryId } = useParams()

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true)
        const response = await blogApi.searchBlogApi({
          pageNum: 1,
          pageSize: 10,
          categoryId: categoryId
        })
        console.log('response', response)
        if (response.pageData) {
          setBlogs(response.pageData)
        }
      } catch (error: unknown) {
        console.log('error', error)
        const err = error as { message?: string }
        if (err.message) {
          message.error(err.message)
        } else {
          message.error('Không thể tải danh sách blog')
        }
      } finally {
        setLoading(false)
      }
    }

    if (categoryId) {
      fetchBlogs()
    }
  }, [categoryId])

  const showCreateModal = () => {
    setIsCreateModalVisible(true)
  }

  const handleCreateModalCancel = () => {
    setIsCreateModalVisible(false)
  }

  const handleBlogCreated = () => {
    setIsCreateModalVisible(false)
    // Fetch lại danh sách blog sau khi tạo
    if (categoryId) {
      const fetchBlogs = async () => {
        try {
          setLoading(true)
          const response = await blogApi.searchBlogApi({
            pageNum: 1,
            pageSize: 10,
            categoryId: categoryId
          })

          if (response.pageData) {
            setBlogs(response.pageData)
          }
        } catch (error: unknown) {
          console.log('error', error)
          const err = error as { message?: string }
          if (err.message) {
            message.error(err.message)
          } else {
            message.error('Không thể tải danh sách blog')
          }
        } finally {
          setLoading(false)
        }
      }
      fetchBlogs()
    }
  }

  const columns: TableProps<Blog>['columns'] = [
    {
      title: (
        <Space>
          <FileTextOutlined />
          <span>Tiêu đề</span>
        </Space>
      ),
      dataIndex: 'title',
      key: 'title',
      render: (title: string) => (
        <div>
          <Text strong className='text-gray-800'>
            {title}
          </Text>
        </div>
      )
    },
    {
      title: (
        <Space>
          <EditOutlined />
          <span>Mô tả</span>
        </Space>
      ),
      dataIndex: 'description',
      key: 'description',
      render: (description: string) => (
        <Paragraph ellipsis={{ rows: 2, expandable: true, symbol: 'Xem thêm' }} className='mb-0 text-gray-600'>
          {description}
        </Paragraph>
      )
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 120,
      render: (_, record) => {
        console.log('Record in BlogList:', record)
        return (
          <Tooltip title='Xem chi tiết blog'>
            <Button
              type='primary'
              icon={<EyeOutlined />}
              size='small'
              onClick={() => {
                const url = path.BLOG_DETAIL.replace(':_id', record._id)
                console.log('Navigating to:', url)
                navigate(url)
              }}
            >
              Chi tiết
            </Button>
          </Tooltip>
        )
      }
    }
  ]

  return (
    <div className='p-6'>
      {/* Header Section */}
      <Card className='mb-2 shadow-sm' style={{ borderRadius: '12px' }}>
        <Row gutter={[24, 16]} align='middle'>
          <Col xs={20} md={16}>
            <div>
              <Button onClick={() => navigate(-1)} style={{ marginBottom: 16 }}>
                Quay lại
              </Button>
              <Title level={2} className='mb-2'>
                <BookOutlined className='mr-3 text-blue-500' />
                Quản lý Blog
              </Title>
              <Text type='secondary' className='text-base'>
                Danh sách các bài blog trong danh mục được chọn
              </Text>
            </div>
          </Col>
          <Col xs={24} md={8} className='text-right'>
            <Button
              type='primary'
              icon={<PlusOutlined />}
              size='large'
              onClick={showCreateModal}
              className='shadow-sm'
              style={{ borderRadius: '8px' }}
            >
              Thêm Blog Mới
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Table Section */}
      <Card className='shadow-sm' style={{ borderRadius: '12px' }}>
        <div className='mb-4'>
          <Title level={4} className='mb-2'>
            <FileTextOutlined className='mr-2' />
            Danh sách Blog
          </Title>
          <Divider className='mt-2 mb-4' />
        </div>

        <Table
          columns={columns}
          dataSource={blogs}
          loading={loading}
          rowKey='id'
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} blog`,
            pageSizeOptions: ['5', '10', '20', '50']
          }}
          scroll={{ x: 800 }}
          className='custom-table'
          locale={{
            emptyText: (
              <div className='py-8'>
                <FileTextOutlined className='text-4xl text-gray-300 mb-4' />
                <div className='text-gray-500'>Chưa có blog nào trong danh mục này</div>
                <Button type='link' onClick={showCreateModal} className='mt-2'>
                  Tạo blog đầu tiên
                </Button>
              </div>
            )
          }}
        />
      </Card>

      {/* Create Blog Modal */}
      <Modal
        title={
          <div className='flex items-center'>
            <PlusOutlined className='mr-2 text-blue-500' />
            <span>Tạo Blog Mới</span>
          </div>
        }
        open={isCreateModalVisible}
        onCancel={handleCreateModalCancel}
        footer={null}
        width={900}
        destroyOnClose
        className='create-blog-modal'
      >
        <Divider className='mt-4 mb-6' />
        <CreateBlog onBlogCreated={handleBlogCreated} />
      </Modal>

      <style jsx global>{`
        .custom-table .ant-table-thead > tr > th {
          background-color: #fafafa;
          font-weight: 600;
          border-bottom: 2px solid #f0f0f0;
        }

        .custom-table .ant-table-tbody > tr:hover > td {
          background-color: #f0f9ff;
        }

        .custom-table .ant-table-tbody > tr > td {
          padding: 16px;
        }

        .create-blog-modal .ant-modal-header {
          border-bottom: 1px solid #f0f0f0;
          padding: 20px 24px 16px;
        }

        .create-blog-modal .ant-modal-body {
          padding: 0 24px 24px;
        }

        /* Custom scrollbar */
        .ant-table-body::-webkit-scrollbar {
          height: 6px;
        }

        .ant-table-body::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 3px;
        }

        .ant-table-body::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }

        .ant-table-body::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .ant-statistic-content {
            font-size: 18px !important;
          }
        }
      `}</style>
    </div>
  )
}

export default BlogList
