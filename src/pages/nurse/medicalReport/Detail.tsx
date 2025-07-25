import React from 'react'
import { useState } from 'react'
import {
  Button,
  Descriptions,
  Form,
  Input,
  message,
  Modal,
  Select,
  DatePicker,
  Upload,
  Card,
  Space,
  Tag,
  Typography,
  Row,
  Col,
  Image,
  InputNumber,
  Alert,
  Tooltip,
  Badge
} from 'antd'
import {
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
  UserOutlined,
  MedicineBoxOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  CameraOutlined,
  InfoCircleOutlined,
  WarningOutlined,
  PlusOutlined
} from '@ant-design/icons'
import { type MedicalEvent, medicalEventApi } from '../../../api/medicalEvent.api'
import type { MedicalSupply } from '../../../api/medicalSupplies.api'
import { getAllMedicalSupplies } from '../../../api/medicalSupplies.api'
import type { Medicine } from '../../../api/medicines.api'
import { getMedicines } from '../../../api/medicines.api'
import { getMedicineById } from '../../../api/medicines.api'
import { getMedicalSupplyById } from '../../../api/medicalSupplies.api'
import dayjs from 'dayjs'
import { handleUploadFile } from '../../../utils/upload'

const { TextArea } = Input
const { Text } = Typography

interface DetailProps {
  id: string
  visible: boolean
  onClose: () => void
  onSuccess: () => void
}

