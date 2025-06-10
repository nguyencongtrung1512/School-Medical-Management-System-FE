import React from 'react'
import { Modal, Form, Input, Select, DatePicker, Spin } from 'antd'
import { useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { createStudentAPI } from '../../../api/student.api'
import { searchUsersAPI } from '../../../api/user.api'
import dayjs from 'dayjs'
import { CalendarOutlined } from '@ant-design/icons'

interface CreateClassProps {
  isModalVisible: boolean
  onCancel: () => void
  onOk: () => void
}
const CreateClass: React.FC<CreateClassProps> = ({ isModalVisible, onCancel, onOk }) => {
  const [form] = Form.useForm()
  const { classId } = useParams<{ classId: string }>()
  const [parents, setParents] = React.useState<{ _id: string; fullName: string }[]>([])
  const [loadingParents, setLoadingParents] = React.useState(false)

  const maxDate = dayjs().subtract(6, 'year')
  const minDate = dayjs().subtract(50, 'year')

  const fetchParents = async (searchText = '') => {
    setLoadingParents(true)
    try {
      const res = await searchUsersAPI(1, 10, searchText, 'parent')
      setParents(res.data.pageData || [])
    } catch (err) {
      console.error('Error fetching parents:', err)
      setParents([])
    }
    setLoadingParents(false)
  }

  // Fetch phụ huynh mặc định khi mở modal
  React.useEffect(() => {
    if (isModalVisible) fetchParents()
  }, [isModalVisible])

  const handleOk = async () => {
    try {
      const values = await form.validateFields()

      if (!classId) {
        toast.error('Không tìm thấy ID lớp')
        return
      }

      const data = {
        fullName: values.fullName,
        gender: values.gender,
        dob: values.dob,
        parentId: values.parentId,
        classId: classId
      }

      await createStudentAPI(data)
      toast.success('Tạo học sinh thành công')
      form.resetFields()
      onOk()
    } catch (error) {
      console.error('Error creating class:', error)
      toast.error('Không thể tạo học sinh mới')
    }
  }

  return (
    <Modal
      title='Thêm học sinh mới'
      open={isModalVisible}
      onOk={handleOk}
      onCancel={() => {
        form.resetFields()
        onCancel()
      }}
      width={600}
    >
      <Form form={form} layout='vertical'>
        <Form.Item
          name='fullName'
          label='Tên học sinh'
          rules={[
            { required: true, message: 'Vui lòng nhập tên học sinh!' },
            { min: 2, message: 'Tên học sinh phải có ít nhất 2 ký tự!' },
            { max: 50, message: 'Tên học sinh không được vượt quá 50 ký tự!' }
          ]}
        >
          <Input placeholder='Nhập tên học sinh' />
        </Form.Item>
        <Form.Item name='gender' label='Giới tính' rules={[{ required: true, message: 'Vui lòng chọn giới tính!' }]}>
          <Select placeholder='Chọn giới tính'>
            <Select.Option value='male'>Nam</Select.Option>
            <Select.Option value='female'>Nữ</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item
          name='dob'
          label='Ngày sinh'
          rules={[
            { required: true, message: 'Vui lòng chọn ngày sinh!' },
            {
              validator: (_, value) => {
                if (value && value.isAfter(maxDate)) {
                  return Promise.reject('Học sinh phải từ 6 tuổi trở lên!')
                }
                if (value && value.isBefore(minDate)) {
                  return Promise.reject('Ngày sinh không hợp lệ!')
                }
                return Promise.resolve()
              }
            }
          ]}
        >
          <DatePicker
            style={{ width: '100%' }}
            disabledDate={(current) => {
              return current && (current > maxDate || current < minDate)
            }}
            suffixIcon={<CalendarOutlined />}
          />
        </Form.Item>
        <Form.Item name='parentId' label='Phụ huynh' rules={[{ required: true, message: 'Vui lòng chọn phụ huynh!' }]}>
          <Select
            showSearch
            placeholder='Chọn phụ huynh'
            onSearch={fetchParents}
            filterOption={false}
            loading={loadingParents}
            allowClear
            notFoundContent={loadingParents ? <Spin size='small' /> : null}
          >
            {parents.map((parent) => (
              <Select.Option key={parent._id} value={parent._id} label={parent.fullName}>
                {parent.fullName}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default CreateClass
