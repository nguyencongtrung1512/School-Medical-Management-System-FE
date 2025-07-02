// import type React from 'react'
// import { useState, useEffect } from 'react'
// import {
//   Button,
//   Table,
//   Tag,
//   Space,
//   Card,
//   Typography,
//   Tabs,
//   Input,
//   Row,
//   Col,
//   Modal,
//   message,
//   Select,
//   Statistic,
//   Badge,
//   Tooltip,
//   Divider
// } from 'antd'
// import {
//   SearchOutlined,
//   FilterOutlined,
//   PlusOutlined,
//   EyeOutlined,
//   DeleteOutlined,
//   CalendarOutlined,
//   MedicineBoxOutlined,
//   EnvironmentOutlined,
//   TeamOutlined,
//   ClockCircleOutlined,
//   BarChartOutlined,
//   CheckCircleOutlined,
//   CloseCircleOutlined
// } from '@ant-design/icons'
// import type { TabsProps } from 'antd'
// import type { ColumnsType } from 'antd/es/table'
// import { getAllVaccineEvents, updateVaccineEvent, type VaccineEventStatus } from '../../../api/vaccineEvent.api'
// import { getGradesAPI } from '../../../api/grade.api'
// import dayjs from 'dayjs'
// import CreateVaccineEvent from './CreateVaccineEvent'
// import UpdateVaccineEvent from './UpdateVaccineEvent'
// import { toast } from 'react-toastify'

// const { Title, Text } = Typography
// const { Search } = Input
// const { Option } = Select

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

// interface VaccineEvent {
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
//   totalStudents?: number
//   confirmed?: number
//   rejected?: number
//   pending?: number
//   isDeleted?: boolean
// }

// const ScheduleVaccination: React.FC = () => {
//   const [activeTab, setActiveTab] = useState('1')
//   const [searchText, setSearchText] = useState('')
//   const [filters, setFilters] = useState({
//     gradeId: undefined,
//     status: undefined
//   })
//   const [selectedEvent, setSelectedEvent] = useState<VaccineEvent | null>(null)
//   const [isModalOpen, setIsModalOpen] = useState(false)
//   const [events, setEvents] = useState<VaccineEvent[]>([])
//   const [grades, setGrades] = useState<Grade[]>([])
//   const [loading, setLoading] = useState(false)

//   useEffect(() => {
//     fetchGrades()
//     fetchEvents()
//   }, [])

//   const fetchGrades = async () => {
//     try {
//       const response = (await getGradesAPI()) as unknown as ApiResponse<Grade>
//       setGrades(response.pageData)
//     } catch {
//       message.error('Không thể tải danh sách khối lớp')
//     }
//   }

