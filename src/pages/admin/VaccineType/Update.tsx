"use client"

import type React from "react"
import { useEffect } from "react"
import { Modal, Form, Input, Button, message } from "antd"
import { updateVaccineTypeAPI } from '../../../api/vaccineType.api'

interface VaccineType {
  _id?: string
  code: string
  name: string
  description?: string
}

interface UpdateProps {
  open: boolean
  vaccineType: VaccineType
  onClose: () => void
}

const Update: React.FC<UpdateProps> = ({ open, vaccineType, onClose }) => {
  const [form] = Form.useForm()

  useEffect(() => {
    if (vaccineType) {
      form.setFieldsValue(vaccineType)
    }
  }, [vaccineType, form])

  const handleSubmit = async (values: VaccineType) => {
    try {
      await updateVaccineTypeAPI(vaccineType._id!, values)
      message.success("Cập nhật loại vaccine thành công")
      onClose()
    } catch {
      message.error("Cập nhật loại vaccine thất bại")
    }
  }

  return (
    <Modal title="Chỉnh sửa loại vaccine" open={open} onCancel={onClose} footer={null} width={600}>
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
            Cập nhật
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default Update
