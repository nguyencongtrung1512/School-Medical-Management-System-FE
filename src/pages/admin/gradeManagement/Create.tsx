import { Form, Input, message, Modal } from 'antd'
import React, { useState } from 'react'
import { createGradeAPI } from '../../../api/grade.api'

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
        positionOrder: values.positionOrder.toString()
      }

      await createGradeAPI(gradeData)

      message.success('Tạo khối thành công!')
      form.resetFields()
      onOk()
    } catch (error: unknown) {
      console.log('error', error)
      const err = error as { message?: string }
      if (err.message) {
        message.error(err.message)
      } else {
        message.error('Có lỗi xảy ra khi tạo khối!')
      }
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
