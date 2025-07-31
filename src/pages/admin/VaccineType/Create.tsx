'use client'

import { MedicineBoxOutlined } from '@ant-design/icons'
import { Button, Form, Input, message, Modal, Space } from 'antd'
import type React from 'react'
import { createVaccineTypeAPI, VaccineType } from '../../../api/vaccineType.api'

interface CreateProps {
  open: boolean
  onClose: () => void
  destroyOnClose?: boolean
}

const Create: React.FC<CreateProps> = ({ open, onClose, destroyOnClose }) => {
  const [form] = Form.useForm()

  const handleSubmit = async (values: VaccineType) => {
    try {
      await createVaccineTypeAPI(values)
      message.success('Thêm loại vaccine thành công')
      form.resetFields()
      onClose()
    } catch {
      message.error('Thêm loại vaccine thất bại')
    }
  }

  return (
    <Modal
      title={
        <div className='flex items-center gap-2'>
          <MedicineBoxOutlined className='text-blue-600' />
          Thêm loại vaccine mới
        </div>
      }
      open={open}
      onCancel={onClose}
      destroyOnClose={destroyOnClose}
      footer={null}
      width={500}
    >
      <Form form={form} layout='vertical' onFinish={handleSubmit} autoComplete='off' size='middle'>
        <Form.Item
          label='Mã loại vaccine'
          name='code'
          rules={[
            { required: true, message: 'Vui lòng nhập mã loại vaccine' },
            { min: 2, message: 'Mã phải có ít nhất 2 ký tự' }
          ]}
        >
          <Input placeholder='Nhập mã loại vaccine' />
        </Form.Item>

        <Form.Item
          label='Tên loại vaccine'
          name='name'
          rules={[
            { required: true, message: 'Vui lòng nhập tên loại vaccine' },
            { min: 3, message: 'Tên phải có ít nhất 3 ký tự' }
          ]}
        >
          <Input placeholder='Nhập tên loại vaccine' />
        </Form.Item>

        <Form.Item label='Mô tả' name='description'>
          <Input.TextArea rows={3} placeholder='Nhập mô tả về loại vaccine' />
        </Form.Item>

        <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
          <Space>
            <Button size='middle' onClick={onClose}>
              Hủy
            </Button>
            <Button size='middle' type='primary' htmlType='submit'>
              Thêm mới
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default Create
