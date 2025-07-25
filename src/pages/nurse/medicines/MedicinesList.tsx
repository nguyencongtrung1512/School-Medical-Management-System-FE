import type React from 'react'
import { useEffect, useState } from 'react'
import {
  Table,
  Button,
  Space,
  Modal,
  message,
  Card,
  Input,
  Typography,
  Tag,
  Tooltip,
  Divider,
  Badge,
  Row,
  Col,
  Dropdown,
  Menu,
  Descriptions
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  SearchOutlined,
  FilterOutlined,
  ReloadOutlined,
  ExclamationCircleOutlined,
  MedicineBoxOutlined,
  DownloadOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'
import { getMedicines, deleteMedicine, getMedicineById } from '../../../api/medicines.api'
import type { Medicine } from '../../../api/medicines.api'
import CreateMedicineForm from './Create'
import UpdateMedicineForm from './Update'
import * as XLSX from 'xlsx'

const { Title, Text } = Typography
const { Search } = Input
const { confirm } = Modal

const MedicinesList: React.FC = () => {
  const [medicines, setMedicines] = useState<Medicine[]>([])
  const [loading, setLoading] = useState(false)
  const [exportLoading, setExportLoading] = useState(false)
  const [totalItems, setTotalItems] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false)
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false)
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false)
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null)
  const [searchText, setSearchText] = useState('')
  const [expirySort, setExpirySort] = useState<'none' | 'asc' | 'desc'>('none')

  const fetchMedicines = async (page: number, size: number) => {
    try {
      setLoading(true)
      const response = await getMedicines(page, size)
      if (response && response.pageData) {
        setMedicines(response.pageData)
        setTotalItems(response.pageInfo.totalItems)
      } else {
        message.error('Dữ liệu không đúng định dạng')
      }
    } catch (error: unknown) {
      console.log('error', error)
      const err = error as { message?: string }
      if (err.message) {
        message.error(err.message)
      } else {
        message.error('Không thể tải danh sách thuốc')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMedicines(currentPage, pageSize)
  }, [currentPage, pageSize])

  const showDeleteConfirm = (record: Medicine) => {
    confirm({
      title: 'Xác nhận xóa thuốc',
      icon: <ExclamationCircleOutlined />,
      content: `Bạn có chắc chắn muốn xóa thuốc "${record.name}" không?`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk() {
        handleDelete(record._id)
      }
    })
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteMedicine(id)
      message.success('Xóa thuốc thành công')
      fetchMedicines(currentPage, pageSize)
    } catch (error: unknown) {
      console.log('error', error)
      const err = error as { message?: string }
      if (err.message) {
        message.error(err.message)
      } else {
        message.error('Không thể xóa thuốc')
      }
    }
  }

  const handleViewDetail = async (id: string) => {
    try {
      const medicine = await getMedicineById(id)
      setSelectedMedicine(medicine.data)
      setIsDetailModalVisible(true)
    } catch (error: unknown) {
      console.log('error', error)
      const err = error as { message?: string }
      if (err.message) {
        message.error(err.message)
      } else {
        message.error('Không thể tải thông tin thuốc')
      }
    }
  }

  const handleUpdate = (medicine: Medicine) => {
    setSelectedMedicine(medicine)
    setIsUpdateModalVisible(true)
  }

  const getExpiryStatus = (date: string) => {
    if (!date) return { color: 'default', text: 'Chưa có thông tin' }

    const expiryDate = dayjs(date)
    const today = dayjs()
    const daysUntilExpiry = expiryDate.diff(today, 'day')

    if (daysUntilExpiry < 0) {
      return { color: 'error', text: 'Đã hết hạn' }
    } else if (daysUntilExpiry <= 30) {
      return { color: 'warning', text: 'Sắp hết hạn' }
    } else {
      return { color: 'success', text: 'Còn hạn' }
    }
  }

  const getQuantityStatus = (quantity: number) => {
    if (quantity === 0) {
      return { color: 'error', text: 'Hết hàng' }
    } else if (quantity <= 10) {
      return { color: 'warning', text: 'Sắp hết' }
    } else {
      return { color: 'success', text: 'Còn hàng' }
    }
  }

  // Enhanced Excel Export Function
  const handleExportExcel = async () => {
    try {
      setExportLoading(true)

      // Prepare data for export
      const dataToExport = sortedMedicines.map((item, index) => ({
        STT: index + 1,
        'Tên thuốc': item.name,
        'Mô tả': item.description || 'Không có',
        'Liều lượng': item.dosage || 'Không có',
        'Số lượng': item.quantity,
        'Đơn vị': item.unit,
        'Trạng thái kho': getQuantityStatus(item.quantity).text,
        'Hãng sản xuất': item.manufacturer || 'Không có thông tin',
        'Ngày sản xuất': item.manufactureDate ? dayjs(item.manufactureDate).format('DD/MM/YYYY') : 'Không có thông tin',
        'Ngày hết hạn': item.expiryDate ? dayjs(item.expiryDate).format('DD/MM/YYYY') : 'Không có thông tin',
        'Số ngày còn lại': item.expiryDate ? dayjs(item.expiryDate).diff(dayjs(), 'day') : 'Không có thông tin',
        'Trạng thái hạn sử dụng': item.expiryDate ? getExpiryStatus(item.expiryDate).text : 'Không có thông tin',
        'Tác dụng phụ': item.sideEffects || 'Không có'
      }))

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.json_to_sheet(dataToExport)

      // Set column widths
      const colWidths = [
        { wch: 5 }, // STT
        { wch: 25 }, // Tên thuốc
        { wch: 30 }, // Mô tả
        { wch: 15 }, // Liều lượng
        { wch: 10 }, // Số lượng
        { wch: 10 }, // Đơn vị
        { wch: 15 }, // Trạng thái kho
        { wch: 20 }, // Hãng sản xuất
        { wch: 15 }, // Ngày sản xuất
        { wch: 15 }, // Ngày hết hạn
        { wch: 15 }, // Số ngày còn lại
        { wch: 20 }, // Trạng thái hạn sử dụng
        { wch: 35 } // Tác dụng phụ
      ]
      ws['!cols'] = colWidths

      // Add header styling
      const range = XLSX.utils.decode_range(ws['!ref'] || 'A1')
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellRef = XLSX.utils.encode_cell({ r: 0, c: col })
        if (!ws[cellRef]) continue
        ws[cellRef].s = {
          font: { bold: true, color: { rgb: 'FFFFFF' } },
          fill: { fgColor: { rgb: '1890FF' } },
          alignment: { horizontal: 'center', vertical: 'center' }
        }
      }

      // Add conditional formatting for quantity status
      for (let row = 1; row <= range.e.r; row++) {
        const quantityStatusCell = XLSX.utils.encode_cell({ r: row, c: 6 }) // Trạng thái kho
        const expiryStatusCell = XLSX.utils.encode_cell({ r: row, c: 11 }) // Trạng thái hạn sử dụng

        // Format quantity status
        if (ws[quantityStatusCell]) {
          const status = ws[quantityStatusCell].v
          let fillColor = 'FFFFFF'

          if (status === 'Hết hàng') {
            fillColor = 'FFEBEE' // light red
          } else if (status === 'Sắp hết') {
            fillColor = 'FFF3E0' // light orange
          } else if (status === 'Còn hàng') {
            fillColor = 'E8F5E8' // light green
          }

          ws[quantityStatusCell].s = {
            fill: { fgColor: { rgb: fillColor } },
            alignment: { horizontal: 'center', vertical: 'center' }
          }
        }

        // Format expiry status
        if (ws[expiryStatusCell]) {
          const status = ws[expiryStatusCell].v
          let fillColor = 'FFFFFF'

          if (status === 'Đã hết hạn') {
            fillColor = 'FFEBEE' // light red
          } else if (status === 'Sắp hết hạn') {
            fillColor = 'FFF3E0' // light orange
          } else if (status === 'Còn hạn') {
            fillColor = 'E8F5E8' // light green
          }

          ws[expiryStatusCell].s = {
            fill: { fgColor: { rgb: fillColor } },
            alignment: { horizontal: 'center', vertical: 'center' }
          }
        }
      }

      // Add main worksheet
      XLSX.utils.book_append_sheet(wb, ws, 'Danh sách thuốc')

      // Add summary sheet
      const summaryData = [
        { 'Thống kê': 'Tổng số loại thuốc', 'Số lượng': sortedMedicines.length },
        { 'Thống kê': 'Thuốc hết hàng', 'Số lượng': sortedMedicines.filter((item) => item.quantity === 0).length },
        {
          'Thống kê': 'Thuốc sắp hết',
          'Số lượng': sortedMedicines.filter((item) => item.quantity > 0 && item.quantity <= 10).length
        },
        { 'Thống kê': 'Thuốc còn hàng', 'Số lượng': sortedMedicines.filter((item) => item.quantity > 10).length },
        { 'Thống kê': '', 'Số lượng': '' },
        {
          'Thống kê': 'Thuốc đã hết hạn',
          'Số lượng': sortedMedicines.filter(
            (item) => item.expiryDate && getExpiryStatus(item.expiryDate).text === 'Đã hết hạn'
          ).length
        },
        {
          'Thống kê': 'Thuốc sắp hết hạn (≤30 ngày)',
          'Số lượng': sortedMedicines.filter(
            (item) => item.expiryDate && getExpiryStatus(item.expiryDate).text === 'Sắp hết hạn'
          ).length
        },
        {
          'Thống kê': 'Thuốc còn hạn',
          'Số lượng': sortedMedicines.filter(
            (item) => item.expiryDate && getExpiryStatus(item.expiryDate).text === 'Còn hạn'
          ).length
        },
        { 'Thống kê': '', 'Số lượng': '' },
        { 'Thống kê': 'Ngày xuất báo cáo', 'Số lượng': dayjs().format('DD/MM/YYYY HH:mm:ss') },
        { 'Thống kê': 'Người xuất', 'Số lượng': 'Hệ thống quản lý thuốc' }
      ]

      const summaryWs = XLSX.utils.json_to_sheet(summaryData)
      summaryWs['!cols'] = [{ wch: 30 }, { wch: 20 }]

      // Style summary headers
      for (let i = 0; i < summaryData.length; i++) {
        const cellA = XLSX.utils.encode_cell({ r: i, c: 0 })
        const cellB = XLSX.utils.encode_cell({ r: i, c: 1 })

        if (summaryData[i]['Thống kê'] === '') continue

        if (summaryWs[cellA]) {
          summaryWs[cellA].s = {
            font: { bold: true },
            alignment: { horizontal: 'left', vertical: 'center' }
          }
        }

        if (summaryWs[cellB]) {
          summaryWs[cellB].s = {
            alignment: { horizontal: 'center', vertical: 'center' }
          }
        }
      }

      XLSX.utils.book_append_sheet(wb, summaryWs, 'Thống kê tổng quan')

      // Generate filename with timestamp
      const timestamp = dayjs().format('DD-MM-YYYY_HH-mm-ss')
      const filename = `Danh_sach_thuoc_${timestamp}.xlsx`

      // Write and download file
      XLSX.writeFile(wb, filename)

      message.success(`Xuất file Excel thành công! Tải về: ${filename}`)
    } catch (error) {
      console.error('Export error:', error)
      message.error('Có lỗi xảy ra khi xuất file Excel')
    } finally {
      setExportLoading(false)
    }
  }

  // Export filtered data only
  const handleExportFiltered = async () => {
    if (sortedMedicines.length === 0) {
      message.warning('Không có dữ liệu để xuất')
      return
    }

    try {
      setExportLoading(true)

      const dataToExport = sortedMedicines.map((item, index) => ({
        STT: index + 1,
        'Tên thuốc': item.name,
        'Liều lượng': item.dosage || 'Không có',
        'Số lượng': item.quantity,
        'Đơn vị': item.unit,
        'Trạng thái kho': getQuantityStatus(item.quantity).text,
        'Hãng sản xuất': item.manufacturer || 'Không có thông tin',
        'Ngày hết hạn': item.expiryDate ? dayjs(item.expiryDate).format('DD/MM/YYYY') : 'Không có thông tin',
        'Trạng thái hạn sử dụng': item.expiryDate ? getExpiryStatus(item.expiryDate).text : 'Không có thông tin',
        'Tác dụng phụ': item.sideEffects || 'Không có'
      }))

      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.json_to_sheet(dataToExport)

      ws['!cols'] = [
        { wch: 5 },
        { wch: 25 },
        { wch: 15 },
        { wch: 10 },
        { wch: 10 },
        { wch: 15 },
        { wch: 20 },
        { wch: 15 },
        { wch: 20 },
        { wch: 35 }
      ]

      XLSX.utils.book_append_sheet(wb, ws, 'Dữ liệu đã lọc')

      const timestamp = dayjs().format('DD-MM-YYYY_HH-mm-ss')
      const filename = `Thuoc_da_loc_${timestamp}.xlsx`

      XLSX.writeFile(wb, filename)
      message.success(`Xuất dữ liệu đã lọc thành công!`)
    } catch (error) {
      console.error('Export filtered error:', error)
      message.error('Có lỗi xảy ra khi xuất dữ liệu đã lọc')
    } finally {
      setExportLoading(false)
    }
  }

  const columns = [
    {
      title: 'Tên thuốc',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => (
        <Space>
          <MedicineBoxOutlined style={{ color: '#1890ff' }} />
          <Text strong>{text}</Text>
        </Space>
      ),
      sorter: (a: Medicine, b: Medicine) => a.name.localeCompare(b.name)
    },
    {
      title: 'Liều lượng',
      dataIndex: 'dosage',
      key: 'dosage',
      render: (text: string) => <Tag color='blue'>{text}</Tag>
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (quantity: number, record: Medicine) => {
        const status = getQuantityStatus(quantity)
        return (
          <Space>
            <Text>{quantity}</Text>
            <Text type='secondary'>{record.unit}</Text>
            <Badge status={status.color as any} text={status.text} />
          </Space>
        )
      },
      sorter: (a: Medicine, b: Medicine) => a.quantity - b.quantity
    },
    {
      title: 'Tác dụng phụ',
      dataIndex: 'sideEffects',
      key: 'sideEffects',
      render: (text: string) => (
        <Text ellipsis style={{ maxWidth: 150 }}>
          {text || 'Không có'}
        </Text>
      )
    },
    {
      title: 'Ngày hết hạn',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      render: (date: string) => {
        if (!date) return <Text type='secondary'>Chưa có thông tin</Text>
        const status = getExpiryStatus(date)
        return (
          <Space>
            <Text>{new Date(date).toLocaleDateString('vi-VN')}</Text>
            <Badge status={status.color as any} text={status.text} />
          </Space>
        )
      },
      sorter: (a: Medicine, b: Medicine) => {
        if (!a.expiryDate || !b.expiryDate) return 0
        return dayjs(a.expiryDate).unix() - dayjs(b.expiryDate).unix()
      }
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: unknown, record: Medicine) => (
        <Space size='middle'>
          <Tooltip title='Xem chi tiết'>
            <Button type='text' icon={<EyeOutlined />} onClick={() => handleViewDetail(record._id)} />
          </Tooltip>
          <Tooltip title='Chỉnh sửa'>
            <Button type='text' icon={<EditOutlined />} onClick={() => handleUpdate(record)} />
          </Tooltip>
          <Tooltip title='Xóa'>
            <Button type='text' danger icon={<DeleteOutlined />} onClick={() => showDeleteConfirm(record)} />
          </Tooltip>
        </Space>
      )
    }
  ]

  const handleSearch = (value: string) => {
    setSearchText(value)
  }

  const filteredMedicines = searchText
    ? medicines.filter(
        (item) =>
          item.name.toLowerCase().includes(searchText.toLowerCase()) ||
          item.description?.toLowerCase().includes(searchText.toLowerCase()) ||
          item.dosage?.toLowerCase().includes(searchText.toLowerCase()) ||
          item.manufacturer?.toLowerCase().includes(searchText.toLowerCase())
      )
    : medicines

  const sortedMedicines = (() => {
    if (expirySort === 'asc') {
      return [...filteredMedicines].sort((a, b) => {
        if (!a.expiryDate) return 1
        if (!b.expiryDate) return -1
        return dayjs(a.expiryDate).unix() - dayjs(b.expiryDate).unix()
      })
    } else if (expirySort === 'desc') {
      return [...filteredMedicines].sort((a, b) => {
        if (!a.expiryDate) return 1
        if (!b.expiryDate) return -1
        return dayjs(b.expiryDate).unix() - dayjs(a.expiryDate).unix()
      })
    }
    return filteredMedicines
  })()

  const filterMenu = (
    <Menu
      onClick={({ key }) => {
        if (key === 'asc') setExpirySort('asc')
        else if (key === 'desc') setExpirySort('desc')
        else setExpirySort('none')
      }}
      items={[
        { key: 'asc', label: 'Ngày hết hạn: Gần nhất' },
        { key: 'desc', label: 'Ngày hết hạn: Xa nhất' },
        { key: 'reset', label: 'Bỏ lọc ngày hết hạn' },
        { type: 'divider' }
      ]}
    />
  )

  const exportMenu = (
    <Menu
      items={[
        {
          key: 'all',
          label: 'Xuất tất cả dữ liệu',
          icon: <DownloadOutlined />,
          onClick: handleExportExcel
        },
        {
          key: 'filtered',
          label: 'Xuất dữ liệu đã lọc',
          icon: <DownloadOutlined />,
          onClick: handleExportFiltered
        }
      ]}
    />
  )
  return (
    <div className='p-6'>
      <Card bordered={false} className='shadow-sm'>
        <Row gutter={[16, 16]} align='middle' justify='space-between'>
          <Col>
            <Title level={2} style={{ margin: 0 }}>
              <Space>
                <MedicineBoxOutlined style={{ color: '#1890ff' }} />
                Quản lý thuốc
              </Space>
            </Title>
          </Col>
          <Col>
            <Space>
              <Dropdown overlay={exportMenu} trigger={['click']}>
                <Button icon={<DownloadOutlined />} size='large' loading={exportLoading}>
                  Xuất Excel
                </Button>
              </Dropdown>
              <Button type='primary' icon={<PlusOutlined />} onClick={() => setIsCreateModalVisible(true)} size='large'>
                Thêm thuốc mới
              </Button>
            </Space>
          </Col>
        </Row>

        <Divider />

        <Row gutter={[16, 16]} className='mb-4'>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Search
              placeholder='Tìm kiếm thuốc'
              allowClear
              enterButton={<SearchOutlined />}
              size='middle'
              onSearch={handleSearch}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </Col>
          <Col>
            <Space>
              <Dropdown overlay={filterMenu} trigger={['click']}>
                <Button icon={<FilterOutlined />}>Lọc</Button>
              </Dropdown>
              <Tooltip title='Làm mới dữ liệu'>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={() => fetchMedicines(currentPage, pageSize)}
                  loading={loading}
                />
              </Tooltip>
            </Space>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={sortedMedicines}
          rowKey='_id'
          loading={loading}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: totalItems,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Tổng cộng ${total} loại thuốc`,
            onChange: (page, size) => {
              setCurrentPage(page)
              setPageSize(size || 10)
            }
          }}
          bordered
          size='middle'
          scroll={{ x: 'max-content' }}
        />
      </Card>

      {/* Modal thêm thuốc mới */}
      <Modal
        title={
          <Title level={4}>
            <Space>
              <PlusOutlined />
              Thêm thuốc mới
            </Space>
          </Title>
        }
        open={isCreateModalVisible}
        onCancel={() => setIsCreateModalVisible(false)}
        footer={null}
        width={800}
        destroyOnClose
      >
        <CreateMedicineForm
          onSuccess={() => {
            setIsCreateModalVisible(false)
            fetchMedicines(currentPage, pageSize)
            message.success('Thêm thuốc thành công')
          }}
          onCancel={() => setIsCreateModalVisible(false)}
        />
      </Modal>

      {/* Modal cập nhật thuốc */}
      <Modal
        title={
          <Title level={4}>
            <Space>
              <EditOutlined />
              Cập nhật thông tin thuốc
            </Space>
          </Title>
        }
        open={isUpdateModalVisible}
        onCancel={() => setIsUpdateModalVisible(false)}
        footer={null}
        width={800}
        destroyOnClose
      >
        {selectedMedicine && (
          <UpdateMedicineForm
            medicine={selectedMedicine}
            onSuccess={() => {
              setIsUpdateModalVisible(false)
              fetchMedicines(currentPage, pageSize)
              message.success('Cập nhật thuốc thành công')
            }}
            onCancel={() => setIsUpdateModalVisible(false)}
          />
        )}
      </Modal>

      {/* Modal xem chi tiết */}
      <Modal
        title={
          <Title level={4}>
            <Space>
              <EyeOutlined />
              Chi tiết thuốc
            </Space>
          </Title>
        }
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={[
          <Button key='close' onClick={() => setIsDetailModalVisible(false)}>
            Đóng
          </Button>,
          <Button
            key='edit'
            type='primary'
            icon={<EditOutlined />}
            onClick={() => {
              setIsDetailModalVisible(false)
              setIsUpdateModalVisible(true)
            }}
          >
            Chỉnh sửa
          </Button>
        ]}
        width={700}
      >
        {selectedMedicine && (
          <Card bordered={false}>
            <Descriptions bordered column={1} size='middle'>
              <Descriptions.Item
                label={
                  <Text strong>
                    <MedicineBoxOutlined /> Tên thuốc
                  </Text>
                }
              >
                <Text strong style={{ fontSize: '16px', color: '#1890ff' }}>
                  {selectedMedicine.name}
                </Text>
              </Descriptions.Item>

              <Descriptions.Item label={<Text strong>Mô tả</Text>}>
                <Text>{selectedMedicine.description || 'Không có mô tả'}</Text>
              </Descriptions.Item>

              <Descriptions.Item label={<Text strong>Liều lượng</Text>}>
                <Tag color='blue' style={{ fontSize: '14px' }}>
                  {selectedMedicine.dosage}
                </Tag>
              </Descriptions.Item>

              <Descriptions.Item label={<Text strong>Số lượng</Text>}>
                <Space>
                  <Text style={{ fontSize: '16px' }}>
                    {selectedMedicine.quantity} {selectedMedicine.unit}
                  </Text>
                  <Badge
                    status={getQuantityStatus(selectedMedicine.quantity).color as any}
                    text={getQuantityStatus(selectedMedicine.quantity).text}
                  />
                </Space>
              </Descriptions.Item>

              <Descriptions.Item label={<Text strong>Hãng sản xuất</Text>}>
                <Text>{selectedMedicine.manufacturer || 'Không có thông tin'}</Text>
              </Descriptions.Item>

              <Descriptions.Item label={<Text strong>Ngày sản xuất</Text>}>
                <Text>
                  {selectedMedicine.manufactureDate
                    ? new Date(selectedMedicine.manufactureDate).toLocaleDateString('vi-VN')
                    : 'Không có thông tin'}
                </Text>
              </Descriptions.Item>

              <Descriptions.Item label={<Text strong>Ngày hết hạn</Text>}>
                {selectedMedicine.expiryDate ? (
                  <Space>
                    <Text>{new Date(selectedMedicine.expiryDate).toLocaleDateString('vi-VN')}</Text>
                    <Tag color={getExpiryStatus(selectedMedicine.expiryDate).color}>
                      {getExpiryStatus(selectedMedicine.expiryDate).text}
                    </Tag>
                  </Space>
                ) : (
                  <Text type='secondary'>Không có thông tin</Text>
                )}
              </Descriptions.Item>

              {selectedMedicine.sideEffects && (
                <Descriptions.Item label={<Text strong>Tác dụng phụ</Text>}>
                  <Text type='warning'>{selectedMedicine.sideEffects}</Text>
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>
        )}
      </Modal>
    </div>
  )
}

export default MedicinesList
