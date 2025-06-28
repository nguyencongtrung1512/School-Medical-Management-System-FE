import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { User, Mail, Phone, Calendar, Edit, UserPlus, Lock } from 'lucide-react'
import { getCurrentUserAPI, linkStudentAPI } from '../../../api/user.api'
import type { Profile } from '../../../api/user.api'
import { toast } from 'react-toastify'
import { getStudentByIdAPI } from '../../../api/student.api'
import type { AxiosResponse } from 'axios'
import type { StudentProfile } from '../../../api/student.api'
import UpdateProfileModal from './updateProfile'
import ChangePasswordForm from './changePassWordForm'
import Loading from '../../../components/Loading/Loading'

import { Button } from '../../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../../components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../../components/ui/form'
import { Input } from '../../../components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar'
import { Badge } from '../../../components/ui/badge'

const ProfileParent = () => {
  const [userProfile, setUserProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false)
  const [isChangePasswordVisible, setIsChangePasswordVisible] = useState(false)
  const [linkedChildren, setLinkedChildren] = useState<
    {
      fullName: string
      studentCode: string
    }[]
  >([])

  const form = useForm({
    defaultValues: {
      studentCode: ''
    }
  })

  const fetchUserProfile = async () => {
    try {
      setLoading(true)
      const response = await getCurrentUserAPI()
      console.log('Current user profile API response:', response)
      setUserProfile(response.data)

      if (response.data.studentIds && response.data.studentIds.length > 0) {
        const studentIdsToFetch = response.data.studentIds
        const studentsPromises = studentIdsToFetch.map((id: string) => getStudentByIdAPI(id))
        const studentsResponses = await Promise.all(studentsPromises)
        const fetchedStudents = studentsResponses.map((res: AxiosResponse<StudentProfile>) => res.data)
        setLinkedChildren(fetchedStudents)
      } else {
        setLinkedChildren([]) // Reset if no studentIds or empty
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
      toast.error('Không thể tải hồ sơ người dùng.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUserProfile()
  }, [])

  const handleCancel = () => {
    setIsModalVisible(false)
    form.reset()
  }

  const showUpdateModal = () => {
    setIsUpdateModalVisible(true)
  }

  const handleUpdateModalClose = () => {
    setIsUpdateModalVisible(false)
  }

  const handleProfileUpdated = () => {
    fetchUserProfile()
  }

  const handleLinkStudent = async (values: { studentCode: string }) => {
    try {
      setLoading(true)
      const apiResponse = await linkStudentAPI({
        studentParents: [{ studentCode: values.studentCode, type: 'father' }]
      })

      if (apiResponse.success && apiResponse.data.length > 0) {
        setLinkedChildren((prev) => [
          ...prev,
          ...apiResponse.data.map(
            (item: { fullName: string; studentCode: string; type: 'father' | 'mother' | 'guardian' }) => ({
              fullName: item.fullName,
              studentCode: item.studentCode
            })
          )
        ])
        toast.success('Liên kết học sinh thành công!')
        handleCancel()
        fetchUserProfile() // Gọi lại hàm fetchUserProfile để cập nhật dữ liệu mới nhất
      } else {
        toast.error(apiResponse.message || 'Liên kết học sinh thất bại. Vui lòng kiểm tra mã học sinh.')
      }
    } catch (error) {
      console.error('Error linking student:', error)
      toast.error('Đã xảy ra lỗi khi liên kết học sinh.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div>
        <Loading />
      </div>
    )
  }

  if (!userProfile) {
    return <div className='flex justify-center items-center h-screen'>Không tìm thấy hồ sơ.</div>
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-8'>
      <div className='max-w-7xl mx-auto'>
        <h1 className='text-3xl font-bold text-gray-900 mb-8'>Hồ sơ của tôi</h1>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* Profile Card */}
          <div className='lg:col-span-1'>
            <Card className='shadow-lg border-0 bg-white/80 backdrop-blur-sm'>
              <CardContent className='p-8'>
                <div className='flex flex-col items-center text-center'>
                  <Avatar className='w-28 h-28 mb-4 ring-4 ring-blue-100'>
                    <AvatarImage src={userProfile.image || '/placeholder.svg'} alt='Avatar' />
                    <AvatarFallback className='bg-blue-500 text-white text-2xl'>
                      <User size={48} />
                    </AvatarFallback>
                  </Avatar>

                  <h2 className='text-2xl font-bold text-gray-900 mb-2'>{userProfile.fullName}</h2>
                  <Badge variant='secondary' className='mb-6 bg-blue-100 text-blue-800'>
                    Phụ huynh
                  </Badge>

                  <div className='w-full space-y-4'>
                    <div className='flex items-center gap-3 text-gray-600 p-3 bg-gray-50 rounded-lg'>
                      <Mail className='w-5 h-5 text-blue-500' />
                      <span className='text-sm'>{userProfile.email}</span>
                    </div>
                    <div className='flex items-center gap-3 text-gray-600 p-3 bg-gray-50 rounded-lg'>
                      <Phone className='w-5 h-5 text-green-500' />
                      <span className='text-sm'>{userProfile.phone}</span>
                    </div>
                    <div className='flex items-center gap-3 text-gray-600 p-3 bg-gray-50 rounded-lg'>
                      <Calendar className='w-5 h-5 text-purple-500' />
                      <span className='text-sm'>
                        Tham gia: {new Date(userProfile.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className='lg:col-span-2 space-y-6'>
            {/* Action Buttons */}
            <Card className='shadow-lg border-0 bg-white/80 backdrop-blur-sm'>
              <CardContent className='p-6'>
                <div className='flex flex-wrap gap-3 justify-end'>
                  <Button
                    variant='outline'
                    onClick={() => setIsChangePasswordVisible(true)}
                    className='flex items-center gap-2'
                  >
                    <Lock className='w-4 h-4' />
                    Đổi mật khẩu
                  </Button>
                  <Button onClick={showUpdateModal} className='flex items-center gap-2'>
                    <Edit className='w-4 h-4' />
                    Chỉnh sửa hồ sơ
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Children List */}
            <Card className='shadow-lg border-0 bg-white/80 backdrop-blur-sm'>
              <CardHeader className='pb-4'>
                <div className='flex justify-between items-center'>
                  <CardTitle className='text-xl font-semibold text-gray-900'>Danh sách con</CardTitle>
                  <Dialog open={isModalVisible} onOpenChange={setIsModalVisible}>
                    <DialogTrigger asChild>
                      <Button className='flex items-center gap-2 bg-blue-600 hover:bg-blue-700'>
                        <UserPlus className='w-4 h-4' />
                        Thêm con
                      </Button>
                    </DialogTrigger>
                    <DialogContent className='sm:max-w-md'>
                      <DialogHeader>
                        <DialogTitle>Liên kết học sinh</DialogTitle>
                      </DialogHeader>
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleLinkStudent)} className='space-y-4'>
                          <FormField
                            control={form.control}
                            name='studentCode'
                            rules={{ required: 'Vui lòng nhập mã học sinh!' }}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Mã học sinh</FormLabel>
                                <FormControl>
                                  <Input placeholder='Nhập mã học sinh' {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div className='flex gap-3 pt-4'>
                            <Button
                              type='button'
                              variant='outline'
                              onClick={handleCancel}
                              className='flex-1 bg-transparent'
                            >
                              Hủy
                            </Button>
                            <Button type='submit' className='flex-1 bg-blue-600 hover:bg-blue-700'>
                              Liên kết
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {linkedChildren.length > 0 ? (
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    {linkedChildren.map((child, idx) => (
                      <Card key={idx} className='border border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50'>
                        <CardContent className='p-4'>
                          <div className='flex items-center gap-4'>
                            <Avatar className='w-12 h-12'>
                              <AvatarFallback className='bg-blue-500 text-white'>
                                <User className='w-6 h-6' />
                              </AvatarFallback>
                            </Avatar>
                            <div className='flex-1'>
                              <h3 className='font-semibold text-gray-900'>{child.fullName}</h3>
                              <p className='text-sm text-gray-600'>Mã HS: {child.studentCode}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className='text-center py-12'>
                    <User className='w-16 h-16 text-gray-300 mx-auto mb-4' />
                    <p className='text-gray-500 text-lg'>Chưa có con nào được liên kết</p>
                    <p className='text-gray-400 text-sm mt-2'>Nhấn "Thêm con" để liên kết học sinh</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Modals */}
        <ChangePasswordForm visible={isChangePasswordVisible} onClose={() => setIsChangePasswordVisible(false)} />
        {userProfile && (
          <UpdateProfileModal
            visible={isUpdateModalVisible}
            onClose={handleUpdateModalClose}
            userProfile={userProfile}
            onUpdateSuccess={handleProfileUpdated}
          />
        )}
      </div>
    </div>
  )
}

export default ProfileParent
