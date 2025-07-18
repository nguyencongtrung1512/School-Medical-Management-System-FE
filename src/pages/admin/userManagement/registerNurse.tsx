import { Form, Input, message, Modal } from 'antd'
import React from 'react'
import { registerAPI } from '../../../api/auth.api'

interface RegisterNurseProps {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
}

const RegisterNurse: React.FC<RegisterNurseProps> = ({ open, onClose, onSuccess }) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = React.useState(false)

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      console.log('Giá trị form gửi đi:', values)
      setLoading(true)
      const response = await registerAPI({
        email: values.email,
        password: values.password,
        fullName: values.fullName,
        phone: values.phone,
        role: 'school-nurse',
        isDeleted: false,
        studentParents: []
      })
      if (response.success) {
        message.success('Đăng ký y tá thành công!')
        form.resetFields()
        onClose()
        onSuccess?.()
      } else {
        message.error(response.message || 'Đăng ký thất bại!')
      }
    } catch (error: unknown) {
      console.log('error', error)
      const err = error as { message?: string }
      if (err.message) {
        message.error(err.message)
      } else {
        message.error('Đăng ký thất bại!')
      }
      // Nếu là lỗi validate của form thì không hiển thị toast, AntD sẽ tự hiển thị lỗi
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      title='Đăng ký y tá mới'
      open={open}
      onCancel={() => {
        onClose()
        form.resetFields()
      }}
      onOk={handleSubmit}
      okText='Đăng ký'
      cancelText='Hủy'
      confirmLoading={loading}
    >
      <Form form={form} layout='vertical' preserve={false}>
        <Form.Item
          name='fullName'
          label='Họ và tên'
          rules={[
            { required: true, message: 'Vui lòng nhập họ và tên!' },
            { min: 2, message: 'Họ và tên phải có ít nhất 2 ký tự!' },
            { max: 50, message: 'Họ và tên không được vượt quá 50 ký tự!' }
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name='email'
          label='Email'
          rules={[
            { required: true, message: 'Vui lòng nhập email!' },
            { type: 'email', message: 'Email không hợp lệ!' }
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name='password'
          label='Mật khẩu'
          rules={[
            { required: true, message: 'Vui lòng nhập mật khẩu!' },
            { min: 8, message: 'Mật khẩu phải có ít nhất 8 ký tự!' }
          ]}
        >
          <Input.Password />
        </Form.Item>
        <Form.Item
          name='phone'
          label='Số điện thoại'
          rules={[
            { required: true, message: 'Vui lòng nhập số điện thoại!' },
            { pattern: /^[0-9]{10}$/, message: 'Số điện thoại phải đủ 10 số!' }
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item name='role' initialValue='school-nurse' hidden>
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default RegisterNurse
