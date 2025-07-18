import { Form, Input, message, Modal } from 'antd'
import React from 'react'
import { createUserAPI, updateUserAPI } from '../../../api/user.api'

interface UpdateProps {
  isModalVisible: boolean
  setIsModalVisible: (v: boolean) => void
  user: any
  onUpdated: () => void
}

const Update: React.FC<UpdateProps> = ({ isModalVisible, setIsModalVisible, user, onUpdated }) => {
  const [form] = Form.useForm()

  React.useEffect(() => {
    if (user) {
      form.setFieldsValue({
        fullName: user.fullName,
        phone: user.phone
      })
    }
  }, [user, form])

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      if (user && user._id) {
        await updateUserAPI(user._id, values)
        message.success('Cập nhật thông tin người dùng thành công!')
      } else {
        await createUserAPI(values)
        message.success('Thêm người dùng thành công!')
      }
      setIsModalVisible(false)
      onUpdated()
      form.resetFields()
    } catch (error: unknown) {
      console.log('error', error)
      const err = error as { message?: string }
      if (err.message) {
        message.error(err.message)
      } else {
        message.error('Cập nhật thất bại!')
      }
    }
  }

  return (
    <Modal
      title='Cập nhật thông tin người dùng'
      open={isModalVisible}
      onCancel={() => {
        setIsModalVisible(false)
        form.resetFields()
      }}
      onOk={handleSubmit}
      okText='Cập nhật'
      cancelText='Hủy'
    >
      <Form form={form} layout='vertical'>
        <Form.Item name='fullName' label='Họ và tên' rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}>
          <Input />
        </Form.Item>
        <Form.Item
          name='phone'
          label='Số điện thoại'
          rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
        >
          <Input />
        </Form.Item>
        {/* <Form.Item name='image' label='Ảnh đại diện'>
          <Upload listType='picture-card' showUploadList={{ showPreviewIcon: false }} onChange={handleUploadChange}>
            <Button icon={<UploadOutlined />}>Upload</Button>
          </Upload>
        </Form.Item> */}
      </Form>
    </Modal>
  )
}

export default Update
