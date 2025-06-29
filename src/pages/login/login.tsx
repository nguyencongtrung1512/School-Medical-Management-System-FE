import React, { useState } from 'react'
import { Form, Input, Button } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { loginAPI, decodeToken, forgotPasswordAPI } from '../../api/auth.api'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import path from '../../constants/path'
import { useAuth } from '../../contexts/auth.context'
import { motion } from 'framer-motion'
import { AxiosError } from 'axios'
import { LoginResponse } from '../../api/auth.api'
import ForgotPasswordForm from './forgotPasswordForm'

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [showForgot, setShowForgot] = useState(false)
  const [forgotForm] = Form.useForm()
  const [loginForm] = Form.useForm()
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleRegister = () => {
    navigate(path.register)
  }

  const handleForgotPassword = () => {
    setShowForgot(true)
  }

  const handleBackToLogin = () => {
    setShowForgot(false)
  }

  const handleForgotSubmit = async (values: { email: string }) => {
    try {
      setLoading(true)
      await forgotPasswordAPI(values.email)
      toast.success('Vui lòng kiểm tra email để đặt lại mật khẩu!')
      setShowForgot(false)
    } catch (error) {
      console.error('Forgot password error:', error)
      toast.error('Gửi yêu cầu thất bại!')
    } finally {
      setLoading(false)
    }
  }

  const formVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: -50, transition: { duration: 0.3 } }
  }

  const onFinish = async (values: { email: string; password: string }) => {
    try {
      setLoading(true)
      const response = await loginAPI(values)

      if (response.success) {
        // Decode token để lấy thông tin user
        const decodedToken = decodeToken(response.data)
        if (decodedToken) {
          const userData = {
            id: decodedToken.userId,
            email: decodedToken.email,
            role: decodedToken.role,
            roleName: decodedToken.role
          }

          // Lưu user vào context và localStorage
          login(userData, response.data)

          toast.success('Đăng nhập thành công!', { autoClose: 1000 })

          // Chuyển hướng dựa vào role
          switch (decodedToken.role.toUpperCase()) {
            case 'ADMIN':
              navigate(path.DASHBOARD_ADMIN)
              break
            case 'SCHOOL-NURSE':
              navigate(path.BASE_NURSE)
              break
            case 'PARENT':
              navigate(path.home)
              break
            default:
              navigate('/')
              break
          }
        }
      } else {
        // Hiển thị lỗi trong form
        loginForm.setFields([
          {
            name: 'email',
            errors: ['Email hoặc mật khẩu không đúng']
          },
          {
            name: 'password',
            errors: ['Email hoặc mật khẩu không đúng']
          }
        ])
        toast.error(response.data.message || 'Đăng nhập thất bại!')
      }
    } catch (error) {
      const axiosError = error as AxiosError<LoginResponse>
      console.error('Login error:', axiosError)

      // Xử lý lỗi từ server
      if (axiosError.response?.data) {
        const errorMessage = axiosError.response.data.message || 'Email hoặc mật khẩu không đúng'

        // Hiển thị lỗi trong form
        loginForm.setFields([
          {
            name: 'email',
            errors: [errorMessage]
          },
          {
            name: 'password',
            errors: [errorMessage]
          }
        ])

        toast.error(errorMessage)
      } else {
        // Lỗi network hoặc lỗi khác
        const errorMessage = 'Email hoặc mật khẩu không đúng'
        loginForm.setFields([
          {
            name: 'email',
            errors: [errorMessage]
          },
          {
            name: 'password',
            errors: [errorMessage]
          }
        ])
        toast.error('Đăng nhập thất bại! Vui lòng thử lại.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-[#44aade]'>
      <div className='flex-1 flex flex-col items-center justify-center text-white px-8'>
        <div className='mb-8'>
          <svg width='150' height='150' viewBox='0 0 36 36' fill='none'>
            <rect x='7' y='16' width='22' height='4' rx='2' fill='#fff' />
            <rect x='16' y='7' width='4' height='22' rx='2' fill='#fff' />
            <rect x='2' y='2' width='32' height='32' rx='8' stroke='#ffffff' strokeWidth='3' />
          </svg>
        </div>
        <h1 className='text-6xl font-bold mb-6'>EduCare</h1>
        <p className='text-2xl text-center max-w-lg leading-relaxed'>
          Nền tảng y tế trực tuyến bảo vệ sức khỏe của con bạn!
        </p>
      </div>
      <div className='flex-1 flex items-center justify-center px-8'>
        <div className='bg-white rounded-2xl shadow-2xl p-10 w-[600px]'>
          <div className='flex items-center justify-center mb-8'>
            <span className='text-blue-500 mr-3'>
              <svg width='48' height='48' viewBox='0 0 36 36' fill='none'>
                <rect x='7' y='16' width='22' height='4' rx='2' fill='#1da1f2' />
                <rect x='16' y='7' width='4' height='22' rx='2' fill='#1da1f2' />
                <rect x='2' y='2' width='32' height='32' rx='8' stroke='#1da1f2' strokeWidth='3' />
              </svg>
            </span>
            <span className='text-4xl font-bold select-none'>
              <span className='text-gray-900'>Edu</span>
              <span className='text-blue-500'>Care</span>
            </span>
          </div>
          {!showForgot ? (
            <motion.div
              key='login'
              initial='hidden'
              animate='visible'
              exit='exit'
              variants={formVariants}
              className='mt-4 w-full'
            >
              <Form
                name='login'
                onFinish={onFinish}
                layout='vertical'
                className='space-y-4'
                form={loginForm}
              >
                <Form.Item
                  name='email'
                  rules={[
                    { required: true, message: 'Vui lòng nhập email!' },
                    { type: 'email', message: 'Email không hợp lệ!' }
                  ]}
                  className='mb-4'
                >
                  <Input
                    prefix={<UserOutlined className='text-gray-400' />}
                    placeholder='Email'
                    size='large'
                    className='py-3 px-4 text-base'
                  />
                </Form.Item>
                <Form.Item
                  name='password'
                  rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
                  className='mb-4'
                >
                  <Input.Password
                    prefix={<LockOutlined className='text-gray-400' />}
                    placeholder='Mật khẩu'
                    size='large'
                    className='py-3 px-4 text-base'
                  />
                </Form.Item>
                <Form.Item className='mb-0 mt-6'>
                  <Button
                    type='primary'
                    htmlType='submit'
                    loading={loading}
                    block
                    size='large'
                    className='bg-blue-500 hover:bg-blue-600 h-14 text-lg font-medium'
                  >
                    Đăng nhập
                  </Button>
                </Form.Item>
              </Form>
              <div className='mt-6 text-center'>
                <Button type='link' onClick={handleForgotPassword} className='p-0 font-medium text-base'>
                  Quên mật khẩu?
                </Button>
                <p className='text-gray-600 text-base'>
                  Bạn chưa có tài khoản?
                  <Button type='link' onClick={handleRegister} className='p-0 ml-1 font-medium text-base'>
                    Đăng ký
                  </Button>
                </p>
              </div>
            </motion.div>
          ) : (
            <ForgotPasswordForm
              onSubmit={handleForgotSubmit}
              onBack={handleBackToLogin}
              loading={loading}
              form={forgotForm}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default Login
