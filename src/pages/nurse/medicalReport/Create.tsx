import type React from 'react'
import { useEffect, useState } from 'react'
import {
  Button,
  Col,
  Form,
  Input,
  message,
  Row,
  Select,
  Typography,
  DatePicker,
  Upload,
  Card,
  Space,
  Tag,
  InputNumber,
  Alert,
  Tooltip,
  Badge
} from 'antd'
import {
  UserOutlined,
  MedicineBoxOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  CameraOutlined,
  PlusOutlined,
  ReloadOutlined,
  InfoCircleOutlined,
  WarningOutlined,
  CloseOutlined
} from '@ant-design/icons'
import { debounce } from 'lodash'
import {
  type CreateMedicalEventRequest,
  medicalEventApi,
  MedicalEventStatus,
  SeverityLevel,
  LeaveMethod,
  ParentContactStatus
} from '../../../api/medicalEvent.api'
import type { MedicalSupply } from '../../../api/medicalSupplies.api'
import { getAllMedicalSupplies } from '../../../api/medicalSupplies.api'
import type { Medicine } from '../../../api/medicines.api'
import { getMedicines } from '../../../api/medicines.api'
import type { StudentProfile } from '../../../api/student.api'
import { getStudentsAPI } from '../../../api/student.api'
import { useAuth } from '../../../contexts/auth.context'
import { handleUploadFile } from '../../../utils/upload'
import dayjs from 'dayjs'

const { TextArea } = Input
const { Text } = Typography

interface CreateMedicalEventFormProps {
  onSuccess: () => void
}

