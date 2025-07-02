import React, { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../components/ui/dialog'
import { Badge } from '../../../components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table'
import { Eye } from 'lucide-react'
import { toast } from 'react-toastify'
import { getMedicineSubmissionsByParentId, MedicineSubmissionData } from '../../../api/medicineSubmissions.api'
import { getStudentByIdAPI, StudentProfile } from '../../../api/student.api'
import { getUserByIdAPI, Profile } from '../../../api/user.api'
import MedicationNoData from '../../../components/nodata/medicationNodata'

type PopulatedMedicineRequest = Omit<MedicineSubmissionData, 'studentId'> & {
  studentId: StudentProfile
  parentInfo?: Profile
  nurseInfo?: Profile
}

const statusBadge = (status: string) => {
  switch (status) {
    case 'pending':
      return (
        <Badge variant='secondary' className='bg-yellow-100 text-yellow-800'>
          Chờ xác nhận
        </Badge>
      )
    case 'approved':
      return (
        <Badge variant='secondary' className='bg-green-100 text-green-800'>
          Đã duyệt
        </Badge>
      )
    case 'rejected':
      return <Badge variant='destructive'>Đã từ chối</Badge>
    case 'completed':
      return (
        <Badge variant='secondary' className='bg-purple-100 text-purple-800'>
          Đã hoàn thành
        </Badge>
      )
    default:
      return <Badge variant='outline'>{status}</Badge>
  }
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
            let nurseInfo: Profile | undefined
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

            if (request.schoolNurseId) {
              try {
                const nurseResponse = await getUserByIdAPI(request.schoolNurseId)
                nurseInfo = nurseResponse.data
              } catch (error) {
                console.error('Error fetching nurse info for request:', request._id, error)
                nurseInfo = { _id: request.schoolNurseId, fullName: 'Y tá không xác định', phone: 'N/A' } as Profile
              }
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
              parentInfo: parentInfo,
              nurseInfo: nurseInfo
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

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-100 to-cyan-50 p-6'>
      <Card className='shadow-xl border-0 bg-white/80 backdrop-blur-sm'>
        <CardHeader className='bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg'>
          <CardTitle className='text-2xl font-bold flex items-center gap-2'>
            <Eye className='h-6 w-6' />
            Lịch sử gửi thuốc
          </CardTitle>
        </CardHeader>
        <CardContent className='p-6'>
          {loading ? (
            <div className='flex items-center justify-center py-12'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
              <span className='ml-3 text-gray-600'>Đang tải...</span>
            </div>
          ) : medicineHistory.length === 0 ? (
            <div className='flex items-center justify-center py-12'>
              <MedicationNoData />
            </div>
          ) : (
            <div className='rounded-lg border border-gray-200 overflow-hidden'>
              <Table>
                <TableHeader>
                  <TableRow className='bg-gray-50'>
                    <TableHead className='font-semibold'>Ngày gửi</TableHead>
                    <TableHead className='font-semibold'>Học sinh</TableHead>
                    <TableHead className='font-semibold'>Tên thuốc</TableHead>
                    <TableHead className='font-semibold'>Thời gian sử dụng</TableHead>
                    <TableHead className='font-semibold'>Trạng thái</TableHead>
                    <TableHead className='font-semibold text-center'>Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {medicineHistory.map((record) => (
                    <TableRow key={record._id} className='hover:bg-gray-50 transition-colors'>
                      <TableCell className='font-medium'>
                        {new Date(record.createdAt).toLocaleDateString('vi-VN')}
                      </TableCell>
                      <TableCell>{record.studentId.fullName}</TableCell>
                      <TableCell>{record.medicines[0]?.name}</TableCell>
                      <TableCell>
                        {record.medicines[0]
                          ? `${new Date(record.medicines[0].startDate).toLocaleDateString('vi-VN')} - ${new Date(record.medicines[0].endDate).toLocaleDateString('vi-VN')}`
                          : ''}
                      </TableCell>
                      <TableCell>{statusBadge(record.status)}</TableCell>
                      <TableCell className='text-center'>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => handleViewDetails(record)}
                          className='hover:bg-blue-50 hover:border-blue-300'
                        >
                          <Eye className='h-4 w-4' />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isModalVisible} onOpenChange={() => setIsModalVisible(false)}>
        <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle className='text-xl font-bold text-gray-800'>Chi tiết đơn thuốc</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className='space-y-6'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <label className='text-sm font-semibold text-gray-600'>Học sinh</label>
                  <p className='text-gray-800 bg-gray-50 p-2 rounded'>
                    {selectedRequest.studentId.fullName} - Mã số: {selectedRequest.studentId.studentCode}
                  </p>
                  {selectedRequest.studentId.classId && (
                    <div>
                      <span className='text-xs text-gray-500'>Lớp: {selectedRequest.studentId.classId}</span>
                    </div>
                  )}
                </div>
                <div className='space-y-2'>
                  <label className='text-sm font-semibold text-gray-600'>Ngày gửi</label>
                  <p className='text-gray-800 bg-gray-50 p-2 rounded'>
                    {new Date(selectedRequest.createdAt).toLocaleDateString('vi-VN')}
                  </p>
                </div>
                <div className='space-y-2'>
                  <label className='text-sm font-semibold text-gray-600'>Trạng thái</label>
                  <div className='bg-gray-50 p-2 rounded'>{statusBadge(selectedRequest.status)}</div>
                </div>
              </div>
              <div className='space-y-2'>
                <label className='text-sm font-semibold text-gray-600'>Danh sách thuốc</label>
                <div className='bg-gray-50 p-2 rounded'>
                  {selectedRequest.medicines && selectedRequest.medicines.length > 0 ? (
                    selectedRequest.medicines.map((med, idx) => (
                      <div key={idx} className='mb-2'>
                        <div className='font-semibold'>Thuốc {idx + 1}: {med.name}</div>
                        <div>Liều lượng: {med.dosage}</div>
                        <div>Số lần uống/ngày: {med.timesPerDay}</div>
                        <div>Thời gian uống: {med.usageInstructions}</div>
                        <div>Thời gian sử dụng: {med.startDate ? `${new Date(med.startDate).toLocaleDateString('vi-VN')} - ${new Date(med.endDate).toLocaleDateString('vi-VN')}` : ''}</div>
                        <div>Lý do: {med.reason}</div>
                        {med.note && <div>Ghi chú: {med.note}</div>}
                      </div>
                    ))
                  ) : (
                    <div>Không có thuốc nào.</div>
                  )}
                </div>
              </div>
              {selectedRequest.nurseNotes && (
                <div className='space-y-2'>
                  <label className='text-sm font-semibold text-gray-600'>Ghi chú của y tá</label>
                  <p className='text-gray-800 bg-blue-50 p-2 rounded border-l-4 border-blue-400'>
                    {selectedRequest.nurseNotes}
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter className='gap-2'>
            <Button variant='outline' onClick={() => setIsModalVisible(false)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default HistorySubmission
