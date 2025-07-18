import { Form, Input, message, Modal } from 'antd'
import React, { useEffect } from 'react'
import { updateClassAPI } from '../../../api/classes.api'

interface Class {
  _id: string
  name: string
  schoolYear: string
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
        name: editingClass.name,
        schoolYear: editingClass.schoolYear
      })
    }
  }, [editingClass, form])

  const handleOk = async () => {
    try {
      const values = await form.validateFields()

      if (!editingClass) return

      const data = {
        name: values.name,
        schoolYear: values.schoolYear
      }

      await updateClassAPI(editingClass._id, data)
      message.success('Cập nhật lớp thành công')
      form.resetFields()
      onOk()
    } catch (error: unknown) {
      console.log('error', error)
      const err = error as { message?: string }
      if (err.message) {
        message.error(err.message)
      } else {
        message.error('Không thể cập nhật lớp')
      }
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
        <Form.Item name='schoolYear' label='Năm học' rules={[{ required: true, message: 'Vui lòng nhập năm học!' }]}>
          <Input placeholder='2024-2025' />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default UpdateClass
