import React, { useEffect } from 'react'
import { Form, Input, Button } from 'antd'
import { updateMedicine } from '../../../api/medicines.api'
import type { Medicine } from '../../../api/medicines.api'
import { toast } from 'react-toastify'

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
      toast.success('Cập nhật thuốc thành công')
      onSuccess()
    } catch (error) {
      toast.error('Không thể cập nhật thuốc')
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
