import React, { useState, useEffect } from 'react'
import { Form, Input, Select, DatePicker, Checkbox, Button, message, Spin } from 'antd'
import dayjs from 'dayjs'
import { createMedicineSubmission } from '../../../api/medicineSubmissions'
import { getCurrentUserAPI } from '../../../api/user.api'
import { getStudentByIdAPI } from '../../../api/student.api'
import { toast } from 'react-toastify'

const { TextArea } = Input
const { RangePicker } = DatePicker

interface Student {
  _id: string
  fullName: string
  class: string
}

interface FormValues {
  studentId: string
  class: string
  sendDate: dayjs.Dayjs
  medicineName: string
  dosage: string
  frequency: string
  timing: string
  quantity: number
  timesPerDay: number
  duration: [dayjs.Dayjs, dayjs.Dayjs]
  storage: string
  expiryDate?: dayjs.Dayjs
  reason: string
  note?: string
  agreement1: boolean
  agreement2: boolean
}

const CreateSubmission: React.FC = () => {
  const [form] = Form.useForm<FormValues>()
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const userResponse = await getCurrentUserAPI()
        if (userResponse.data.studentIds && userResponse.data.studentIds.length > 0) {
          const studentPromises = userResponse.data.studentIds.map((studentId) => getStudentByIdAPI(studentId))
          const studentResponses = await Promise.all(studentPromises)
          const studentList = studentResponses.map((response) => ({
            _id: response.data._id,
            fullName: response.data.fullName,
            class: response.data.studentCode
          }))
          setStudents(studentList)
        } else {
          message.warning('Bạn chưa liên kết với học sinh nào!')
        }
      } catch (error) {
        message.error('Không thể lấy danh sách học sinh!')
      }
    }

    fetchStudents()
  }, [])

  const handleStudentChange = (studentId: string) => {
    const student = students.find((s) => s._id === studentId)
    if (student) {
      form.setFieldsValue({
        class: student.class
      })
    }
  }

  const onFinish = async (values: FormValues) => {
    try {
      setSubmitting(true)
      setLoading(true)
      const userStr = localStorage.getItem('user')
      if (!userStr) {
        toast.error('Vui lòng đăng nhập lại!', { autoClose: 1000 })
        return
      }

      const user = JSON.parse(userStr)
      if (!user.id) {
        toast.error('Thông tin người dùng không hợp lệ!', { autoClose: 1000 })
        return
      }

      const submissionData = {
        parentId: user.id,
        studentId: values.studentId,
        schoolNurseId: '683a72580f9eb8044e40e296',
        medicines: [
          {
            name: values.medicineName,
            dosage: values.dosage,
            usageInstructions: values.timing,
            quantity: values.quantity,
            timesPerDay: values.timesPerDay,
            timeSlots: values.timing.split(',').map((time) => time.trim()),
            startDate: values.duration[0].format('YYYY-MM-DD'),
            endDate: values.duration[1].format('YYYY-MM-DD'),
            reason: values.reason,
            note: values.note
          }
        ]
      }

      const response = await createMedicineSubmission(submissionData)
      if (response.success) {
        toast.success('Gửi thông tin thuốc thành công!', { autoClose: 1000 })
        form.resetFields()
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra khi gửi thông tin thuốc!', { autoClose: 1000 })
    } finally {
      setLoading(false)
      setSubmitting(false)
    }
  }

  return (
    <Spin spinning={submitting} tip='Đang xử lý...'>
      <div className='bg-white rounded-2xl shadow-xl p-8'>
        <div className='flex items-center mb-6'>
          <h1 className='text-2xl font-bold text-gray-800'>Form Gửi Thuốc</h1>
        </div>

        <Form
          form={form}
          layout='vertical'
          onFinish={onFinish}
          initialValues={{
            sendDate: dayjs()
          }}
        >
          {/* 1. Thông tin học sinh */}
          <div className='bg-gray-50 p-6 rounded-xl mb-6'>
            <h2 className='text-lg font-semibold mb-4'>1. Thông tin học sinh</h2>
            <div className='grid grid-cols-2 gap-6'>
              <Form.Item
                name='studentId'
                label='Họ và tên học sinh'
                rules={[{ required: true, message: 'Vui lòng chọn học sinh!' }]}
              >
                <Select
                  placeholder='Chọn học sinh'
                  onChange={handleStudentChange}
                  options={students.map((student) => ({
                    value: student._id,
                    label: student.fullName
                  }))}
                />
              </Form.Item>

              <Form.Item name='class' label='Mã'>
                <Input disabled />
              </Form.Item>

              <Form.Item
                name='sendDate'
                label='Ngày gửi thuốc'
                rules={[{ required: true, message: 'Vui lòng chọn ngày gửi thuốc!' }]}
              >
                <DatePicker className='w-full' format='DD/MM/YYYY' />
              </Form.Item>
            </div>
          </div>

          {/* 2. Thông tin thuốc */}
          <div className='bg-gray-50 p-6 rounded-xl mb-6'>
            <h2 className='text-lg font-semibold mb-4'>2. Thông tin thuốc</h2>
            <div className='grid grid-cols-2 gap-6'>
              <Form.Item
                name='medicineName'
                label='Tên thuốc'
                rules={[{ required: true, message: 'Vui lòng nhập tên thuốc!' }]}
              >
                <Input placeholder='Nhập tên thuốc' />
              </Form.Item>

              <Form.Item
                name='quantity'
                label='Số lượng thuốc'
                rules={[{ required: true, message: 'Vui lòng nhập số lượng thuốc!' }]}
              >
                <Input type="number" min={1} placeholder='Nhập số lượng' />
              </Form.Item>

              <Form.Item
                name='dosage'
                label='Liều lượng mỗi lần uống'
                rules={[{ required: true, message: 'Vui lòng nhập liều lượng!' }]}
              >
                <Input placeholder='VD: 1 viên, 5ml' />
              </Form.Item>

              <Form.Item
                name='timesPerDay'
                label='Số lần uống trong ngày'
                rules={[{ required: true, message: 'Vui lòng nhập số lần uống!' }]}
              >
                <Input type="number" min={1} placeholder='Nhập số lần uống' />
              </Form.Item>

              <Form.Item
                name='timing'
                label='Thời gian uống cụ thể'
                rules={[{ required: true, message: 'Vui lòng nhập thời gian uống!' }]}
              >
                <Input placeholder='VD: 08:00, 12:00, 20:00' />
              </Form.Item>

              <Form.Item
                name='duration'
                label='Thời gian sử dụng'
                rules={[{ required: true, message: 'Vui lòng chọn thời gian sử dụng!' }]}
              >
                <RangePicker className='w-full' format='DD/MM/YYYY' />
              </Form.Item>
            </div>
          </div>

          {/* 3. Lý do dùng thuốc */}
          <div className='bg-gray-50 p-6 rounded-xl mb-6'>
            <h2 className='text-lg font-semibold mb-4'>3. Lý do dùng thuốc</h2>
            <Form.Item
              name='reason'
              label='Lý do dùng thuốc'
              rules={[{ required: true, message: 'Vui lòng nhập lý do dùng thuốc!' }]}
            >
              <TextArea rows={3} placeholder='VD: Hạ sốt, kháng sinh điều trị viêm họng' />
            </Form.Item>

            <Form.Item name='note' label='Ghi chú đặc biệt'>
              <TextArea rows={3} placeholder='VD: Dị ứng, cần uống với sữa, không dùng khi đau bụng' />
            </Form.Item>
          </div>

          {/* 4. Xác nhận và cam kết */}
          <div className='bg-gray-50 p-6 rounded-xl mb-6'>
            <h2 className='text-lg font-semibold mb-4'>4. Xác nhận và cam kết</h2>
            <Form.Item
              name='agreement1'
              valuePropName='checked'
              rules={[
                {
                  validator: (_, value) =>
                    value ? Promise.resolve() : Promise.reject(new Error('Vui lòng xác nhận cam kết!'))
                }
              ]}
            >
              <Checkbox>
                Tôi cam kết thông tin trên là chính xác, thuốc còn hạn sử dụng và không gây hại đến sức khỏe của con
                tôi.
              </Checkbox>
            </Form.Item>

            <Form.Item
              name='agreement2'
              valuePropName='checked'
              rules={[
                {
                  validator: (_, value) =>
                    value ? Promise.resolve() : Promise.reject(new Error('Vui lòng xác nhận đồng ý!'))
                }
              ]}
            >
              <Checkbox>
                Tôi đồng ý để nhân viên y tế nhà trường hỗ trợ cho con tôi uống thuốc theo thông tin trên.
              </Checkbox>
            </Form.Item>
          </div>

          <Form.Item>
            <Button type='primary' htmlType='submit' className='bg-blue-500 w-full h-12 text-lg' loading={loading}>
              Gửi yêu cầu
            </Button>
          </Form.Item>
        </Form>
      </div>
    </Spin>
  )
}

export default CreateSubmission
