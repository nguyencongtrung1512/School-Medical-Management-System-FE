import React from 'react'
import { Layout, Menu } from 'antd'
import { FileSearchOutlined } from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'
import path from '../../constants/path'

const { Sider } = Layout

const Sidebar: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const menuItems = [
    {
      key: path.DASHBOARD_ADMIN,
      icon: <FileSearchOutlined className='text-xl' />,
      label: 'DashBoard'
    },
    {
      key: path.CENSOR_LIST,
      icon: <FileSearchOutlined className='text-xl' />,
      label: 'Danh sách kiểm duyệt'
    },
    {
      key: path.USER_MANAGEMENT,
      icon: <FileSearchOutlined className='text-xl' />,
      label: 'Quản lí User'
    },
    {
      key: path.GRADE_MANAGEMENT,
      icon: <FileSearchOutlined className='text-xl' />,
      label: 'Quản lí Student'
    }
  ]

  const handleMenuClick = (key: string) => {
    navigate(key)
  }

  return (
    <Sider
      width={270}
      className='fixed h-full left-0 top-0 bg-white border-r border-gray-200 shadow-lg rounded-r-2xl z-30'
      style={{ minHeight: '100vh' }}
    >
      <div className='h-24 flex items-center px-8 border-b border-gray-200 mb-2'>
        <div className='flex items-center'>
          <span className='text-blue-500 mr-3'>
            <svg width='48' height='48' viewBox='0 0 36 36' fill='none' xmlns='http://www.w3.org/2000/svg'>
              <rect x='7' y='16' width='22' height='4' rx='2' fill='#1da1f2' />
              <rect x='16' y='7' width='4' height='22' rx='2' fill='#1da1f2' />
              <rect x='2' y='2' width='32' height='32' rx='8' stroke='#1da1f2' strokeWidth='3' />
            </svg>
          </span>
          <span className='text-3xl font-extrabold select-none tracking-wide'>
            <span className='text-gray-900'>Edu</span>
            <span className='text-blue-500'>Care</span>
          </span>
        </div>
      </div>
      <Menu
        mode='inline'
        selectedKeys={[location.pathname]}
        className='border-0 bg-transparent font-medium text-base'
        items={menuItems}
        onClick={({ key }) => handleMenuClick(key)}
        style={{
          height: 'calc(100% - 96px)',
          borderRight: 0,
          fontSize: '17px',
          background: 'transparent',
          paddingTop: 12
        }}
      />
    </Sider>
  )
}

export default Sidebar
