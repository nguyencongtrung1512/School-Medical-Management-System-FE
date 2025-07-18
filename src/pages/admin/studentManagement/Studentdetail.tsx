import { UploadOutlined } from '@ant-design/icons'
import {
  Button,
  DatePicker,
  Descriptions,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Spin,
  Typography,
  Upload,
  message
} from 'antd'
import dayjs from 'dayjs'
import React, { useEffect, useState } from 'react'
import { updateStudentAPI } from '../../../api/student.api'
import { handleUploadFile } from '../../../utils/upload'
import { formatDate } from '../../../utils/utils'

const { Title } = Typography

interface StudentDetailProps {
  open: boolean
  onCancel: () => void
  student: any
  loading: boolean
  onUpdated?: (updatedStudentId: string) => void
}

const StudentDetail: React.FC<StudentDetailProps> = ({ open, onCancel, student, loading, onUpdated }) => {
  const [isEdit, setIsEdit] = useState(false)
  const [form] = Form.useForm()
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined)

  const handleAvatarUpload = async (file: File) => {
    try {
      setUploading(true)
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
    } finally {
      setUploading(false)
    }
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

  useEffect(() => {
    if (student && isEdit) {
      form.setFieldsValue({
        ...student,
        dob: student.dob ? dayjs(student.dob) : null
      })
      setAvatarUrl(undefined)
    }
    if (!isEdit) setAvatarUrl(undefined)
  }, [student, isEdit, form])

  const handleSave = async () => {
    try {
      setSaving(true)
      const values = await form.validateFields()
      console.log('Giá trị gửi lên API:', values)
      await updateStudentAPI(student._id, {
        ...values,
        dob: values.dob ? values.dob.format('YYYY-MM-DD') : undefined
      })
      message.success('Cập nhật học sinh thành công')
      setIsEdit(false)
      if (onUpdated && student) onUpdated(student._id)
    } catch (error: unknown) {
      console.log('error', error)
      const err = error as { message?: string }
      if (err.message) {
        message.error(err.message)
      } else {
        message.error('Không thể cập nhật học sinh')
      }
    } finally {
      setSaving(false)
    }
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
            <img
              alt={student.fullName}
              src={isEdit ? avatarUrl || student.avatar : student.avatar}
              className='mr-4'
              style={{ width: 74, height: 94 }}
            />
            <div>
              <Title level={4}>{student.fullName}</Title>
            </div>
          </div>
          {isEdit ? (
            <Form form={form} layout='vertical'>
              <Form.Item name='avatar' label='Avatar'>
                <Upload name='avatar' listType='picture' showUploadList={false} beforeUpload={beforeUpload}>
                  <Button icon={<UploadOutlined />} loading={uploading}>
                    Upload Avatar
                  </Button>
                </Upload>
              </Form.Item>
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
                <Descriptions.Item label='Ngày sinh'>{formatDate(student.dob)}</Descriptions.Item>
                <Descriptions.Item label='Giới tính'>
                  {student.gender === 'male' ? 'Nam' : student.gender === 'female' ? 'Nữ' : 'Khác'}
                </Descriptions.Item>
                <Descriptions.Item label='Phụ huynh'>
                  {Array.isArray(student.parentInfos) && student.parentInfos.length > 0 ? (
                    <ul style={{ paddingLeft: 16, margin: 0 }}>
                      {student.parentInfos.map((parent: any) => (
                        <li key={parent._id}>
                          <b>{parent.fullName}</b> (
                          {parent.type === 'father' ? 'Bố' : parent.type === 'mother' ? 'Mẹ' : parent.type})<br />
                          Email: {parent.email}
                          <br />
                          SĐT: {parent.phone}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    'Chưa cập nhật'
                  )}
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
