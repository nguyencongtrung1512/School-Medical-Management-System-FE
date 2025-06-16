import React, { useState } from 'react'
import { Modal, Descriptions, Form, Input, Select, Button, message } from 'antd'
import { getMedicalEventById, updateMedicalEvent } from '../../../api/medicalEvent'
import type { MedicalEvent, UpdateMedicalEventRequest } from '../../../api/medicalEvent'

const { TextArea } = Input

interface DetailProps {
  id: string
  visible: boolean
  onClose: () => void
  onSuccess: () => void
}

const Detail: React.FC<DetailProps> = ({ id, visible, onClose, onSuccess }) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [medicalEvent, setMedicalEvent] = useState<MedicalEvent | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  const fetchMedicalEvent = async () => {
    try {
      const data = await getMedicalEventById(id)
      setMedicalEvent(data)
      console.log("trung", data)
      form.setFieldsValue({
        eventName: data.eventName,
        description: data.description,
        actionTaken: data.actionTaken,
        medicinesId: data.medicinesId,
        medicalSuppliesId: data.medicalSuppliesId,
        isSerious: data.isSerious,
        notes: data.notes
      })
    } catch (error) {
      message.error('Có lỗi xảy ra khi tải thông tin sự kiện!')
    }
  }

  React.useEffect(() => {
    if (visible && id) {
      fetchMedicalEvent()
    }
  }, [visible, id])

  const handleUpdate = async (values: UpdateMedicalEventRequest) => {
    try {
      setLoading(true)
      await updateMedicalEvent(id, values)
      message.success('Cập nhật sự kiện y tế thành công!')
      setIsEditing(false)
      onSuccess()
    } catch (error) {
      message.error('Có lỗi xảy ra khi cập nhật sự kiện!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      title='Chi tiết sự kiện y tế'
      open={visible}
      onCancel={onClose}
      width={800}
      footer={null}
    >
      {medicalEvent && (
        <div>
          {!isEditing ? (
            <>
              <Descriptions bordered column={2}>
                <Descriptions.Item label='Học sinh' span={2}>
                  {medicalEvent.student.fullName}
                </Descriptions.Item>
                <Descriptions.Item label='Tên sự kiện' span={2}>
                  {medicalEvent.eventName}
                </Descriptions.Item>
                <Descriptions.Item label='Mô tả' span={2}>
                  {medicalEvent.description}
                </Descriptions.Item>
                <Descriptions.Item label='Biện pháp xử lý' span={2}>
                  {medicalEvent.actionTaken}
                </Descriptions.Item>
                <Descriptions.Item label='Thuốc sử dụng' span={2}>
                  {medicalEvent.medicines.map(medicine => (
                    <div key={medicine._id}>
                      {medicine.name} - {medicine.quantity} {medicine.unit}
                    </div>
                  ))}
                </Descriptions.Item>
                <Descriptions.Item label='Vật tư y tế sử dụng' span={2}>
                  {medicalEvent.medicalSupplies.map(supply => (
                    <div key={supply._id}>
                      {supply.name} - {supply.quantity} {supply.unit}
                    </div>
                  ))}
                </Descriptions.Item>
                <Descriptions.Item label='Mức độ nghiêm trọng'>
                  {medicalEvent.isSerious ? 'Nghiêm trọng' : 'Không nghiêm trọng'}
                </Descriptions.Item>
                <Descriptions.Item label='Người tạo'>
                  {medicalEvent.schoolNurse.fullName}
                </Descriptions.Item>
                {medicalEvent.notes && (
                  <Descriptions.Item label='Ghi chú' span={2}>
                    {medicalEvent.notes}
                  </Descriptions.Item>
                )}
              </Descriptions>
              <div style={{ marginTop: 16, textAlign: 'right' }}>
                <Button type='primary' onClick={() => setIsEditing(true)}>
                  Chỉnh sửa
                </Button>
              </div>
            </>
          ) : (
            <Form
              form={form}
              layout='vertical'
              onFinish={handleUpdate}
            >
              <Form.Item
                name='eventName'
                label='Tên sự kiện'
                rules={[{ required: true, message: 'Vui lòng nhập tên sự kiện!' }]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                name='description'
                label='Mô tả'
                rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}
              >
                <TextArea rows={4} />
              </Form.Item>

              <Form.Item
                name='actionTaken'
                label='Biện pháp xử lý'
                rules={[{ required: true, message: 'Vui lòng nhập biện pháp xử lý!' }]}
              >
                <TextArea rows={3} />
              </Form.Item>

              <Form.Item
                name='medicinesId'
                label='Thuốc sử dụng'
              >
                <Select
                  mode='multiple'
                  options={[]} // TODO: Thêm danh sách thuốc từ API
                />
              </Form.Item>

              <Form.Item
                name='medicalSuppliesId'
                label='Vật tư y tế sử dụng'
              >
                <Select
                  mode='multiple'
                  options={[]} // TODO: Thêm danh sách vật tư từ API
                />
              </Form.Item>

              <Form.Item
                name='isSerious'
                label='Mức độ nghiêm trọng'
                rules={[{ required: true, message: 'Vui lòng chọn mức độ nghiêm trọng!' }]}
              >
                <Select
                  options={[
                    { value: true, label: 'Nghiêm trọng' },
                    { value: false, label: 'Không nghiêm trọng' }
                  ]}
                />
              </Form.Item>

              <Form.Item
                name='notes'
                label='Ghi chú'
              >
                <TextArea rows={3} />
              </Form.Item>

              <Form.Item>
                <Button type='primary' htmlType='submit' loading={loading}>
                  Cập nhật
                </Button>
                <Button style={{ marginLeft: 8 }} onClick={() => setIsEditing(false)}>
                  Hủy
                </Button>
              </Form.Item>
            </Form>
          )}
        </div>
      )}
    </Modal>
  )
}

export default Detail