const CreateMedicalEventForm: React.FC<CreateMedicalEventFormProps> = ({ onSuccess }) => {
  const [form] = Form.useForm()
  const [medicines, setMedicines] = useState<Medicine[]>([])
  const [medicalSupplies, setMedicalSupplies] = useState<MedicalSupply[]>([])
  const [students, setStudents] = useState<StudentProfile[]>([])
  const [loading, setLoading] = useState(false)
  const [studentLoading, setStudentLoading] = useState(false)
  const { user } = useAuth()
  const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(null)
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [selectedMedicines, setSelectedMedicines] = useState<{ id: string; quantity: number }[]>([])
  const [selectedSupplies, setSelectedSupplies] = useState<{ id: string; quantity: number }[]>([])
  const [actions, setActions] = useState<{ time: string; description: string; performedBy?: string }[]>([])
  const [parentContactStatus, setParentContactStatus] = useState<ParentContactStatus | undefined>()
  const [parentContactedAt, setParentContactedAt] = useState<string | undefined>()

  useEffect(() => {
    fetchMedicinesAndSupplies()
    fetchStudents('')
  }, [])

  const fetchMedicinesAndSupplies = async () => {
    try {
      setLoading(true)
      const [medicinesResponse, suppliesResponse] = await Promise.all([
        getMedicines(1, 100),
        getAllMedicalSupplies(1, 100)
      ])
      setMedicines(medicinesResponse.pageData)
      setMedicalSupplies(suppliesResponse.pageData)
    } catch (error: unknown) {
      console.log('error', error)
      const err = error as { message?: string }
      if (err.message) {
        message.error(err.message)
      } else {
        message.error('Không thể tải danh sách thuốc và vật tư y tế')
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchStudents = async (keyword: string) => {
    try {
      setStudentLoading(true)
      const response = await getStudentsAPI(100, 1, keyword.trim())
      if (response && response.pageData) {
        setStudents(response.pageData)
      } else {
        message.error('Dữ liệu học sinh không đúng định dạng')
        setStudents([])
      }
    } catch (error: unknown) {
      console.log('error', error)
      const err = error as { message?: string }
      if (err.message) {
        message.error(err.message)
      } else {
        message.error('Không thể tải danh sách học sinh')
      }
      setStudents([])
    } finally {
      setStudentLoading(false)
    }
  }

  const debouncedFetchStudents = debounce((value: string) => {
    fetchStudents(value || '')
  }, 300)

  const onFinish = async (values: CreateMedicalEventRequest) => {
    try {
      if (!user) {
        message.error('Không tìm thấy thông tin y tá')
        return
      }

      const medicinesUsed = selectedMedicines.map((item) => ({ medicineId: item.id, quantity: item.quantity }))
      const medicalSuppliesUsed = selectedSupplies.map((item) => ({ supplyId: item.id, quantity: item.quantity }))

      const medicalEventData: CreateMedicalEventRequest = {
        ...values,
        initialCondition: values.initialCondition,
        firstAid: values.firstAid,
        actions,
        parentContactStatus,
        parentContactedAt,
        medicinesUsed,
        medicalSuppliesUsed,
        schoolNurseId: user.id,
        images: imageUrls,
        leaveTime: values.leaveTime
          ? typeof values.leaveTime === 'string'
            ? values.leaveTime
            : values.leaveTime.toISOString()
          : undefined
      }

      await medicalEventApi.create(medicalEventData)
      // message.success('Tạo sự kiện y tế thành công!')
      form.resetFields()
      setSelectedStudent(null)
      setImageUrls([])
      setSelectedMedicines([])
      setSelectedSupplies([])
      setActions([])
      setParentContactStatus(undefined)
      setParentContactedAt(undefined)
      onSuccess()
    } catch (error: unknown) {
      console.log('error', error)
      const err = error as { message?: string }
      if (err.message) {
        message.error(err.message)
      } else {
        message.error('Có lỗi xảy ra khi tạo sự kiện y tế!')
      }
    }
  }

  const eventTypes = [
    { value: 'sốt', label: 'Sốt', color: 'red' },
    { value: 'té ngã', label: 'Té ngã', color: 'orange' },
    { value: 'đau bụng', label: 'Đau bụng', color: 'green' },
    { value: 'đau đầu', label: 'Đau đầu', color: 'blue' },
    { value: 'dị ứng', label: 'Dị ứng', color: 'purple' },
    { value: 'dịch bệnh', label: 'Dịch bệnh', color: 'volcano' }
  ]

  const parentContactStatusOptions = [
    { value: ParentContactStatus.NOT_CONTACTED, label: 'Chưa liên hệ' },
    { value: ParentContactStatus.CONTACTING, label: 'Đang liên hệ' },
    { value: ParentContactStatus.CONTACTED, label: 'Đã liên hệ' }
  ]

  const resetForm = () => {
    form.resetFields()
    setSelectedStudent(null)
    setImageUrls([])
    setSelectedMedicines([])
    setSelectedSupplies([])
    setActions([])
    setParentContactStatus(undefined)
    setParentContactedAt(undefined)
  }

  return (
    <div style={{ maxWidth: '100%', padding: '0' }}>
      <Form form={form} layout='vertical' onFinish={onFinish}>
        {/* Student Information Section */}
        <Card
          title={
            <Space>
              <UserOutlined style={{ color: '#1890ff' }} />
              <Text strong>Thông tin học sinh</Text>
            </Space>
          }
          size='small'
          style={{ marginBottom: '16px' }}
        >
          <Row gutter={24}>
            <Col span={selectedStudent ? 12 : 24}>
              <Form.Item
                name='studentId'
                label='Chọn học sinh'
                rules={[{ required: true, message: 'Vui lòng chọn học sinh!' }]}
              >
                <Select
                  showSearch
                  placeholder='Tìm kiếm học sinh theo tên hoặc mã'
                  loading={studentLoading}
                  filterOption={false}
                  allowClear
                  size='large'
                  notFoundContent={studentLoading ? 'Đang tải...' : 'Không tìm thấy học sinh'}
                  onSearch={debouncedFetchStudents}
                  onChange={(val) => {
                    const stu = students.find((s) => s._id === val)
                    setSelectedStudent(stu || null)
                  }}
                  onClear={() => {
                    setSelectedStudent(null)
                    fetchStudents('')
                  }}
                  onDropdownVisibleChange={(open) => {
                    if (open && students.length === 0) {
                      fetchStudents('')
                    }
                  }}
                  options={students.map((student) => {
                    const studentClass = student.class as unknown
                    let className = ''
                    if (typeof studentClass === 'object' && studentClass !== null && 'name' in studentClass) {
                      className = (studentClass as { name?: string }).name || ''
                    } else if (typeof studentClass === 'string') {
                      className = studentClass
                    }
                    return {
                      value: student._id,
                      label: `${student.fullName} - ${student.studentIdCode} - ${className}`
                    }
                  })}
                />
              </Form.Item>
            </Col>
            {selectedStudent && (
              <Col span={12}>
                <Card size='small' style={{ backgroundColor: '#f6ffed', border: '1px solid #b7eb8f' }}>
                  <Space direction='vertical' size={4}>
                    <Text strong style={{ color: '#52c41a' }}>
                      Thông tin học sinh đã chọn:
                    </Text>
                    <div>
                      <Text strong>Họ tên: </Text>
                      <Text>{selectedStudent.fullName}</Text>
                    </div>
                    <div>
                      <Text strong>Mã học sinh: </Text>
                      <Text>{selectedStudent.studentIdCode}</Text>
                    </div>
                    <div>
                      <Text strong>Lớp: </Text>
                      <Text>
                        {typeof selectedStudent.class === 'object'
                          ? selectedStudent.class?.name
                          : selectedStudent.class || ''}
                      </Text>
                    </div>
                  </Space>
                </Card>
              </Col>
            )}
          </Row>
        </Card>

        {/* Event Information Section */}
        <Card
          title={
            <Space>
              <FileTextOutlined style={{ color: '#1890ff' }} />
              <Text strong>Thông tin sự kiện</Text>
            </Space>
          }
          size='small'
          style={{ marginBottom: '16px' }}
        >
          <Row gutter={24}>
            <Col span={24}>
              <Form.Item
                name='eventName'
                label='Tên sự kiện'
                rules={[{ required: true, message: 'Vui lòng chọn tên sự kiện!' }]}
              >
                <Select placeholder='Chọn tên sự kiện' size='large'>
                  {eventTypes.map((type) => (
                    <Select.Option key={type.value} value={type.value}>
                      <Tag color={type.color} style={{ margin: 0 }}>
                        {type.label}
                      </Tag>
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name='description'
            label='Mô tả chi tiết'
            rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}
          >
            <TextArea rows={4} placeholder='Nhập mô tả chi tiết về sự kiện...' />
          </Form.Item>

          <Form.Item
            name='actionTaken'
            label='Biện pháp xử lý'
            rules={[{ required: true, message: 'Vui lòng nhập biện pháp xử lý!' }]}
          >
            <TextArea rows={3} placeholder='Nhập biện pháp xử lý đã thực hiện...' />
          </Form.Item>
        </Card>

        {/* Medicine and Supplies Section */}
        <Card
          title={
            <Space>
              <MedicineBoxOutlined style={{ color: '#1890ff' }} />
              <Text strong>Thuốc và vật tư y tế sử dụng</Text>
            </Space>
          }
          size='small'
          style={{ marginBottom: '16px' }}
        >
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item label='Thuốc sử dụng'>
                <Select
                  mode='multiple'
                  placeholder='Chọn thuốc'
                  loading={loading}
                  size='large'
                  showSearch
                  filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                  value={selectedMedicines.map((m) => m.id)}
                  onChange={(ids: string[]) => {
                    setSelectedMedicines((prev) => {
                      return ids.map((id) => {
                        const found = prev.find((m) => m.id === id)
                        return { id, quantity: found?.quantity || 1 }
                      })
                    })
                  }}
                  options={medicines.map((medicine) => ({
                    value: medicine._id,
                    label: `${medicine.name} (Còn: ${medicine.quantity} viên)`
                  }))}
                />
                {selectedMedicines.length > 0 && (
                  <div style={{ marginTop: 12 }}>
                    <Text strong style={{ marginBottom: 8, display: 'block' }}>
                      Thuốc đã chọn:
                    </Text>
                    {selectedMedicines.map((item) => {
                      const med = medicines.find((m) => m._id === item.id)
                      if (!med) return null
                      return (
                        <Card
                          key={item.id}
                          size='small'
                          style={{ marginBottom: 8, backgroundColor: '#fafafa' }}
                          bodyStyle={{ padding: '8px 12px' }}
                        >
                          <Row align='middle' justify='space-between'>
                            <Col flex='1'>
                              <Space direction='vertical' size={0}>
                                <Text strong>{med.name}</Text>
                                <Text type='secondary' style={{ fontSize: '12px' }}>
                                  Số lượng còn lại: {med.quantity} viên
                                </Text>
                              </Space>
                            </Col>
                            <Col>
                              <Space align='center'>
                                <Text>Số lượng:</Text>
                                <InputNumber
                                  size='small'
                                  min={1}
                                  max={med.quantity}
                                  value={item.quantity}
                                  onChange={(val) => {
                                    const newVal = Math.max(1, Math.min(val || 1, med.quantity))
                                    setSelectedMedicines((prev) =>
                                      prev.map((m) => (m.id === item.id ? { ...m, quantity: newVal } : m))
                                    )
                                  }}
                                  style={{ width: 80 }}
                                />
                                <Text type='secondary'>viên</Text>
                              </Space>
                            </Col>
                          </Row>
                        </Card>
                      )
                    })}
                  </div>
                )}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label='Vật tư y tế sử dụng'>
                <Select
                  mode='multiple'
                  placeholder='Chọn vật tư y tế'
                  loading={loading}
                  size='large'
                  showSearch
                  filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                  value={selectedSupplies.map((s) => s.id)}
                  onChange={(ids: string[]) => {
                    setSelectedSupplies((prev) => {
                      return ids.map((id) => {
                        const found = prev.find((s) => s.id === id)
                        return { id, quantity: found?.quantity || 1 }
                      })
                    })
                  }}
                  options={medicalSupplies
                    .filter((sup) => sup.quantity > 0)
                    .map((supply) => ({
                      value: supply._id,
                      label: `${supply.name} (Còn: ${supply.quantity} ${supply.unit || 'thiết bị'})`
                    }))}
                />
                {selectedSupplies.length > 0 && (
                  <div style={{ marginTop: 12 }}>
                    <Text strong style={{ marginBottom: 8, display: 'block' }}>
                      Vật tư đã chọn:
                    </Text>
                    {selectedSupplies.map((item) => {
                      const sup = medicalSupplies.find((s) => s._id === item.id)
                      if (!sup) return null
                      return (
                        <Card
                          key={item.id}
                          size='small'
                          style={{ marginBottom: 8, backgroundColor: '#fafafa' }}
                          bodyStyle={{ padding: '8px 12px' }}
                        >
                          <Row align='middle' justify='space-between'>
                            <Col flex='1'>
                              <Space direction='vertical' size={0}>
                                <Text strong>{sup.name}</Text>
                                <Text type='secondary' style={{ fontSize: '12px' }}>
                                  Số lượng còn lại: {sup.quantity} {sup.unit || 'thiết bị'}
                                </Text>
                              </Space>
                            </Col>
                            <Col>
                              <Space align='center'>
                                <Text>Số lượng:</Text>
                                <InputNumber
                                  size='small'
                                  min={1}
                                  max={sup.quantity}
                                  value={item.quantity}
                                  onChange={(val) => {
                                    const newVal = Math.max(1, Math.min(val || 1, sup.quantity))
                                    setSelectedSupplies((prev) =>
                                      prev.map((s) => (s.id === item.id ? { ...s, quantity: newVal } : s))
                                    )
                                  }}
                                  style={{ width: 80 }}
                                />
                                <Text type='secondary'>{sup.unit || 'thiết bị'}</Text>
                              </Space>
                            </Col>
                          </Row>
                        </Card>
                      )
                    })}
                  </div>
                )}
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Status and Time Section */}
        <Card
          title={
            <Space>
              <ClockCircleOutlined style={{ color: '#1890ff' }} />
              <Text strong>Trạng thái và thời gian</Text>
            </Space>
          }
          size='small'
          style={{ marginBottom: '16px' }}
        >
          <Row gutter={24}>
            {/* <Col span={8}>
              <Form.Item name='severityLevel' label='Mức độ nghiêm trọng'>
                <Select placeholder='Chọn mức độ' size='large'>
                  <Select.Option value={SeverityLevel.MILD}>
                    <Tag color='green'>Nhẹ</Tag>
                  </Select.Option>
                  <Select.Option value={SeverityLevel.MODERATE}>
                    <Tag color='orange'>Trung bình</Tag>
                  </Select.Option>
                  <Select.Option value={SeverityLevel.SEVERE}>
                    <Tag color='red'>Nặng</Tag>
                  </Select.Option>
                </Select>
              </Form.Item>
            </Col> */}
            <Col span={8}>
              <Form.Item name='status' label='Trạng thái xử lý'>
                <Select placeholder='Chọn trạng thái' size='large'>
                  <Select.Option value={MedicalEventStatus.TREATED}>
                    <Badge status='success' text='Đã xử lý' />
                  </Select.Option>
                  <Select.Option value={MedicalEventStatus.MONITORING}>
                    <Badge status='processing' text='Theo dõi' />
                  </Select.Option>
                  <Select.Option value={MedicalEventStatus.TRANSFERRED}>
                    <Badge status='warning' text='Chuyển viện' />
                  </Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name='leaveMethod' label='Cách rời khỏi'>
                <Select placeholder='Chọn cách rời khỏi' size='large'>
                  <Select.Option value={LeaveMethod.NONE}>Không</Select.Option>
                  <Select.Option value={LeaveMethod.PARENT_PICKUP}>Phụ huynh đón</Select.Option>
                  <Select.Option value={LeaveMethod.HOSPITAL_TRANSFER}>Chuyển viện</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                name='leaveTime'
                label={
                  <Space>
                    <Text>Thời gian xảy ra sự kiện</Text>
                    <Tooltip title='Chỉ được chọn trong vòng 7 ngày gần đây, từ 7:00 đến 17:00'>
                      <InfoCircleOutlined style={{ color: '#1890ff' }} />
                    </Tooltip>
                  </Space>
                }
                rules={[
                  {
                    required: false,
                    validator: (_, value) => {
                      if (!value) return Promise.resolve()
                      const now = new Date()
                      const selected = value.toDate ? value.toDate() : value
                      const diff = now.getTime() - selected.getTime()
                      const sevenDays = 7 * 24 * 60 * 60 * 1000

                      if (selected > now) {
                        return Promise.reject('Không được chọn ngày trong tương lai!')
                      }
                      if (diff > sevenDays) {
                        return Promise.reject('Chỉ được chọn trong vòng 7 ngày trở lại đây!')
                      }

                      const hour = selected.getHours()
                      if (hour < 7 || hour > 17 || (hour === 17 && selected.getMinutes() > 0)) {
                        return Promise.reject('Chỉ được chọn thời gian từ 7:00 đến 17:00!')
                      }
                      return Promise.resolve()
                    }
                  }
                ]}
              >
                <DatePicker
                  showTime
                  style={{ width: '100%' }}
                  size='large'
                  placeholder='Chọn thời gian xảy ra sự kiện'
                  disabledDate={(current) => {
                    const now = new Date()
                    const sevenDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7, 0, 0, 0, 0)
                    return current && (current.toDate() > now || current.toDate() < sevenDaysAgo)
                  }}
                />
              </Form.Item>
              <Alert
                message='Lưu ý về thời gian'
                description='Chỉ được chọn thời gian trong vòng 7 ngày gần đây và trong giờ học (7:00 - 17:00)'
                type='info'
                showIcon
                icon={<WarningOutlined />}
                style={{ marginTop: 8 }}
              />
            </Col>
            <Col span={12}>
              <Form.Item name='pickedUpBy' label='Người đón'>
                <Input placeholder='Nhập tên người đón (nếu có)' size='large' />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Images and Notes Section */}
        <Card
          title={
            <Space>
              <CameraOutlined style={{ color: '#1890ff' }} />
              <Text strong>Ảnh minh họa và ghi chú</Text>
            </Space>
          }
          size='small'
          style={{ marginBottom: '24px' }}
        >
          <Form.Item name='images' label='Ảnh minh họa'>
            <Upload
              listType='picture-card'
              customRequest={async (options) => {
                const { file, onSuccess, onError } = options as any
                const url = await handleUploadFile(file as File, 'image')
                if (url) {
                  setImageUrls((prev) => {
                    const newArr = [...prev, url]
                    form.setFieldsValue({ images: newArr })
                    return newArr
                  })
                  if (onSuccess) onSuccess('ok')
                } else {
                  if (onError) onError(new Error('Upload failed'))
                }
              }}
              fileList={imageUrls.map((url, idx) => ({
                uid: url,
                name: `Ảnh ${idx + 1}`,
                status: 'done',
                url
              }))}
              onRemove={(file) => {
                setImageUrls((prev) => {
                  const newArr = prev.filter((url) => url !== file.url)
                  form.setFieldsValue({ images: newArr })
                  return newArr
                })
                return true
              }}
              accept='image/*'
              multiple
            >
              {imageUrls.length >= 8 ? null : (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Tải ảnh lên</div>
                </div>
              )}
            </Upload>
          </Form.Item>

          <Form.Item name='notes' label='Ghi chú thêm'>
            <TextArea rows={3} placeholder='Nhập ghi chú thêm nếu cần...' />
          </Form.Item>
        </Card>

        {/* New Fields for Create Medical Event */}
        <Card
          title={
            <Space>
              <InfoCircleOutlined style={{ color: '#1890ff' }} />
              <Text strong>Thông tin chi tiết sự kiện</Text>
            </Space>
          }
          size='small'
          style={{ marginBottom: '16px' }}
        >
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item label="Tình trạng ban đầu" name="initialCondition">
                <Input placeholder="Nhập tình trạng ban đầu của học sinh" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Sơ cứu ban đầu" name="firstAid">
                <Input placeholder="Nhập biện pháp sơ cứu ban đầu (nếu có)" />
              </Form.Item>
            </Col>
          </Row>
          {/* Danh sách thao tác xử lý */}
          <Form.Item label="Các thao tác xử lý">
            {/* Đơn giản: cho phép thêm nhiều thao tác với thời gian, mô tả, performedBy (tùy chọn) */}
            {/* Có thể dùng Table hoặc List, ở đây dùng List đơn giản */}
            <Button type="dashed" onClick={() => setActions([...actions, { time: new Date().toISOString(), description: '' }])} icon={<PlusOutlined />}>Thêm thao tác</Button>
            {actions.map((action, idx) => (
              <Space key={idx} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                <DatePicker
                  showTime
                  value={action.time ? dayjs(action.time) : undefined}
                  onChange={date => {
                    const newActions = [...actions]
                    newActions[idx].time = date ? date.toISOString() : ''
                    setActions(newActions)
                  }}
                />
                <Input
                  placeholder="Mô tả thao tác"
                  value={action.description}
                  onChange={e => {
                    const newActions = [...actions]
                    newActions[idx].description = e.target.value
                    setActions(newActions)
                  }}
                />
                <Input
                  placeholder="Người thực hiện (tùy chọn)"
                  value={action.performedBy}
                  onChange={e => {
                    const newActions = [...actions]
                    newActions[idx].performedBy = e.target.value
                    setActions(newActions)
                  }}
                />
                <Button danger icon={<CloseOutlined />} onClick={() => setActions(actions.filter((_, i) => i !== idx))} />
              </Space>
            ))}
          </Form.Item>
          <Form.Item label="Trạng thái liên hệ phụ huynh">
            <Select
              options={parentContactStatusOptions}
              value={parentContactStatus}
              onChange={setParentContactStatus}
              placeholder="Chọn trạng thái liên hệ phụ huynh"
              allowClear
            />
          </Form.Item>
          <Form.Item label="Thời gian liên hệ phụ huynh">
            <DatePicker
              showTime
              value={parentContactedAt ? dayjs(parentContactedAt) : undefined}
              onChange={date => setParentContactedAt(date ? date.toISOString() : undefined)}
              placeholder="Chọn thời gian liên hệ phụ huynh"
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Card>

        {/* Action Buttons */}
        <Card size='small'>
          <Row justify='center'>
            <Col>
              <Space size='large'>
                <Button type='primary' htmlType='submit' size='large' icon={<PlusOutlined />}>
                  Tạo sự kiện y tế
                </Button>
                <Button onClick={resetForm} size='large' icon={<ReloadOutlined />}>
                  Làm mới form
                </Button>
              </Space>
            </Col>
          </Row>
        </Card>
      </Form>
    </div>
  )
}

export default CreateMedicalEventForm
