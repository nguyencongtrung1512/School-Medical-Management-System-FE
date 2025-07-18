import { Button, Descriptions, Form, Input, message, Modal, Select } from 'antd'
import React, { useState } from 'react'
import { MedicalEvent, medicalEventApi, SeverityLevel, UpdateMedicalEventRequest } from '../../../api/medicalEvent.api'
import type { MedicalSupply } from '../../../api/medicalSupplies.api'
import { getAllMedicalSupplies } from '../../../api/medicalSupplies.api'
import type { Medicine } from '../../../api/medicines.api'
import { getMedicines } from '../../../api/medicines.api'

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
  const [medicines, setMedicines] = useState<Medicine[]>([])
  const [medicalSupplies, setMedicalSupplies] = useState<MedicalSupply[]>([])

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
      if (isEditing) {
        fetchMedicinesAndSupplies()
      }
    }
  }, [visible, id, isEditing])

  const handleUpdate = async (values: UpdateMedicalEventRequest) => {
    try {
      setLoading(true)
      await medicalEventApi.update(id, values)
      message.success('Cập nhật sự kiện y tế thành công!')
      setIsEditing(false)
      onSuccess()
    } catch (error: unknown) {
      console.log('error', error)
      const err = error as { message?: string }
      if (err.message) {
        message.error(err.message)
      } else {
        message.error('Có lỗi xảy ra khi cập nhật sự kiện!')
      }
    } finally {
      setLoading(false)
    }
  }

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

  return (
    <Modal title='Chi tiết sự kiện y tế' open={visible} onCancel={onClose} width={800} footer={null}>
      {medicalEvent && (
        <div>
          {!isEditing ? (
            <>
              <Descriptions bordered column={2}>
                <Descriptions.Item label='Học sinh' span={2}>
                  {medicalEvent.student?.fullName || 'N/A'}
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
                  {medicalEvent.medicines && medicalEvent.medicines.length > 0
                    ? medicalEvent.medicines.map((medicine) => (
                        <div key={medicine._id}>
                          {medicine.name} - {medicine.quantity} {medicine.unit}
                        </div>
                      ))
                    : 'Không sử dụng'}
                </Descriptions.Item>
                <Descriptions.Item label='Vật tư y tế sử dụng' span={2}>
                  {medicalEvent.medicalSupplies && medicalEvent.medicalSupplies.length > 0
                    ? medicalEvent.medicalSupplies.map((supply) => (
                        <div key={supply._id}>
                          {supply.name} - {supply.quantity} {supply.unit}
                        </div>
                      ))
                    : 'Không sử dụng'}
                </Descriptions.Item>
                <Descriptions.Item label='Mức độ nghiêm trọng'>
                  {medicalEvent.severityLevel || 'Không xác định'}
                </Descriptions.Item>
                <Descriptions.Item label='Người tạo'>{medicalEvent.schoolNurse?.fullName || 'N/A'}</Descriptions.Item>
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
            <Form form={form} layout='vertical' onFinish={handleUpdate}>
              <Form.Item
                name='eventName'
                label='Tên sự kiện'
                rules={[{ required: true, message: 'Vui lòng nhập tên sự kiện!' }]}
              >
                <Input />
              </Form.Item>

              <Form.Item name='description' label='Mô tả' rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}>
                <TextArea rows={4} />
              </Form.Item>

              <Form.Item
                name='actionTaken'
                label='Biện pháp xử lý'
                rules={[{ required: true, message: 'Vui lòng nhập biện pháp xử lý!' }]}
              >
                <TextArea rows={3} />
              </Form.Item>

              <Form.Item name='medicinesId' label='Thuốc sử dụng'>
                <Select
                  mode='multiple'
                  options={medicines.map((medicine) => ({ value: medicine._id, label: medicine.name }))}
                />
              </Form.Item>

              <Form.Item name='medicalSuppliesId' label='Vật tư y tế sử dụng'>
                <Select
                  mode='multiple'
                  options={medicalSupplies.map((supply) => ({ value: supply._id, label: supply.name }))}
                />
              </Form.Item>

              <Form.Item name='severityLevel' label='Mức độ nghiêm trọng'>
                <Select options={Object.values(SeverityLevel).map((level) => ({ value: level, label: level }))} />
              </Form.Item>

              <Form.Item name='notes' label='Ghi chú'>
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
