import { CalendarOutlined, UploadOutlined } from '@ant-design/icons'
import { Button, DatePicker, Form, Input, message, Modal, Select, Upload } from 'antd'
import dayjs from 'dayjs'
import React from 'react'
import { useParams } from 'react-router-dom'
import { createStudentAPI } from '../../../api/student.api'
import { handleUploadFile } from '../../../utils/upload'

interface CreateClassProps {
  isModalVisible: boolean
  onCancel: () => void
  onOk: () => void
}
const CreateClass: React.FC<CreateClassProps> = ({ isModalVisible, onCancel, onOk }) => {
  const [form] = Form.useForm()
  const { classId } = useParams<{ classId: string }>()
  const [avatarUrl, setAvatarUrl] = React.useState<string | undefined>(undefined)

  const maxDate = dayjs().subtract(6, 'year')
  const minDate = dayjs().subtract(50, 'year')

  const handleOk = async () => {
    try {
      const values = await form.validateFields()

      if (!classId) {
        message.error('Không tìm thấy ID lớp')
        return
      }

      const data = {
        fullName: values.fullName,
        gender: values.gender,
        dob: values.dob,
        parents: [
          {
            type: values.parentType,
            email: values.email
          }
        ],
        classId: classId,
        avatar: values.avatar
      }

      await createStudentAPI(data)
      message.success('Tạo học sinh thành công')
      form.resetFields()
      onOk()
    } catch (error: unknown) {
      console.log('error', error)
      const err = error as { message?: string }
      if (err.message) {
        message.error(err.message)
      } else {
        message.error('Không thể tạo học sinh mới')
      }
    }
  }

  const handleAvatarUpload = async (file: File) => {
    try {
      const url = await handleUploadFile(file, 'image')
      if (url) {
        form.setFieldsValue({ avatar: url })
        setAvatarUrl(url)
        message.success('Tải ảnh lên thành công!')
      }
    } catch (error: unknown) {
      console.log('error', error)
      const err = error as { message?: string }
      if (err.message) {
        message.error(err.message)
      } else {
        message.error('Tải ảnh lên thất bại!')
      }
    }
    return false
  }

  const beforeUpload = (file: File) => {
    const isImage = file.type.startsWith('image/')
    if (!isImage) {
      message.error('Bạn chỉ được upload file ảnh!')
      return false
    }
    const isLt2M = file.size / 1024 / 1024 < 2
    if (!isLt2M) {
      message.error('Ảnh phải nhỏ hơn 2MB!')
      return false
    }
    handleAvatarUpload(file)
    return false
  }

  React.useEffect(() => {
    if (!isModalVisible) setAvatarUrl(undefined)
  }, [isModalVisible])

  return (
    <Modal
      title='Thêm học sinh mới'
      open={isModalVisible}
      onOk={handleOk}
      onCancel={() => {
        form.resetFields()
        onCancel()
      }}
      width={600}
    >
      <Form form={form} layout='vertical'>
        <Form.Item
          name='fullName'
          label='Tên học sinh'
          rules={[
            { required: true, message: 'Vui lòng nhập tên học sinh!' },
            { min: 2, message: 'Tên học sinh phải có ít nhất 2 ký tự!' },
            { max: 50, message: 'Tên học sinh không được vượt quá 50 ký tự!' }
          ]}
        >
          <Input placeholder='Nhập tên học sinh' />
        </Form.Item>
        <Form.Item name='gender' label='Giới tính' rules={[{ required: true, message: 'Vui lòng chọn giới tính!' }]}>
          <Select placeholder='Chọn giới tính'>
            <Select.Option value='male'>Nam</Select.Option>
            <Select.Option value='female'>Nữ</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item
          name='dob'
          label='Ngày sinh'
          rules={[
            { required: true, message: 'Vui lòng chọn ngày sinh!' },
            {
              validator: (_, value) => {
                if (value && value.isAfter(maxDate)) {
                  return Promise.reject('Học sinh phải từ 6 tuổi trở lên!')
                }
                if (value && value.isBefore(minDate)) {
                  return Promise.reject('Ngày sinh không hợp lệ!')
                }
                return Promise.resolve()
              }
            }
          ]}
        >
          <DatePicker
            style={{ width: '100%' }}
            disabledDate={(current) => {
              return current && (current > maxDate || current < minDate)
            }}
            suffixIcon={<CalendarOutlined />}
          />
        </Form.Item>
        <Form.Item
          name='email'
          label='Email phụ huynh'
          rules={[
            { required: true, message: 'Vui lòng nhập email phụ huynh!' },
            { type: 'email', message: 'Email không hợp lệ!' }
          ]}
        >
          <Input placeholder='Nhập email phụ huynh' />
        </Form.Item>
        <Form.Item
          name='parentType'
          label='Loại phụ huynh'
          rules={[{ required: true, message: 'Vui lòng chọn loại phụ huynh!' }]}
        >
          <Select placeholder='Chọn loại phụ huynh'>
            <Select.Option value='father'>Cha</Select.Option>
            <Select.Option value='mother'>Mẹ</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item name='avatar' label='Avatar'>
          <Upload name='avatar' listType='picture' showUploadList={false} beforeUpload={beforeUpload}>
            <Button icon={<UploadOutlined />}>Upload Avatar</Button>
          </Upload>
          {(avatarUrl || form.getFieldValue('avatar')) && (
            <img
              src={avatarUrl || form.getFieldValue('avatar')}
              alt='avatar preview'
              style={{ width: 74, height: 94, marginTop: 8 }}
            />
          )}
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default CreateClass
