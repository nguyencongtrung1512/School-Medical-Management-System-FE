import React, { useEffect, useState } from 'react'
import { Table, Tag, Space, Button, Spin, Modal, Descriptions, Typography } from 'antd'
import { toast } from 'react-toastify'
import { getMedicineSubmissionsByParentId, MedicineSubmissionData } from '../../../api/medicineSubmissions'
import { getStudentByIdAPI, StudentProfile } from '../../../api/student.api'
import { getUserByIdAPI, Profile } from '../../../api/user.api'

const { Text } = Typography

type PopulatedMedicineRequest = Omit<MedicineSubmissionData, 'studentId'> & {
  studentId: StudentProfile
  parentInfo?: Profile
}

function HistorySubmission() {
  const [medicineHistory, setMedicineHistory] = useState<PopulatedMedicineRequest[]>([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalItems, setTotalItems] = useState(0)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<PopulatedMedicineRequest | null>(null)

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

        const requestsWithPopulatedInfo = await Promise.all(
          response.pageData.map(async (request) => {
            let studentInfo: StudentProfile | undefined
            let parentInfo: Profile | undefined
            try {
              const studentResponse = await getStudentByIdAPI(request.studentId as string)
              studentInfo = studentResponse.data
            } catch (error) {
              console.error('Error fetching student info for request:', request._id, error)
              studentInfo = {
                _id: request.studentId,
                fullName: 'Học sinh không xác định',
                studentCode: 'N/A'
              } as StudentProfile
            }

            try {
              const parentResponse = await getUserByIdAPI(request.parentId)
              parentInfo = parentResponse.data
            } catch (error) {
              console.error('Error fetching parent info for request:', request._id, error)
              parentInfo = { _id: request.parentId, fullName: 'Phụ huynh không xác định', phone: 'N/A' } as Profile
            }

            return {
              _id: request._id,
              parentId: request.parentId,
              schoolNurseId: request.schoolNurseId,
              medicines: request.medicines,
              status: request.status,
              isDeleted: request.isDeleted,
              createdAt: request.createdAt,
              updatedAt: request.updatedAt,
              __v: request.__v,
              nurseNotes: request.nurseNotes,
              studentId: studentInfo!,
              parentInfo: parentInfo
            }
          })
        )

        setMedicineHistory(requestsWithPopulatedInfo)
        setTotalItems(response.totalPage * pageSize)
      } catch (error) {
        toast.error('Có lỗi xảy ra khi lấy lịch sử gửi thuốc!', { autoClose: 1000 })
        console.error('Fetch history error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [currentPage, pageSize])

  const handleTableChange = (page: number, pageSize?: number) => {
    setCurrentPage(page)
    if (pageSize) {
      setPageSize(pageSize)
    }
  }

  const handleViewDetails = (record: PopulatedMedicineRequest) => {
    setSelectedRequest(record)
    setIsModalVisible(true)
  }

  const columns = [
    {
      title: 'Ngày gửi',
      dataIndex: 'createdAt',
      key: 'sendDate',
      render: (text: string) => new Date(text).toLocaleDateString('vi-VN')
    },
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
      title: 'Thời gian sử dụng',
      key: 'duration',
      render: (_: unknown, record: PopulatedMedicineRequest) => {
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
      render: (_: unknown, record: PopulatedMedicineRequest) => (
        <Space size='middle'>
          <Button type='link' onClick={() => handleViewDetails(record)}>
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

        {/* Modal chi tiết */}
        <Modal
          title='Chi tiết đơn thuốc'
          open={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          width={800}
          footer={null}
        >
          {selectedRequest && (
            <div>
              <Descriptions bordered column={2}>
                <Descriptions.Item label='Học sinh' span={2}>
                  {selectedRequest.studentId.fullName} - Mã số: {selectedRequest.studentId.studentCode}
                  {selectedRequest.studentId.classId && (
                    <div>
                      <Text type='secondary'>Lớp: {selectedRequest.studentId.classId}</Text>
                    </div>
                  )}
                </Descriptions.Item>
                <Descriptions.Item label='Phụ huynh' span={2}>
                  {selectedRequest.parentInfo?.fullName || 'N/A'}
                  <div>
                    <Text type='secondary'>Số điện thoại: {selectedRequest.parentInfo?.phone || 'N/A'}</Text>
                  </div>
                </Descriptions.Item>
                <Descriptions.Item label='Tên thuốc'>{selectedRequest.medicines[0]?.name}</Descriptions.Item>
                <Descriptions.Item label='Liều lượng'>{selectedRequest.medicines[0]?.dosage}</Descriptions.Item>
                <Descriptions.Item label='Số lần uống'>{selectedRequest.medicines[0]?.timesPerDay}</Descriptions.Item>
                <Descriptions.Item label='Thời gian uống'>
                  {selectedRequest.medicines[0]?.usageInstructions}
                </Descriptions.Item>
                <Descriptions.Item label='Thời gian sử dụng' span={2}>
                  {new Date(selectedRequest.medicines[0].startDate).toLocaleDateString('vi-VN')} -{' '}
                  {new Date(selectedRequest.medicines[0].endDate).toLocaleDateString('vi-VN')}
                </Descriptions.Item>
                <Descriptions.Item label='Lý do dùng thuốc' span={2}>
                  {selectedRequest.medicines[0]?.reason}
                </Descriptions.Item>
                {selectedRequest.medicines[0]?.note && (
                  <Descriptions.Item label='Ghi chú đặc biệt' span={2}>
                    {selectedRequest.medicines[0]?.note}
                  </Descriptions.Item>
                )}
                {selectedRequest.nurseNotes && (
                  <Descriptions.Item label='Ghi chú của y tá' span={2}>
                    {selectedRequest.nurseNotes}
                  </Descriptions.Item>
                )}
              </Descriptions>
            </div>
          )}
        </Modal>
      </div>
    </Spin>
  )
}

export default HistorySubmission
