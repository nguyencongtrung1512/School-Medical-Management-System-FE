import React, { useEffect, useState } from 'react'
import { Table, Tag, Space, Button, message, Spin } from 'antd'
import { toast } from 'react-toastify'
import { getMedicineSubmissionsByParentId } from '../../../api/medicineSubmissions'

interface MedicineRequest {
  _id: string
  studentId: {
    _id: string
    fullName: string
    studentCode: string
  }
  medicines: {
    name: string
    dosage: string
    usageInstructions: string
    quantity: number
    timesPerDay: number
    timeSlots: string[]
    startDate: string
    endDate: string
    reason: string
    note?: string
    _id: string
  }[]
  status: 'pending' | 'approved' | 'rejected' | 'completed'
  createdAt: string
  updatedAt: string
}

function HistorySubmission() {
  const [medicineHistory, setMedicineHistory] = useState<MedicineRequest[]>([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalItems, setTotalItems] = useState(0)

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true)
      try {
        const userStr = localStorage.getItem('user')
        if (!userStr) {
          toast.error('Vui lòng đăng nhập lại!', { autoClose: 1000 })
          setLoading(false)
          return
        }

        const user = JSON.parse(userStr)
        if (!user || !user.id) {
          toast.error('Thông tin người dùng không hợp lệ!', { autoClose: 1000 })
          setLoading(false)
          return
        }

        const response = await getMedicineSubmissionsByParentId(user.id, currentPage, pageSize)
        if (response.success) {
          setMedicineHistory(response.pageData)
          setTotalItems(response.totalPage * pageSize) // Assuming totalPage is based on current pageSize
        } else {
          toast.error('Không thể lấy lịch sử gửi thuốc!', { autoClose: 1000 })
        }
      } catch {
        toast.error('Có lỗi xảy ra khi lấy lịch sử gửi thuốc!', { autoClose: 1000 })
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [currentPage, pageSize]) // Re-fetch data when page or size changes

  const handleTableChange = (page: number, pageSize?: number) => {
    setCurrentPage(page)
    if (pageSize) {
      setPageSize(pageSize)
    }
  }

  const columns = [
    {
      title: 'Học sinh',
      dataIndex: ['studentId', 'fullName'],
      key: 'studentName'
    },
    {
      title: 'Tên thuốc',
      dataIndex: ['medicines', 0, 'name'],
      key: 'medicineName'
    },
    {
      title: 'Ngày gửi',
      dataIndex: 'createdAt',
      key: 'sendDate',
      render: (text: string) => new Date(text).toLocaleDateString('vi-VN')
    },
    {
      title: 'Thời gian sử dụng',
      key: 'duration',
      render: (_: unknown, record: MedicineRequest) => {
        const medicine = record.medicines[0]
        return medicine
          ? `${new Date(medicine.startDate).toLocaleDateString('vi-VN')} - ${new Date(medicine.endDate).toLocaleDateString('vi-VN')}`
          : ''
      }
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = 'blue'
        let text = 'Chờ xác nhận'

        switch (status) {
          case 'pending':
            color = 'blue'
            text = 'Chờ xác nhận'
            break
          case 'approved':
            color = 'green'
            text = 'Đã duyệt'
            break
          case 'rejected':
            color = 'red'
            text = 'Đã từ chối'
            break
          case 'completed':
            color = 'purple'
            text = 'Đã hoàn thành'
            break
        }

        return <Tag color={color}>{text}</Tag>
      }
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: unknown, record: MedicineRequest) => (
        <Space size='middle'>
          <Button type='link' onClick={() => message.info('Xem chi tiết ' + record._id)}>
            Xem chi tiết
          </Button>
        </Space>
      )
    }
  ]
  return (
    <Spin spinning={loading} tip='Đang tải...'>
      <div>
        <Table
          columns={columns}
          dataSource={medicineHistory}
          rowKey='_id'
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: totalItems,
            onChange: handleTableChange,
            showSizeChanger: true,
            pageSizeOptions: ['5', '10', '20', '50']
          }}
          className='bg-white'
        />
      </div>
    </Spin>
  )
}

export default HistorySubmission
