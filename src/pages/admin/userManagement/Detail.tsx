import React from 'react'
import { Modal, Descriptions, Spin, Typography } from 'antd'

const { Title } = Typography

interface DetailProps {
  open: boolean
  onCancel: () => void
  user: any
  loading: boolean
}
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}
const Detail: React.FC<DetailProps> = ({ open, onCancel, user, loading }) => (
  
  <Modal title='Thông tin chi tiết người dùng' open={open} onCancel={onCancel} footer={null} width={600}>
    {loading ? (
      <Spin />
    ) : user ? (
      <div>
        <Title level={4}>{user.fullName}</Title>
        <Descriptions bordered column={1}>
          <Descriptions.Item label='Email'>{user.email}</Descriptions.Item>
          <Descriptions.Item label='Số điện thoại'>{user.phone}</Descriptions.Item>
          <Descriptions.Item label='Vai trò'>{user.role}</Descriptions.Item>
          <Descriptions.Item label='Trạng thái'>
            {user.isDeleted === false ? 'Hoạt động' : 'Ngưng hoạt động'}
          </Descriptions.Item>
          <Descriptions.Item label='Ngày tạo'>{formatDate(user.createdAt)}</Descriptions.Item>
        </Descriptions>
      </div>
    ) : (
      <p>Không tìm thấy thông tin người dùng.</p>
    )}
  </Modal>
)

export default Detail
