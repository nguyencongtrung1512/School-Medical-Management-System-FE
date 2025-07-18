import { Form, Input, Modal, message } from 'antd'
import React, { useEffect, useState } from 'react'
import { updateGradeAPI } from '../../../api/grade.api'

interface Grade {
  _id: string
  name: string
  positionOrder: string
}

interface UpdateGradeProps {
  isModalVisible: boolean
  onCancel: () => void
  onOk: () => void
  editingGrade: Grade | null
}

type CombinedGrade = {
  _id: string
  name: string
  positionOrder: string | number
}
const UpdateGrade: React.FC<UpdateGradeProps> = ({
  isModalVisible,
  onCancel,
  onOk,
  editingGrade
}: UpdateGradeProps & { editingGrade: CombinedGrade | null }) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (editingGrade) {
      form.setFieldsValue({
        ...editingGrade,
        positionOrder: editingGrade.positionOrder
      })
    }
  }, [editingGrade, form])

  const handleOk = async () => {
    try {
      setLoading(true)
      const values = await form.validateFields()
      if (editingGrade) {
        await updateGradeAPI(editingGrade._id, {
          name: values.name,
          positionOrder: values.positionOrder
        })
        message.success('Cập nhật khối thành công!')
        form.resetFields()
        onOk()
      }
    } catch (error: unknown) {
      console.log('error', error)
      const err = error as { message?: string }
      if (err.message) {
        message.error(err.message)
      } else {
        message.error('Có lỗi xảy ra khi cập nhật khối!')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      title='Sửa khối'
      open={isModalVisible}
      onOk={handleOk}
      confirmLoading={loading}
      onCancel={() => {
        form.resetFields()
        onCancel()
      }}
      width={600}
    >
      <Form form={form} layout='vertical'>
        <Form.Item name='name' label='Tên khối' rules={[{ required: true, message: 'Vui chỉ nhập tên khối!' }]}>
          <Input placeholder='Nhập tên khối' />
        </Form.Item>
        <Form.Item name='positionOrder' label='Thứ tự' rules={[{ required: true, message: 'Vui chỉ nhập thuật tờ!' }]}>
          <Input placeholder='Nhập thứ tự' />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default UpdateGrade
