import React, { useState, useEffect } from 'react'
import { Modal, Form, Input, Button, Upload, message } from 'antd'
import { UploadOutlined, UserOutlined, PhoneOutlined, MailOutlined } from '@ant-design/icons'
import { Profile, updateUserAPI } from '../../../api/user.api'
import { RcFile, UploadChangeParam, UploadFile } from 'antd/lib/upload/interface'
import axios from 'axios'

// Hàm nén hình ảnh
const compressImage = (file: RcFile): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (event) => {
      const img = new Image()
      img.src = event.target?.result as string
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const MAX_WIDTH = 800
        const MAX_HEIGHT = 800
        let width = img.width
        let height = img.height

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width
            width = MAX_WIDTH
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height
            height = MAX_HEIGHT
          }
        }

        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx?.drawImage(img, 0, 0, width, height)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7)
        resolve(dataUrl)
      }
      img.onerror = (error) => reject(error)
    }
    reader.onerror = (error) => reject(error)
  })
}

interface UpdateProfileModalProps {
  visible: boolean
  onClose: () => void
  userProfile: Profile | null
  onUpdateSuccess: () => void
}

const UpdateProfileModal: React.FC<UpdateProfileModalProps> = ({ visible, onClose, userProfile, onUpdateSuccess }) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [fileList, setFileList] = useState<UploadFile[]>([])
  const [imageUrl, setImageUrl] = useState<string | undefined>(userProfile?.image)

  useEffect(() => {
    if (visible && userProfile) {
      form.setFieldsValue({
        fullName: userProfile.fullName,
        email: userProfile.email,
        phone: userProfile.phone
      })
      setImageUrl(userProfile.image)
      setFileList([]) // Clear file list on modal open
    }
  }, [visible, userProfile, form])

  const beforeUpload = (file: RcFile) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'
    if (!isJpgOrPng) {
      message.error('Bạn chỉ có thể tải lên file JPG/PNG!')
    }
    const isLt2M = file.size / 1024 / 1024 < 2
    if (!isLt2M) {
      message.error('Ảnh phải nhỏ hơn 2MB!')
    }
    return isJpgOrPng && isLt2M
  }

  const handleFileChange = async (info: UploadChangeParam) => {
    setFileList(info.fileList.slice(-1)) // Keep only the last uploaded file
    if (info.file.status === 'done') {
      message.success(`${info.file.name} tải lên thành công`)
      try {
        const compressedImageUrl = await compressImage(info.file.originFileObj as RcFile)
        setImageUrl(compressedImageUrl)
      } catch (error) {
        console.error('Error compressing image:', error)
        message.error('Lỗi khi nén hình ảnh.')
      }
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} tải lên thất bại.`)
    }
  }

  const onFinish = async (values: { fullName: string; email: string; phone: string }) => {
    if (!userProfile?._id) {
      message.error('Không tìm thấy ID người dùng.')
      return
    }

    setLoading(true)
    try {
      const updatedData: { fullName?: string; email?: string; phone?: string; image?: string } = {
        fullName: values.fullName,
        email: values.email,
        phone: values.phone
      }

      if (fileList.length > 0 && fileList[0].originFileObj) {
        try {
          updatedData.image = await compressImage(fileList[0].originFileObj as RcFile)
        } catch (error) {
          console.error('Error compressing image:', error)
          message.error('Lỗi khi nén hình ảnh.')
          setLoading(false)
          return
        }
      } else if (imageUrl && !fileList.length) {
        updatedData.image = imageUrl
      } else if (!imageUrl && !fileList.length) {
        updatedData.image = undefined
      }

      const response = await updateUserAPI(userProfile._id, updatedData)
      if (response.success) {
        message.success('Cập nhật hồ sơ thành công!')
        onUpdateSuccess() // Call to re-fetch user profile in parent
        onClose()
      } else {
        message.error(response.message || 'Cập nhật hồ sơ thất bại!')
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error('Update profile error:', error)
        message.error(error.response?.message || 'Đã xảy ra lỗi khi cập nhật hồ sơ.')
      } else {
        console.error('Update profile error:', error)
        message.error('Đã xảy ra lỗi khi cập nhật hồ sơ.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      title='Chỉnh sửa hồ sơ'
      open={visible}
      onCancel={onClose}
      footer={null}
      destroyOnClose // Destroy form fields on close to reset state
    >
      <Form
        form={form}
        layout='vertical'
        onFinish={onFinish}
        initialValues={{
          fullName: userProfile?.fullName,
          email: userProfile?.email,
          phone: userProfile?.phone
        }}
      >
        <Form.Item name='fullName' label='Họ và tên' rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}>
          <Input prefix={<UserOutlined />} />
        </Form.Item>
        <Form.Item name='email' label='Email'>
          <Input prefix={<MailOutlined />} readOnly />
        </Form.Item>
        <Form.Item
          name='phone'
          label='Số điện thoại'
          rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
        >
          <Input prefix={<PhoneOutlined />} />
        </Form.Item>

        <Form.Item label='Ảnh đại diện'>
          <Upload
            listType='picture-card'
            fileList={fileList}
            beforeUpload={beforeUpload}
            onChange={handleFileChange}
            maxCount={1}
            showUploadList={false} // Hide default list to show custom preview
          >
            {imageUrl ? (
              <img src={imageUrl} alt='avatar' style={{ width: '100%' }} />
            ) : (
              <div>
                <UploadOutlined />
                <div style={{ marginTop: 8 }}>Tải ảnh lên</div>
              </div>
            )}
          </Upload>
          {imageUrl && (
            <Button
              danger
              onClick={() => {
                setImageUrl(undefined)
                setFileList([])
                message.info('Ảnh đại diện đã được xóa khỏi bản xem trước. Lưu để áp dụng.')
              }}
              style={{ marginTop: 8 }}
            >
              Xóa ảnh
            </Button>
          )}
        </Form.Item>

        <Form.Item>
          <Button type='primary' htmlType='submit' loading={loading} block>
            Cập nhật
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default UpdateProfileModal
