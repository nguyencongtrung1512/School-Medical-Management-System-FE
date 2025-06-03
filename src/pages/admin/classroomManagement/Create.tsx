import React from 'react'
import { Modal, Form, Input } from 'antd'
import { createClassAPI } from '../../../api/classes.api'
import { useParams } from 'react-router-dom'
import { toast } from 'react-toastify'

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
        toast.error('Không tìm thấy ID khối. Vui lòng chọn khối trước khi tạo lớp!')
        return
      }

      const data = {
        name: values.name,
        gradeId: gradeId
      }

      await createClassAPI(data)
      toast.success('Tạo lớp thành công')
      form.resetFields()
      onOk()
    } catch (error) {
      console.error('Error creating class:', error)
      toast.error('Không thể tạo lớp mới')
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
      </Form>
    </Modal>
  )
}

export default CreateClass
