import React from 'react'
import { Modal, message } from 'antd'
import { blogApi } from '../../../api/blog.api'
import { useNavigate } from 'react-router-dom'

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
        } catch (error) {
            console.error('Error deleting blog:', error)
            message.error('Xóa blog thất bại!')
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
