import { Modal, message } from 'antd'
import { useNavigate } from 'react-router-dom'
import { blogApi } from '../../../api/blog.api'

interface DeleteBlogProps {
  blogId: string
  isVisible: boolean
  onClose: () => void
  onDeleted?: () => void
}

function DeleteBlog({ blogId, isVisible, onClose, onDeleted }: DeleteBlogProps) {
  const navigate = useNavigate()

  const handleDelete = async () => {
    try {
      const response = await blogApi.deleteBlogApi(blogId)
      if (response.data) {
        message.success('Xóa blog thành công!')
        if (onDeleted) {
          onDeleted()
        }
        onClose()
        navigate(-1)
      }
    } catch (error: unknown) {
      console.log('error', error)
      const err = error as { message?: string }
      if (err.message) {
        message.error(err.message)
      } else {
        message.error('Xóa blog thất bại!')
      }
    }
  }

  return (
    <Modal
      title='Xác nhận xóa blog'
      open={isVisible}
      onOk={handleDelete}
      onCancel={onClose}
      okText='Xóa'
      cancelText='Hủy'
      okButtonProps={{ danger: true }}
    >
      <p>Bạn có chắc chắn muốn xóa blog này không?</p>
      <p className='text-red-500'>Lưu ý: Hành động này không thể hoàn tác!</p>
    </Modal>
  )
}

export default DeleteBlog