//   const fetchEvents = async () => {
//     try {
//       setLoading(true)
//       const response = (await getAllVaccineEvents(1, 10)) as unknown as ApiResponse<VaccineEvent>
//       setEvents(response.pageData)
//     } catch {
//       message.error('Không thể tải danh sách sự kiện')
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleSearch = (value: string) => {
//     setSearchText(value)
//   }

//   const handleFilterChange = (key: string, value: string | undefined) => {
//     setFilters((prev) => ({ ...prev, [key]: value }))
//   }

//   const handleViewDetails = (record: VaccineEvent) => {
//     console.log('Clicked view details for record:', record)
//     setSelectedEvent(record)
//     setIsModalOpen(true)
//   }

//   const handleCloseModal = () => {
//     setIsModalOpen(false)
//     setSelectedEvent(null)
//     fetchEvents() // Refresh list after closing modal
//   }

//   const handleCreateSuccess = () => {
//     fetchEvents()
//     setActiveTab('2')
//   }

//   const handleUpdateSuccess = () => {
//     fetchEvents()
//     setIsModalOpen(false)
//     setSelectedEvent(null)
//     toast.success('Cập nhật kế hoạch tiêm chủng thành công')
//   }

//   const handleDeleteEvent = async (_id: string) => {
//     try {
//       await updateVaccineEvent(_id, { isDeleted: true })
//       toast.success('Vô hiệu hóa kế hoạch tiêm chủng thành công')
//       fetchEvents()
//     } catch {
//       toast.error('Không thể vô hiệu hóa kế hoạch tiêm chủng')
//     }
//   }

//   const filteredData = events.filter((item) => {
//     const matchesSearch =
//       item.title.toLowerCase().includes(searchText.toLowerCase()) ||
//       item.vaccineName.toLowerCase().includes(searchText.toLowerCase())
//     const matchesFilters =
//       (!filters.gradeId || item.gradeId === filters.gradeId) && (!filters.status || item.status === filters.status)
//     const notDeleted = !item.isDeleted // Only show if not deleted

//     return matchesSearch && matchesFilters && notDeleted
//   })

//   const getStatusConfig = (status: VaccineEventStatus) => {
//     const configs = {
//       ongoing: { color: 'processing', text: 'Đang diễn ra', icon: <ClockCircleOutlined /> },
//       completed: { color: 'success', text: 'Hoàn thành', icon: <CheckCircleOutlined /> },
//       cancelled: { color: 'error', text: 'Đã hủy', icon: <CloseCircleOutlined /> }
//     }
//     return configs[status] || { color: 'default', text: status, icon: null }
//   }

//   const getGradeName = (gradeId: string) => {
//     const grade = grades.find((g) => g._id === gradeId)
//     return grade?.name || 'N/A'
//   }

//   // Statistics
//   const stats = {
//     total: filteredData.length,
//     ongoing: filteredData.filter((e) => e.status === 'ongoing').length,
//     completed: filteredData.filter((e) => e.status === 'completed').length,
//     cancelled: filteredData.filter((e) => e.status === 'cancelled').length
//   }

//   const columns: ColumnsType<VaccineEvent> = [
//     {
//       title: 'Thông tin sự kiện',
//       key: 'info',
//       render: (_, record) => (
//         <div>
//           <div className='font-semibold text-gray-800 mb-1'>{record.title}</div>
//           <div className='flex items-center text-sm text-gray-600 mb-1'>
//             <MedicineBoxOutlined className='mr-1' />
//             {record.vaccineName}
//           </div>
//           <div className='flex items-center text-sm text-gray-600'>
//             <TeamOutlined className='mr-1' />
//             {getGradeName(record.gradeId)}
//           </div>
//         </div>
//       )
//     },
//     {
//       title: 'Địa điểm & Thời gian',
//       key: 'location_time',
//       render: (_, record) => (
//         <div>
//           <div className='flex items-center text-sm mb-2'>
//             <EnvironmentOutlined className='mr-1 text-blue-500' />
//             <span className='font-medium'>{record.location}</span>
//           </div>
//           <div className='text-xs text-gray-600'>
//             <div className='mb-1'>
//               <CalendarOutlined className='mr-1' />
//               Từ: {dayjs(record.startDate).format('DD/MM/YYYY HH:mm')}
//             </div>
//             <div>
//               <CalendarOutlined className='mr-1' />
//               Đến: {dayjs(record.endDate).format('DD/MM/YYYY HH:mm')}
//             </div>
//           </div>
//         </div>
//       )
//     },
//     {
//       title: 'Hạn đăng ký',
//       dataIndex: 'registrationDeadline',
//       key: 'registrationDeadline',
//       render: (date) => (
//         <div className='text-center'>
//           <div className='text-sm font-medium'>{dayjs(date).format('DD/MM/YYYY')}</div>
//           <div className='text-xs text-gray-500'>{dayjs(date).format('HH:mm')}</div>
//         </div>
//       )
//     },
//     {
//       title: 'Trạng thái',
//       dataIndex: 'status',
//       key: 'status',
//       filters: [
//         { text: 'Đang diễn ra', value: 'ongoing' },
//         { text: 'Hoàn thành', value: 'completed' },
//         { text: 'Đã hủy', value: 'cancelled' }
//       ],
//       onFilter: (value, record) => record.status === value,
//       render: (status: VaccineEventStatus) => {
//         const config = getStatusConfig(status)
//         return (
//           <Tag color={config.color} icon={config.icon}>
//             {config.text}
//           </Tag>
//         )
//       }
//     },
//     {
//       title: 'Hành động',
//       key: 'action',
//       render: (_, record) => (
//         <Space>
//           <Tooltip title='Xem chi tiết'>
//             <Button type='primary' size='small' icon={<EyeOutlined />} onClick={() => handleViewDetails(record)}>
//               Chi tiết
//             </Button>
//           </Tooltip>
//           <Tooltip title='Xóa kế hoạch'>
//             <Button
//               type='primary'
//               danger
//               size='small'
//               icon={<DeleteOutlined />}
//               onClick={() => handleDeleteEvent(record._id)}
//             >
//               Xóa
//             </Button>
//           </Tooltip>
//         </Space>
//       )
//     }
//   ]

//   const items: TabsProps['items'] = [
//     {
//       key: '1',
//       label: (
//         <span>
//           <PlusOutlined />
//           Lập kế hoạch mới
//         </span>
//       ),
//       children: <CreateVaccineEvent onSuccess={handleCreateSuccess} />
//     },
//     {
//       key: '2',
//       label: (
//         <span>
//           <BarChartOutlined />
//           Danh sách kế hoạch
//           <Badge count={stats.total} style={{ marginLeft: 8 }} />
//         </span>
//       ),
//       children: (
//         <div>
//           {/* Statistics Cards */}
//           <Row gutter={[16, 16]} className='mb-6'>
//             <Col xs={12} sm={6}>
//               <Card className='text-center'>
//                 <Statistic title='Tổng số' value={stats.total} valueStyle={{ color: '#1890ff' }} />
//               </Card>
//             </Col>
//             <Col xs={12} sm={6}>
//               <Card className='text-center'>
//                 <Statistic title='Đang diễn ra' value={stats.ongoing} valueStyle={{ color: '#52c41a' }} />
//               </Card>
//             </Col>
//             <Col xs={12} sm={6}>
//               <Card className='text-center'>
//                 <Statistic title='Hoàn thành' value={stats.completed} valueStyle={{ color: '#13c2c2' }} />
//               </Card>
//             </Col>
//             <Col xs={12} sm={6}>
//               <Card className='text-center'>
//                 <Statistic title='Đã hủy' value={stats.cancelled} valueStyle={{ color: '#ff4d4f' }} />
//               </Card>
//             </Col>
//           </Row>

//           {/* Header */}
//           <div className='mb-4 flex justify-between items-center'>
//             <Title level={4} className='mb-0'>
//               <MedicineBoxOutlined className='mr-2' />
//               Danh sách kế hoạch tiêm chủng
//             </Title>
//             <Button type='primary' icon={<PlusOutlined />} onClick={() => setActiveTab('1')} size='large'>
//               Lập kế hoạch mới
//             </Button>
//           </div>

//           {/* Filters */}
//           <Card className='mb-4' style={{ borderRadius: '8px' }}>
//             <Row gutter={[16, 16]} align='middle'>
//               <Col xs={24} sm={12} md={8}>
//                 <Search
//                   placeholder='Tìm kiếm theo tiêu đề, vaccine...'
//                   allowClear
//                   enterButton={<SearchOutlined />}
//                   onSearch={handleSearch}
//                   onChange={(e) => handleSearch(e.target.value)}
//                   size='large'
//                 />
//               </Col>
//               <Col xs={24} sm={12} md={16}>
//                 <Space wrap>
//                   <Select
//                     placeholder='Chọn khối'
//                     allowClear
//                     style={{ width: 150 }}
//                     onChange={(value: string | undefined) => handleFilterChange('gradeId', value)}
//                     size='large'
//                   >
//                     {grades.map((grade) => (
//                       <Option key={grade._id} value={grade._id}>
//                         {grade.name}
//                       </Option>
//                     ))}
//                   </Select>
//                   <Select
//                     placeholder='Chọn trạng thái'
//                     allowClear
//                     style={{ width: 150 }}
//                     onChange={(value: string | undefined) => handleFilterChange('status', value)}
//                     size='large'
//                   >
//                     <Option value='ongoing'>Đang diễn ra</Option>
//                     <Option value='completed'>Hoàn thành</Option>
//                     <Option value='cancelled'>Đã hủy</Option>
//                   </Select>
//                   <Button
//                     icon={<FilterOutlined />}
//                     onClick={() =>
//                       setFilters({
//                         gradeId: undefined,
//                         status: undefined
//                       })
//                     }
//                     size='large'
//                   >
//                     Xóa bộ lọc
//                   </Button>
//                 </Space>
//               </Col>
//             </Row>
//           </Card>

//           {/* Table */}
//           <Card style={{ borderRadius: '8px' }}>
//             <Table
//               columns={columns}
//               dataSource={filteredData}
//               loading={loading}
//               rowKey='_id'
//               pagination={{
//                 pageSize: 10,
//                 showSizeChanger: true,
//                 showQuickJumper: true,
//                 showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} kế hoạch`,
//                 pageSizeOptions: ['5', '10', '20', '50']
//               }}
//               scroll={{ x: 800 }}
//               className='custom-table'
//             />
//           </Card>
//         </div>
//       )
//     }
//   ]

//   return (
//     <div className='p-6'>
//       <div className='mb-6'>
//         <Title level={2} className='mb-2'>
//           <MedicineBoxOutlined className='mr-3 text-blue-500' />
//           Quản lý kế hoạch tiêm chủng
//         </Title>
//         <Text type='secondary'>Tạo và quản lý các kế hoạch tiêm chủng cho học sinh</Text>
//       </div>

//       <Divider />

//       <Tabs
//         activeKey={activeTab}
//         items={items}
//         onChange={setActiveTab}
//         size='large'
//         className='custom-tabs'
//         tabBarStyle={{ marginBottom: 24 }}
//       />

//       <Modal
//         title={
//           <div className='flex items-center'>
//             <EyeOutlined className='mr-2 text-blue-500' />
//             Chi tiết kế hoạch tiêm chủng
//           </div>
//         }
//         open={isModalOpen}
//         onCancel={handleCloseModal}
//         width={900}
//         footer={null}
//         destroyOnClose
//       >
//         {selectedEvent && (
//           <UpdateVaccineEvent eventId={selectedEvent._id} onSuccess={handleUpdateSuccess} onCancel={handleCloseModal} />
//         )}
//       </Modal>

//       <style jsx global>{`
//         .custom-table .ant-table-thead > tr > th {
//           background-color: #fafafa;
//           font-weight: 600;
//         }
//         .custom-table .ant-table-tbody > tr:hover > td {
//           background-color: #f0f9ff;
//         }
//         .custom-tabs .ant-tabs-tab {
//           font-weight: 500;
//         }
//         .custom-tabs .ant-tabs-tab-active {
//           font-weight: 600;
//         }
//       `}</style>
//     </div>
//   )
// }

// export default ScheduleVaccination
