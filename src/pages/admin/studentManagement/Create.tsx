import { CalendarOutlined, DeleteOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons'
import { Button, DatePicker, Form, Input, message, Modal, Select, Upload, Row, Col } from 'antd'
import dayjs from 'dayjs'
import React from 'react'
import { useParams } from 'react-router-dom'
import { createStudentAPI } from '../../../api/student.api'
import { handleUploadFile } from '../../../utils/upload'

interface CreateStudentProps {
  isModalVisible: boolean
  onCancel: () => void
  onOk: () => void
}

const CreateStudent: React.FC<CreateStudentProps> = ({ isModalVisible, onCancel, onOk }) => {
  const [form] = Form.useForm()
  const { classId } = useParams<{ classId: string }>()
  const [avatarUrl, setAvatarUrl] = React.useState<string | undefined>(undefined)

  const watchedParents = Form.useWatch('parents', form) || []

  const getAvailableOptions = (currentIndex: number) => {
    const selectedTypes = watchedParents
      .map((parent: { type: string }, index: number) => (index !== currentIndex ? parent?.type : null))
      .filter(Boolean)

    const allOptions = [
      { value: 'father', label: 'Bố' },
      { value: 'mother', label: 'Mẹ' }
    ]

    return allOptions.filter((option) => !selectedTypes.includes(option.value))
  }

  const maxDate = dayjs().subtract(6, 'year')
  const minDate = dayjs().subtract(15, 'year')

  // Hàm reset form hoàn toàn
  const resetFormCompletely = () => {
    form.resetFields()
    setAvatarUrl(undefined)
    // Đặt lại parents mặc định sau khi reset
    setTimeout(() => {
      form.setFieldsValue({
        parents: [{ type: '', email: '' }]
      })
    }, 0)
  }

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      if (!classId) {
        message.error('Không tìm thấy ID lớp')
        return
      }

      // Lấy danh sách parents từ form
      const parents = values.parents || []

      const data = {
        fullName: values.fullName.trim(),
        gender: values.gender,
        dob: values.dob.toISOString(),
        parents: parents.map((parent: { type: string; email: string }) => ({
          type: parent.type,
          email: parent.email.trim()
        })),
        classId: classId,
        avatar: values.avatar?.trim()
      }

      await createStudentAPI(data)
      message.success('Tạo học sinh thành công')
      resetFormCompletely() // Sử dụng hàm reset mới
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

  const handleCancel = () => {
    resetFormCompletely() // Sử dụng hàm reset mới
    onCancel()
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
    if (isModalVisible) {
      // Chỉ khởi tạo khi modal mở và form chưa có dữ liệu
      const currentParents = form.getFieldValue('parents')
      if (!currentParents || currentParents.length === 0) {
        form.setFieldsValue({
          parents: [{ type: '', email: '' }]
        })
      }
    } else {
      // Reset khi modal đóng
      resetFormCompletely()
    }
  }, [isModalVisible, form])

  return (
    <Modal
      title='Thêm học sinh mới'
      open={isModalVisible}
      onOk={handleOk}
      onCancel={handleCancel}
      width={700}
      okText='Tạo học sinh'
      cancelText='Hủy'
      // Thêm destroyOnClose để đảm bảo component được tạo mới mỗi lần
      destroyOnClose={true}
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

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name='gender'
              label='Giới tính'
              rules={[{ required: true, message: 'Vui lòng chọn giới tính!' }]}
            >
              <Select placeholder='Chọn giới tính'>
                <Select.Option value='male'>Nam</Select.Option>
                <Select.Option value='female'>Nữ</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
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
                format='DD/MM/YYYY'
                placeholder='Chọn ngày sinh'
                disabledDate={(current) => {
                  return current && (current > maxDate || current < minDate)
                }}
                suffixIcon={<CalendarOutlined />}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label='Thông tin phụ huynh (tối đa 2)'>
          <Form.List
            name='parents'
            rules={[
              {
                validator: async (_, parents) => {
                  if (!parents || parents.length < 1) {
                    return Promise.reject(new Error('Vui lòng thêm ít nhất 1 phụ huynh'))
                  }
                  if (parents.length > 2) {
                    return Promise.reject(new Error('Chỉ được thêm tối đa 2 phụ huynh'))
                  }
                }
              }
            ]}
          >
            {(fields, { add, remove }, { errors }) => (
              <>
                {fields.map(({ key, name, ...restField }, index) => (
                  <div
                    key={key}
                    style={{
                      marginBottom: 16,
                      padding: 16,
                      border: '1px solid #d9d9d9',
                      borderRadius: 6,
                      backgroundColor: '#fafafa'
                    }}
                  >
                    <Row gutter={8} align='middle'>
                      <Col span={8}>
                        <Form.Item
                          {...restField}
                          name={[name, 'type']}
                          label={`Loại phụ huynh ${index + 1}`}
                          rules={[
                            { required: true, message: 'Chọn loại!' },
                            {
                              validator: (_, value) => {
                                if (value) {
                                  const currentParents = form.getFieldValue('parents') || []
                                  const duplicateCount = currentParents.filter(
                                    (parent: { type: string }, idx: number) => parent?.type === value && idx !== name
                                  ).length

                                  if (duplicateCount > 0) {
                                    return Promise.reject('Loại phụ huynh không được trùng lặp!')
                                  }
                                }
                                return Promise.resolve()
                              }
                            }
                          ]}
                          style={{ marginBottom: 8 }}
                        >
                          <Select
                            placeholder='Chọn loại'
                            onChange={() => {
                              // Trigger validation cho tất cả các field type khác
                              const parents = form.getFieldValue('parents') || []
                              parents.forEach((_: any, idx: number) => {
                                if (idx !== name) {
                                  form.validateFields([['parents', idx, 'type']])
                                }
                              })
                            }}
                          >
                            {getAvailableOptions(name).map((option) => (
                              <Select.Option key={option.value} value={option.value}>
                                {option.label}
                              </Select.Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={14}>
                        <Form.Item
                          {...restField}
                          name={[name, 'email']}
                          label={`Email phụ huynh ${index + 1}`}
                          rules={[
                            { required: true, message: 'Nhập email!' },
                            { type: 'email', message: 'Email không hợp lệ!' }
                          ]}
                          style={{ marginBottom: 8 }}
                        >
                          <Input placeholder='Nhập email phụ huynh' />
                        </Form.Item>
                      </Col>
                      <Col span={2}>
                        {fields.length > 1 && (
                          <Button
                            type='text'
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => remove(name)}
                            style={{ marginTop: 30 }}
                          />
                        )}
                      </Col>
                    </Row>
                  </div>
                ))}

                {fields.length < 2 && (
                  <Form.Item>
                    <Button type='dashed' onClick={() => add({ type: '', email: '' })} block icon={<PlusOutlined />}>
                      Thêm phụ huynh
                    </Button>
                  </Form.Item>
                )}

                <Form.ErrorList errors={errors} />
              </>
            )}
          </Form.List>
        </Form.Item>

        <Form.Item name='avatar' label='Avatar'>
          <Upload name='avatar' listType='picture' showUploadList={false} beforeUpload={beforeUpload}>
            <Button icon={<UploadOutlined />}>Upload Avatar</Button>
          </Upload>
          {(avatarUrl || form.getFieldValue('avatar')) && (
            <div style={{ marginTop: 8 }}>
              <img
                src={avatarUrl || form.getFieldValue('avatar')}
                alt='avatar preview'
                style={{
                  width: 74,
                  height: 94,
                  objectFit: 'cover',
                  border: '1px solid #d9d9d9',
                  borderRadius: 4
                }}
              />
            </div>
          )}
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default CreateStudent