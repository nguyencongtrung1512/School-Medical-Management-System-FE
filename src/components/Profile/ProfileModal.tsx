import type React from 'react'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { User, Mail, Phone, Calendar, Edit, Save, X, Upload, Loader2, Lock, KeyRound, Eye, EyeOff } from 'lucide-react'
import { getCurrentUserAPI, updateUserAPI, changePasswordAPI } from '../../api/user.api'
import type { Profile } from '../../api/user.api'
import axios from 'axios'
import cloudinaryConfig from '../../service/cloudinary' // Assuming this path is correct

import { Button } from '../../components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../components/ui/form'
import { Input } from '../../components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar'
import { Label } from '../../components/ui/label'
import { message } from 'antd' // Import message from antd

// Utility function for date formatting
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('vi-VN')
}

interface ProfileModalProps {
  isOpen: boolean
  onClose: () => void
  onUpdateSuccess?: () => void // Callback for when profile is updated
}

interface EditedProfile extends Partial<Profile> {
  imageFile?: File | null
}

const profileSchema = z.object({
  fullName: z.string().min(1, 'Họ và tên không được để trống'),
  phone: z.string().min(1, 'Số điện thoại không được để trống')
})

const passwordSchema = z
  .object({
    oldPassword: z.string().min(1, 'Mật khẩu cũ không được để trống'),
    newPassword: z
      .string()
      .min(8, 'Mật khẩu mới phải có ít nhất 8 ký tự')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).+$/,
        'Mật khẩu phải có ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt'
      ),
    confirmPassword: z.string().min(1, 'Xác nhận mật khẩu mới không được để trống')
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp!',
    path: ['confirmPassword']
  })

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, onUpdateSuccess }) => {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedProfile, setEditedProfile] = useState<EditedProfile | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [changePasswordLoading, setChangePasswordLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('personal-info')
  const [isUpdating, setIsUpdating] = useState(false)
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: '',
      phone: ''
    }
  })

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  })

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        const res = await getCurrentUserAPI()
        const profileData = res.data
        if (profileData) {
          setProfile(profileData)
          setEditedProfile(profileData)
          profileForm.reset({
            fullName: profileData.fullName,
            phone: profileData.phone
          })
        } else {
          setError('Không thể tải thông tin profile')
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
        setError('Có lỗi xảy ra khi tải thông tin profile.')
      } finally {
        setLoading(false)
      }
    }
    if (isOpen) {
      fetchProfile()
      setActiveTab('personal-info') // Reset to personal info tab on open
      setIsEditing(false) // Reset editing state when modal opens
    }
  }, [isOpen])

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsEditing(true)
  }

  const handleCancelEdit = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsEditing(false)
    if (profile) {
      setEditedProfile(profile)
      profileForm.reset({
        fullName: profile.fullName,
        phone: profile.phone
      })
    }
  }

  const handleUpdateProfile = async (values: z.infer<typeof profileSchema>) => {
    if (profile && !isUpdating) {
      try {
        setIsUpdating(true)
        let imageUrl = editedProfile?.image

        if (editedProfile?.imageFile) {
          setUploadingImage(true)
          const formData = new FormData()
          formData.append('file', editedProfile.imageFile)
          formData.append('upload_preset', cloudinaryConfig.uploadPreset)
          const response = await axios.post(
            `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`,
            formData
          )
          imageUrl = response.data.secure_url
          setUploadingImage(false)
        }

        const dataToUpdate: { fullName?: string; phone?: string; image?: string } = {
          fullName: values.fullName,
          phone: values.phone,
          image: imageUrl
        }

        await updateUserAPI(profile._id, dataToUpdate)
        setProfile((prev) => ({ ...prev!, ...dataToUpdate }))
        setIsEditing(false)
        message.success('Cập nhật thông tin thành công!')
        onUpdateSuccess?.()
      } catch (err) {
        console.error('Error updating profile:', err)
        setError('Có lỗi xảy ra khi cập nhật thông tin profile.')
        message.error('Có lỗi xảy ra khi cập nhật thông tin.')
      } finally {
        setIsUpdating(false)
      }
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setEditedProfile((prev) => ({ ...prev!, image: URL.createObjectURL(file), imageFile: file }))
    }
  }

  const handleChangePassword = async (values: z.infer<typeof passwordSchema>) => {
    setChangePasswordLoading(true)
    try {
      const res = await changePasswordAPI(values)
      if (res && res.data) {
        message.success('Đổi mật khẩu thành công!')
        passwordForm.reset()
        setActiveTab('personal-info') // Switch back to personal info after success
      } else {
        message.error('Đổi mật khẩu thất bại!')
      }
    } catch (error) {
      console.error('Error in handleChangePassword:', error)
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || 'Đã xảy ra lỗi khi đổi mật khẩu.'
        message.error(errorMessage)
      } else {
        message.error('Đã xảy ra lỗi khi đổi mật khẩu.')
      }
    } finally {
      setChangePasswordLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-[600px] p-0 overflow-hidden'>
        <DialogHeader className='p-6 pb-4 border-b'>
          <DialogTitle className='text-2xl font-bold text-gray-900'>Thông tin cá nhân</DialogTitle>
        </DialogHeader>
        <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
          <TabsList className='grid w-full grid-cols-2 rounded-none border-b bg-transparent p-0'>
            <TabsTrigger
              value='personal-info'
              className='relative rounded-none border-b-2 border-b-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none'
            >
              Thông tin cá nhân
            </TabsTrigger>
            <TabsTrigger
              value='change-password'
              className='relative rounded-none border-b-2 border-b-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none'
            >
              Đổi mật khẩu
            </TabsTrigger>
          </TabsList>
          <TabsContent value='personal-info' className='p-6 pt-4'>
            {loading ? (
              <div className='flex justify-center items-center h-48'>
                <Loader2 className='h-8 w-8 animate-spin text-blue-600' />
              </div>
            ) : error ? (
              <div className='text-red-500 text-center py-8'>{error}</div>
            ) : (
              profile && (
                <div>
                  <div className='flex flex-col items-center mb-6'>
                    <Avatar className='w-32 h-32 mb-4 ring-4 ring-blue-200'>
                      <AvatarImage src={editedProfile?.image || '/placeholder.svg'} alt='Avatar' />
                      <AvatarFallback className='bg-blue-500 text-white text-2xl'>
                        <User size={48} />
                      </AvatarFallback>
                    </Avatar>
                    {isEditing && (
                      <div className='relative'>
                        <Input
                          id='image-upload'
                          type='file'
                          accept='image/*'
                          className='absolute inset-0 opacity-0 cursor-pointer'
                          onChange={handleImageChange}
                        />
                        <Label
                          htmlFor='image-upload'
                          className='inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-md cursor-pointer hover:bg-blue-100 transition-colors'
                        >
                          <Upload className='w-4 h-4 mr-2' />
                          {uploadingImage ? 'Đang tải...' : 'Tải ảnh lên'}
                          {uploadingImage && <Loader2 className='ml-2 h-4 w-4 animate-spin' />}
                        </Label>
                      </div>
                    )}
                  </div>

                  <Form {...profileForm}>
                    <form onSubmit={profileForm.handleSubmit(handleUpdateProfile)} className='space-y-6'>
                      <div className='space-y-4'>
                        <div className='flex items-center gap-3 p-3 bg-gray-50 rounded-lg'>
                          <Mail className='w-5 h-5 text-blue-500' />
                          <Label className='font-semibold w-24 text-gray-700'>Email:</Label>
                          <span className='text-gray-900 flex-1'>{profile.email}</span>
                        </div>

                        <FormField
                          control={profileForm.control}
                          name='fullName'
                          render={({ field }) => (
                            <FormItem>
                              <div className='flex items-center gap-3 p-3 bg-gray-50 rounded-lg'>
                                <User className='w-5 h-5 text-blue-500' />
                                <FormLabel className='font-semibold w-24 text-gray-700'>Họ và tên:</FormLabel>
                                <FormControl>
                                  {isEditing ? (
                                    <Input {...field} className='flex-1' />
                                  ) : (
                                    <span className='text-gray-900 flex-1'>{field.value}</span>
                                  )}
                                </FormControl>
                              </div>
                              <FormMessage className='ml-[120px]' />
                            </FormItem>
                          )}
                        />

                        <div className='flex items-center gap-3 p-3 bg-gray-50 rounded-lg'>
                          <Calendar className='w-5 h-5 text-blue-500' />
                          <Label className='font-semibold w-24 text-gray-700'>Ngày tạo:</Label>
                          <span className='text-gray-900 flex-1'>{formatDate(profile.createdAt)}</span>
                        </div>

                        <FormField
                          control={profileForm.control}
                          name='phone'
                          render={({ field }) => (
                            <FormItem>
                              <div className='flex items-center gap-3 p-3 bg-gray-50 rounded-lg'>
                                <Phone className='w-5 h-5 text-blue-500' />
                                <FormLabel className='font-semibold w-24 text-gray-700'>Số điện thoại:</FormLabel>
                                <FormControl>
                                  {isEditing ? (
                                    <Input {...field} className='flex-1' />
                                  ) : (
                                    <span className='text-gray-900 flex-1'>{field.value}</span>
                                  )}
                                </FormControl>
                              </div>
                              <FormMessage className='ml-[120px]' />
                            </FormItem>
                          )}
                        />

                        <div className='flex items-center gap-3 p-3 bg-gray-50 rounded-lg'>
                          <User className='w-5 h-5 text-blue-500' />
                          <Label className='font-semibold w-24 text-gray-700'>Vai trò:</Label>
                          <span className='text-gray-900 flex-1'>{profile.role}</span>
                        </div>
                      </div>

                      <div className='flex justify-end pt-6 space-x-3'>
                        {!isEditing ? (
                          <Button
                            type='button'
                            onClick={handleEditClick}
                            className='flex items-center gap-2'
                            style={{ backgroundColor: '#06b6d4' }}
                          >
                            <Edit className='w-4 h-4' />
                            Chỉnh sửa
                          </Button>
                        ) : (
                          <>
                            <Button
                              type='submit'
                              className='flex items-center gap-2 bg-green-600 hover:bg-green-700'
                              disabled={isUpdating}
                            >
                              {isUpdating ? <Loader2 className='w-4 h-4 animate-spin' /> : <Save className='w-4 h-4' />}
                              Lưu
                            </Button>
                            <Button
                              type='button'
                              variant='outline'
                              onClick={handleCancelEdit}
                              className='flex items-center gap-2'
                              disabled={isUpdating}
                            >
                              <X className='w-4 h-4' />
                              Hủy
                            </Button>
                          </>
                        )}
                      </div>
                    </form>
                  </Form>
                </div>
              )
            )}
          </TabsContent>
          <TabsContent value='change-password' className='p-6 pt-4'>
            <Form {...passwordForm}>
              <form onSubmit={passwordForm.handleSubmit(handleChangePassword)} className='space-y-6'>
                <FormField
                  control={passwordForm.control}
                  name='oldPassword'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mật khẩu cũ</FormLabel>
                      <FormControl>
                        <div className='relative'>
                          <Lock className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
                          <Input
                            type={showOldPassword ? 'text' : 'password'}
                            placeholder='Nhập mật khẩu cũ'
                            className='pl-10 pr-10'
                            {...field}
                          />
                          <span
                            className='absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600'
                            onClick={() => setShowOldPassword((v) => !v)}
                          >
                            {showOldPassword ? <EyeOff className='w-4 h-4' /> : <Eye className='w-4 h-4' />}
                          </span>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={passwordForm.control}
                  name='newPassword'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mật khẩu mới</FormLabel>
                      <FormControl>
                        <div className='relative'>
                          <KeyRound className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
                          <Input
                            type={showNewPassword ? 'text' : 'password'}
                            placeholder='Nhập mật khẩu mới'
                            className='pl-10 pr-10'
                            {...field}
                          />
                          <span
                            className='absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600'
                            onClick={() => setShowNewPassword((v) => !v)}
                          >
                            {showNewPassword ? <EyeOff className='w-4 h-4' /> : <Eye className='w-4 h-4' />}
                          </span>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={passwordForm.control}
                  name='confirmPassword'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Xác nhận mật khẩu mới</FormLabel>
                      <FormControl>
                        <div className='relative'>
                          <KeyRound className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
                          <Input
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder='Xác nhận mật khẩu mới'
                            className='pl-10 pr-10'
                            {...field}
                          />
                          <span
                            className='absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600'
                            onClick={() => setShowConfirmPassword((v) => !v)}
                          >
                            {showConfirmPassword ? <EyeOff className='w-4 h-4' /> : <Eye className='w-4 h-4' />}
                          </span>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type='submit'
                  style={{ backgroundColor: '#06b6d4' }}
                  className='w-full'
                  disabled={changePasswordLoading}
                >
                  {changePasswordLoading ? (
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  ) : (
                    <Lock className='mr-2 h-4 w-4' />
                  )}
                  Đổi mật khẩu
                </Button>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

export default ProfileModal
