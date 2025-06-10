import React, { useState, useEffect } from 'react'
import { Modal, Form, Input, Button, Upload, message, Spin } from 'antd'
import { UploadOutlined, UserOutlined, PhoneOutlined, MailOutlined, LoadingOutlined } from '@ant-design/icons'
import { Profile, updateUserAPI } from '../../../api/user.api'
import { RcFile, UploadChangeParam, UploadFile } from 'antd/lib/upload/interface'
import axios from 'axios'
import { handleUploadFile } from '../../../utils/upload'

interface UpdateUserResponse {
  success: boolean
  message?: string
  data?: Profile
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
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (visible && userProfile) {
      form.setFieldsValue({
        fullName: userProfile.fullName,
        email: userProfile.email,
        phone: userProfile.phone
      })
      setImageUrl(userProfile.image)
      setFileList([])
    }
  }, [visible, userProfile, form])

  const beforeUpload = (file: RcFile) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'
    if (!isJpgOrPng) {
      message.error('Bạn chỉ có thể tải lên file JPG/PNG!')
      return false
    }
    const isLt5M = file.size / 1024 / 1024 < 5
    if (!isLt5M) {
      message.error('Ảnh phải nhỏ hơn 5MB!')
      return false
    }
    return true
  }

  const handleFileChange = async (info: UploadChangeParam) => {
    setFileList(info.fileList.slice(-1))

    if (info.file.status === 'uploading') {
      setUploading(true)
      return
    }

    if (info.file.status === 'done') {
      try {
        const file = info.file.originFileObj as RcFile
        const url = await handleUploadFile(file, 'image')
        if (url) {
          setImageUrl(url)
          message.success('Tải ảnh lên thành công')
        }
      } catch (error) {
        console.error('Lỗi khi tải ảnh:', error)
        message.error('Không thể tải ảnh lên. Vui lòng thử lại.')
      } finally {
        setUploading(false)
      }
    } else if (info.file.status === 'error') {
      message.error('Tải ảnh lên thất bại')
      setUploading(false)
    }
  }

  const onFinish = async (values: { fullName: string; email: string; phone: string }) => {
    if (!userProfile?._id) {
      message.error('Không tìm thấy ID người dùng.')
      return
    }

    setLoading(true)
    try {
      const updatedData = {
        fullName: values.fullName,
        email: values.email,
        phone: values.phone,
        ...(imageUrl && { image: imageUrl })
      }

      const response = await updateUserAPI(userProfile._id, updatedData)
      if (response.success) {
        message.success('Cập nhật hồ sơ thành công!')
        onUpdateSuccess()
        onClose()
      } else {
        message.error(response.message || 'Cập nhật hồ sơ thất bại!')
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        message.error(error.response?.data?.message || 'Đã xảy ra lỗi khi cập nhật hồ sơ.')
      } else {
        message.error('Đã xảy ra lỗi khi cập nhật hồ sơ.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal title='Chỉnh sửa hồ sơ' open={visible} onCancel={onClose} footer={null} destroyOnClose width={500} centered>
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
          <div style={{ textAlign: 'center' }}>
            <Upload
              listType='picture-card'
              fileList={fileList}
              beforeUpload={beforeUpload}
              onChange={handleFileChange}
              maxCount={1}
              showUploadList={false}
              customRequest={({ file, onSuccess }) => {
                setTimeout(() => {
                  onSuccess?.('ok')
                }, 0)
              }}
            >
              {imageUrl ? (
                <div style={{ position: 'relative' }}>
                  <img
                    src={imageUrl}
                    alt='avatar'
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: '8px'
                    }}
                  />
                  {uploading && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '8px'
                      }}
                    >
                      <Spin indicator={<LoadingOutlined style={{ fontSize: 24, color: '#fff' }} spin />} />
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ padding: '20px 0' }}>
                  <UploadOutlined style={{ fontSize: 24 }} />
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
                  message.info('Ảnh đại diện đã được xóa')
                }}
                style={{ marginTop: 8 }}
              >
                Xóa ảnh
              </Button>
            )}
          </div>
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
