import React from 'react'
import { Form, Input, Select, Button, message, Row, Col, Card } from 'antd'
import { createMedicalEvent } from '../../../api/medicalEvent'
import type { CreateMedicalEventRequest } from '../../../api/medicalEvent'

const { TextArea } = Input

interface CreateMedicalEventFormProps {
  onSuccess: () => void
}

const CreateMedicalEventForm: React.FC<CreateMedicalEventFormProps> = ({ onSuccess }) => {
  const [form] = Form.useForm()

  const onFinish = async (values: CreateMedicalEventRequest) => {
    try {
      await createMedicalEvent(values)
      message.success('Tạo sự kiện y tế thành công!')
      form.resetFields()
      onSuccess()
    } catch (error) {
      message.error('Có lỗi xảy ra khi tạo sự kiện y tế!')
    }
  }

  return (
    <Form
      form={form}
      layout='vertical'
      onFinish={onFinish}
      style={{ maxWidth: '100%' }}
    >
      <Row gutter={24}>
        <Col span={12}>
          <Form.Item
            name='studentId'
            label='Học sinh'
            rules={[{ required: true, message: 'Vui lòng chọn học sinh!' }]}
          >
            <Select
              placeholder='Chọn học sinh'
              options={[]} // TODO: Thêm danh sách học sinh từ API
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name='eventName'
            label='Tên sự kiện'
            rules={[{ required: true, message: 'Vui lòng nhập tên sự kiện!' }]}
          >
            <Input placeholder='Nhập tên sự kiện' />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        name='description'
        label='Mô tả'
        rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}
      >
        <TextArea rows={4} placeholder='Nhập mô tả chi tiết về sự kiện...' />
      </Form.Item>

      <Form.Item
        name='actionTaken'
        label='Biện pháp xử lý'
        rules={[{ required: true, message: 'Vui lòng nhập biện pháp xử lý!' }]}
      >
        <TextArea rows={3} placeholder='Nhập biện pháp xử lý...' />
      </Form.Item>

      <Row gutter={24}>
        <Col span={12}>
          <Form.Item
            name='medicinesId'
            label='Thuốc sử dụng'
          >
            <Select
              mode='multiple'
              placeholder='Chọn thuốc'
              options={[]} // TODO: Thêm danh sách thuốc từ API
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name='medicalSuppliesId'
            label='Vật tư y tế sử dụng'
          >
            <Select
              mode='multiple'
              placeholder='Chọn vật tư y tế'
              options={[]} // TODO: Thêm danh sách vật tư từ API
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={24}>
        <Col span={12}>
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
        </Col>
        <Col span={12}>
          <Form.Item
            name='notes'
            label='Ghi chú'
          >
            <TextArea rows={3} placeholder='Nhập ghi chú thêm nếu cần...' />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item>
        <Button type='primary' htmlType='submit' style={{ marginRight: 8 }}>
          Tạo sự kiện
        </Button>
        <Button onClick={() => form.resetFields()}>
          Làm mới
        </Button>
      </Form.Item>
    </Form>
  )
}

export default CreateMedicalEventForm
