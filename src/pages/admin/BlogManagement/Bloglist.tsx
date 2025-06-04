import React, { useEffect, useState } from 'react'
import { Table, TableProps, Button, Modal, Space } from 'antd'
import { blogApi, Blog } from '../../../api/blog.api'
import { useNavigate, useParams } from 'react-router-dom'
import path from '../../../constants/path'
import CreateBlog from './Create'

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
        console.log("res bloglist", response)
        if (response.pageData) {
          setBlogs(response.pageData)
        }
      } catch (error) {
        console.error('Error fetching blogs:', error)
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
        } catch (error) {
          console.error('Error fetching blogs:', error)
        } finally {
          setLoading(false)
        }
      }
      fetchBlogs()
    }
  }

  const columns: TableProps<Blog>['columns'] = [
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title'
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description'
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => {
        console.log('Record in BlogList:', record)
        return <a onClick={() => {
          const url = path.BLOG_DETAIL.replace(':_id', record._id)
          console.log('Navigating to:', url)
          navigate(url)
        }}>Xem chi tiết</a>
      }
    }
  ]

  return (
    <div>
      <Space style={{ marginBottom: 16, justifyContent: 'space-between', width: '100%' }}>
        <h2>Danh sách Blog của Category</h2>
        <Button type='primary' onClick={showCreateModal}>
          Thêm Blog Mới
        </Button>
      </Space>
      <Table columns={columns} dataSource={blogs} loading={loading} rowKey='id' />

      <Modal
        title='Tạo Blog Mới'
        open={isCreateModalVisible}
        onCancel={handleCreateModalCancel}
        footer={null}
        width={800}
      >
        <CreateBlog onBlogCreated={handleBlogCreated} />
      </Modal>
    </div>
  )
}

export default BlogList
