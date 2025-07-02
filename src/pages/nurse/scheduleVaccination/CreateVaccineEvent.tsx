// import type React from 'react'
// import { useState, useEffect } from 'react'
// import { Form, Select, DatePicker, Button, Card, Input, message, Row, Col, Typography, Space, Divider } from 'antd'
// import {
//   CalendarOutlined,
//   EnvironmentOutlined,
//   MedicineBoxOutlined,
//   FileTextOutlined,
//   TeamOutlined,
//   BookOutlined
// } from '@ant-design/icons'
// import { createVaccineEvent } from '../../../api/vaccineEvent.api'
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

// interface CreateVaccineEventProps {
//   onSuccess: () => void
// }

// interface FormValues {
//   title: string
//   gradeId: string
//   vaccineName: string
//   location: string
//   dateRange: [dayjs.Dayjs, dayjs.Dayjs]
//   eventDate: dayjs.Dayjs
//   description: string
//   schoolYear: string
// }

// const CreateVaccineEvent: React.FC<CreateVaccineEventProps> = ({ onSuccess }) => {
//   const [form] = Form.useForm()
//   const [grades, setGrades] = useState<Grade[]>([])
//   const [loading, setLoading] = useState(false)
//   const [schoolYear, setSchoolYear] = useState<string>('')

//   useEffect(() => {
//     fetchGrades()
//     // Tính năm học mặc định
//     const now = dayjs()
//     const year = now.year()
//     let schoolYearValue = ''

//     if (now.month() + 1 < 6) {
//       // Trước tháng 6: năm học là (năm trước)-(năm hiện tại)
//       schoolYearValue = `${year - 1}-${year}`
//     } else {
//       // Từ tháng 6 trở đi: năm học là (năm hiện tại)-(năm sau)
//       schoolYearValue = `${year}-${year + 1}`
//     }

//     setSchoolYear(schoolYearValue)
//     form.setFieldsValue({ schoolYear: schoolYearValue })
//   }, [])

//   const fetchGrades = async () => {
//     try {
//       const response = await getGradesAPI()
//       setGrades(response.pageData)
//     } catch {
//       message.error('Không thể tải danh sách khối')
//     }
//   }

//   const handleSubmit = async (values: FormValues) => {
//     try {
//       setLoading(true)
//       const { dateRange, ...rest } = values

//       const data = {
//         ...rest,
//         startRegistrationDate: dateRange[0].toISOString(),
//         endRegistrationDate: dateRange[1].toISOString(),
//         eventDate: values.eventDate.toISOString(),
//         status: 'ongoing',
//         schoolYear: values.schoolYear
//       }
//       console.log('form subbmit', data)

//       await createVaccineEvent(data)
//       toast.success('Tạo kế hoạch tiêm chủng thành công')
//       form.resetFields()
//       onSuccess()
//     } catch {
//       message.error('Không thể tạo kế hoạch tiêm chủng')
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <div className='max-w-4xl mx-auto p-6'>
//       <Card className='shadow-lg' style={{ borderRadius: '12px' }}>
//         <div className='mb-6'>
//           <Title level={2} className='text-center mb-2'>
//             <MedicineBoxOutlined className='mr-3 text-blue-500' />
//             Tạo Kế Hoạch Tiêm Chủng
//           </Title>
//           <Text type='secondary' className='block text-center'>
//             Điền thông tin chi tiết để tạo kế hoạch tiêm chủng mới
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
//                     <span>Thời gian đăng ký</span>
//                   </Space>
//                 }
//                 rules={[
//                   { required: true, message: 'Vui lòng chọn thời gian đăng ký' },
//                   () => ({
//                     validator(_, value) {
//                       if (!value || !value[0]) return Promise.resolve()
//                       const now = dayjs()
//                       if (value[0].isBefore(now, 'minute')) {
//                         return Promise.reject('Ngày bắt đầu đăng ký không được nhỏ hơn hiện tại!')
//                       }
//                       return Promise.resolve()
//                     }
//                   })
//                 ]}
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
//                 name='eventDate'
//                 label={
//                   <Space>
//                     <CalendarOutlined />
//                     <span>Ngày diễn ra sự kiện</span>
//                   </Space>
//                 }
//                 rules={[
//                   { required: true, message: 'Vui lòng chọn ngày diễn ra sự kiện' },
//                   ({ getFieldValue }) => ({
//                     validator(_, value) {
//                       const dateRange = getFieldValue('dateRange')
//                       if (!value || !dateRange || !dateRange[1]) return Promise.resolve()
//                       if (value.isAfter(dateRange[1])) {
//                         return Promise.resolve()
//                       }
//                       return Promise.reject('Ngày diễn ra sự kiện phải lớn hơn thời gian đăng ký kết thúc!')
//                     }
//                   })
//                 ]}
//               >
//                 <DatePicker
//                   showTime
//                   format='DD/MM/YYYY HH:mm'
//                   className='w-full rounded-lg'
//                   placeholder='Chọn ngày và giờ diễn ra'
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
//                 <Input
//                   value={schoolYear}
//                   onChange={(e) => setSchoolYear(e.target.value)}
//                   placeholder='VD: 2023-2024'
//                   className='rounded-lg'
//                 />
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
//               <Button size='large' onClick={() => form.resetFields()} className='rounded-lg min-w-[120px]'>
//                 Đặt lại
//               </Button>
//               <Button
//                 type='primary'
//                 htmlType='submit'
//                 size='large'
//                 loading={loading}
//                 className='bg-blue-500 hover:bg-blue-600 rounded-lg min-w-[120px]'
//                 icon={<MedicineBoxOutlined />}
//               >
//                 {loading ? 'Đang tạo...' : 'Tạo kế hoạch'}
//               </Button>
//             </Space>
//           </div>
//         </Form>
//       </Card>
//     </div>
//   )
// }

// export default CreateVaccineEvent
