import { Button, Form, Input, message } from 'antd'
import { categoryApi } from '../../../api/category.api'

interface CreateCategoryFormValues {
  name: string
  description?: string
}

// Định nghĩa props cho component CreateCategory
interface CreateCategoryProps {
  onCategoryCreated: () => void // Thêm prop onCategoryCreated
}

// Cập nhật function component để nhận props
function CreateCategory({ onCategoryCreated }: CreateCategoryProps) {
  const [form] = Form.useForm()

  const onFinish = async (values: CreateCategoryFormValues) => {
    try {
      await categoryApi.createCategoryApi(values)
      message.success('Tạo danh mục thành công!')
      form.resetFields()
      onCategoryCreated()
    } catch (error: unknown) {
      console.log('error', error)
      const err = error as { message?: string }
      if (err.message) {
        message.error(err.message)
      } else {
        message.error('Tạo danh mục thất bại.')
      }
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
