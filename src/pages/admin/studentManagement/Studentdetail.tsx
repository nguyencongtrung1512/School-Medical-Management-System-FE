import React, { useState, useEffect } from 'react'
import { Modal, Descriptions, Avatar, Space, Typography, Spin, Form, Input, Select, DatePicker, Button } from 'antd'
import { UserOutlined, PhoneOutlined } from '@ant-design/icons'
import { updateStudentAPI } from '../../../api/student.api'
import { toast } from 'react-toastify'
import dayjs from 'dayjs'

const { Title } = Typography

interface StudentDetailProps {
  open: boolean
  onCancel: () => void
  student: any
  loading: boolean
  onUpdated?: () => void // callback để reload lại danh sách nếu cần
}

const StudentDetail: React.FC<StudentDetailProps> = ({ open, onCancel, student, loading, onUpdated }) => {
  const [isEdit, setIsEdit] = useState(false)
  const [form] = Form.useForm()
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (student && isEdit) {
      form.setFieldsValue({
        ...student,
        dob: student.dob ? dayjs(student.dob) : null
      })
    }
  }, [student, isEdit, form])

  const handleSave = async () => {
    try {
      setSaving(true)
      const values = await form.validateFields()
      await updateStudentAPI(student._id, {
        ...values,
        dob: values.dob ? values.dob.format('YYYY-MM-DD') : undefined
      })
      toast.success('Cập nhật học sinh thành công')
      setIsEdit(false)
      if (onUpdated) onUpdated()
    } catch (err) {
      toast.error('Không thể cập nhật học sinh')
    }
    setSaving(false)
  }

  return (
    <Modal
      title='Thông tin chi tiết học sinh'
      open={open}
      onCancel={() => {
        setIsEdit(false)
        onCancel()
      }}
      footer={null}
      width={800}
    >
      {loading ? (
        <Spin />
      ) : student ? (
        <div className='p-4'>
          <div className='flex items-center mb-6'>
            <Avatar size={64} src={student.avatar} icon={<UserOutlined />} className='mr-4' />
            <div>
              <Title level={4}>{student.fullName}</Title>
              <p className='text-gray-600'>Mã học sinh: {student.studentCode}</p>
            </div>
          </div>
          {isEdit ? (
            <Form form={form} layout='vertical'>
              <Form.Item
                name='fullName'
                label='Tên học sinh'
                rules={[{ required: true, message: 'Vui lòng nhập tên học sinh!' }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name='gender'
                label='Giới tính'
                rules={[{ required: true, message: 'Vui lòng chọn giới tính!' }]}
              >
                <Select>
                  <Select.Option value='male'>Nam</Select.Option>
                  <Select.Option value='female'>Nữ</Select.Option>
                  <Select.Option value='other'>Khác</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item name='dob' label='Ngày sinh' rules={[{ required: true, message: 'Vui lòng chọn ngày sinh!' }]}>
                <DatePicker />
              </Form.Item>
              <Form.Item>
                <Space>
                  <Button type='primary' loading={saving} onClick={handleSave}>
                    Lưu
                  </Button>
                  <Button onClick={() => setIsEdit(false)}>Hủy</Button>
                </Space>
              </Form.Item>
            </Form>
          ) : (
            <>
              <Descriptions bordered column={2}>
                <Descriptions.Item label='Ngày sinh'>{student.dob}</Descriptions.Item>
                <Descriptions.Item label='Giới tính'>
                  {student.gender === 'male' ? 'Nam' : student.gender === 'female' ? 'Nữ' : 'Khác'}
                </Descriptions.Item>
                <Descriptions.Item label='Phụ huynh'>{student.parentName}</Descriptions.Item>
                <Descriptions.Item label='Số điện thoại'>
                  <Space>
                    <PhoneOutlined />
                    {student.parentPhone}
                  </Space>
                </Descriptions.Item>
              </Descriptions>
              <Button className='mt-4' type='primary' onClick={() => setIsEdit(true)}>
                Chỉnh sửa
              </Button>
            </>
          )}
        </div>
      ) : (
        <p>Không tìm thấy thông tin học sinh.</p>
      )}
    </Modal>
  )
}

export default StudentDetail
