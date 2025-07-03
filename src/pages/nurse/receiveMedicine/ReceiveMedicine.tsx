import React, { useEffect, useState } from 'react'
import { Table, Button, Tag, message, Modal, Descriptions, Space } from 'antd'
import {
  getMedicineSubmissionsByNurseId,
  updateMedicineSubmissionStatus,
  updateMedicineSlotStatus
} from '../../../api/medicineSubmissions.api'
import { getUserByIdAPI } from '../../../api/user.api'
import { getStudentByIdAPI } from '../../../api/student.api'
import { handleUploadFile } from '../../../utils/upload'

function ReceiveMedicine() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState<any | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [slotImages, setSlotImages] = useState<{ [slotTime: string]: string }>({})
  const [slotUploading, setSlotUploading] = useState<{ [slotTime: string]: boolean }>({})

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const userStr = localStorage.getItem('user')
      if (!userStr) return
      const user = JSON.parse(userStr)
      const res = await getMedicineSubmissionsByNurseId(user.id)
      // Map thêm thông tin parent, student, nurse
      const mapped = await Promise.all(
        res.pageData.map(async (item: any) => {
          const [parent, student, nurse] = await Promise.all([
            getUserByIdAPI(item.parentId).then((r) => r.data),
            getStudentByIdAPI(item.studentId).then((r) => r.data),
            getUserByIdAPI(item.schoolNurseId).then((r) => r.data)
          ])
          return { ...item, parent, student, schoolNurse: nurse }
        })
      )
      setData(mapped)
    } catch (err) {
      message.error('Lỗi tải dữ liệu!')
    } finally {
      setLoading(false)
    }
  }

  const handleStatus = async (id: string, status: string) => {
    try {
      await updateMedicineSubmissionStatus(id, status)
      message.success('Cập nhật trạng thái thành công!')
      fetchData()
    } catch {
      message.error('Cập nhật trạng thái thất bại!')
    }
  }

  const renderStatusText = (status: string) => {
    if (status === 'taken') return 'Đã uống'
    if (status === 'missed') return 'Bỏ lỡ'
    if (status === 'compensated') return 'Bù sau'
    return status
  }

  const handleUpdateSlotStatus = async (status: 'taken' | 'missed' | 'compensated', time: string, image?: string) => {
    if (!selected) return
    try {
      console.log({
        id: selected._id,
        medicineDetailId: selected.medicines[0]._id,
        time,
        status,
        image
      })
      console.log('Các timeSlots:', selected.medicines[0].timeSlots)
      await updateMedicineSlotStatus(selected._id, {
        medicineDetailId: selected.medicines[0]._id,
        time,
        status,
        image
      })
      message.success('Cập nhật trạng thái slot thành công!')
      fetchData()
      setSelected((prev: any) => {
        if (!prev) return prev
        return {
          ...prev,
          medicines: prev.medicines.map((med: any, idx: number) =>
            idx === 0
              ? {
                  ...med,
                  slotStatus: [...(med.slotStatus || []).filter((s: any) => s.time !== time), { time, status, image }]
                }
              : med
          )
        }
      })
    } catch {
      message.error('Cập nhật trạng thái slot thất bại!')
    }
  }

  const columns = [
    {
      title: 'Học sinh',
      dataIndex: 'student',
      render: (student: any) => (student ? `${student.fullName} (${student.studentCode})` : '')
    },
    {
      title: 'Phụ huynh',
      dataIndex: 'parent',
      render: (parent: any) => (parent ? `${parent.fullName} (${parent.phone})` : '')
    },
    {
      title: 'Thuốc',
      dataIndex: 'medicines',
      render: (medicines: any[]) => (medicines && medicines.length > 0 ? medicines[0].name : '')
    },
    {
      title: 'Ngày gửi',
      dataIndex: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString('vi-VN')
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      render: (status: string) => {
        let color = 'blue',
          text = 'Chờ xác nhận'
        if (status === 'approved') {
          color = 'lime'
          text = 'Đã duyệt'
        } else if (status === 'completed') {
          color = 'green'
          text = 'Đã hoàn thành'
        } else if (status === 'rejected') {
          color = 'red'
          text = 'Đã từ chối'
        }
        return <Tag color={color}>{text}</Tag>
      }
    },
    {
      title: 'Thao tác',
      render: (_: any, record: any) => (
        <Space>
          <Button
            type='link'
            onClick={() => {
              setSelected(record)
              setModalOpen(true)
            }}
          >
            Xem chi tiết
          </Button>
          {record.status === 'pending' && <Button onClick={() => handleStatus(record._id, 'approved')}>Duyệt</Button>}
          {record.status === 'pending' && (
            <Button danger onClick={() => handleStatus(record._id, 'rejected')}>
              Từ chối
            </Button>
          )}
          {record.status === 'approved' && (
            <Button onClick={() => handleStatus(record._id, 'completed')}>Hoàn thành</Button>
          )}
        </Space>
      )
    }
  ]

  return (
    <div>
      <Table columns={columns} dataSource={data} rowKey='_id' loading={loading} />
      <Modal open={modalOpen} onCancel={() => setModalOpen(false)} footer={null} width={700}>
        {selected && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label='Học sinh' span={2}>
              {selected.student?.fullName} - {selected.student?.studentCode}
            </Descriptions.Item>
            <Descriptions.Item label='Phụ huynh' span={2}>
              {selected.parent?.fullName} - {selected.parent?.phone}
            </Descriptions.Item>
            <Descriptions.Item label='Tên thuốc'>{selected.medicines[0]?.name}</Descriptions.Item>
            <Descriptions.Item label='Liều lượng'>{selected.medicines[0]?.dosage}</Descriptions.Item>
            <Descriptions.Item label='Số lần uống'>{selected.medicines[0]?.timesPerDay}</Descriptions.Item>
            <Descriptions.Item label='Thời gian uống'>{selected.medicines[0]?.usageInstructions}</Descriptions.Item>
            <Descriptions.Item label='Lý do dùng thuốc' span={2}>
              {selected.medicines[0]?.reason}
            </Descriptions.Item>
            {selected.medicines[0]?.note && (
              <Descriptions.Item label='Ghi chú đặc biệt' span={2}>
                {selected.medicines[0]?.note}
              </Descriptions.Item>
            )}
            <Descriptions.Item label='Lịch uống' span={2}>
              {selected.medicines[0]?.timeSlots?.map((slot: string) => {
                const slotStatus = selected.medicines[0]?.slotStatus?.find((s: any) => s.time === slot)
                return (
                  <div key={slot} style={{ marginBottom: 8 }}>
                    <span>
                      {new Date(slot).toLocaleTimeString('vi-VN')} - Trạng thái:
                      <b> {slotStatus?.status ? renderStatusText(slotStatus.status) : 'Chưa cập nhật'}</b>
                    </span>
                    <input
                      type='file'
                      accept='image/*'
                      style={{ marginLeft: 8 }}
                      disabled={slotUploading[slot]}
                      onChange={async (e) => {
                        if (e.target.files && e.target.files[0]) {
                          setSlotUploading((prev) => ({ ...prev, [slot]: true }))
                          const url = await handleUploadFile(e.target.files[0], 'image')
                          setSlotUploading((prev) => ({ ...prev, [slot]: false }))
                          if (url) {
                            setSlotImages((prev) => ({ ...prev, [slot]: url }))
                            message.success('Tải ảnh thành công!')
                          }
                        }
                      }}
                    />
                    <Button.Group style={{ marginLeft: 8 }}>
                      <Button
                        size='small'
                        onClick={() => handleUpdateSlotStatus('taken', slot, slotImages[slot])}
                        loading={slotUploading[slot]}
                      >
                        Đã uống
                      </Button>
                      <Button
                        size='small'
                        onClick={() => handleUpdateSlotStatus('missed', slot, slotImages[slot])}
                        loading={slotUploading[slot]}
                      >
                        Bỏ lỡ
                      </Button>
                      <Button
                        size='small'
                        onClick={() => handleUpdateSlotStatus('compensated', slot, slotImages[slot])}
                        loading={slotUploading[slot]}
                      >
                        Bù sau
                      </Button>
                    </Button.Group>
                    {slotImages[slot] && (
                      <img
                        src={slotImages[slot]}
                        alt='Ảnh xác nhận'
                        style={{ width: 40, height: 40, marginLeft: 8, borderRadius: 4, border: '1px solid #eee' }}
                      />
                    )}
                  </div>
                )
              })}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  )
}

export default ReceiveMedicine
