import React, { useState } from 'react'
import { Form, Input, Button } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { loginAPI, decodeToken } from '../../api/auth.api'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import path from '../../constants/path'

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const onFinish = async (values: { email: string; password: string }) => {
    try {
      setLoading(true)
      const response = await loginAPI(values)
      const loginResponse = response.success

      if (loginResponse) {
        // Lưu token vào localStorage
        localStorage.setItem('token', response.data)

        // Decode token để lấy thông tin user
        const decodedToken = decodeToken(response.data)
        if (decodedToken) {
          localStorage.setItem(
            'user',
            JSON.stringify({
              id: decodedToken.userId,
              email: decodedToken.email,
              role: decodedToken.role
            })
          )
          console.log('decodedToken', decodedToken)
          toast.success('Đăng nhập thành công!')

          // Chuyển hướng dựa vào role
          switch (decodedToken.role.toUpperCase()) {
            case 'ADMIN':
              navigate(path.DASHBOARD_ADMIN)
              break
            case 'NURSE':
              navigate(path.BASE_NURSE)
              break
            default:
              navigate(path.BASE_NURSE)
              break
          }
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Đăng nhập thất bại!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-[#44aade]'>
      {/* Bên trái: Logo + slogan */}
      <div className='flex-1 flex flex-col items-center justify-center text-white'>
        <div className='mb-8'>
          {/* Logo SVG hoặc ảnh */}
          <svg width='120' height='120' viewBox='0 0 36 36' fill='none'>
            <rect x='7' y='16' width='22' height='4' rx='2' fill='#fff' />
            <rect x='16' y='7' width='4' height='22' rx='2' fill='#fff' />
            <rect x='2' y='2' width='32' height='32' rx='8' stroke='#ffffff' strokeWidth='3' />
          </svg>
        </div>
        <h1 className='text-5xl font-bold mb-4'>EduCare</h1>
        <p className='text-xl text-center max-w-xs'>Nền tảng y tế trực tuyến bảo vệ sức khỏe của con bạn!</p>
      </div>
      {/* Bên phải: Form đăng nhập */}
      <div className='flex-1 flex items-center justify-center'>
        <div className='bg-white rounded-lg shadow-lg p-8 w-[400px]'>
          <div className='flex items-center justify-center mb-6'>
            <span className='text-blue-500 mr-2'>
              <svg width='36' height='36' viewBox='0 0 36 36' fill='none'>
                <rect x='7' y='16' width='22' height='4' rx='2' fill='#1da1f2' />
                <rect x='16' y='7' width='4' height='22' rx='2' fill='#1da1f2' />
                <rect x='2' y='2' width='32' height='32' rx='8' stroke='#1da1f2' strokeWidth='3' />
              </svg>
            </span>
            <span className='text-3xl font-bold select-none'>
              <span className='text-gray-900'>Edu</span>
              <span className='text-blue-500'>Care</span>
            </span>
          </div>
          <Form name='login' onFinish={onFinish} layout='vertical'>
            <Form.Item
              name='email'
              rules={[
                { required: true, message: 'Vui lòng nhập email!' },
                { type: 'email', message: 'Email không hợp lệ!' }
              ]}
            >
              <Input prefix={<UserOutlined />} placeholder='Email' size='large' />
            </Form.Item>
            <Form.Item name='password' rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}>
              <Input.Password prefix={<LockOutlined />} placeholder='Mật khẩu' size='large' />
            </Form.Item>
            <Form.Item>
              <Button
                type='primary'
                htmlType='submit'
                loading={loading}
                block
                size='large'
                className='bg-blue-500 hover:bg-blue-600'
              >
                Đăng nhập
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  )
}

export default Login
