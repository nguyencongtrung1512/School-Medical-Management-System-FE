"use client"

import type React from "react"
import { Modal, Form, Input, Button, message } from "antd"
import { createVaccineTypeAPI, VaccineType } from '../../../api/vaccineType.api'

interface CreateProps {
  open: boolean
  onClose: () => void
  destroyOnClose?: boolean
}

const Create: React.FC<CreateProps> = ({ open, onClose, destroyOnClose }) => {
  const [form] = Form.useForm()

  const handleSubmit = async (values: VaccineType) => {
    try {
      await createVaccineTypeAPI(values)
      message.success("Thêm loại vaccine thành công")
      form.resetFields()
      onClose()
    } catch {
      message.error("Thêm loại vaccine thất bại")
    }
  }

  return (
    <Modal
      title="Thêm loại vaccine mới"
      open={open}
      onCancel={onClose}
      destroyOnClose={destroyOnClose}
      footer={null}
      width={600}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit} autoComplete="off">
        <Form.Item
          label="Mã loại vaccine"
          name="code"
          rules={[
            { required: true, message: "Vui lòng nhập mã loại vaccine" },
            { min: 2, message: "Mã phải có ít nhất 2 ký tự" },
          ]}
        >
          <Input placeholder="Nhập mã loại vaccine" />
        </Form.Item>

        <Form.Item
          label="Tên loại vaccine"
          name="name"
          rules={[
            { required: true, message: "Vui lòng nhập tên loại vaccine" },
            { min: 3, message: "Tên phải có ít nhất 3 ký tự" },
          ]}
        >
          <Input placeholder="Nhập tên loại vaccine" />
        </Form.Item>

        <Form.Item label="Mô tả" name="description">
          <Input.TextArea rows={4} placeholder="Nhập mô tả về loại vaccine" />
        </Form.Item>

        <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
          <Button onClick={onClose} style={{ marginRight: 8 }}>
            Hủy
          </Button>
          <Button type="primary" htmlType="submit">
            Thêm mới
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default Create
