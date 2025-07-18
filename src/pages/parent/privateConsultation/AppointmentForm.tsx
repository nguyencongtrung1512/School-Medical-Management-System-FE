import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { CalendarIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { Button } from '../../../components/ui/button'
import { Calendar } from '../../../components/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Label } from '../../../components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '../../../components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select'
import { Textarea } from '../../../components/ui/textarea'

import { appointmentApi, AppointmentType, CreateAppointmentRequest } from '../../../api/appointment.api'
import { getStudentByIdAPI } from '../../../api/student.api'
import { getCurrentUserAPI } from '../../../api/user.api'
import Loading from '../../../components/Loading/Loading'
import SuccessModal from './successModal'

interface Student {
  _id: string
  studentCode: string
  fullName: string
  classId?: string
}

interface AppointmentFormProps {
  onSuccess?: () => void
}

const AppointmentForm = ({ onSuccess }: AppointmentFormProps) => {
  const [selectedStudent, setSelectedStudent] = useState<string>('')
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [reason, setReason] = useState<string>('')
  const [note, setNote] = useState<string>('')
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [appointmentDetails, setAppointmentDetails] = useState<{ date?: string; time?: string }>()

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const userResponse = await getCurrentUserAPI()
        if (userResponse.studentIds && userResponse.studentIds.length > 0) {
          const studentPromises = userResponse.studentIds.map((studentId: string) => getStudentByIdAPI(studentId))
          const studentResponses = await Promise.all(studentPromises)
          const studentList = studentResponses.map((response: any) => ({
            _id: response.data._id,
            fullName: response.data.fullName,
            studentCode: response.data.studentCode
          }))
          setStudents(studentList)
        } else {
          toast.warning('Bạn chưa liên kết với học sinh nào!')
        }
      } catch {
        toast.error('Không thể lấy danh sách học sinh!')
      }
    }
    fetchStudents()
  }, [])

  const timeSlots = [
    '08:00',
    '08:30',
    '09:00',
    '09:30',
    '10:00',
    '10:30',
    '13:00',
    '13:30',
    '14:00',
    '14:30',
    '15:00',
    '15:30',
    '16:00'
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedStudent || !selectedDate || !selectedTime || !reason.trim()) {
      toast.error('Vui lòng điền đầy đủ thông tin')
      return
    }
    const student = students.find((s) => s._id === selectedStudent)
    if (!student) {
      toast.error('Không tìm thấy thông tin học sinh')
      return
    }
    const scheduledDateTime = new Date(selectedDate)
    const [hours, minutes] = selectedTime.split(':')
    scheduledDateTime.setHours(parseInt(hours), parseInt(minutes))
    const appointmentTime = scheduledDateTime.toISOString()
    setLoading(true)
    try {
      const data: CreateAppointmentRequest = {
        studentId: student._id,
        appointmentTime,
        reason: reason.trim(),
        type: AppointmentType.Other,
        note: note.trim()
      }
      await appointmentApi.create(data)
      setAppointmentDetails({
        date: format(scheduledDateTime, 'dd/MM/yyyy', { locale: vi }),
        time: format(scheduledDateTime, 'HH:mm')
      })
      setShowSuccess(true)
      setSelectedStudent('')
      setSelectedDate(undefined)
      setSelectedTime('')
      setReason('')
      setNote('')
      if (onSuccess) onSuccess()
    } catch {
      toast.error('Đặt lịch hẹn thất bại!')
    } finally {
      setLoading(false)
    }
  }

  if (students.length === 0) {
    return <Loading />
  }

  return (
    <>
      <Card className='w-full'>
        <CardHeader>
          <CardTitle className='text-2xl font-bold text-center text-green-700'>Đặt lịch hẹn với y tế</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className='space-y-6'>
            {/* Student Selection */}
            <div className='space-y-2'>
              <Label htmlFor='student'>Chọn học sinh</Label>
              <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                <SelectTrigger>
                  <SelectValue placeholder='Chọn học sinh...' />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student._id} value={student._id}>
                      {student.studentCode} - {student.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date and Time Selection */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label>Chọn ngày</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant='outline'
                      className={
                        'w-full justify-start text-left font-normal' + (!selectedDate ? ' text-muted-foreground' : '')
                      }
                    >
                      <CalendarIcon className='mr-2 h-4 w-4' />
                      {selectedDate ? format(selectedDate, 'PPP', { locale: vi }) : 'Chọn ngày'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className='w-auto p-0' align='start'>
                    <Calendar
                      mode='single'
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={(date) => date < new Date()}
                      initialFocus
                      className='p-3 pointer-events-auto'
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className='space-y-2'>
                <Label>Chọn giờ</Label>
                <Select value={selectedTime} onValueChange={setSelectedTime}>
                  <SelectTrigger>
                    <SelectValue placeholder='Chọn giờ...' />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Reason */}
            <div className='space-y-2'>
              <Label htmlFor='reason'>Lý do đặt lịch</Label>
              <Textarea
                id='reason'
                placeholder='Mô tả lý do đặt lịch...'
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className='min-h-[100px]'
              />
            </div>

            {/* Note */}
            <div className='space-y-2'>
              <Label htmlFor='note'>Ghi chú (nếu có)</Label>
              <Textarea
                id='note'
                placeholder='Ghi chú thêm cho y tế...'
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className='min-h-[60px]'
              />
            </div>

            <Button type='submit' className='w-full bg-green-600 hover:bg-green-700' disabled={loading}>
              {loading ? 'Đang gửi...' : 'Đặt lịch hẹn'}
            </Button>
          </form>
        </CardContent>
      </Card>
      <SuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        appointmentDetails={appointmentDetails}
      />
    </>
  )
}

export default AppointmentForm
