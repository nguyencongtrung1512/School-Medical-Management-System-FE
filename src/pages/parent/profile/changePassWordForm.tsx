import { LockOutlined } from '@ant-design/icons'
import { Modal, Form, Input, Button } from 'antd'
import { useState } from 'react'
import { changePasswordAPI } from '../../../api/user.api'
import { toast } from 'react-toastify'

interface ChangePasswordFormProps {
  visible: boolean
  onClose: () => void
}

const ChangePasswordForm: React.FC<ChangePasswordFormProps> = ({ visible, onClose }) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  const onFinish = async (values: { oldPassword: string; newPassword: string }) => {
    setLoading(true)
    try {
      const response = await changePasswordAPI(values)
      if (response.success) {
        toast.success('Đổi mật khẩu thành công!')
        form.resetFields()
        onClose()
      } else {
        toast.error(response.message || 'Đổi mật khẩu thất bại!')
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Đã xảy ra lỗi khi đổi mật khẩu.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal title='Đổi mật khẩu' open={visible} onCancel={onClose} footer={null} destroyOnClose width={400} centered>
      <Form form={form} layout='vertical' onFinish={onFinish}>
        <Form.Item
          name='oldPassword'
          label='Mật khẩu cũ'
          rules={[{ required: true, message: 'Vui lòng nhập mật khẩu cũ!' }]}
        >
          <Input.Password prefix={<LockOutlined />} />
        </Form.Item>
        <Form.Item
          name='newPassword'
          label='Mật khẩu mới'
          rules={[
            { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
            { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
          ]}
        >
          <Input.Password prefix={<LockOutlined />} />
        </Form.Item>
        <Form.Item
          name='confirmPassword'
          label='Xác nhận mật khẩu mới'
          dependencies={['newPassword']}
          rules={[
            { required: true, message: 'Vui lòng xác nhận mật khẩu mới!' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('newPassword') === value) {
                  return Promise.resolve()
                }
                return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'))
              }
            })
          ]}
        >
          <Input.Password prefix={<LockOutlined />} />
        </Form.Item>
        <Form.Item>
          <Button type='primary' htmlType='submit' loading={loading} block>
            Đổi mật khẩu
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default ChangePasswordForm
