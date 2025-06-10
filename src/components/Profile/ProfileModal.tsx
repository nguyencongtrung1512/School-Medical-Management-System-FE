import { Modal, Spin, message } from 'antd'
import { useEffect, useState } from 'react'
import { getCurrentUserAPI, updateUserAPI } from '../../api/user.api'
import { formatDate } from '../../utils/utils'
import axios from 'axios'
import cloudinaryConfig from '../../service/cloudinary'

interface Profile {
  _id: string
  email: string
  fullName: string
  phone: string
  role: string
  isDeleted: boolean
  createdAt: string
  updatedAt: string
  __v: number
  image: string
}

interface ProfileModalProps {
  isOpen: boolean
  onClose: () => void
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedProfile, setEditedProfile] = useState<Partial<Profile> | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getCurrentUserAPI()
        const profileData = res.data
        if (profileData) {
          setProfile(profileData)
          setEditedProfile(profileData)
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
    }
  }, [isOpen])

  const handleUpdateProfile = async () => {
    if (editedProfile && profile) {
      try {
        const dataToUpdate: { fullName?: string; phone?: string; image?: string } = {
          fullName: editedProfile.fullName,
          phone: editedProfile.phone,
          image: editedProfile.image
        }
        await updateUserAPI(profile._id, dataToUpdate)
        setProfile((prev) => ({ ...prev!, ...editedProfile }))
        setIsEditing(false)
        message.success('Cập nhật thông tin thành công!')
      } catch (err) {
        console.error('Error updating profile:', err)
        setError('Có lỗi xảy ra khi cập nhật thông tin profile.')
        message.error('Có lỗi xảy ra khi cập nhật thông tin.')
      }
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingImage(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', cloudinaryConfig.uploadPreset)

    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`,
        formData
      )
      setEditedProfile((prev) => ({ ...prev!, image: response.data.secure_url }))
      message.success('Tải ảnh lên thành công!')
    } catch (err) {
      console.error('Error uploading image:', err)
      message.error('Có lỗi xảy ra khi tải ảnh lên.')
    } finally {
      setUploadingImage(false)
    }
  }

  return (
    <Modal title='Thông tin cá nhân' open={isOpen} onCancel={onClose} footer={null} width={600} className='p-6'>
      {loading ? (
        <Spin>loading...</Spin>
      ) : error ? (
        <div className='text-red-500 text-center'>{error}</div>
      ) : (
        profile && (
          <div className='space-y-4 p-4 bg-white rounded-lg shadow-md'>
            <div className='flex justify-center mb-6'>
              <img
                src={editedProfile?.image || 'https://via.placeholder.com/150'}
                alt='Avatar'
                className='w-36 h-36 rounded-full object-cover border-4 border-blue-300 shadow-lg'
              />
            </div>
            {isEditing && (
              <div className='flex items-center py-3 border-b border-gray-200'>
                <span className='font-semibold w-32 text-gray-700'>Tải ảnh lên:</span>
                <input
                  type='file'
                  accept='image/*'
                  className='flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ease-in-out'
                  onChange={handleImageUpload}
                />
                {uploadingImage && <Spin size='small' className='ml-2' />}
              </div>
            )}
            <div className='flex items-center py-3 border-b border-gray-200'>
              <span className='font-semibold w-32 text-gray-700'>Email:</span>
              <span className='text-gray-900'>{profile.email}</span>
            </div>
            <div className='flex items-center py-3 border-b border-gray-200'>
              <span className='font-semibold w-32 text-gray-700'>Họ và tên:</span>
              {isEditing ? (
                <input
                  type='text'
                  className='flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ease-in-out'
                  value={editedProfile?.fullName || ''}
                  onChange={(e) => setEditedProfile({ ...editedProfile, fullName: e.target.value })}
                />
              ) : (
                <span className='text-gray-900'>{profile.fullName}</span>
              )}
            </div>
            <div className='flex items-center py-3 border-b border-gray-200'>
              <span className='font-semibold w-32 text-gray-700'>Ngày tạo:</span>
              <span className='text-gray-900'>{formatDate(profile.createdAt)}</span>
            </div>
            <div className='flex items-center py-3 border-b border-gray-200'>
              <span className='font-semibold w-32 text-gray-700'>Số điện thoại:</span>
              {isEditing ? (
                <input
                  type='text'
                  className='flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ease-in-out'
                  value={editedProfile?.phone || ''}
                  onChange={(e) => setEditedProfile({ ...editedProfile, phone: e.target.value })}
                />
              ) : (
                <span className='text-gray-900'>{profile.phone}</span>
              )}
            </div>
            <div className='flex items-center py-3'>
              <span className='font-semibold w-32 text-gray-700'>Vai trò:</span>
              <span className='text-gray-900'>{profile.role}</span>
            </div>
            <div className='flex justify-end pt-6 space-x-3'>
              {!isEditing ? (
                <button
                  className='px-6 py-2 bg-blue-600 text-white rounded-md shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 ease-in-out transform hover:scale-105'
                  onClick={() => setIsEditing(true)}
                >
                  Chỉnh sửa
                </button>
              ) : (
                <>
                  <button
                    className='px-6 py-2 bg-green-600 text-white rounded-md shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-300 ease-in-out transform hover:scale-105'
                    onClick={handleUpdateProfile}
                  >
                    Lưu
                  </button>
                  <button
                    className='px-6 py-2 bg-red-600 text-white rounded-md shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition duration-300 ease-in-out transform hover:scale-105'
                    onClick={() => {
                      setIsEditing(false)
                      setEditedProfile(profile)
                    }}
                  >
                    Hủy
                  </button>
                </>
              )}
            </div>
          </div>
        )
      )}
    </Modal>
  )
}

export default ProfileModal
