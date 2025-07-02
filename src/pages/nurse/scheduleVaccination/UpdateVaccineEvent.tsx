// import type React from 'react'
// import { useState, useEffect } from 'react'
// import {
//   Form,
//   Select,
//   DatePicker,
//   Button,
//   Card,
//   Input,
//   message,
//   Space,
//   Row,
//   Col,
//   Typography,
//   Divider,
//   Tag,
//   Spin
// } from 'antd'
// import {
//   CalendarOutlined,
//   EnvironmentOutlined,
//   MedicineBoxOutlined,
//   FileTextOutlined,
//   TeamOutlined,
//   BookOutlined,
//   EditOutlined,
//   CloseOutlined,
//   SaveOutlined,
//   ClockCircleOutlined
// } from '@ant-design/icons'
// import { getVaccineEventDetail, updateVaccineEvent, type VaccineEventStatus } from '../../../api/vaccineEvent.api'
// import { getGradesAPI } from '../../../api/grade.api'
// import dayjs from 'dayjs'
// import { toast } from 'react-toastify'

// const { Option } = Select
// const { Title, Text } = Typography
// const { TextArea } = Input

// interface Grade {
//   _id: string
//   name: string
// }

// interface ApiResponse<T> {
//   pageData: T[]
//   pageInfo: {
//     pageNum: string
//     pageSize: string
//     totalItems: number
//     totalPages: number
//   }
// }

// interface VaccineEventDetail {
//   _id: string
//   title: string
//   gradeId: string
//   description: string
//   vaccineName: string
//   location: string
//   startDate: string
//   endDate: string
//   status: VaccineEventStatus
//   registrationDeadline: string
//   schoolYear?: string
// }

// interface UpdateVaccineEventProps {
//   eventId: string
//   onSuccess: () => void
//   onCancel: () => void
// }

// interface FormValues {
//   title: string
//   gradeId: string
//   vaccineName: string
//   location: string
//   dateRange: [dayjs.Dayjs, dayjs.Dayjs]
//   registrationDeadline: dayjs.Dayjs
//   description: string
//   status: VaccineEventStatus
//   schoolYear: string
// }

// const UpdateVaccineEvent: React.FC<UpdateVaccineEventProps> = ({ eventId, onSuccess, onCancel }) => {
//   const [form] = Form.useForm()
//   const [grades, setGrades] = useState<Grade[]>([])
//   const [loading, setLoading] = useState(false)
//   const [initialLoading, setInitialLoading] = useState(true)

//   useEffect(() => {
//     fetchGrades()
//     if (eventId) {
//       fetchEventDetails(eventId)
//     }
//   }, [eventId])

//   const fetchGrades = async () => {
//     try {
//       const response = (await getGradesAPI()) as unknown as ApiResponse<Grade>
//       setGrades(response.pageData)
//     } catch {
//       message.error('Không thể tải danh sách khối lớp')
//     }
//   }

//   const fetchEventDetails = async (id: string) => {
//     try {
//       setInitialLoading(true)
//       const response = await getVaccineEventDetail(id)
//       const eventData = response.data as VaccineEventDetail

//       form.setFieldsValue({
//         ...eventData,
//         dateRange: [dayjs(eventData.startDate), dayjs(eventData.endDate)],
//         registrationDeadline: dayjs(eventData.registrationDeadline),
//         schoolYear: eventData.schoolYear || getDefaultSchoolYear()
//       })
//     } catch {
//       message.error('Không thể tải chi tiết sự kiện')
//     } finally {
//       setInitialLoading(false)
//     }
//   }

//   const handleSubmit = async (values: FormValues) => {
//     try {
//       setLoading(true)
//       const { dateRange, ...rest } = values

//       const data = {
//         ...rest,
//         startDate: dateRange[0].toISOString(),
//         endDate: dateRange[1].toISOString(),
//         registrationDeadline: values.registrationDeadline.toISOString(),
//         schoolYear: values.schoolYear
//       }

