import { UploadOutlined } from '@ant-design/icons'
import type { UploadProps } from 'antd'
import { Button, Form, Input, message, Select, Upload } from 'antd'
import { useEffect, useState } from 'react'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import { useNavigate } from 'react-router-dom'
import { blogApi } from '../../../api/blog.api'
import { categoryApi } from '../../../api/category.api'
import { customUploadHandler } from '../../../utils/upload'

interface Category {
  _id: string
  name: string
}

interface CreateBlogProps {
  onBlogCreated?: () => void
}

interface BlogFormValues {
  title: string
  description: string
  content: string
  categoryId: string
  image: string
}

function CreateBlog({ onBlogCreated }: CreateBlogProps) {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [imageUrl, setImageUrl] = useState<string>('')
  const navigate = useNavigate()

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryApi.searchCategoryApi({
          pageNum: 1,
          pageSize: 100,
          query: ''
        })
        if (response.data.pageData) {
          setCategories(response.data.pageData)
        }
      } catch (error: unknown) {
        console.log('error', error)
        const err = error as { message?: string }
        if (err.message) {
          message.error(err.message)
        } else {
          message.error('Không thể tải danh sách danh mục')
        }
      }
    }

    fetchCategories()
  }, [])

  const handleUploadSuccess = (type: 'video' | 'image', url: string) => {
    setImageUrl(url)
    form.setFieldValue('image', url)
  }

  const handleSubmit = async (values: BlogFormValues) => {
    try {
      setLoading(true)
      const response = await blogApi.createBlogApi({
        title: values.title,
        description: values.description,
        content: values.content,
        categoryId: values.categoryId,
        image: values.image
      } as unknown as Parameters<typeof blogApi.createBlogApi>[0])

      if (response.data) {
        message.success('Tạo blog thành công!')
        form.resetFields()
        if (onBlogCreated) {
          onBlogCreated()
        }
        navigate(-1)
      }
    } catch (error: unknown) {
      console.log('error', error)
      const err = error as { message?: string }
      if (err.message) {
        message.error(err.message)
      } else {
        message.error('Tạo blog thất bại!')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleUpload: UploadProps['customRequest'] = (options) => {
    const { file, onSuccess, onError } = options
    if (file instanceof File) {
      customUploadHandler(
        {
          file,
          onSuccess: (url: string) => onSuccess?.(url),
          onError: () => onError?.(new Error('Upload failed'))
        },
        'image',
        setUploading,
        handleUploadSuccess
      )
    } else {
      onError?.(new Error('Invalid file type'))
    }
  }

  return (
    <Form form={form} layout='vertical' onFinish={handleSubmit}>
      <Form.Item name='categoryId' label='Danh mục' rules={[{ required: true, message: 'Vui lòng chọn danh mục!' }]}>
        <Select placeholder='Chọn danh mục'>
          {categories.map((category) => (
            <Select.Option key={category._id} value={category._id}>
              {category.name}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item name='title' label='Tiêu đề' rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}>
        <Input placeholder='Nhập tiêu đề blog' />
      </Form.Item>

      <Form.Item name='description' label='Mô tả' rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}>
        <Input.TextArea rows={4} placeholder='Nhập mô tả blog' />
      </Form.Item>

      <Form.Item name='image' label='Ảnh bìa' rules={[{ required: true, message: 'Vui lòng tải lên ảnh bìa!' }]}>
        <Upload customRequest={handleUpload} showUploadList={false} accept='image/*'>
          <Button icon={<UploadOutlined />} loading={uploading}>
            Tải lên ảnh bìa
          </Button>
        </Upload>
        {imageUrl && (
          <div style={{ marginTop: 16 }}>
            <img src={imageUrl} alt='Ảnh bìa' style={{ maxWidth: '100%', maxHeight: 200 }} />
          </div>
        )}
      </Form.Item>

      <Form.Item name='content' label='Nội dung' rules={[{ required: true, message: 'Vui lòng nhập nội dung!' }]}>
        <ReactQuill theme='snow' style={{ height: '200px', marginBottom: '50px' }} />
      </Form.Item>

      <Form.Item>
        <Button type='primary' htmlType='submit' loading={loading}>
          Tạo Blog
        </Button>
      </Form.Item>
    </Form>
  )
}

export default CreateBlog
