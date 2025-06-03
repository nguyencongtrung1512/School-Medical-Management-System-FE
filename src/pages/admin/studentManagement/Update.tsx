import React, { useEffect } from 'react'
import { Modal, Form, Input, Select, DatePicker, Spin } from 'antd'
import { useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { updateStudentAPI } from '../../../api/student.api'
import { searchUsersAPI } from '../../../api/user.api'

interface UpdateStudentProps {
  isModalVisible: boolean
  onCancel: () => void
  onOk: () => void
  editingStudent: {
    _id: string
    fullName: string
    gender: 'male' | 'female' | 'other'
    dob: string
    parentId?: string
    avatar?: string
  } | null
}

const UpdateStudent: React.FC<UpdateStudentProps> = ({ isModalVisible, onCancel, onOk, editingStudent }) => {
  const [form] = Form.useForm()
  const [parents, setParents] = React.useState<{ _id: string; fullName: string }[]>([])
  const [loadingParents, setLoadingParents] = React.useState(false)

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

  useEffect(() => {
    if (isModalVisible) fetchParents()
  }, [isModalVisible])

  useEffect(() => {
    if (editingStudent) {
      form.setFieldsValue({
        ...editingStudent,
        dob: editingStudent.dob ? editingStudent.dob : null
      })
    }
  }, [editingStudent, form])

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      if (!editingStudent) return
      const data = {
        fullName: values.fullName,
        gender: values.gender,
        dob: values.dob,
        parentId: values.parentId,
        avatar: values.avatar
      }
      await updateStudentAPI(editingStudent._id, data)
      toast.success('Cập nhật học sinh thành công')
      form.resetFields()
      onOk()
    } catch (error) {
      console.error('Error updating student:', error)
      toast.error('Không thể cập nhật học sinh')
    }
  }

  return (
    <Modal
      title='Cập nhật học sinh'
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
          rules={[{ required: true, message: 'Vui lòng nhập tên học sinh!' }]}
        >
          <Input placeholder='Nhập tên học sinh' />
        </Form.Item>
        <Form.Item name='gender' label='Giới tính' rules={[{ required: true, message: 'Vui lòng chọn giới tính!' }]}>
          <Select placeholder='Chọn giới tính'>
            <Select.Option value='male'>Nam</Select.Option>
            <Select.Option value='female'>Nữ</Select.Option>
            <Select.Option value='other'>Khác</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item name='dob' label='Ngày sinh' rules={[{ required: true, message: 'Vui lòng chọn ngày sinh!' }]}>
          <DatePicker />
        </Form.Item>
        <Form.Item name='parentId' label='Phụ huynh'>
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
        <Form.Item name='avatar' label='Ảnh đại diện'>
          <Input placeholder='Nhập link ảnh đại diện' />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default UpdateStudent
