import React, { useState } from 'react'
import { Modal, Form, Input, message } from 'antd'
import { createGradeAPI } from '../../../api/grade.api'
import { toast } from 'react-toastify'

interface CreateGradeProps {
  isModalVisible: boolean
  onCancel: () => void
  onOk: () => void
}

const CreateGrade: React.FC<CreateGradeProps> = ({ isModalVisible, onCancel, onOk }) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  const handleOk = async () => {
    try {
      setLoading(true)
      const values = await form.validateFields()
      const gradeData = {
        name: values.name,
        positionOrder: values.positionOrder.toString(),
      }

      console.log('Sending grade data:', gradeData)

      // Call the API
      const response = await createGradeAPI(gradeData)
      console.log('API response:', response)

      toast.success('Tạo khối thành công!')
      form.resetFields()
      onOk()
    } catch (error: any) {
      console.error('Error creating grade:', error)
      message.error(error.response?.data?.message || error.message || 'Có lỗi xảy ra khi tạo khối!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      title='Thêm khối mới'
      open={isModalVisible}
      onOk={handleOk}
      confirmLoading={loading}
      onCancel={() => {
        form.resetFields()
        onCancel()
      }}
      width={600}
    >
      <Form form={form} layout='vertical' initialValues={{ status: 'active' }}>
        <Form.Item name='name' label='Tên khối' rules={[{ required: true, message: 'Vui lòng nhập tên khối!' }]}>
          <Input placeholder='Nhập tên khối' />
        </Form.Item>

        <Form.Item name='positionOrder' label='Thứ tự' rules={[{ required: true, message: 'Vui lòng nhập thứ tự!' }]}>
          <Input type='number' min={1} placeholder='Nhập thứ tự' />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default CreateGrade