//       await updateVaccineEvent(eventId, data)
//       toast.success('Cập nhật kế hoạch tiêm chủng thành công')
//       onSuccess()
//     } catch {
//       message.error('Không thể cập nhật kế hoạch tiêm chủng')
//     } finally {
//       setLoading(false)
//     }
//   }

//   const getStatusColor = (status: VaccineEventStatus) => {
//     switch (status) {
//       case 'ongoing':
//         return 'processing'
//       case 'completed':
//         return 'success'
//       case 'cancelled':
//         return 'error'
//       default:
//         return 'default'
//     }
//   }

//   const getStatusText = (status: VaccineEventStatus) => {
//     switch (status) {
//       case 'ongoing':
//         return 'Đang diễn ra'
//       case 'completed':
//         return 'Đã hoàn thành'
//       case 'cancelled':
//         return 'Đã hủy'
//       default:
//         return status
//     }
//   }

//   if (initialLoading) {
//     return (
//       <div className='flex justify-center items-center min-h-[400px]'>
//         <Spin size='large' tip='Đang tải thông tin sự kiện...' />
//       </div>
//     )
//   }

//   return (
//     <div className='max-w-4xl mx-auto p-6'>
//       <Card className='shadow-lg' style={{ borderRadius: '12px' }}>
//         <div className='mb-6'>
//           <Title level={2} className='text-center mb-2'>
//             <EditOutlined className='mr-3 text-orange-500' />
//             Cập Nhật Kế Hoạch Tiêm Chủng
//           </Title>
//           <Text type='secondary' className='block text-center'>
//             Chỉnh sửa thông tin kế hoạch tiêm chủng
//           </Text>
//         </div>

//         <Divider />

//         <Form form={form} layout='vertical' onFinish={handleSubmit} size='large' className='mt-6'>
//           <Row gutter={[24, 16]}>
//             <Col xs={24} lg={12}>
//               <Form.Item
//                 name='title'
//                 label={
//                   <Space>
//                     <FileTextOutlined />
//                     <span>Tiêu đề sự kiện</span>
//                   </Space>
//                 }
//                 rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
//               >
//                 <Input placeholder='Nhập tiêu đề sự kiện tiêm chủng' className='rounded-lg' />
//               </Form.Item>
//             </Col>

//             <Col xs={24} lg={12}>
//               <Form.Item
//                 name='gradeId'
//                 label={
//                   <Space>
//                     <TeamOutlined />
//                     <span>Khối học</span>
//                   </Space>
//                 }
//                 rules={[{ required: true, message: 'Vui lòng chọn khối' }]}
//               >
//                 <Select placeholder='Chọn khối học' className='rounded-lg' showSearch optionFilterProp='children'>
//                   {grades.map((grade) => (
//                     <Option key={grade._id} value={grade._id}>
//                       {grade.name}
//                     </Option>
//                   ))}
//                 </Select>
//               </Form.Item>
//             </Col>

//             <Col xs={24} lg={12}>
//               <Form.Item
//                 name='vaccineName'
//                 label={
//                   <Space>
//                     <MedicineBoxOutlined />
//                     <span>Tên vaccine</span>
//                   </Space>
//                 }
//                 rules={[{ required: true, message: 'Vui lòng nhập tên vaccine' }]}
//               >
//                 <Input placeholder='Nhập tên vaccine (VD: Vaccine COVID-19)' className='rounded-lg' />
//               </Form.Item>
//             </Col>

//             <Col xs={24} lg={12}>
//               <Form.Item
//                 name='location'
//                 label={
//                   <Space>
//                     <EnvironmentOutlined />
//                     <span>Địa điểm tiêm</span>
//                   </Space>
//                 }
//                 rules={[{ required: true, message: 'Vui lòng nhập địa điểm' }]}
//               >
//                 <Input placeholder='Nhập địa điểm tiêm chủng' className='rounded-lg' />
//               </Form.Item>
//             </Col>

