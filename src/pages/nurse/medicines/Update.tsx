import { Button, Form, Input, message, InputNumber, DatePicker } from 'antd'
import React, { useEffect } from 'react'
import type { Medicine } from '../../../api/medicines.api'
import { updateMedicine } from '../../../api/medicines.api'

interface UpdateMedicineFormProps {
  medicine: Medicine
  onSuccess: () => void
  onCancel: () => void
}

const UpdateMedicineForm: React.FC<UpdateMedicineFormProps> = ({ medicine, onSuccess, onCancel }) => {
  const [form] = Form.useForm()

  useEffect(() => {
    form.setFieldsValue({
      name: medicine.name,
      description: medicine.description,
      dosage: medicine.dosage,
      sideEffects: medicine.sideEffects
    })
  }, [medicine, form])

  const onFinish = async (values: { name?: string; description?: string; dosage?: string; sideEffects?: string }) => {
    try {
      await updateMedicine(medicine._id, values)
      message.success('Cập nhật thuốc thành công')
      onSuccess()
    } catch (error: unknown) {
      console.log('error', error)
      const err = error as { message?: string }
      if (err.message) {
        message.error(err.message)
      } else {
        message.error('Không thể cập nhật thuốc')
      }
    }
  }

  return (
    <Form form={form} layout='vertical' onFinish={onFinish} className='bg-white p-6 rounded-lg'>
      <Form.Item name='name' label='Tên thuốc' rules={[{ required: true, message: 'Vui lòng nhập tên thuốc!' }]}>
        <Input placeholder='Nhập tên thuốc' />
      </Form.Item>

      <Form.Item name='description' label='Mô tả' rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}>
        <Input.TextArea rows={4} placeholder='Nhập mô tả' />
      </Form.Item>

      <Form.Item name='dosage' label='Liều lượng' rules={[{ required: true, message: 'Vui lòng nhập liều lượng!' }]}>
        <Input placeholder='Nhập liều lượng' />
      </Form.Item>

      <Form.Item name='sideEffects' label='Tác dụng phụ'>
        <Input.TextArea rows={4} placeholder='Nhập tác dụng phụ (nếu có)' />
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
              const maxDate = new Date(now.getFullYear() + 6, now.getMonth(), now.getDate())
              if (value.toDate() < minDate) return Promise.reject('Ngày hết hạn phải ít nhất 6 tháng kể từ hôm nay!')
              if (value.toDate() > maxDate) return Promise.reject('Ngày hết hạn không được quá 6 năm kể từ hôm nay!')
              return Promise.resolve()
            }
          }
        ]}
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

export default UpdateMedicineForm
