import React from 'react'
import CreateSubmission from './createSubmission'
import HistorySubmission from './historySubmission'
import { Button } from 'antd'

const MedicineSubmissions: React.FC = () => {
  const [showCreate, setShowCreate] = React.useState(false)
  const formRef = React.useRef<HTMLDivElement>(null)
  const handleShowCreate = () => {
    setShowCreate((prev) => {
      const next = !prev
      if (!prev) {
        setTimeout(() => {
          formRef.current?.scrollIntoView({ behavior: 'smooth' })
        }, 100) // Đợi form render xong
      }
      return next
    })
  }
  return (
    <div>
      <div className='mb-4 flex justify-end'>
        <Button type='primary' onClick={handleShowCreate}>
          {showCreate ? 'Hủy form gửi thuốc' : 'Tạo đơn gửi thuốc'}
        </Button>
      </div>
      <div>
        <HistorySubmission />
      </div>
      {showCreate && (
        <div ref={formRef}>
          <CreateSubmission />
        </div>
      )}
    </div>
  )
}

export default MedicineSubmissions
