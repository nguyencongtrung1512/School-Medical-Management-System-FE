import { Button, DatePicker, Form, Input, InputNumber, message } from 'antd'
import dayjs from 'dayjs'
import React, { useEffect } from 'react'
import { updateMedicalSupply, MedicalSupply } from '../../../api/medicalSupplies.api'

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
      supplier: medicalSupply.supplier,
      manufacturer: medicalSupply.manufacturer,
      manufactureDate: dayjs(medicalSupply.manufactureDate)
    })
  }, [medicalSupply, form])

  const onFinish = async (values: MedicalSupply) => {
    try {
      const formattedValues: MedicalSupply = {
        ...values,
        expiryDate: (values.expiryDate as any).format('YYYY-MM-DD'),
        manufactureDate: (values.manufactureDate as any).format('YYYY-MM-DD')
      }
      await updateMedicalSupply(medicalSupply._id!, formattedValues)
      message.success('Cập nhật vật tư y tế thành công')
      onSuccess()
    } catch (error: unknown) {
      console.log('error', error)
      const err = error as { message?: string }
      if (err.message) {
        message.error(err.message)
      } else {
        message.error('Không thể cập nhật vật tư y tế')
      }
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

      <Form.Item
        name='quantity'
        label='Số lượng'
        rules={[
          { required: true, message: 'Vui lòng nhập số lượng!' },
          { type: 'number', min: 1, max: 999, message: 'Số lượng phải từ 1 đến 999!' }
        ]}
      >
        <InputNumber min={1} max={999} className='w-full' placeholder='Nhập số lượng' />
      </Form.Item>

      <Form.Item name='unit' label='Đơn vị' rules={[{ required: true, message: 'Vui lòng nhập đơn vị!' }]}>
        <Input placeholder='Nhập đơn vị' />
      </Form.Item>

      <Form.Item
        name='expiryDate'
        label='Ngày hết hạn'
        rules={[
          { required: true, message: 'Vui lòng chọn ngày hết hạn!' },
          {
            validator(_, value) {
              if (!value) return Promise.reject('Vui lòng chọn ngày hết hạn!')
              const now = new Date()
              const minDate = new Date(now.getFullYear(), now.getMonth() + 6, now.getDate())
              const maxDate = new Date(now.getFullYear() + 11, now.getMonth(), now.getDate())
              if (value.toDate() < minDate) return Promise.reject('Ngày hết hạn phải ít nhất 6 tháng kể từ hôm nay!')
              if (value.toDate() > maxDate) return Promise.reject('Ngày hết hạn không được quá 11 năm kể từ hôm nay!')
              return Promise.resolve()
            }
          }
        ]}
      >
        <DatePicker className='w-full' format='DD/MM/YYYY' />
      </Form.Item>

      <Form.Item
        name='supplier'
        label='Nhà cung cấp'
        rules={[{ required: true, message: 'Vui lòng nhập nhà cung cấp!' }]}
      >
        <Input placeholder='Nhập nhà cung cấp' />
      </Form.Item>

      <Form.Item
        name='manufacturer'
        label='Hãng sản xuất'
        rules={[{ required: true, message: 'Vui lòng nhập hãng sản xuất!' }]}
      >
        <Input placeholder='Nhập hãng sản xuất' />
      </Form.Item>

      <Form.Item
        name='manufactureDate'
        label='Ngày sản xuất'
        rules={[{ required: true, message: 'Vui lòng chọn ngày sản xuất!' }]}
      >
        <DatePicker className='w-full' format='DD/MM/YYYY' />
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
