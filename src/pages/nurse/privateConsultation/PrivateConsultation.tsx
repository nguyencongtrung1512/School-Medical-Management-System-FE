import { useEffect, useState } from 'react'
import { Card, List, Spin, Typography, Empty, Avatar, Space, Divider, Row, Col, DatePicker } from 'antd'
import { UserOutlined, ClockCircleOutlined, PhoneOutlined, FileTextOutlined, CalendarOutlined } from '@ant-design/icons'
import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'

import { getAppointmentsNurse, type AppointmentAPIResponse } from '../../../api/appointment.api'
import { useAuth } from '../../../contexts/auth.context'

const { Title, Text } = Typography

function PrivateConsultation() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState<AppointmentAPIResponse[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs())

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!user) return

      setLoading(true)
      try {
        // Gọi API lấy danh sách lịch phỏng vấn theo nurseId
        const res = await getAppointmentsNurse({ pageNum: 1, pageSize: 10, nurseId: user.id })
        setAppointments(res)
        console.log('trung', res)
      } catch {
        setAppointments([])
      } finally {
        setLoading(false)
      }
    }

    fetchAppointments()
  }, [user])

  // Lọc danh sách theo ngày nếu có chọn
  const filteredAppointments = (appointments ?? []).filter((item) =>
    dayjs(item.appointmentTime).isSame(selectedDate, 'day')
  )

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px 0' }}>
        <Spin size='large' />
        <div style={{ marginTop: 16 }}>
          <Text>Đang tải dữ liệu...</Text>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '2px', minHeight: '100vh' }}>
      <Card>
        <Title level={2} style={{ marginBottom: 24, color: '#1890ff' }}>
          <CalendarOutlined style={{ marginRight: 8 }} />
          Lịch Tư Vấn
        </Title>
        <div style={{ marginBottom: 24 }}>
          <DatePicker
            format='DD/MM/YYYY'
            value={selectedDate}
            onChange={setSelectedDate}
            allowClear
            placeholder='Chọn ngày cần xem'
            style={{ width: 220 }}
          />
        </div>
        {filteredAppointments.length === 0 ? (
          <Empty
            description={selectedDate ? 'Không có lịch phỏng vấn cho ngày này' : 'Không có lịch phỏng vấn nào'}
            style={{ padding: '50px 0' }}
          />
        ) : (
          <List
            itemLayout='vertical'
            size='large'
            dataSource={filteredAppointments}
            renderItem={(item) => (
              <List.Item key={item._id}>
                <Card
                  hoverable
                  style={{
                    marginBottom: 16,
                    borderRadius: 8,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}
                >
                  <Row gutter={[16, 16]}>
                    <Col xs={24} lg={12}>
                      <Space direction='vertical' size='middle' style={{ width: '100%' }}>
                        <div>
                          <Space align='center'>
                            <Avatar size='large' icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
                            <div>
                              <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
                                {item.student.fullName}
                              </Title>
                              <Text type='secondary'>Học sinh</Text>
                            </div>
                          </Space>
                        </div>

                        <div>
                          <Space>
                            <ClockCircleOutlined style={{ color: '#52c41a' }} />
                            <Text strong>Thời gian:</Text>
                            <Text>{new Date(item.appointmentTime).toLocaleString('vi-VN')}</Text>
                          </Space>
                        </div>

                        <div>
                          <Space align='start'>
                            <FileTextOutlined style={{ color: '#faad14', marginTop: 4 }} />
                            <div>
                              <Text strong>Lý do:</Text>
                              <div style={{ marginTop: 4 }}>
                                <Text>{item.reason}</Text>
                              </div>
                            </div>
                          </Space>
                        </div>
                      </Space>
                    </Col>

                    <Col xs={24} lg={12}>
                      <Space direction='vertical' size='middle' style={{ width: '100%' }}>
                        {/* <div>
                          <Space>
                            <Text strong>Trạng thái:</Text>
                            <Tag color={getStatusColor(item.status)} style={{ fontSize: '14px' }}>
                              {getStatusText(item.status)}
                            </Tag>
                          </Space>
                        </div> */}

                        {item.note && (
                          <div>
                            <Text strong>Ghi chú:</Text>
                            <div
                              style={{
                                marginTop: 4,
                                padding: 8,
                                background: '#f6f6f6',
                                borderRadius: 4,
                                border: '1px solid #d9d9d9'
                              }}
                            >
                              <Text>{item.note}</Text>
                            </div>
                          </div>
                        )}

                        <Divider style={{ margin: '12px 0' }} />

                        <div>
                          <Text strong style={{ color: '#722ed1' }}>
                            Thông tin phụ huynh:
                          </Text>
                          <div style={{ marginTop: 8 }}>
                            <Space direction='vertical' size='small'>
                              <Space>
                                <UserOutlined style={{ color: '#722ed1' }} />
                                <Text>{item.parent.fullName}</Text>
                              </Space>
                              <Space>
                                <PhoneOutlined style={{ color: '#722ed1' }} />
                                <Text copyable>{item.parent.phone}</Text>
                              </Space>
                            </Space>
                          </div>
                        </div>
                      </Space>
                    </Col>
                  </Row>
                </Card>
              </List.Item>
            )}
          />
        )}
      </Card>
    </div>
  )
}

export default PrivateConsultation
