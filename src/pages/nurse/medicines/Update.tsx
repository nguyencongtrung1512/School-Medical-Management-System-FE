import { Button, Form, Input, message, InputNumber, DatePicker } from 'antd'
import React, { useEffect } from 'react'
import type { Medicine } from '../../../api/medicines.api'
import { updateMedicine } from '../../../api/medicines.api'
import dayjs from 'dayjs'

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
      sideEffects: medicine.sideEffects,
      manufacturer: medicine.manufacturer,
      manufactureDate: dayjs(medicine.manufactureDate),
      expiryDate: dayjs(medicine.expiryDate),
    })
  }, [medicine, form])

  const onFinish = async (values: { name?: string; description?: string; dosage?: string; sideEffects?: string; manufacturer?: string; manufactureDate?: dayjs.Dayjs; expiryDate?: dayjs.Dayjs }) => {
    try {
      const payload = {
        ...values,
        manufactureDate: values.manufactureDate?.toDate(),
        expiryDate: values.expiryDate?.toDate(),
      }
      await updateMedicine(medicine._id, payload)
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
      <Form.Item name='unit' label='Dạng thuốc' rules={[{ required: true, message: 'Vui lòng nhập dạng thuốc!' }]}>
        <Input placeholder='Nhập dạng thuốc' />
      </Form.Item>

      <Form.Item name='manufacturer' label='Hãng sản xuất' rules={[{ required: true, message: 'Vui lòng nhập hãng sản xuất!' }]}>
        <Input placeholder='Nhập hãng sản xuất' />
      </Form.Item>

      <Form.Item
        name='manufactureDate'
        label='Ngày sản xuất'
        rules={[
          { required: true, message: 'Vui lòng chọn ngày sản xuất!' },
          {
            validator(_, value) {
              if (!value) return Promise.reject('Vui lòng chọn ngày sản xuất!')
              const today = dayjs().startOf('day')
              if (!value.isBefore(today, 'day')) {
                return Promise.reject('Ngày sản xuất phải nhỏ hơn ngày hiện tại!')
              }
              return Promise.resolve()
            }
          }
        ]}
      >
        <DatePicker
          className='w-full'
          format='DD/MM/YYYY'
          disabledDate={current => {
            // Disable today and future dates
            return current && current >= dayjs().startOf('day')
          }}
        />
      </Form.Item>

      <Form.Item name='sideEffects' label='Tác dụng phụ'>
        <Input.TextArea rows={4} placeholder='Nhập tác dụng phụ (nếu có)' />
      </Form.Item>

      <Form.Item
        name='expiryDate'
        label='Ngày hết hạn'
        rules={[
          { required: true, message: 'Vui lòng chọn ngày hết hạn!' },
          {
            validator(_, value) {
              if (!value) return Promise.reject('Vui lòng chọn ngày hết hạn!')
              const now = dayjs().startOf('day')
              const minDate = now.add(6, 'month')
              const maxDate = now.add(6, 'year')
              if (value.isBefore(minDate, 'day')) return Promise.reject('Ngày hết hạn phải ít nhất 6 tháng kể từ hôm nay!')
              if (value.isAfter(maxDate, 'day')) return Promise.reject('Ngày hết hạn không được quá 6 năm kể từ hôm nay!')
              return Promise.resolve()
            }
          }
        ]}
      >
        <DatePicker
          className='w-full'
          format='DD/MM/YYYY'
          disabledDate={current => {
            // Disable past dates and dates less than 6 months from today
            const now = dayjs().startOf('day')
            const minDate = now.add(6, 'month')
            return current && current < minDate
          }}
        />
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
