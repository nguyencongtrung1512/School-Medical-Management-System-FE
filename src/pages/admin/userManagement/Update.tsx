import React from 'react'
import { Modal, Form, Input } from 'antd'
import { updateUserAPI, createUserAPI } from '../../../api/user.api'
import { toast } from 'react-toastify'


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
        toast.success('Cập nhật thông tin người dùng thành công!')
      } else {
        await createUserAPI(values)
        toast.success('Thêm người dùng thành công!')
      }
      setIsModalVisible(false)
      onUpdated()
      form.resetFields()
    } catch (err) {
      toast.error('Cập nhật thất bại!')
      console.error('Update error:', err)
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
