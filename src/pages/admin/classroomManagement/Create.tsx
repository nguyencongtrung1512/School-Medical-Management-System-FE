import { Form, Input, message, Modal } from 'antd'
import React from 'react'
import { useParams } from 'react-router-dom'
import { createClassAPI } from '../../../api/classes.api'

interface CreateClassProps {
  isModalVisible: boolean
  onCancel: () => void
  onOk: () => void
}
const CreateClass: React.FC<CreateClassProps> = ({ isModalVisible, onCancel, onOk }) => {
  const [form] = Form.useForm()
  const { gradeId } = useParams<{ gradeId: string }>()

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      if (!gradeId || gradeId === 'undefined' || gradeId === 'null') {
        message.error('Không tìm thấy ID khối. Vui lòng chọn khối trước khi tạo lớp!')
        return
      }

      const data = {
        name: values.name,
        gradeId: gradeId,
        schoolYear: values.schoolYear
      }

      await createClassAPI(data)
      message.success('Tạo lớp thành công')
      form.resetFields()
      onOk()
    } catch (error: unknown) {
      console.log('error', error)
      const err = error as { message?: string }
      if (err.message) {
        message.error(err.message)
      } else {
        message.error('Không thể tạo lớp mới')
      }
    }
  }

  return (
    <Modal
      title='Thêm lớp mới'
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

export default CreateClass
