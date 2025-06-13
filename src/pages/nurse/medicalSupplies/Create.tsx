import React from 'react'
import { Form, Input, InputNumber, Button, DatePicker } from 'antd'
import { createMedicalSupply } from '../../../api/medicalSupplies'
import { toast } from 'react-toastify'
import dayjs from 'dayjs'

interface CreateMedicalSupplyFormProps {
  onSuccess: () => void
  onCancel: () => void
}

const CreateMedicalSupplyForm: React.FC<CreateMedicalSupplyFormProps> = ({ onSuccess, onCancel }) => {
  const [form] = Form.useForm()

  const onFinish = async (values: any) => {
    try {
      const formattedValues = {
        ...values,
        expiryDate: values.expiryDate.format('YYYY-MM-DD')
      }
      await createMedicalSupply(formattedValues)
      toast.success('Thêm vật tư y tế mới thành công')
      form.resetFields()
      onSuccess()
    } catch (error) {
      toast.error('Không thể thêm vật tư y tế mới')
    }
  }

  return (
    <Form form={form} layout='vertical' onFinish={onFinish} className='bg-white p-6 rounded-lg'>
      <Form.Item name='name' label='Tên vật tư' rules={[{ required: true, message: 'Vui lòng nhập tên vật tư!' }]}>
        <Input placeholder='Nhập tên vật tư' />
      </Form.Item>

      <Form.Item name='description' label='Mô tả' rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}>
        <Input.TextArea rows={4} placeholder='Nhập mô tả' />
      </Form.Item>

      <Form.Item name='quantity' label='Số lượng' rules={[{ required: true, message: 'Vui lòng nhập số lượng!' }]}>
        <InputNumber min={0} className='w-full' placeholder='Nhập số lượng' />
      </Form.Item>

      <Form.Item name='unit' label='Đơn vị' rules={[{ required: true, message: 'Vui lòng nhập đơn vị!' }]}>
        <Input placeholder='Nhập đơn vị' />
      </Form.Item>

      <Form.Item name='expiryDate' label='Ngày hết hạn' rules={[{ required: true, message: 'Vui lòng chọn ngày hết hạn!' }]}>
        <DatePicker className='w-full' format='DD/MM/YYYY' />
      </Form.Item>

      <Form.Item name='supplier' label='Nhà cung cấp' rules={[{ required: true, message: 'Vui lòng nhập nhà cung cấp!' }]}>
        <Input placeholder='Nhập nhà cung cấp' />
      </Form.Item>

      <Form.Item>
        <div className='flex justify-end gap-4'>
          <Button onClick={onCancel}>Hủy</Button>
          <Button type='primary' htmlType='submit'>
            Thêm vật tư
          </Button>
        </div>
      </Form.Item>
    </Form>
  )
}

export default CreateMedicalSupplyForm
