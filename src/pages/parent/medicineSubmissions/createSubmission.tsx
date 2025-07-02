import type React from 'react'
import { useState, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import dayjs from 'dayjs'
import { toast } from 'react-toastify'

import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Textarea } from '../../../components/ui/textarea'
import { Checkbox } from '../../../components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../../components/ui/form'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Separator } from '../../../components/ui/separator'
import { Calendar } from '../../../components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '../../../components/ui/popover'
import { CalendarIcon, Plus, Trash2, Loader2 } from 'lucide-react'
import { cn } from '../../../lib/utils'

// Keep your existing API imports
import { createMedicineSubmission } from '../../../api/medicineSubmissions.api'
import { getCurrentUserAPI, searchNurseUsersAPI, type NurseProfile } from '../../../api/user.api'
import { getStudentByIdAPI } from '../../../api/student.api'

interface Student {
  _id: string
  fullName: string
  class: string
}

interface StudentAPIResponse {
  data: {
    _id: string
    fullName: string
    studentCode: string
  }
}

const medicineSchema = z.object({
  medicineName: z.string().min(1, 'Vui lòng nhập tên thuốc'),
  quantity: z.number().min(1, 'Số lượng phải lớn hơn 0'),
  dosage: z.string().min(1, 'Vui lòng nhập liều lượng'),
  timesPerDay: z.number().min(1, 'Số lần uống phải lớn hơn 0'),
  timing: z.string().min(1, 'Vui lòng nhập thời gian uống'),
  startDate: z.date({ required_error: 'Vui lòng chọn ngày bắt đầu' }),
  endDate: z.date({ required_error: 'Vui lòng chọn ngày kết thúc' }),
  reason: z.string().min(1, 'Vui lòng nhập lý do dùng thuốc'),
  note: z.string().optional()
})

const formSchema = z.object({
  studentId: z.string().min(1, 'Vui lòng chọn học sinh'),
  class: z.string().optional(),
  sendDate: z.date({ required_error: 'Vui lòng chọn ngày gửi thuốc' }),
  schoolNurseId: z.string().min(1, 'Vui lòng chọn y tá phụ trách'),
  medicines: z.array(medicineSchema).min(1, 'Vui lòng thêm ít nhất một loại thuốc'),
  agreement1: z.boolean().refine((val) => val === true, 'Vui lòng xác nhận cam kết'),
  agreement2: z.boolean().refine((val) => val === true, 'Vui lòng xác nhận đồng ý')
})

type FormValues = z.infer<typeof formSchema>

