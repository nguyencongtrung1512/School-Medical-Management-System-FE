import {
  LockOutlined,
  MailOutlined,
  MinusCircleOutlined,
  PhoneOutlined,
  PlusOutlined,
  UserOutlined
} from '@ant-design/icons'
import { Alert, Button, Col, Form, Input, Row, Select, Space } from 'antd'
import { AxiosError } from 'axios'
import { motion } from 'framer-motion'
import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { registerAPI } from '../../api/auth.api'
import path from '../../constants/path'

interface RegisterFormValues {
  phoneNumber: string
  password: string
  confirmPassword: string
  fullname: string
  email: string
  type: 'father' | 'mother' | 'guardian'
  studentCodes: string[]
}

interface RegisterFormProps {
  onFinish?: (values: RegisterFormValues) => Promise<void>
  loading: boolean
}

interface ErrorResponseData {
  message?: string
}

const Register: React.FC<RegisterFormProps> = ({ loading }) => {
  const [form] = Form.useForm<RegisterFormValues>()
  const formVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: -50, transition: { duration: 0.3 } }
  }
  const navigate = useNavigate()

  useEffect(() => {
    form.setFieldsValue({ role: 'parent' })
  }, [form])

  const handleRegister = () => {
    navigate(path.login)
  }

  const handleSubmit = async (values: RegisterFormValues) => {
    try {
      const { type, studentCodes, email, password, fullname, phoneNumber } = values
      const studentParents = (studentCodes || []).map((code) => ({ studentCode: code, type }))
      const body: any = {
        email,
        password,
        fullName: fullname,
        phone: phoneNumber,
        role: 'parent',
        studentParents,
        isDeleted: false
      }
      const response = await registerAPI(body)
      if (response.success) {
        toast.success('Đăng ký thành công!')
        form.resetFields()
        navigate(path.login)
      } else {
        // Hiển thị lỗi trong form
        const errorMessage = response.message || 'Đăng ký thất bại!'

        // Kiểm tra nếu lỗi liên quan đến email
        if (errorMessage.toLowerCase().includes('email') || errorMessage.toLowerCase().includes('tồn tại')) {
          form.setFields([
            {
              name: 'email',
              errors: [errorMessage]
            }
          ])
        } else {
          toast.error(errorMessage)
        }
      }
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponseData>
      console.error('Register error:', axiosError)

      // Xử lý lỗi từ server
      if (axiosError) {
        const errorMessage = axiosError.message || 'Đăng ký thất bại!'

        // Kiểm tra nếu lỗi liên quan đến email đã tồn tại
        if (
          errorMessage.toLowerCase().includes('email') ||
          errorMessage.toLowerCase().includes('tồn tại') ||
          errorMessage.toLowerCase().includes('exists')
        ) {
          form.setFields([
            {
              name: 'email',
              errors: [errorMessage]
            }
          ])
        } else if (
          errorMessage.toLowerCase().includes('phone') ||
          errorMessage.toLowerCase().includes('số điện thoại')
        ) {
          // Lỗi liên quan đến số điện thoại
          form.setFields([
            {
              name: 'phoneNumber',
              errors: [errorMessage]
            }
          ])
        } else if (errorMessage.toLowerCase().includes('password') || errorMessage.toLowerCase().includes('mật khẩu')) {
          // Lỗi liên quan đến mật khẩu
          form.setFields([
            {
              name: 'password',
              errors: [errorMessage]
            }
          ])
        } else {
          // Lỗi chung
          toast.error(errorMessage)
        }
      } else {
        // Lỗi network hoặc lỗi khác
        toast.error('Đăng ký thất bại! Vui lòng thử lại.')
      }
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
          <motion.div
            key='register'
            initial='hidden'
            animate='visible'
            exit='exit'
            variants={formVariants}
            className='mt-4 w-full'
          >
            <Alert
              message='Vui lòng điền đầy đủ thông tin để đăng ký tài khoản'
              type='info'
              showIcon
              className='mb-6 text-base'
            />

            <Form name='register' onFinish={handleSubmit} layout='vertical' form={form} className='space-y-4 w-full'>
              <Row gutter={24}>
                <Col span={24}>
                  <Form.Item
                    name='fullname'
                    rules={[
                      { required: true, message: 'Vui lòng nhập họ tên!' },
                      { min: 2, message: 'Họ tên phải có ít nhất 2 ký tự!' },
                      { max: 50, message: 'Họ tên không được vượt quá 50 ký tự!' }
                    ]}
                    className='mb-4'
                  >
                    <Input
                      prefix={<UserOutlined className='text-gray-400' />}
                      placeholder='Họ và tên'
                      size='large'
                      className='py-3 px-4 text-base'
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={24}>
                <Col span={12}>
                  <Form.Item
                    name='email'
                    rules={[
                      { required: true, message: 'Vui lòng nhập email!' },
                      { type: 'email', message: 'Email không hợp lệ!' }
                    ]}
                    className='mb-4'
                    validateTrigger={['onChange', 'onBlur']}
                  >
                    <Input
                      prefix={<MailOutlined className='text-gray-400' />}
                      placeholder='Email'
                      size='large'
                      className='py-3 px-4 text-base'
                    />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    name='phoneNumber'
                    rules={[
                      { required: true, message: 'Vui lòng nhập số điện thoại!' },
                      { pattern: /^[0-9]{10}$/, message: 'Số điện thoại phải có 10 chữ số!' }
                    ]}
                    className='mb-4'
                    validateTrigger={['onChange', 'onBlur']}
                  >
                    <Input
                      prefix={<PhoneOutlined className='text-gray-400' />}
                      placeholder='Số điện thoại'
                      size='large'
                      className='py-3 px-4 text-base'
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={24}>
                <Col span={12}>
                  <Form.Item
                    name='password'
                    rules={[
                      { required: true, message: 'Vui lòng nhập mật khẩu!' },
                      { min: 8, message: 'Mật khẩu phải có ít nhất 8 ký tự!' },
                      {
                        pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/,
                        message: 'Mật khẩu phải có ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt!'
                      }
                    ]}
                    className='mb-4'
                    validateTrigger={['onChange', 'onBlur']}
                  >
                    <Input.Password
                      prefix={<LockOutlined className='text-gray-400' />}
                      placeholder='Mật khẩu'
                      size='large'
                      className='py-3 px-4 text-base'
                    />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    name='confirmPassword'
                    dependencies={['password']}
                    rules={[
                      { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldValue('password') === value) {
                            return Promise.resolve()
                          }
                          return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'))
                        }
                      })
                    ]}
                    className='mb-4'
                    validateTrigger={['onChange', 'onBlur']}
                  >
                    <Input.Password
                      prefix={<LockOutlined className='text-gray-400' />}
                      placeholder='Xác nhận mật khẩu'
                      size='large'
                      className='py-3 px-4 text-base'
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={24}>
                <Col span={24}>
                  <Form.Item
                    name='type'
                    label='Danh tính'
                    rules={[{ required: true, message: 'Vui lòng chọn danh tính!' }]}
                    className='mb-4'
                  >
                    <Select
                      placeholder='Chọn danh tính'
                      options={[
                        { value: 'father', label: 'Cha' },
                        { value: 'mother', label: 'Mẹ' },
                        { value: 'guardian', label: 'Người giám hộ' }
                      ]}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.List name='studentCodes'>
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }) => (
                      <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align='baseline'>
                        <Form.Item
                          {...restField}
                          name={name}
                          rules={[{ required: true, message: 'Vui lòng nhập mã học sinh!' }]}
                        >
                          <Input placeholder='Mã học sinh' />
                        </Form.Item>
                        <MinusCircleOutlined onClick={() => remove(name)} />
                      </Space>
                    ))}
                    <Form.Item>
                      <Button type='dashed' onClick={() => add()} block icon={<PlusOutlined />}>
                        Thêm mã học sinh
                      </Button>
                    </Form.Item>
                  </>
                )}
              </Form.List>

              <Form.Item className='mb-0 mt-6'>
                <Button
                  type='primary'
                  htmlType='submit'
                  loading={loading}
                  block
                  size='large'
                  className='bg-blue-500 hover:bg-blue-600 h-14 text-lg font-medium'
                >
                  Đăng ký
                </Button>
              </Form.Item>
            </Form>
            <div className='mt-6 text-center'>
              <p className='text-gray-600 text-base'>
                Bạn đã có tài khoản?
                <Button type='link' onClick={handleRegister} className='p-0 ml-1 font-medium text-base'>
                  Đăng nhập
                </Button>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Register
