import React, { useEffect } from 'react'
import { Form, Input, InputNumber, Button, DatePicker } from 'antd'
import { updateMedicalSupply } from '../../../api/medicalSupplies'
import type { MedicalSupply } from '../../../api/medicalSupplies'
import { toast } from 'react-toastify'
import dayjs from 'dayjs'

interface UpdateMedicalSupplyFormProps {
  medicalSupply: MedicalSupply
  onSuccess: () => void
  onCancel: () => void
}

const UpdateMedicalSupplyForm: React.FC<UpdateMedicalSupplyFormProps> = ({ medicalSupply, onSuccess, onCancel }) => {
  const [form] = Form.useForm()

  useEffect(() => {
    form.setFieldsValue({
      name: medicalSupply.name,
      description: medicalSupply.description,
      quantity: medicalSupply.quantity,
      unit: medicalSupply.unit,
      expiryDate: dayjs(medicalSupply.expiryDate),
      supplier: medicalSupply.supplier
    })
  }, [medicalSupply, form])

  const onFinish = async (values: any) => {
    try {
      const formattedValues = {
        ...values,
        expiryDate: values.expiryDate.format('YYYY-MM-DD')
      }
      await updateMedicalSupply(medicalSupply._id!, formattedValues)
      toast.success('Cập nhật vật tư y tế thành công')
      onSuccess()
    } catch (error) {
      toast.error('Không thể cập nhật vật tư y tế')
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
            Cập nhật
          </Button>
        </div>
      </Form.Item>
    </Form>
  )
}

export default UpdateMedicalSupplyForm