const CreateSubmission: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [nurses, setNurses] = useState<NurseProfile[]>([])
  const [nurseLoading, setNurseLoading] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sendDate: new Date(),
      medicines: [{}],
      agreement1: false,
      agreement2: false
    }
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'medicines'
  })

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const userResponse = await getCurrentUserAPI()
        const userData = userResponse.data

        if (userData.studentIds && userData.studentIds.length > 0) {
          const studentPromises = userData.studentIds.map((studentId: string) => getStudentByIdAPI(studentId))
          const studentResponses = await Promise.all(studentPromises)

          const studentList = studentResponses.map((response: StudentAPIResponse) => ({
            _id: response.data._id,
            fullName: response.data.fullName,
            class: response.data.studentCode
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

  const handleStudentChange = (studentId: string) => {
    const student = students.find((s) => s._id === studentId)
    if (student) {
      form.setValue('class', student.class)
    }
  }

  const fetchNurses = async (searchText?: string) => {
    try {
      setNurseLoading(true)
      const response = await searchNurseUsersAPI(1, 10, searchText)
      console.log('trúng:', response)
      setNurses(response.pageData)
    } catch (error) {
      toast.error('Không thể tải danh sách y tá!')
    } finally {
      setNurseLoading(false)
    }
  }


  useEffect(() => {
    fetchNurses()
  }, [])

  const onSubmit = async (values: FormValues) => {
    console.log('Submit values:', values)

    try {
      setSubmitting(true)
      setLoading(true)

      const userStr = localStorage.getItem('user')
      if (!userStr) {
        toast.error('Vui lòng đăng nhập lại!', { autoClose: 1000 })
        return
      }

      const user = JSON.parse(userStr)
      if (!user || !user.id) {
        toast.error('Thông tin người dùng không hợp lệ! Vui lòng đăng nhập lại.', { autoClose: 2000 })
        return
      }

      const submissionData = {
        parentId: user.id,
        studentId: values.studentId,
        schoolNurseId: values.schoolNurseId,
        medicines: values.medicines.map((med) => ({
          name: med.medicineName,
          dosage: med.dosage,
          usageInstructions: med.timing,
          quantity: med.quantity,
          timesPerDay: med.timesPerDay,
          timeSlots: (med.timing || '').split(',').map((time: string) => time.trim()),
          startDate: dayjs(med.startDate).format('YYYY-MM-DD'),
          endDate: dayjs(med.endDate).format('YYYY-MM-DD'),
          reason: med.reason,
          note: med.note
        }))
      }

      const response = await createMedicineSubmission(submissionData)

      if ((response as any).success) {
        toast.success('Gửi thông tin thuốc thành công!', { autoClose: 1000 })
        form.reset()
      }
    } catch (error) {
      console.log('trung', error)
      toast.error('Có lỗi xảy ra khi gửi thông tin thuốc!', { autoClose: 1000 })
    } finally {
      setLoading(false)
      setSubmitting(false)
    }
  }

  const formatDate = (date: Date | undefined) => {
    return date ? dayjs(date).format('DD/MM/YYYY') : 'Chọn ngày'
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-100 to-cyan-50 p-6'>
      <Card className='max-w-6xl mx-auto'>
        <CardHeader>
          <CardTitle className='text-2xl font-bold text-gray-800 flex items-center gap-2'>Form Gửi Thuốc</CardTitle>
        </CardHeader>
        <CardContent>
          {submitting && (
            <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
              <div className='bg-white p-6 rounded-lg flex items-center gap-3'>
                <Loader2 className='h-6 w-6 animate-spin' />
                <span>Đang xử lý...</span>
              </div>
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
              {/* 1. Thông tin học sinh */}
              <Card>
                <CardHeader>
                  <CardTitle className='text-lg'>1. Thông tin học sinh</CardTitle>
                </CardHeader>
                <CardContent className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <FormField
                    control={form.control}
                    name='studentId'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Họ và tên học sinh</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value)
                            handleStudentChange(value)
                          }}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder='Chọn học sinh' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {students.map((student) => (
                              <SelectItem key={student._id} value={student._id}>
                                {student.fullName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='class'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mã học sinh</FormLabel>
                        <FormControl>
                          <Input {...field} disabled />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='sendDate'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ngày gửi thuốc</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant='outline'
                                className={cn(
                                  'w-full pl-3 text-left font-normal',
                                  !field.value && 'text-muted-foreground'
                                )}
                              >
                                {formatDate(field.value)}
                                <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className='w-auto p-0' align='start'>
                            <Calendar
                              mode='single'
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date < new Date('1900-01-01')}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='schoolNurseId'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Y tá phụ trách</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder='Chọn y tá phụ trách' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {nurses.map((nurse) => (
                              <SelectItem key={nurse._id} value={nurse._id}>
                                {nurse.fullName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* 2. Thông tin thuốc */}
              <Card>
                <CardHeader>
                  <CardTitle className='text-lg'>2. Thông tin thuốc</CardTitle>
                </CardHeader>
                <CardContent>
                  {fields.map((field, index) => (
                    <div key={field.id} className='space-y-4 p-4 border rounded-lg mb-4'>
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <FormField
                          control={form.control}
                          name={`medicines.${index}.medicineName`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tên thuốc</FormLabel>
                              <FormControl>
                                <Input placeholder='Nhập tên thuốc' {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`medicines.${index}.quantity`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Số lượng thuốc</FormLabel>
                              <FormControl>
                                <Input
                                  type='number'
                                  min='1'
                                  placeholder='Nhập số lượng'
                                  {...field}
                                  onChange={(e) => field.onChange(Number.parseInt(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`medicines.${index}.dosage`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Liều lượng mỗi lần uống</FormLabel>
                              <FormControl>
                                <Input placeholder='VD: 1 viên, 5ml' {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`medicines.${index}.timesPerDay`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Số lần uống trong ngày</FormLabel>
                              <FormControl>
                                <Input
                                  type='number'
                                  min='1'
                                  placeholder='Nhập số lần uống'
                                  {...field}
                                  onChange={(e) => field.onChange(Number.parseInt(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`medicines.${index}.timing`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Thời gian uống cụ thể</FormLabel>
                              <FormControl>
                                <Input placeholder='VD: 08:00, 12:00, 20:00' {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className='space-y-4'>
                          <FormField
                            control={form.control}
                            name={`medicines.${index}.startDate`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Ngày bắt đầu sử dụng thuốc</FormLabel>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <FormControl>
                                      <Button
                                        variant='outline'
                                        className={cn(
                                          'w-full pl-3 text-left font-normal',
                                          !field.value && 'text-muted-foreground'
                                        )}
                                      >
                                        {formatDate(field.value)}
                                        <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                                      </Button>
                                    </FormControl>
                                  </PopoverTrigger>
                                  <PopoverContent className='w-auto p-0' align='start'>
                                    <Calendar
                                      mode='single'
                                      selected={field.value}
                                      onSelect={field.onChange}
                                      disabled={(date) => date < new Date('1900-01-01')}
                                      initialFocus
                                    />
                                  </PopoverContent>
                                </Popover>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`medicines.${index}.endDate`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Ngày kết thúc sử dụng thuốc</FormLabel>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <FormControl>
                                      <Button
                                        variant='outline'
                                        className={cn(
                                          'w-full pl-3 text-left font-normal',
                                          !field.value && 'text-muted-foreground'
                                        )}
                                      >
                                        {formatDate(field.value)}
                                        <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                                      </Button>
                                    </FormControl>
                                  </PopoverTrigger>
                                  <PopoverContent className='w-auto p-0' align='start'>
                                    <Calendar
                                      mode='single'
                                      selected={field.value}
                                      onSelect={field.onChange}
                                      disabled={(date) => date < new Date('1900-01-01')}
                                      initialFocus
                                    />
                                  </PopoverContent>
                                </Popover>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      <FormField
                        control={form.control}
                        name={`medicines.${index}.reason`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Lý do dùng thuốc</FormLabel>
                            <FormControl>
                              <Textarea placeholder='VD: Hạ sốt, cảm cúm' className='resize-none' {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`medicines.${index}.note`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ghi chú</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder='VD: Uống với sữa, dị ứng thuốc khác'
                                className='resize-none'
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {fields.length > 1 && (
                        <Button
                          type='button'
                          variant='destructive'
                          size='sm'
                          onClick={() => remove(index)}
                          className='w-full'
                        >
                          <Trash2 className='w-4 h-4 mr-2' />
                          Xóa thuốc này
                        </Button>
                      )}

                      {index < fields.length - 1 && <Separator />}
                    </div>
                  ))}

                  <Button type='button' variant='outline' onClick={() => append({})} className='w-full'>
                    <Plus className='w-4 h-4 mr-2' />
                    Thêm thuốc
                  </Button>
                </CardContent>
              </Card>

              {/* 4. Xác nhận và cam kết */}
              <Card>
                <CardHeader>
                  <CardTitle className='text-lg'>3. Xác nhận và cam kết</CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <FormField
                    control={form.control}
                    name='agreement1'
                    render={({ field }) => (
                      <FormItem className='flex flex-row items-start space-x-3 space-y-0'>
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <div className='space-y-1 leading-none'>
                          <FormLabel className='text-sm font-normal'>
                            Tôi cam kết thông tin trên là chính xác, thuốc còn hạn sử dụng và không gây hại đến sức khỏe
                            của con tôi.
                          </FormLabel>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='agreement2'
                    render={({ field }) => (
                      <FormItem className='flex flex-row items-start space-x-3 space-y-0'>
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <div className='space-y-1 leading-none'>
                          <FormLabel className='text-sm font-normal'>
                            Tôi đồng ý để nhân viên y tế nhà trường hỗ trợ cho con tôi uống thuốc theo thông tin trên.
                          </FormLabel>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Button type='submit' className='w-full h-12 text-lg' disabled={loading}>
                {loading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                Gửi yêu cầu
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

export default CreateSubmission
