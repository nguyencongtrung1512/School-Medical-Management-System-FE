import { UploadOutlined } from '@ant-design/icons'
import type { UploadProps } from 'antd'
import { Button, Form, Input, message, Select, Upload } from 'antd'
import { useEffect, useState } from 'react'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import { useNavigate, useParams } from 'react-router-dom'
import { blogApi } from '../../../api/blog.api'
import { categoryApi } from '../../../api/category.api'
import { customUploadHandler } from '../../../utils/upload'

interface Category {
  _id: string
  name: string
}

interface UpdateBlogProps {
  onBlogUpdated?: () => void
}

interface BlogFormValues {
  title: string
  description: string
  content: string
  categoryId: string
  image: string
  banner: string
}

function UpdateBlog({ onBlogUpdated }: UpdateBlogProps) {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadingBanner, setUploadingBanner] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [imageUrl, setImageUrl] = useState<string>('')
  const [bannerUrl, setBannerUrl] = useState<string>('')
  const navigate = useNavigate()
  const { _id } = useParams()

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!_id) return

        // Fetch categories
        const categoriesResponse = await categoryApi.searchCategoryApi({
          pageNum: 1,
          pageSize: 100,
          query: ''
        })
        if (categoriesResponse.pageData) {
          setCategories(categoriesResponse.pageData)
        }

        // Fetch blog
        const blogResponse = await blogApi.getBlogByIdApi(_id)
        if (blogResponse.data) {
          form.setFieldsValue({
            title: blogResponse.data.title,
            description: blogResponse.data.description,
            content: blogResponse.data.content,
            categoryId: blogResponse.data.categoryId,
            image: blogResponse.data.image,
            banner: blogResponse.data.banner
          })
          setImageUrl(blogResponse.data.image || '')
          setBannerUrl(blogResponse.data.banner || '')
        }
      } catch (error: unknown) {
        console.log('error', error)
        const err = error as { message?: string }
        if (err.message) {
          message.error(err.message)
        } else {
          message.error('Không thể tải thông tin')
        }
      } finally {
        setInitialLoading(false)
      }
    }

    fetchData()
  }, [_id, form])

  const handleUploadSuccess = (type: 'video' | 'image', url: string) => {
    setImageUrl(url)
    form.setFieldValue('image', url)
  }

  const handleBannerUploadSuccess = (type: 'video' | 'image', url: string) => {
    setBannerUrl(url)
    form.setFieldValue('banner', url)
  }

  const handleSubmit = async (values: BlogFormValues) => {
    try {
      setLoading(true)
      if (!_id) return

      const response = await blogApi.updateBlogApi(_id, {
        title: values.title,
        description: values.description,
        content: values.content,
        categoryId: values.categoryId,
        image: values.image,
        banner: values.banner
      })

      if (response.data) {
        message.success('Cập nhật blog thành công!')
        if (onBlogUpdated) {
          onBlogUpdated()
        }
        navigate(-1)
      }
    } catch (error: unknown) {
      console.log('error', error)
      const err = error as { message?: string }
      if (err.message) {
        message.error(err.message)
      } else {
        message.error('Cập nhật blog thất bại!')
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

  const handleBannerUpload: UploadProps['customRequest'] = (options) => {
    const { file, onSuccess, onError } = options
    if (file instanceof File) {
      customUploadHandler(
        {
          file,
          onSuccess: (url: string) => onSuccess?.(url),
          onError: () => onError?.(new Error('Upload failed'))
        },
        'image',
        setUploadingBanner,
        handleBannerUploadSuccess
      )
    } else {
      onError?.(new Error('Invalid file type'))
    }
  }

  if (initialLoading) {
    return <div>Loading...</div>
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

      <Form.Item name='banner' label='Ảnh banner' rules={[{ required: true, message: 'Vui lòng tải lên ảnh banner!' }]}>
        <Upload customRequest={handleBannerUpload} showUploadList={false} accept='image/*'>
          <Button icon={<UploadOutlined />} loading={uploadingBanner}>
            Tải lên ảnh banner
          </Button>
        </Upload>
        {bannerUrl && (
          <div style={{ marginTop: 16 }}>
            <img src={bannerUrl} alt='Ảnh banner' style={{ maxWidth: '100%', maxHeight: 200 }} />
          </div>
        )}
      </Form.Item>

      <Form.Item name='content' label='Nội dung' rules={[{ required: true, message: 'Vui lòng nhập nội dung!' }]}>
        <ReactQuill theme='snow' style={{ height: '200px', marginBottom: '50px' }} />
      </Form.Item>

      <Form.Item>
        <Button type='primary' htmlType='submit' loading={loading}>
          Cập nhật Blog
        </Button>
      </Form.Item>
    </Form>
  )
}

export default UpdateBlog
