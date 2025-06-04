import React from 'react'
import { Form, Input, Button, message } from 'antd'
import { categoryApi } from '../../../api/category.api'
import { toast } from 'react-toastify'

interface CreateCategoryFormValues {
  name: string
  description?: string
}

// Định nghĩa props cho component CreateCategory
interface CreateCategoryProps {
  onCategoryCreated: () => void; // Thêm prop onCategoryCreated
}

// Cập nhật function component để nhận props
function CreateCategory({ onCategoryCreated }: CreateCategoryProps) {
  const [form] = Form.useForm()

  const onFinish = async (values: CreateCategoryFormValues) => {
    try {
      // Gọi API tạo category mới
      const response = await categoryApi.createCategoryApi(values)
      console.log('ok',response)
      toast.success('Tạo danh mục thành công!')
      form.resetFields() // Reset form sau khi tạo thành công
      onCategoryCreated(); // Gọi hàm callback sau khi tạo thành công
    } catch (error) {
      console.error('Error creating category:', error)
      message.error('Tạo danh mục thất bại.')
      // Xử lý lỗi cụ thể hơn nếu cần
    }
  }

  return (
    <div>
      <h1>Tạo Danh mục Mới</h1>
      <Form form={form} name='create_category' onFinish={onFinish} layout='vertical'>
        <Form.Item
          name='name'
          label='Tên Danh mục'
          rules={[{ required: true, message: 'Vui lòng nhập tên danh mục!' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item name='description' label='Mô tả'>
          <Input.TextArea />
        </Form.Item>
        <Form.Item>
          <Button type='primary' htmlType='submit'>
            Tạo
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}

export default CreateCategory
