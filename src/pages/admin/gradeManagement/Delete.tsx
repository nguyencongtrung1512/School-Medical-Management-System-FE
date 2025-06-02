import React, { useState } from 'react'
import { Modal } from 'antd'
import { deleteGradeAPI } from '../../../api/grade.api'
import { toast } from 'react-toastify'

interface Grade {
  _id: string
  name: string
}

interface DeleteGradeProps {
  grade: Grade | null
  onOk: () => void
  onCancel: () => void
}

const DeleteGrade: React.FC<DeleteGradeProps> = ({ grade, onOk, onCancel }) => {
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (!grade) return
    try {
      setLoading(true)
      const response = await deleteGradeAPI(grade._id)
      console.log('Delete response:', response) // Add this to debug
      if (response && response.status === 200) {
        toast.success('Xóa khối thành công!')
        onOk()
      } else {
        throw new Error('Delete operation failed')
      }
    } catch (error: any) {
      console.error('Delete error:', error)
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi xóa khối!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      title='Xác nhận xóa'
      open={!!grade}
      confirmLoading={loading}
      onOk={handleDelete}
      onCancel={onCancel}
      okText='Xóa'
      cancelText='Hủy'
    >
      {grade && (
        <>
          Bạn có chắc chắn muốn xóa khối <strong>{grade.name}</strong>?
        </>
      )}
    </Modal>
  )
}

export default DeleteGrade
