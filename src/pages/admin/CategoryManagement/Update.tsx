import React, { useEffect, useState } from 'react'
import { Form, Input, Button, message, Spin } from 'antd' // Import Spin
import { categoryApi } from '../../../api/category.api' // Xóa import Category không sử dụng
import { toast } from 'react-toastify'

interface EditCategoryFormValues {
  name: string
  description?: string
}

interface EditCategoryProps {
  categoryId: string | null // ID của category cần sửa
  onCategoryUpdated: () => void // Callback sau khi cập nhật thành công
}

function EditCategory({ categoryId, onCategoryUpdated }: EditCategoryProps) {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [fetchingCategory, setFetchingCategory] = useState(false)

  // Fetch dữ liệu category khi categoryId thay đổi và modal hiển thị
  useEffect(() => {
    const fetchCategory = async () => {
      if (categoryId) {
        setFetchingCategory(true)
        try {
          const response = await categoryApi.getByIdCategoryApi(categoryId)
          // LOG CHI TIẾT RESPONSE ĐỂ DEBUG CẤU TRÚC DỮ LIỆU
          console.log('Full getById response:', response);
          console.log('Data in getById response:', response.data);

          // Giả định cấu trúc data giống với API tìm kiếm (response.pageData.content[0])
          // Nếu API getById trả về trực tiếp đối tượng category ở response.data, dùng response.data
          if (response && response.data) {
            // Thử truy cập data trực tiếp nếu API getById trả về đối tượng ở response.data
            const categoryData = response.data;
            if (categoryData) {
              form.setFieldsValue({
                name: categoryData.name,
                description: categoryData.description,
              });
            } else {
              console.error('Category data is null or undefined in response.data', response);
              message.error('Dữ liệu danh mục không hợp lệ.');
            }
          } else {
            console.error('Invalid category fetch response:', response)
            message.error('Không thể tải dữ liệu danh mục để sửa.')
          }
        } catch (error) {
          console.error('Error fetching category for edit:', error)
          message.error('Lỗi khi tải dữ liệu danh mục để sửa.')
        } finally {
          setFetchingCategory(false)
        }
      } else {
        // Reset form khi không có categoryId (modal đóng)
        form.resetFields()
        setFetchingCategory(false)
      }
    }

    fetchCategory()
  }, [categoryId, form]) // Thêm form vào dependency để tránh warning

  const onFinish = async (values: EditCategoryFormValues) => {
    if (!categoryId) return // Không làm gì nếu không có categoryId

    setLoading(true)
    try {
      // Gọi API cập nhật category
      const response = await categoryApi.updateCategoryApi(categoryId, values)
      console.log('Update category response:', response)
      // KIỂM TRA RESPONSE TỪ API UPDATE CÓ THÀNH CÔNG KHÔNG
      if (response) { // Kiểm tra response có tồn tại (API call thành công ở mức transport) và có thể thêm kiểm tra status code cụ thể nếu cần
        toast.success('Cập nhật danh mục thành công!')
        onCategoryUpdated() // Gọi callback để List.tsx fetch lại dữ liệu
      } else {
        console.error('Update category API call failed or returned invalid response:', response);
        toast.error('Cập nhật danh mục thất bại: Phản hồi không hợp lệ từ server.');
      }
    } catch (error) {
      console.error('Error updating category:', error)
      // Axois error có thể có response.response để lấy thông tin lỗi từ server
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(`Cập nhật danh mục thất bại: ${error.response.data.message}`);
      } else {
        toast.error('Cập nhật danh mục thất bại: Lỗi không xác định.');
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1>Sửa Danh mục</h1>
      {fetchingCategory ? (
        <Spin tip='Đang tải dữ liệu...'>
          <div style={{ height: 150 }} />
        </Spin>
      ) : (
        <Form form={form} name='edit_category' onFinish={onFinish} layout='vertical'>
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
            <Button type='primary' htmlType='submit' loading={loading}>
              Lưu Thay Đổi
            </Button>
          </Form.Item>
        </Form>
      )}
    </div>
  )
}

export default EditCategory
