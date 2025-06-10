import { useEffect, useState } from 'react'
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
  EditOutlined,
  UserAddOutlined
} from '@ant-design/icons'
import { getCurrentUserAPI, linkStudentAPI } from '../../../api/user.api'
import { Profile } from '../../../api/user.api'
import { toast } from 'react-toastify'
import { Modal, Form, Input } from 'antd'
import { getStudentByIdAPI } from '../../../api/student.api'
import { AxiosResponse } from 'axios'
import { StudentProfile } from '../../../api/student.api'

const ProfileParent = () => {
  const [userProfile, setUserProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [form] = Form.useForm()
  const [linkedChildren, setLinkedChildren] = useState<
    {
      fullName: string
      studentCode: string
    }[]
  >([])

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true)
        const response = await getCurrentUserAPI()
        console.log('User Profile:', response.data)
        setUserProfile(response.data)

        if (response.data.studentIds) {
          const studentIds = Array.isArray(response.data.studentIds)
            ? response.data.studentIds
            : (response.data.studentIds as string)
              .split(',')
              .map((id: string) => id.trim())
              .filter(Boolean)

          if (studentIds.length > 0) {
            const studentsPromises = studentIds.map((id: string) => getStudentByIdAPI(id))
            const studentsResponses = await Promise.all(studentsPromises)
            const fetchedStudents = studentsResponses.map((res: AxiosResponse<StudentProfile>) => res.data)
            setLinkedChildren(fetchedStudents)
          }
        }
      } catch (error) {
        console.error('Error fetching user profile:', error)
        toast.error('Không thể tải hồ sơ người dùng.')
      } finally {
        setLoading(false)
      }
    }

    fetchUserProfile()
  }, [])

  const showModal = () => {
    setIsModalVisible(true)
  }

  const handleCancel = () => {
    setIsModalVisible(false)
    form.resetFields()
  }

  const handleLinkStudent = async (values: { studentCode: string }) => {
    try {
      const response = await linkStudentAPI({ studentCodes: [values.studentCode] })
      if (response.success && response.data.length > 0) {
        setLinkedChildren((prev) => [...prev, ...response.data])
        toast.success('Liên kết học sinh thành công!')
        handleCancel()
      } else {
        toast.error(response.message || 'Liên kết học sinh thất bại. Vui lòng kiểm tra mã học sinh.')
      }
    } catch (error) {
      console.error('Error linking student:', error)
      toast.error('Đã xảy ra lỗi khi liên kết học sinh.')
    }
  }

  if (loading) {
    return <div className='flex justify-center items-center h-screen'>Đang tải...</div>
  }

  if (!userProfile) {
    return <div className='flex justify-center items-center h-screen'>Không tìm thấy hồ sơ.</div>
  }

  return (
    <div className='min-h-screen bg-gray-50 py-8 px-8'>
      <h1 className='text-2xl font-bold mb-6'>Hồ sơ của tôi</h1>
      <div className='flex gap-8'>
        {/* Thông tin phụ huynh bên trái */}
        <div className='bg-white rounded-2xl shadow p-8 w-[350px] flex flex-col items-center'>
          <div className='w-28 h-28 rounded-full bg-gray-200 flex items-center justify-center mb-2 text-gray-400 text-2xl relative'>
            <UserOutlined style={{ fontSize: 48 }} />
          </div>
          <div className='text-xl font-bold mt-2'>{userProfile.fullName}</div>
          <div className='text-gray-500 mb-4'>Phụ huynh</div>
          <div className='w-full space-y-3 text-gray-700'>
            <div className='flex items-center gap-2'>
              <MailOutlined /> {userProfile.email}
            </div>
            <div className='flex items-center gap-2'>
              <PhoneOutlined /> {userProfile.phone}
            </div>
            <div className='flex items-center gap-2'>
              <CalendarOutlined /> Tham gia: {new Date(userProfile.createdAt).toLocaleDateString('vi-VN')}
            </div>
          </div>
        </div>
        <div className='flex-1 flex flex-col gap-6'>
          {/* Tabs và nút chỉnh sửa */}
          <div className='flex justify-between items-center'>
            <div className='space-x-2'>
              <button className='px-4 py-2 bg-gray-100 rounded-full font-medium'>Con của tôi</button>
            </div>
            <button className='flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50'>
              <EditOutlined /> Chỉnh sửa hồ sơ
            </button>
          </div>

          {/* Danh sách con */}
          <div className='bg-white rounded-2xl shadow p-6'>
            <div className='flex justify-between items-center mb-4'>
              <div className='text-lg font-semibold'>Danh sách con</div>
              <button
                className='flex items-center gap-2 bg-blue-500 hover:bg-green-400 text-white px-4 py-2 rounded-lg font-medium shadow-md transition-all duration-200 ease-in-out transform hover:scale-105'
                onClick={showModal}
              >
                <UserAddOutlined /> Thêm con
              </button>
            </div>
            <div className='flex gap-4 flex-wrap'>
              {linkedChildren.length > 0 ? (
                linkedChildren.map((child, idx) => (
                  <div key={idx} className='flex items-center gap-4 bg-gray-50 rounded-xl p-4 flex-1 min-w-[220px]'>
                    <div>
                      <div className='font-semibold text-gray-800'>{child.fullName}</div>
                      <div className='flex items-center gap-1 text-gray-500 text-xl mt-1'>
                        Mã HS: {child.studentCode}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className='text-gray-500 text-center w-full py-4'>Chưa có con nào được liên kết.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <Modal title='Liên kết học sinh' open={isModalVisible} onCancel={handleCancel} footer={null}>
        <Form form={form} onFinish={handleLinkStudent} layout='vertical'>
          <Form.Item
            name='studentCode'
            label='Mã học sinh'
            rules={[{ required: true, message: 'Vui lòng nhập mã học sinh!' }]}
          >
            <Input placeholder='Nhập mã học sinh' size='large' />
          </Form.Item>
          <Form.Item>
            <button
              type='submit'
              className='w-full bg-blue-500 hover:bg-green-400 text-white py-2 rounded-lg font-medium shadow-md transition-all duration-200 ease-in-out transform hover:scale-105'
            >
              Liên kết
            </button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default ProfileParent
