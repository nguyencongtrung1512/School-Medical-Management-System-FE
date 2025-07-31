import {
  CameraOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  EditOutlined,
  FileTextOutlined,
  MedicineBoxOutlined,
  PhoneOutlined,
  SaveOutlined,
  UserOutlined
} from '@ant-design/icons'
import {
  Badge,
  Button,
  Card,
  Col,
  DatePicker,
  Descriptions,
  Form,
  Image,
  Input,
  message,
  Modal,
  Row,
  Select,
  Space,
  Tag,
  Timeline,
  Typography
} from 'antd'
import dayjs from 'dayjs'
import React, { useState } from 'react'
import {
  LeaveMethod,
  type MedicalEvent,
  medicalEventApi,
  MedicalEventStatus,
  ParentContactStatus
} from '../../../api/medicalEvent.api'
import { getMedicalSupplyById } from '../../../api/medicalSupplies.api'
import { getMedicineById } from '../../../api/medicines.api'

const { TextArea } = Input
const { Text } = Typography

interface DetailProps {
  id: string
  visible: boolean
  onClose: () => void
  onSuccess: () => void
}

const Detail: React.FC<DetailProps> = ({ id, visible, onClose, onSuccess }) => {
  const [medicalEvent, setMedicalEvent] = useState<MedicalEvent | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [medicineNames, setMedicineNames] = useState<{ [id: string]: string }>({})
  const [supplyNames, setSupplyNames] = useState<{ [id: string]: string }>({})
  const [editLoading, setEditLoading] = useState(false)
  const [editForm] = Form.useForm()

  // States for new fields
  const [actions, setActions] = useState<{ time: string; description: string; performedBy?: string }[]>([])
  const [parentContactStatus, setParentContactStatus] = useState<ParentContactStatus | undefined>()
  const [parentContactedAt, setParentContactedAt] = useState<string | undefined>()

  // Constants for display
  const statusColors = {
    [MedicalEventStatus.TREATED]: 'success',
    [MedicalEventStatus.MONITORING]: 'processing',
    [MedicalEventStatus.TRANSFERRED]: 'warning'
  }

  const statusVN = {
    [MedicalEventStatus.TREATED]: 'Đã xử lý',
    [MedicalEventStatus.MONITORING]: 'Đang theo dõi',
    [MedicalEventStatus.TRANSFERRED]: 'Đã chuyển viện'
  }

  const leaveMethodVN = {
    [LeaveMethod.NONE]: 'Không rời khỏi',
    [LeaveMethod.PARENT_PICKUP]: 'Phụ huynh đón',
    [LeaveMethod.HOSPITAL_TRANSFER]: 'Chuyển viện'
  }

  const parentContactStatusVN = {
    [ParentContactStatus.NOT_CONTACTED]: 'Chưa liên hệ',
    [ParentContactStatus.CONTACTING]: 'Đang liên hệ',
    [ParentContactStatus.CONTACTED]: 'Đã liên hệ'
  }

  const parentContactStatusColors = {
    [ParentContactStatus.NOT_CONTACTED]: 'default',
    [ParentContactStatus.CONTACTING]: 'processing',
    [ParentContactStatus.CONTACTED]: 'success'
  }

  const parentContactStatusOptions = [
    { value: ParentContactStatus.NOT_CONTACTED, label: 'Chưa liên hệ' },
    { value: ParentContactStatus.CONTACTING, label: 'Đang liên hệ' },
    { value: ParentContactStatus.CONTACTED, label: 'Đã liên hệ' }
  ]

  // Fetch medicine name by id with caching
  const fetchMedicineName = async (id: string) => {
    if (medicineNames[id]) return medicineNames[id]
    try {
      const response = await getMedicineById(id)
      const medicine = response.data
      setMedicineNames((prev) => ({ ...prev, [id]: medicine.name }))
      return medicine.name
    } catch (error) {
      console.error('Error fetching medicine name:', error)
      return 'Không xác định'
    }
  }

  // Fetch supply name by id with caching
  const fetchSupplyName = async (id: string) => {
    if (supplyNames[id]) return supplyNames[id]
    try {
      const response = await getMedicalSupplyById(id)
      const supply = response.data
      setSupplyNames((prev) => ({ ...prev, [id]: supply.name }))
      return supply.name
    } catch (error) {
      console.error('Error fetching supply name:', error)
      return 'Không xác định'
    }
  }

  // Fetch medical event data
  const fetchMedicalEvent = async () => {
    if (!id) return
    try {
      const response = await medicalEventApi.getById(id)
      const data = response.data
      setMedicalEvent(data)

      // Set form values for editing
      editForm.setFieldsValue({
        eventName: data.eventName,
        description: data.description,
        actionTaken: data.actionTaken,
        initialCondition: data.initialCondition,
        firstAid: data.firstAid,
        status: data.status,
        leaveMethod: data.leaveMethod,
        leaveTime: data.leaveTime ? dayjs(data.leaveTime) : undefined,
        pickedUpBy: data.pickedUpBy,
        notes: data.notes,
        parentContactStatus: data.parentContactStatus,
        parentContactedAt: data.parentContactedAt ? dayjs(data.parentContactedAt) : undefined,
        images: data.images || []
      })

      // Set additional states
      setImageUrls(data.images || [])
      setActions(data.actions || [])
      setParentContactStatus(data.parentContactStatus)
      setParentContactedAt(data.parentContactedAt)

      // Fetch medicine and supply names
      if (data.medicinesUsed) {
        data.medicinesUsed.forEach((item) => {
          fetchMedicineName(item.medicineId)
        })
      }

      if (data.medicalSuppliesUsed) {
        data.medicalSuppliesUsed.forEach((item) => {
          fetchSupplyName(item.supplyId)
        })
      }
    } catch (error) {
      console.error('Error fetching medical event:', error)
      message.error('Không thể tải thông tin sự cố y tế')
    }
  }

  React.useEffect(() => {
    if (visible && id) {
      fetchMedicalEvent()
    }
  }, [visible, id])

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleEditSubmit = async (values: any) => {
    setEditLoading(true)
    try {
      const updateData = {
        ...values,
        leaveTime: values.leaveTime?.toISOString(),
        parentContactedAt: values.parentContactedAt?.toISOString(),
        actions: actions,
        parentContactStatus: parentContactStatus,
        images: imageUrls
      }

      await medicalEventApi.update(id, updateData)
      message.success('Cập nhật sự cố y tế thành công')
      setIsEditing(false)
      fetchMedicalEvent()
      onSuccess()
    } catch (error) {
      console.error('Error updating medical event:', error)
      message.error('Không thể cập nhật sự cố y tế')
    } finally {
      setEditLoading(false)
    }
  }

  if (!medicalEvent) {
    return (
      <Modal title='Chi tiết sự cố y tế' open={visible} onCancel={onClose} footer={null} width={1000} centered>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Text>Đang tải thông tin...</Text>
        </div>
      </Modal>
    )
  }

  return (
    <Modal
      title={
        <Space>
          <FileTextOutlined style={{ color: '#1890ff' }} />
          <Text strong>Chi tiết sự cố y tế</Text>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={1200}
      centered
      style={{ top: 20 }}
    >
      {!isEditing ? (
        /* View Mode */
        <div style={{ maxHeight: '80vh', overflowY: 'auto' }}>
          {/* 1. Student Information Card */}
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
              <Col span={8}>
                <Space direction='vertical' size={0}>
                  <Text type='secondary'>Họ và tên</Text>
                  <Text strong style={{ fontSize: '16px' }}>
                    {medicalEvent.student?.fullName || 'N/A'}
                  </Text>
                </Space>
              </Col>
              <Col span={8}>
                <Space direction='vertical' size={0}>
                  <Text type='secondary'>Mã học sinh</Text>
                  <Text strong>{medicalEvent.student?.studentIdCode || 'N/A'}</Text>
                </Space>
              </Col>
              <Col span={8}>
                <Space direction='vertical' size={0}>
                  <Text type='secondary'>Giới tính</Text>
                  <Text strong>{medicalEvent.student?.gender === 'male' ? 'Nam' : 'Nữ'}</Text>
                </Space>
              </Col>
            </Row>
            {medicalEvent.student?.avatar && (
              <div style={{ marginTop: '12px' }}>
                <Image
                  src={medicalEvent.student.avatar}
                  alt='Avatar'
                  width={60}
                  height={60}
                  style={{ borderRadius: '50%' }}
                />
              </div>
            )}
          </Card>

          {/* 2. Event Information Card */}
          <Card
            title={
              <Space>
                <FileTextOutlined style={{ color: '#1890ff' }} />
                <Text strong>2. Thông tin sự cố</Text>
              </Space>
            }
            size='small'
            style={{ marginBottom: '16px' }}
          >
            <Descriptions bordered column={2} size='small'>
              <Descriptions.Item label='Tên sự cố' span={2}>
                <Tag color='blue' style={{ fontSize: '14px' }}>
                  {medicalEvent.eventName}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label='Trạng thái'>
                <Badge
                  status={statusColors[medicalEvent.status] as 'success' | 'processing' | 'warning'}
                  text={statusVN[medicalEvent.status] || 'Không xác định'}
                />
              </Descriptions.Item>
              <Descriptions.Item label='Mô tả' span={2}>
                <Text>{medicalEvent.description || 'Không có mô tả'}</Text>
              </Descriptions.Item>
              <Descriptions.Item label='Tình trạng ban đầu' span={2}>
                <Text>{medicalEvent.initialCondition || 'Không có'}</Text>
              </Descriptions.Item>
              <Descriptions.Item label='Sơ cứu ban đầu' span={2}>
                <Text>{medicalEvent.firstAid || 'Không có sơ cứu'}</Text>
              </Descriptions.Item>
              <Descriptions.Item label='Biện pháp xử lý' span={2}>
                <Text>{medicalEvent.actionTaken || 'Không có'}</Text>
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* 3. Medicines and Supplies Card */}
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
                <Text strong style={{ display: 'block', marginBottom: '12px' }}>
                  Thuốc đã sử dụng:
                </Text>
                {medicalEvent.medicinesUsed && medicalEvent.medicinesUsed.length > 0 ? (
                  medicalEvent.medicinesUsed.map((item, index) => (
                    <Card
                      key={index}
                      size='small'
                      style={{ marginBottom: '8px', backgroundColor: '#f6ffed' }}
                      bodyStyle={{ padding: '8px 12px' }}
                    >
                      <Row justify='space-between' align='middle'>
                        <Col flex='1'>
                          <Text strong>{medicineNames[item.medicineId] || 'Đang tải...'}</Text>
                        </Col>
                        <Col>
                          <Tag color='blue'>{item.quantity} viên</Tag>
                        </Col>
                      </Row>
                    </Card>
                  ))
                ) : (
                  <Text type='secondary'>Không có thuốc nào được sử dụng</Text>
                )}
              </Col>
              <Col span={12}>
                <Text strong style={{ display: 'block', marginBottom: '12px' }}>
                  Vật tư y tế đã sử dụng:
                </Text>
                {medicalEvent.medicalSuppliesUsed && medicalEvent.medicalSuppliesUsed.length > 0 ? (
                  medicalEvent.medicalSuppliesUsed.map((item, index) => (
                    <Card
                      key={index}
                      size='small'
                      style={{ marginBottom: '8px', backgroundColor: '#f6ffed' }}
                      bodyStyle={{ padding: '8px 12px' }}
                    >
                      <Row justify='space-between' align='middle'>
                        <Col flex='1'>
                          <Text strong>{supplyNames[item.supplyId] || 'Đang tải...'}</Text>
                        </Col>
                        <Col>
                          <Tag color='green'>{item.quantity} thiết bị</Tag>
                        </Col>
                      </Row>
                    </Card>
                  ))
                ) : (
                  <Text type='secondary'>Không có vật tư nào được sử dụng</Text>
                )}
              </Col>
            </Row>
          </Card>

          {/* 4. Parent Contact Status Card */}
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
            <Descriptions bordered column={2} size='small'>
              <Descriptions.Item label='Trạng thái liên hệ'>
                <Badge
                  status={
                    parentContactStatusColors[medicalEvent.parentContactStatus || 'not_contacted'] as
                      | 'default'
                      | 'processing'
                      | 'success'
                  }
                  text={parentContactStatusVN[medicalEvent.parentContactStatus || 'not_contacted'] || 'Không xác định'}
                />
              </Descriptions.Item>
              <Descriptions.Item label='Thời gian liên hệ'>
                <Text>
                  {medicalEvent.parentContactedAt
                    ? dayjs(medicalEvent.parentContactedAt).format('DD/MM/YYYY HH:mm')
                    : 'Chưa liên hệ'}
                </Text>
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* 5. Time and Additional Information Card */}
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
            <Descriptions bordered column={3} size='small'>
              <Descriptions.Item label='Phương thức ra về'>
                <Tag color='orange'>{leaveMethodVN[medicalEvent.leaveMethod] || 'Không xác định'}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label='Thời gian xảy ra'>
                <Text>
                  {medicalEvent.leaveTime
                    ? dayjs(medicalEvent.leaveTime).format('DD/MM/YYYY HH:mm')
                    : 'Không có thông tin'}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label='Người đón'>
                <Text>{medicalEvent.pickedUpBy || 'Không có thông tin'}</Text>
              </Descriptions.Item>
              <Descriptions.Item label='Ghi chú' span={3}>
                <Text>{medicalEvent.notes || 'Không có ghi chú'}</Text>
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* 6. Actions Timeline Card */}
          {actions && actions.length > 0 && (
            <Card
              title={
                <Space>
                  <ClockCircleOutlined style={{ color: '#1890ff' }} />
                  <Text strong>6. Lịch sử thao tác</Text>
                </Space>
              }
              size='small'
              style={{ marginBottom: '16px' }}
            >
              <Timeline>
                {actions.map((action, index) => (
                  <Timeline.Item key={index} dot={<CheckCircleOutlined style={{ color: '#52c41a' }} />}>
                    <Space direction='vertical' size={4}>
                      <Text strong>{dayjs(action.time).format('DD/MM/YYYY HH:mm')}</Text>
                      <Text>{action.description}</Text>
                      {action.performedBy && <Text type='secondary'>Thực hiện bởi: {action.performedBy}</Text>}
                    </Space>
                  </Timeline.Item>
                ))}
              </Timeline>
            </Card>
          )}

          {/* 7. Images Card */}
          {medicalEvent.images && medicalEvent.images.length > 0 && (
            <Card
              title={
                <Space>
                  <CameraOutlined style={{ color: '#1890ff' }} />
                  <Text strong>7. Ảnh minh họa</Text>
                </Space>
              }
              size='small'
              style={{ marginBottom: '16px' }}
            >
              <Image.PreviewGroup>
                <Row gutter={[8, 8]}>
                  {medicalEvent.images.map((image, index) => (
                    <Col key={index} span={6}>
                      <Image
                        src={image}
                        alt={`Ảnh ${index + 1}`}
                        style={{ width: '100%', height: '120px', objectFit: 'cover' }}
                      />
                    </Col>
                  ))}
                </Row>
              </Image.PreviewGroup>
            </Card>
          )}

          {/* Action Buttons */}
          <Card size='small'>
            <Row justify='center'>
              <Col>
                <Space size='large'>
                  <Button type='primary' icon={<EditOutlined />} onClick={handleEdit} size='large'>
                    Chỉnh sửa
                  </Button>
                  <Button onClick={onClose} size='large'>
                    Đóng
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>
        </div>
      ) : (
        /* Edit Mode */
        <div style={{ maxHeight: '80vh', overflowY: 'auto' }}>
          <Form form={editForm} layout='vertical' onFinish={handleEditSubmit}>
            {/* 1. Event Information */}
            <Card
              title={
                <Space>
                  <FileTextOutlined style={{ color: '#1890ff' }} />
                  <Text strong>1. Thông tin sự cố</Text>
                </Space>
              }
              size='small'
              style={{ marginBottom: '16px' }}
            >
              <Row gutter={24}>
                <Col span={12}>
                  <Form.Item name='eventName' label='Tên sự cố'>
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name='status' label='Trạng thái'>
                    <Select>
                      <Select.Option value={MedicalEventStatus.TREATED}>Đã xử lý</Select.Option>
                      <Select.Option value={MedicalEventStatus.MONITORING}>Theo dõi</Select.Option>
                      <Select.Option value={MedicalEventStatus.TRANSFERRED}>Chuyển viện</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item name='description' label='Mô tả'>
                <TextArea rows={3} />
              </Form.Item>
              <Row gutter={24}>
                <Col span={12}>
                  <Form.Item name='initialCondition' label='Tình trạng ban đầu'>
                    <TextArea rows={3} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name='firstAid' label='Sơ cứu ban đầu'>
                    <TextArea rows={3} />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item name='actionTaken' label='Biện pháp xử lý'>
                <TextArea rows={3} />
              </Form.Item>
            </Card>

            {/* 2. Parent Contact Information */}
            <Card
              title={
                <Space>
                  <PhoneOutlined style={{ color: '#1890ff' }} />
                  <Text strong>2. Liên hệ phụ huynh</Text>
                </Space>
              }
              size='small'
              style={{ marginBottom: '16px' }}
            >
              <Row gutter={24}>
                <Col span={12}>
                  <Form.Item label='Trạng thái liên hệ'>
                    <Select value={parentContactStatus} onChange={setParentContactStatus} placeholder='Chọn trạng thái'>
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
                      value={parentContactedAt ? dayjs(parentContactedAt) : null}
                      onChange={(date) => {
                        if (date) {
                          setParentContactedAt(date.toISOString())
                        } else {
                          setParentContactedAt(undefined)
                        }
                      }}
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* 3. Additional Information */}
            <Card
              title={
                <Space>
                  <ClockCircleOutlined style={{ color: '#1890ff' }} />
                  <Text strong>3. Thời gian và thông tin bổ sung</Text>
                </Space>
              }
              size='small'
              style={{ marginBottom: '16px' }}
            >
              <Row gutter={24}>
                <Col span={8}>
                  <Form.Item name='leaveMethod' label='Phương thức ra về'>
                    <Select>
                      <Select.Option value={LeaveMethod.NONE}>Không rời khỏi</Select.Option>
                      <Select.Option value={LeaveMethod.PARENT_PICKUP}>Phụ huynh đón</Select.Option>
                      <Select.Option value={LeaveMethod.HOSPITAL_TRANSFER}>Chuyển viện</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name='leaveTime' label='Thời gian xảy ra'>
                    <DatePicker showTime format='DD/MM/YYYY HH:mm' style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name='pickedUpBy' label='Người đón'>
                    <Input placeholder='Nhập tên người đón (nếu có)' />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item name='notes' label='Ghi chú'>
                <TextArea rows={3} />
              </Form.Item>
            </Card>

            {/* Action Buttons */}
            <Card size='small'>
              <Row justify='center'>
                <Col>
                  <Space size='large'>
                    <Button type='primary' htmlType='submit' icon={<SaveOutlined />} loading={editLoading} size='large'>
                      Lưu thay đổi
                    </Button>
                    <Button onClick={() => setIsEditing(false)} size='large'>
                      Hủy
                    </Button>
                  </Space>
                </Col>
              </Row>
            </Card>
          </Form>
        </div>
      )}
    </Modal>
  )
}

export default Detail