const Detail: React.FC<DetailProps> = ({ id, visible, onClose, onSuccess }) => {
  const [form] = Form.useForm()
  const [medicalEvent, setMedicalEvent] = useState<MedicalEvent | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [medicineNames, setMedicineNames] = useState<{ [id: string]: string }>({})
  const [supplyNames, setSupplyNames] = useState<{ [id: string]: string }>({})
  const [editLoading, setEditLoading] = useState(false)
  const [editForm] = Form.useForm()

  // States for medicines and supplies
  const [medicines, setMedicines] = useState<Medicine[]>([])
  const [medicalSupplies, setMedicalSupplies] = useState<MedicalSupply[]>([])
  const [selectedMedicines, setSelectedMedicines] = useState<{ id: string; quantity: number }[]>([])
  const [selectedSupplies, setSelectedSupplies] = useState<{ id: string; quantity: number }[]>([])
  const [loading, setLoading] = useState(false)

  // Fetch medicines and supplies when modal opens
  React.useEffect(() => {
    if (visible) {
      setLoading(true)
      Promise.all([getMedicines(1, 100), getAllMedicalSupplies(1, 100)])
        .then(([medicinesRes, suppliesRes]) => {
          setMedicines(medicinesRes.pageData)
          setMedicalSupplies(suppliesRes.pageData)
        })
        .finally(() => setLoading(false))
    }
  }, [visible])

  // Fetch medicine name by id with caching
  const fetchMedicineName = async (id: string) => {
    if (medicineNames[id]) return medicineNames[id]
    try {
      const res = await getMedicineById(id)
      const name = (res as any).data?.name || (res as any).name
      setMedicineNames((prev) => ({ ...prev, [id]: name }))
      return name
    } catch {
      setMedicineNames((prev) => ({ ...prev, [id]: 'Không rõ' }))
      return 'Không rõ'
    }
  }

  // Fetch supply name by id with caching
  const fetchSupplyName = async (id: string) => {
    if (supplyNames[id]) return supplyNames[id]
    try {
      // Không cần chuyển đổi id sang number nữa
      const res = await getMedicalSupplyById(id)
      const name = (res as any).data?.name || (res as any).name
      setSupplyNames((prev) => ({ ...prev, [id]: name }))
      return name
    } catch (error) {
      console.log("Error:", error)
      setSupplyNames((prev) => ({ ...prev, [id]: 'Không rõ' }))
      return 'Không rõ'
    }
  }

  // Fetch names when medical event is loaded
  React.useEffect(() => {
    if (medicalEvent && visible) {
      if (medicalEvent.medicinesUsed) {
        medicalEvent.medicinesUsed.forEach((item: any) => {
          const id = item.medicineId
          if (id && !medicineNames[id]) fetchMedicineName(id)
        })
      }
      if (medicalEvent.medicalSuppliesUsed) {
        medicalEvent.medicalSuppliesUsed.forEach((item: any) => {
          const id = item.supplyId
          if (id && !supplyNames[id]) fetchSupplyName(id)
        })
      }
    }
  }, [medicalEvent, visible])

  const fetchMedicalEvent = async () => {
    try {
      const response = await medicalEventApi.getById(id)
      setMedicalEvent(response.data)
      form.setFieldsValue({
        eventName: response.data.eventName,
        description: response.data.description,
        actionTaken: response.data.actionTaken,
        medicinesId: response.data.medicinesId,
        medicalSuppliesId: response.data.medicalSuppliesId,
        severityLevel: response.data.severityLevel,
        notes: response.data.notes
      })
    } catch (error: unknown) {
      console.log('error', error)
      const err = error as { message?: string }
      if (err.message) {
        message.error(err.message)
      } else {
        message.error('Có lỗi xảy ra khi tải thông tin sự kiện!')
      }
    }
  }

  React.useEffect(() => {
    if (visible && id) {
      fetchMedicalEvent()
    }
  }, [visible, id, isEditing])

  // Translation mappings
  const severityLevelVN: Record<string, string> = {
    Mild: 'Nhẹ',
    Moderate: 'Trung bình',
    Severe: 'Nặng'
  }

  const statusVN: Record<string, string> = {
    treated: 'Đã xử lý',
    monitoring: 'Theo dõi',
    transferred: 'Chuyển viện'
  }

  const severityColors: Record<string, string> = {
    Mild: 'green',
    Moderate: 'orange',
    Severe: 'red'
  }

  const statusColors: Record<string, string> = {
    treated: 'success',
    monitoring: 'processing',
    transferred: 'warning'
  }

  // Handle edit mode
  const handleEdit = () => {
    if (!medicalEvent) return

    setSelectedMedicines(
      Array.isArray(medicalEvent.medicinesUsed)
        ? medicalEvent.medicinesUsed.map((item: any) => ({ id: item.medicineId, quantity: item.quantity }))
        : []
    )
    setSelectedSupplies(
      Array.isArray(medicalEvent.medicalSuppliesUsed)
        ? medicalEvent.medicalSuppliesUsed.map((item: any) => ({ id: item.supplyId, quantity: item.quantity }))
        : []
    )

    editForm.setFieldsValue({
      eventName: medicalEvent.eventName,
      description: medicalEvent.description,
      actionTaken: medicalEvent.actionTaken,
      severityLevel: medicalEvent.severityLevel,
      status: medicalEvent.status,
      leaveMethod: medicalEvent.leaveMethod,
      leaveTime: medicalEvent.leaveTime ? dayjs(medicalEvent.leaveTime) : null,
      pickedUpBy: medicalEvent.pickedUpBy,
      notes: medicalEvent.notes
    })
    setImageUrls(medicalEvent.images || [])
    setIsEditing(true)
  }

  // Handle edit submit
  const handleEditSubmit = async (values: any) => {
    if (!medicalEvent) return
    setEditLoading(true)
    try {
      const medicinesUsed = selectedMedicines.map((item) => ({ medicineId: item.id, quantity: item.quantity }))
      const medicalSuppliesUsed = selectedSupplies.map((item) => ({ supplyId: item.id, quantity: item.quantity }))

      const updateData = {
        ...values,
        medicinesUsed,
        medicalSuppliesUsed,
        images: imageUrls,
        leaveTime: values.leaveTime ? values.leaveTime.toISOString() : undefined
      }

      await medicalEventApi.update(medicalEvent._id, updateData)
      message.success('Cập nhật sự kiện thành công!')
      setIsEditing(false)
      fetchMedicalEvent()
      onSuccess()
    } catch {
      message.error('Cập nhật thất bại!')
    } finally {
      setEditLoading(false)
    }
  }

  return (
    <Modal
      title={
        <Space>
          <FileTextOutlined style={{ color: '#1890ff' }} />
          <Text strong style={{ fontSize: '18px' }}>
            Chi tiết sự kiện y tế
          </Text>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      width={1000}
      footer={null}
      destroyOnClose
    >
      {medicalEvent && (
        <div>
          {!isEditing ? (
            <div>
              {/* Student Information Card */}
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
                  {/* <Col span={8}>
                    <Space direction='vertical' size={0}>
                      <Text type='secondary'>Lớp</Text>
                      <Text strong>{medicalEvent.student?.class?.name || 'N/A'}</Text>
                    </Space>
                  </Col> */}
                </Row>
              </Card>

              {/* Event Information Card */}
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
                <Descriptions bordered column={2} size='small'>
                  <Descriptions.Item label='Tên sự kiện' span={2}>
                    <Tag color='blue' style={{ fontSize: '14px' }}>
                      {medicalEvent.eventName}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label='Mô tả' span={2}>
                    <Text>{medicalEvent.description}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label='Biện pháp xử lý' span={2}>
                    <Text>{medicalEvent.actionTaken}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label='Mức độ nghiêm trọng'>
                    <Tag color={severityColors[medicalEvent.severityLevel]} style={{ fontWeight: 'bold' }}>
                      {severityLevelVN[medicalEvent.severityLevel] || 'Không xác định'}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label='Trạng thái'>
                    <Badge
                      status={statusColors[medicalEvent.status] as any}
                      text={statusVN[medicalEvent.status] || 'Không xác định'}
                    />
                  </Descriptions.Item>
                </Descriptions>
              </Card>

              {/* Medicine and Supplies Card */}
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
                    <Text strong style={{ display: 'block', marginBottom: '8px' }}>
                      Thuốc sử dụng:
                    </Text>
                    {Array.isArray(medicalEvent.medicinesUsed) && medicalEvent.medicinesUsed.length > 0 ? (
                      <Space direction='vertical' style={{ width: '100%' }}>
                        {(medicalEvent.medicinesUsed as any[]).map((item: { medicineId: string; quantity: number }) =>
                          typeof item === 'object' && item.medicineId ? (
                            <Card key={item.medicineId} size='small' style={{ backgroundColor: '#f6ffed' }}>
                              <Space justify='space-between' style={{ width: '100%' }}>
                                <Text strong>{medicineNames[item.medicineId] || 'Đang tải...'}</Text>
                                <Tag color='green'>{item.quantity} viên</Tag>
                              </Space>
                            </Card>
                          ) : null
                        )}
                      </Space>
                    ) : (
                      <Text type='secondary'>Không sử dụng thuốc</Text>
                    )}
                  </Col>
                  <Col span={12}>
                    <Text strong style={{ display: 'block', marginBottom: '8px' }}>
                      Vật tư y tế sử dụng:
                    </Text>
                    {Array.isArray(medicalEvent.medicalSuppliesUsed) && medicalEvent.medicalSuppliesUsed.length > 0 ? (
                      <Space direction='vertical' style={{ width: '100%' }}>
                        {(medicalEvent.medicalSuppliesUsed as any[]).map(
                          (item: { supplyId: string; quantity: number }) =>
                            typeof item === 'object' && item.supplyId ? (
                              <Card key={item.supplyId} size='small' style={{ backgroundColor: '#fff7e6' }}>
                                <Space justify='space-between' style={{ width: '100%' }}>
                                  <Text strong>{supplyNames[item.supplyId] || 'Đang tải...'}</Text>
                                  <Tag color='orange'>{item.quantity} thiết bị</Tag>
                                </Space>
                              </Card>
                            ) : null
                        )}
                      </Space>
                    ) : (
                      <Text type='secondary'>Không sử dụng vật tư</Text>
                    )}
                  </Col>
                </Row>
              </Card>

              {/* Time and Additional Info Card */}
              <Card
                title={
                  <Space>
                    <ClockCircleOutlined style={{ color: '#1890ff' }} />
                    <Text strong>Thông tin thời gian và bổ sung</Text>
                  </Space>
                }
                size='small'
                style={{ marginBottom: '16px' }}
              >
                <Descriptions bordered column={2} size='small'>
                  <Descriptions.Item label='Cách rời khỏi'>
                    <Text>{medicalEvent.leaveMethod || 'Không xác định'}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label='Thời gian xảy ra sự kiện'>
                    <Text>
                      {medicalEvent.leaveTime
                        ? dayjs(medicalEvent.leaveTime).format('DD/MM/YYYY HH:mm')
                        : 'Không xác định'}
                    </Text>
                  </Descriptions.Item>
                  <Descriptions.Item label='Người đón'>
                    <Text>{medicalEvent.pickedUpBy || 'Không xác định'}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label='Người tạo'>
                    <Text>{medicalEvent.schoolNurse?.fullName || 'N/A'}</Text>
                  </Descriptions.Item>
                  {medicalEvent.notes && (
                    <Descriptions.Item label='Ghi chú' span={2}>
                      <Text>{medicalEvent.notes}</Text>
                    </Descriptions.Item>
                  )}
                </Descriptions>
              </Card>

              {/* Images Card */}
              {medicalEvent.images && medicalEvent.images.length > 0 && (
                <Card
                  title={
                    <Space>
                      <CameraOutlined style={{ color: '#1890ff' }} />
                      <Text strong>Ảnh minh họa</Text>
                    </Space>
                  }
                  size='small'
                  style={{ marginBottom: '16px' }}
                >
                  <Image.PreviewGroup>
                    <Space wrap>
                      {medicalEvent.images.map((img, idx) => (
                        <Image
                          key={idx}
                          src={img || '/placeholder.svg'}
                          alt={`Ảnh ${idx + 1}`}
                          width={120}
                          height={120}
                          style={{ objectFit: 'cover', borderRadius: '8px' }}
                        />
                      ))}
                    </Space>
                  </Image.PreviewGroup>
                </Card>
              )}

              {/* Action Buttons */}
              <div style={{ textAlign: 'right', marginTop: '16px' }}>
                <Button type='primary' icon={<EditOutlined />} onClick={handleEdit} size='large'>
                  Chỉnh sửa sự kiện
                </Button>
              </div>
            </div>
          ) : (
            /* Edit Form */
            <Form form={editForm} layout='vertical' onFinish={handleEditSubmit}>
              <Card
                title={
                  <Space>
                    <EditOutlined style={{ color: '#1890ff' }} />
                    <Text strong>Chỉnh sửa sự kiện y tế</Text>
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
                      rules={[{ required: true, message: 'Vui lòng nhập tên sự kiện!' }]}
                    >
                      <Input size='large' />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name='severityLevel' label='Mức độ nghiêm trọng'>
                      <Select placeholder='Chọn mức độ' size='large'>
                        <Select.Option value='Mild'>
                          <Tag color='green'>Nhẹ</Tag>
                        </Select.Option>
                        <Select.Option value='Moderate'>
                          <Tag color='orange'>Trung bình</Tag>
                        </Select.Option>
                        <Select.Option value='Severe'>
                          <Tag color='red'>Nặng</Tag>
                        </Select.Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  name='description'
                  label='Mô tả'
                  rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}
                >
                  <TextArea rows={3} />
                </Form.Item>

                <Form.Item
                  name='actionTaken'
                  label='Biện pháp xử lý'
                  rules={[{ required: true, message: 'Vui lòng nhập biện pháp xử lý!' }]}
                >
                  <TextArea rows={2} />
                </Form.Item>
              </Card>

              {/* Medicine and Supplies Edit */}
              <Card
                title={
                  <Space>
                    <MedicineBoxOutlined style={{ color: '#1890ff' }} />
                    <Text strong>Thuốc và vật tư y tế</Text>
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
                        value={selectedMedicines.map((m) => m.id)}
                        onChange={(ids: string[]) => {
                          setSelectedMedicines((prev) => {
                            return ids.map((id) => {
                              const found = prev.find((m) => m.id === id)
                              return { id, quantity: found?.quantity || 1 }
                            })
                          })
                        }}
                        options={medicines.map((medicine) => ({ value: medicine._id, label: medicine.name }))}
                      />
                      {selectedMedicines.length > 0 && (
                        <div style={{ marginTop: 12 }}>
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
                                    <Text strong>{med.name}</Text>
                                  </Col>
                                  <Col>
                                    <Space align='center'>
                                      <Text>Số lượng:</Text>
                                      <InputNumber
                                        size='small'
                                        min={1}
                                        value={item.quantity}
                                        onChange={(val) => {
                                          const newVal = Math.max(1, val || 1)
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
                          .map((supply) => ({ value: supply._id, label: supply.name }))}
                      />
                      {selectedSupplies.length > 0 && (
                        <div style={{ marginTop: 12 }}>
                          {selectedSupplies.map((item) => {
                            const sup = medicalSupplies.find((s) => String(s._id) === String(item.id))
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
                                    <Text strong>{sup.name}</Text>
                                  </Col>
                                  <Col>
                                    <Space align='center'>
                                      <Text>Số lượng:</Text>
                                      <InputNumber
                                        size='small'
                                        min={1}
                                        value={item.quantity}
                                        onChange={(val) => {
                                          const newVal = Math.max(1, val || 1)
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

              {/* Time and Additional Info Edit */}
              <Card
                title={
                  <Space>
                    <ClockCircleOutlined style={{ color: '#1890ff' }} />
                    <Text strong>Thông tin thời gian</Text>
                  </Space>
                }
                size='small'
                style={{ marginBottom: '16px' }}
              >
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
                          const sevenDaysAgo = new Date(
                            now.getFullYear(),
                            now.getMonth(),
                            now.getDate() - 7,
                            0,
                            0,
                            0,
                            0
                          )
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
                      <Input size='large' placeholder='Nhập tên người đón' />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item name='notes' label='Ghi chú'>
                  <TextArea rows={2} placeholder='Nhập ghi chú thêm' />
                </Form.Item>
              </Card>

              {/* Images Edit */}
              <Card
                title={
                  <Space>
                    <CameraOutlined style={{ color: '#1890ff' }} />
                    <Text strong>Ảnh minh họa</Text>
                  </Space>
                }
                size='small'
                style={{ marginBottom: '24px' }}
              >
                <Form.Item name='images' label='Tải ảnh lên'>
                  <Upload
                    listType='picture-card'
                    customRequest={async (options) => {
                      const { file, onSuccess, onError } = options as any
                      const url = await handleUploadFile(file as File, 'image')
                      if (url) {
                        setImageUrls((prev) => {
                          const newArr = [...prev, url]
                          editForm.setFieldsValue({ images: newArr })
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
                        editForm.setFieldsValue({ images: newArr })
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
              </Card>

              {/* Action Buttons */}
              <Card size='small'>
                <Row justify='center'>
                  <Col>
                    <Space size='large'>
                      <Button
                        type='primary'
                        htmlType='submit'
                        loading={editLoading}
                        size='large'
                        icon={<SaveOutlined />}
                      >
                        Lưu thay đổi
                      </Button>
                      <Button onClick={() => setIsEditing(false)} size='large' icon={<CloseOutlined />}>
                        Hủy chỉnh sửa
                      </Button>
                    </Space>
                  </Col>
                </Row>
              </Card>
            </Form>
          )}
        </div>
      )}
    </Modal>
  )
}

export default Detail
