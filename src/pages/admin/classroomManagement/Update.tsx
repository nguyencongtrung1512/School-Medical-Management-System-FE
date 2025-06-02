import React, { useEffect } from 'react'
import { Modal, Form, Input } from 'antd'
import { updateClassAPI } from '../../../api/classes.api'
import { toast } from 'react-toastify'

interface Class {
  _id: string
  name: string
}

interface UpdateClassProps {
  isModalVisible: boolean
  onCancel: () => void
  onOk: () => void
  editingClass: Class | null
}

const UpdateClass: React.FC<UpdateClassProps> = ({ isModalVisible, onCancel, onOk, editingClass }) => {
  const [form] = Form.useForm()

  useEffect(() => {
    if (editingClass) {
      form.setFieldsValue({
        name: editingClass.name
      })
    }
  }, [editingClass, form])

  const handleOk = async () => {
    try {
      const values = await form.validateFields()

      if (!editingClass) return

      const data = {
        name: values.name
      }

      await updateClassAPI(editingClass._id, data)
      toast.success('Cập nhật lớp thành công')
      form.resetFields()
      onOk()
    } catch (error) {
      console.error('Error updating class:', error)
      toast.error('Không thể cập nhật lớp')
    }
  }

  return (
    <Modal
      title='Sửa lớp'
      open={isModalVisible}
      onOk={handleOk}
      onCancel={() => {
        form.resetFields()
        onCancel()
      }}
      width={600}
    >
      <Form form={form} layout='vertical'>
        <Form.Item name='name' label='Tên lớp' rules={[{ required: true, message: 'Vui lòng nhập tên lớp!' }]}>
          <Input placeholder='Nhập tên lớp' />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default UpdateClass
