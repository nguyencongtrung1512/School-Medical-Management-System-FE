import { message, Modal } from 'antd'
import React from 'react'
import { deleteStudentAPI } from '../../../api/student.api'

interface Student {
  _id: string
  fullName: string
}

interface DeleteStudentProps {
  isModalVisible: boolean
  onCancel: () => void
  onOk: () => void
  deletingStudent: Student | null
}

const DeleteStudent: React.FC<DeleteStudentProps> = ({ isModalVisible, onCancel, onOk, deletingStudent }) => {
  const handleDelete = async () => {
    try {
      if (!deletingStudent) return

      await deleteStudentAPI(deletingStudent._id)
      message.success('Xóa học sinh thành công')
      onOk()
    } catch (error: unknown) {
      console.log('error', error)
      const err = error as { message?: string }
      if (err.message) {
        message.error(err.message)
      } else {
        message.error('Không thể xóa học sinh')
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
      <p>Bạn có chắc chắn muốn xóa học sinh {deletingStudent?.fullName}?</p>
      <p className='text-red-500'>Lưu ý: Hành động này không thể hoàn tác!</p>
    </Modal>
  )
}

export default DeleteStudent
