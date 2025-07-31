import {
  CameraOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  MedicineBoxOutlined,
  PhoneOutlined,
  PlusOutlined,
  ReloadOutlined,
  UserOutlined
} from '@ant-design/icons'
import {
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  message,
  Row,
  Select,
  Space,
  Tag,
  Typography,
  Upload
} from 'antd'
import dayjs from 'dayjs'
import { debounce } from 'lodash'
import type React from 'react'
import { useEffect, useState } from 'react'
import {
  type CreateMedicalEventRequest,
  LeaveMethod,
  medicalEventApi,
  MedicalEventStatus,
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
    <Form form={form} layout='vertical' onFinish={onFinish} className='max-h-[70vh] overflow-y-auto'>
      {/* 1. Student Information Section */}
      <Card
        title={
          <Space>
            <UserOutlined style={{ color: '#1890ff' }} />
            <Text strong>1. Thông tin học sinh</Text>
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

      {/* 2. Event Information Section */}
      <Card
        title={
          <Space>
            <FileTextOutlined style={{ color: '#1890ff' }} />
            <Text strong>2. Thông tin sự kiện</Text>
          </Space>
        }
        size='small'
        style={{ marginBottom: '16px' }}
      >
        <Row gutter={24}>
          <Col span={12}>
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
          <Col span={12}>
            <Form.Item name='status' label='Trạng thái xử lý'>
              <Select placeholder='Chọn trạng thái' size='large'>
                <Select.Option value={MedicalEventStatus.TREATED}>
                  <Tag color='green'>Đã xử lý</Tag>
                </Select.Option>
                <Select.Option value={MedicalEventStatus.MONITORING}>
                  <Tag color='orange'>Theo dõi</Tag>
                </Select.Option>
                <Select.Option value={MedicalEventStatus.TRANSFERRED}>
                  <Tag color='red'>Chuyển viện</Tag>
                </Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name='description'
          label='Mô tả chi tiết'
          rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}
        >
          <TextArea rows={3} placeholder='Nhập mô tả chi tiết về sự kiện...' />
        </Form.Item>

        <Row gutter={24}>
          <Col span={12}>
            <Form.Item
              name='initialCondition'
              label='Tình trạng ban đầu'
            >
              <TextArea rows={3} placeholder='Mô tả tình trạng ban đầu của học sinh...' />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name='firstAid'
              label='Biện pháp sơ cứu ban đầu'
            >
              <TextArea rows={3} placeholder='Mô tả biện pháp sơ cứu đã thực hiện...' />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name='actionTaken'
          label='Biện pháp xử lý'
          rules={[{ required: true, message: 'Vui lòng nhập biện pháp xử lý!' }]}
        >
          <TextArea rows={3} placeholder='Nhập biện pháp xử lý đã thực hiện...' />
        </Form.Item>
      </Card>

      {/* 3. Medicine and Supplies Section */}
      <Card
        title={
          <Space>
            <MedicineBoxOutlined style={{ color: '#1890ff' }} />
            <Text strong>3. Thuốc và vật tư y tế sử dụng</Text>
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

      {/* 4. Parent Contact Section */}
      <Card
        title={
          <Space>
            <PhoneOutlined style={{ color: '#1890ff' }} />
            <Text strong>4. Liên hệ phụ huynh</Text>
          </Space>
        }
        size='small'
        style={{ marginBottom: '16px' }}
      >
        <Row gutter={24}>
          <Col span={12}>
            <Form.Item label='Trạng thái liên hệ'>
              <Select
                placeholder='Chọn trạng thái liên hệ'
                value={parentContactStatus}
                onChange={setParentContactStatus}
                size='large'
              >
                {parentContactStatusOptions.map((option) => (
                  <Select.Option key={option.value} value={option.value}>
                    {option.label}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label='Thời gian liên hệ'>
              <DatePicker
                showTime
                format='DD/MM/YYYY HH:mm'
                placeholder='Chọn thời gian liên hệ'
                value={parentContactedAt ? dayjs(parentContactedAt) : null}
                onChange={(date) => {
                  if (date) {
                    setParentContactedAt(date.toISOString())
                  } else {
                    setParentContactedAt(undefined)
                  }
                }}
                size='large'
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      {/* 5. Time and Additional Information Section */}
      <Card
        title={
          <Space>
            <ClockCircleOutlined style={{ color: '#1890ff' }} />
            <Text strong>5. Thời gian và thông tin bổ sung</Text>
          </Space>
        }
        size='small'
        style={{ marginBottom: '16px' }}
      >
        <Row gutter={24}>
          <Col span={8}>
            <Form.Item name='leaveMethod' label='Phương thức ra về'>
              <Select placeholder='Chọn phương thức' size='large'>
                <Select.Option value={LeaveMethod.NONE}>Không rời khỏi</Select.Option>
                <Select.Option value={LeaveMethod.PARENT_PICKUP}>Phụ huynh đón</Select.Option>
                <Select.Option value={LeaveMethod.HOSPITAL_TRANSFER}>Chuyển viện</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name='leaveTime'
              label='Thời gian xảy ra sự kiện'
            >
              <DatePicker
                showTime
                format='DD/MM/YYYY HH:mm'
                placeholder='Chọn thời gian'
                size='large'
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name='pickedUpBy' label='Người đón'>
              <Input placeholder='Nhập tên người đón (nếu có)' size='large' />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      {/* 6. Images and Notes Section */}
      <Card
        title={
          <Space>
            <CameraOutlined style={{ color: '#1890ff' }} />
            <Text strong>6. Ảnh minh họa và ghi chú</Text>
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
  )
}

export default CreateMedicalEventForm
