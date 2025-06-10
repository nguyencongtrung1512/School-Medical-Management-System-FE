import React from 'react'
import { Table, Tag, Space, Button, message } from 'antd'

interface MedicineRequest {
  id: string
  studentName: string
  medicineName: string
  sendDate: string
  status: 'pending' | 'approved' | 'rejected' | 'completed'
  duration: string
}
function HistorySubmission() {
  const medicineHistory: MedicineRequest[] = [
    {
      id: '1',
      studentName: 'Nguyễn Văn An',
      medicineName: 'Paracetamol',
      sendDate: '20/03/2024',
      status: 'completed',
      duration: '20/03/2024 - 22/03/2024'
    },
    {
      id: '2',
      studentName: 'Nguyễn Văn An',
      medicineName: 'Vitamin C',
      sendDate: '18/03/2024',
      status: 'approved',
      duration: '18/03/2024 - 25/03/2024'
    },
    {
      id: '3',
      studentName: 'Nguyễn Thị Bình',
      medicineName: 'Thuốc ho',
      sendDate: '15/03/2024',
      status: 'pending',
      duration: '15/03/2024 - 18/03/2024'
    }
  ]
  const columns = [
    {
      title: 'Học sinh',
      dataIndex: 'studentName',
      key: 'studentName'
    },
    {
      title: 'Tên thuốc',
      dataIndex: 'medicineName',
      key: 'medicineName'
    },
    {
      title: 'Ngày gửi',
      dataIndex: 'sendDate',
      key: 'sendDate'
    },
    {
      title: 'Thời gian sử dụng',
      dataIndex: 'duration',
      key: 'duration'
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = 'blue'
        let text = 'Chờ xác nhận'

        switch (status) {
          case 'received':
            color = 'cyan'
            text = 'Đã nhận thuốc'
            break
          case 'in_progress':
            color = 'orange'
            text = 'Đang thực hiện'
            break
          case 'completed':
            color = 'green'
            text = 'Đã hoàn thành'
            break
          default:
            color = 'blue'
            text = 'Chờ xác nhận'
        }

        return <Tag color={color}>{text}</Tag>
      }
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: unknown, record: MedicineRequest) => (
        <Space size='middle'>
          <Button type='link' onClick={() => message.info('Xem chi tiết ' + record.id)}>
            Xem chi tiết
          </Button>
        </Space>
      )
    }
  ]
  return (
    <div>
      <Table
        columns={columns}
        dataSource={medicineHistory}
        rowKey='id'
        pagination={{ pageSize: 5 }}
        className='bg-white'
      />
    </div>
  )
}

export default HistorySubmission
