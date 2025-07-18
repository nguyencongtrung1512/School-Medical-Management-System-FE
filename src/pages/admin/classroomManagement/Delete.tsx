import React from 'react'
import { Modal } from 'antd'
import { deleteClassAPI } from '../../../api/classes.api'
import { message } from 'antd'

interface Class {
  _id: string
  name: string
}

interface DeleteClassProps {
  isModalVisible: boolean
  onCancel: () => void
  onOk: () => void
  deletingClass: Class | null
}

const DeleteClass: React.FC<DeleteClassProps> = ({ isModalVisible, onCancel, onOk, deletingClass }) => {
  const handleDelete = async () => {
    try {
      if (!deletingClass) return

      await deleteClassAPI(deletingClass._id)
      message.success('Xóa lớp thành công')
      onOk()
    } catch (error: unknown) {
      console.log('error', error)
      const err = error as { message?: string }
      if (err.message) {
        message.error(err.message)
      } else {
        message.error('Không thể xóa lớp')
      }
    }
  }

  return (
    <Modal
      title='Xác nhận xóa'
      open={isModalVisible}
      onOk={handleDelete}
      onCancel={onCancel}
      okText='Xóa'
      okType='danger'
      cancelText='Hủy'
    >
      <p>Bạn có chắc chắn muốn xóa lớp {deletingClass?.name}?</p>
      <p className='text-red-500'>Lưu ý: Hành động này không thể hoàn tác!</p>
    </Modal>
  )
}

export default DeleteClass
