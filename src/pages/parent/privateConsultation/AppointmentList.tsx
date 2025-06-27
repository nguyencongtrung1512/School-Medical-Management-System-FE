import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Badge } from '../../../components/ui/badge'
import { Calendar, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { useEffect, useState } from 'react'
import { getAppointments, Appointment } from '../../../api/appointment.api'
import Loading from '../../../components/Loading/Loading'

interface AppointmentListProps {
  appointments: Appointment[]
}

const AppointmentList = ({ appointments }: AppointmentListProps) => {
  const [showAll, setShowAll] = useState(false)
  const sortedAppointments = [...appointments].sort((a, b) => new Date(b.appointmentTime).getTime() - new Date(a.appointmentTime).getTime())
  const visibleAppointments = showAll ? sortedAppointments : sortedAppointments.slice(0, 3)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'approved':
        return 'bg-green-500'
      case 'pending':
        return 'bg-yellow-500'
      case 'done':
        return 'bg-blue-500'
      case 'cancelled':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
      case 'approved':
        return 'Đã xác nhận'
      case 'pending':
        return 'Chờ xác nhận'
      case 'done':
        return 'Hoàn thành'
      case 'cancelled':
        return 'Đã hủy'
      default:
        return status
    }
  }

  if (appointments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Lịch hẹn của bạn</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='text-center py-8 text-gray-500'>Chưa có lịch hẹn nào được đặt</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lịch hẹn của bạn</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='space-y-7'>
          {visibleAppointments.map((appointment) => (
            <div
              key={appointment._id}
              className='border rounded-lg p-6 hover:shadow-lg transition-shadow max-w-xl mx-auto bg-white'
            >
              <div className='flex items-start justify-between'>
                <div className='space-y-2'>
                  <div className='flex items-center space-x-2'>
                    <h3 className='font-medium text-gray-900'>{appointment.studentId}</h3>
                  </div>
                  <div className='flex items-center space-x-4 text-sm text-gray-600'>
                    <div className='flex items-center space-x-1'>
                      <Calendar className='w-4 h-4' />
                      <span>{format(new Date(appointment.appointmentTime), 'dd/MM/yyyy', { locale: vi })}</span>
                    </div>
                    <div className='flex items-center space-x-1'>
                      <Clock className='w-4 h-4' />
                      <span>{format(new Date(appointment.appointmentTime), 'HH:mm')}</span>
                    </div>
                  </div>
                  <p className='text-sm text-gray-700'>
                    <strong>Lý do:</strong> {appointment.reason}
                  </p>
                  {appointment.note && (
                    <p className='text-sm text-gray-700'>
                      <strong>Ghi chú:</strong> {appointment.note}
                    </p>
                  )}
                </div>
                <div className='flex flex-col items-end gap-4 min-w-[110px]'>
                  <Badge className={getStatusColor(appointment.status)}>{getStatusText(appointment.status)}</Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
        {sortedAppointments.length > 3 && !showAll && (
          <div className='text-center mt-4'>
            <button
              className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 font-semibold shadow'
              onClick={() => setShowAll(true)}
            >
              Xem tất cả
            </button>
          </div>
        )}
        {sortedAppointments.length > 3 && showAll && (
          <div className='text-center mt-4'>
            <button
              className='px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 font-semibold shadow'
              onClick={() => setShowAll(false)}
            >
              Ẩn bớt
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

const AppointmentListContainer = ({ reload }: { reload?: boolean }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

  const fetchAppointments = async () => {
    setLoading(true)
    try {
      const res = await getAppointments(1, 10)
      setAppointments(res.pageData || [])
      console.log("trung nè", res.pageData)
    } catch {
      setAppointments([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAppointments()
  }, [reload])

  if (loading) return <Loading />
  return <AppointmentList appointments={appointments} />
}

export default AppointmentListContainer
