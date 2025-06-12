import React from 'react'
import { Form, Input, Button, Row, Col, Alert, Select, Space } from 'antd'
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined, PlusOutlined, MinusCircleOutlined } from '@ant-design/icons'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import path from '../../constants/path'
import { toast } from 'react-toastify'
import { AxiosError } from 'axios'
import { registerAPI } from '../../api/auth.api'

interface RegisterFormValues {
  phoneNumber: string
  password: string
  confirmPassword: string
  fullname: string
  email: string
  role: 'parent' | 'student'
  studentParents: {
    studentCode: string
    type: 'father' | 'mother' | 'guardian'
  }[]
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

  const handleRegister = () => {
    navigate(path.login)
  }

  const handleSubmit = async (values: RegisterFormValues) => {
    try {
      const response = await registerAPI({
        email: values.email,
        password: values.password,
        fullName: values.fullname,
        phone: values.phoneNumber,
        role: values.role,
        studentParents: values.studentParents
      })
      if (response.success) {
        toast.success('Đăng ký thành công!')
        console.log('Form instance before resetFields:', form)
        form.resetFields()
        navigate(path.login)
      } else {
        toast.error(response.message || 'Đăng ký thất bại!')
      }
    } catch (error) {
      const axiosError = error as AxiosError
      console.error('Register error:', axiosError)
      toast.error((axiosError.response?.data as ErrorResponseData)?.message || 'Đăng ký thất bại!')
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
                    name="role"
                    rules={[{ required: true, message: 'Vui lòng chọn vai trò!' }]}
                    className='mb-4'
                  >
                    <Select
                      placeholder="Chọn vai trò"
                      size="large"
                      options={[
                        { value: 'parent', label: 'Phụ huynh' },
                        { value: 'student', label: 'Học sinh' }
                      ]}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                noStyle
                shouldUpdate={(prevValues, currentValues) => prevValues.role !== currentValues.role}
              >
                {({ getFieldValue }) =>
                  getFieldValue('role') === 'parent' && (
                    <Row gutter={24}>
                      <Col span={24}>
                        <Form.List name="studentParents">
                          {(fields, { add, remove }) => (
                            <>
                              {fields.map(({ key, name, ...restField }) => (
                                <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                                  <Form.Item
                                    {...restField}
                                    name={[name, 'studentCode']}
                                    rules={[{ required: true, message: 'Vui lòng nhập mã học sinh!' }]}
                                  >
                                    <Input placeholder="Mã học sinh" />
                                  </Form.Item>
                                  <Form.Item
                                    {...restField}
                                    name={[name, 'type']}
                                    rules={[{ required: true, message: 'Vui lòng chọn danh tính!' }]}
                                  >
                                    <Select
                                      style={{ width: 120 }}
                                      placeholder="Chọn danh tính"
                                      options={[
                                        { value: 'father', label: 'Cha' },
                                        { value: 'mother', label: 'Mẹ' },
                                        { value: 'guardian', label: 'Người giám hộ' }
                                      ]}
                                    />
                                  </Form.Item>
                                  <MinusCircleOutlined onClick={() => remove(name)} />
                                </Space>
                              ))}
                              <Form.Item>
                                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                  Thêm danh tính
                                </Button>
                              </Form.Item>
                            </>
                          )}
                        </Form.List>
                      </Col>
                    </Row>
                  )
                }
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