//             <Col xs={24} lg={12}>
//               <Form.Item
//                 name='dateRange'
//                 label={
//                   <Space>
//                     <CalendarOutlined />
//                     <span>Thời gian diễn ra</span>
//                   </Space>
//                 }
//                 rules={[{ required: true, message: 'Vui lòng chọn thời gian' }]}
//               >
//                 <DatePicker.RangePicker
//                   showTime
//                   format='DD/MM/YYYY HH:mm'
//                   className='w-full rounded-lg'
//                   placeholder={['Ngày bắt đầu', 'Ngày kết thúc']}
//                 />
//               </Form.Item>
//             </Col>

//             <Col xs={24} lg={12}>
//               <Form.Item
//                 name='registrationDeadline'
//                 label={
//                   <Space>
//                     <ClockCircleOutlined />
//                     <span>Hạn đăng ký</span>
//                   </Space>
//                 }
//                 rules={[{ required: true, message: 'Vui lòng chọn hạn đăng ký' }]}
//               >
//                 <DatePicker
//                   showTime
//                   format='DD/MM/YYYY HH:mm'
//                   className='w-full rounded-lg'
//                   placeholder='Chọn hạn cuối đăng ký'
//                 />
//               </Form.Item>
//             </Col>

//             <Col xs={24} lg={12}>
//               <Form.Item
//                 name='schoolYear'
//                 label={
//                   <Space>
//                     <BookOutlined />
//                     <span>Năm học</span>
//                   </Space>
//                 }
//                 rules={[{ required: true, message: 'Vui lòng nhập năm học' }]}
//               >
//                 <Input placeholder='VD: 2023-2024' className='rounded-lg' />
//               </Form.Item>
//             </Col>

//             <Col xs={24} lg={12}>
//               <Form.Item
//                 name='status'
//                 label={
//                   <Space>
//                     <Tag />
//                     <span>Trạng thái</span>
//                   </Space>
//                 }
//                 rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
//               >
//                 <Select placeholder='Chọn trạng thái' className='rounded-lg'>
//                   <Option value='ongoing'>
//                     <Tag color='processing'>Đang diễn ra</Tag>
//                   </Option>
//                   <Option value='completed'>
//                     <Tag color='success'>Đã hoàn thành</Tag>
//                   </Option>
//                   <Option value='cancelled'>
//                     <Tag color='error'>Đã hủy</Tag>
//                   </Option>
//                 </Select>
//               </Form.Item>
//             </Col>

//             <Col xs={24}>
//               <Form.Item
//                 name='description'
//                 label={
//                   <Space>
//                     <FileTextOutlined />
//                     <span>Mô tả chi tiết</span>
//                   </Space>
//                 }
//                 rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
//               >
//                 <TextArea
//                   rows={4}
//                   placeholder='Nhập mô tả chi tiết về sự kiện tiêm chủng, lưu ý quan trọng, yêu cầu chuẩn bị...'
//                   className='rounded-lg'
//                   showCount
//                   maxLength={500}
//                 />
//               </Form.Item>
//             </Col>
//           </Row>

//           <Divider />

//           <div className='text-center'>
//             <Space size='middle'>
//               <Button size='large' onClick={onCancel} className='rounded-lg min-w-[120px]' icon={<CloseOutlined />}>
//                 Hủy bỏ
//               </Button>
//               <Button
//                 type='primary'
//                 htmlType='submit'
//                 size='large'
//                 loading={loading}
//                 className='bg-orange-500 hover:bg-orange-600 rounded-lg min-w-[120px]'
//                 icon={<SaveOutlined />}
//               >
//                 {loading ? 'Đang cập nhật...' : 'Cập nhật kế hoạch'}
//               </Button>
//             </Space>
//           </div>
//         </Form>
//       </Card>
//     </div>
//   )
// }

// export default UpdateVaccineEvent

// function getDefaultSchoolYear() {
//   const now = dayjs()
//   const year = now.year()
//   if (now.month() + 1 < 6) {
//     return `${year - 1}-${year}`
//   } else {
//     return `${year}-${year + 1}`
//   }
// }
