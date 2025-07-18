import { ArrowLeftOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons'
import { Button, Card, message, Modal, Space, Spin } from 'antd'
import DOMPurify from 'dompurify'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Blog, blogApi } from '../../../api/blog.api'
import DeleteBlog from './Delete'
import UpdateBlog from './Update'

function BlogDetail() {
  const { _id } = useParams()
  const navigate = useNavigate()
  const [blog, setBlog] = useState<Blog | null>(null)
  const [loading, setLoading] = useState(true)
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false)
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false)

  const fetchBlogDetail = async () => {
    try {
      setLoading(true)

      if (!_id) {
        message.error('ID blog không hợp lệ')
        return
      }

      const response = await blogApi.getBlogByIdApi(_id)

      if (response.data) {
        setBlog(response.data)
      } else {
        message.error('Không tìm thấy thông tin blog')
      }
    } catch (error: unknown) {
      console.log('error', error)
      const err = error as { message?: string }
      if (err.message) {
        message.error(err.message)
      } else {
        message.error('Không thể tải thông tin blog')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBlogDetail()
  }, [_id, navigate])

  const handleBack = () => {
    navigate(-1)
  }

  const handleUpdate = () => {
    setIsUpdateModalVisible(true)
  }

  const handleDelete = () => {
    setIsDeleteModalVisible(true)
  }

  const handleBlogUpdated = () => {
    setIsUpdateModalVisible(false)
    fetchBlogDetail()
  }

  const handleBlogDeleted = () => {
    setIsDeleteModalVisible(false)
    navigate(-1)
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size='large' />
      </div>
    )
  }

  if (!blog) {
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <h2>Không tìm thấy thông tin blog</h2>
        <Button type='primary' onClick={handleBack} icon={<ArrowLeftOutlined />}>
          Quay lại
        </Button>
      </div>
    )
  }

  return (
    <div style={{ padding: '20px' }}>
      <Space style={{ marginBottom: '20px' }}>
        <Button type='primary' onClick={handleBack} icon={<ArrowLeftOutlined />}>
          Quay lại
        </Button>
        <Button type='primary' onClick={handleUpdate} icon={<EditOutlined />}>
          Sửa
        </Button>
        <Button danger onClick={handleDelete} icon={<DeleteOutlined />}>
          Xóa
        </Button>
      </Space>

      <Card title={blog.title}>
        {blog.image && (
          <div style={{ marginBottom: '20px', textAlign: 'center' }}>
            <img
              src={blog.image}
              alt='Ảnh bìa blog'
              style={{
                maxWidth: '100%',
                maxHeight: '400px',
                objectFit: 'contain',
                borderRadius: '8px'
              }}
            />
          </div>
        )}

        <div style={{ marginBottom: '20px' }}>
          <h3>Mô tả:</h3>
          <p>{blog.description}</p>
        </div>

        <div>
          <h3>Nội dung:</h3>
          <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(blog.content) }} />
        </div>
      </Card>

      <Modal
        title='Sửa Blog'
        open={isUpdateModalVisible}
        onCancel={() => setIsUpdateModalVisible(false)}
        footer={null}
        width={800}
      >
        <UpdateBlog onBlogUpdated={handleBlogUpdated} />
      </Modal>

      <DeleteBlog
        blogId={_id || ''}
        isVisible={isDeleteModalVisible}
        onClose={() => setIsDeleteModalVisible(false)}
        onDeleted={handleBlogDeleted}
      />
    </div>
  )
}

export default BlogDetail
