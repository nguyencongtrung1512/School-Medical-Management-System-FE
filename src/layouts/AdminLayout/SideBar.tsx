import {
  AuditOutlined,
  BookOutlined,
  EditOutlined,
  HeartOutlined,
  MedicineBoxOutlined,
  TeamOutlined
} from '@ant-design/icons'
import { Layout, Menu } from 'antd'
import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import path from '../../constants/path'

const AnimatedIcon: React.FC<{
  children: React.ReactNode
  animationType?: 'scale' | 'bounce' | 'pulse' | 'rotate'
}> = ({ children, animationType = 'scale' }) => {
  const getAnimationClass = () => {
    switch (animationType) {
      case 'bounce':
        return 'hover:animate-bounce'
      case 'pulse':
        return 'hover:animate-pulse hover:scale-105'
      case 'rotate':
        return 'hover:rotate-12 hover:scale-110'
      default:
        return 'hover:scale-110'
    }
  }

  return (
    <span
      className={`inline-block transition-all duration-300 ease-in-out ${getAnimationClass()} mr-3`}
      style={{
        transformOrigin: 'center',
        color: '#000000'
      }}
    >
      {children}
    </span>
  )
}

const { Sider } = Layout

const Sidebar: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const menuItems = [
    // {
    //   key: path.DASHBOARD_ADMIN,
    //   icon: <DashboardOutlined className='text-xl' />,
    //   label: 'DashBoard'
    // },
    {
      key: path.CENSOR_LIST,
      icon: (
        <AnimatedIcon animationType='scale'>
          <MedicineBoxOutlined className='text-lg' />
        </AnimatedIcon>
      ),
      label: 'Tiêm chủng'
    },
    {
      key: path.VACCINE_TYPE,
      icon: (
        <AnimatedIcon animationType='scale'>
          <MedicineBoxOutlined className='text-lg' />
        </AnimatedIcon>
      ),
      label: 'Loại Vaccine'
    },
    {
      key: path.MEDICAL_PLAN,
      icon: (
        <AnimatedIcon animationType='scale'>
          <HeartOutlined className='text-lg' />
        </AnimatedIcon>
      ),
      label: 'Kiểm tra sức khoẻ'
    },
    {
      key: path.Appointment_Check,
      icon: (
        <AnimatedIcon animationType='scale'>
          <AuditOutlined className='text-lg' />
        </AnimatedIcon>
      ),
      label: 'Kiểm duyệt tư vấn'
    },
    {
      key: path.CATEGORY_MANAGEMENT,
      icon: (
        <AnimatedIcon animationType='scale'>
          <EditOutlined className='text-lg' />
        </AnimatedIcon>
      ),
      label: 'Quản lí Blog'
    },
    {
      key: path.USER_MANAGEMENT,
      icon: (
        <AnimatedIcon animationType='scale'>
          <TeamOutlined className='text-lg' />
        </AnimatedIcon>
      ),
      label: 'Quản lí User'
    },
    {
      key: path.GRADE_MANAGEMENT,
      icon: (
        <AnimatedIcon animationType='scale'>
          <BookOutlined className='text-lg' />
        </AnimatedIcon>
      ),
      label: 'Quản lí Student'
    }
  ]

  const handleMenuClick = (key: string) => {
    navigate(key)
  }

  return (
    <>
      <Sider width={240} className='fixed h-full left-0 top-0 bg-white border-r border-gray-200'>
        <div className='h-16 flex items-center px-6 border-b border-gray-200'>
          <div className='flex items-center'>
            <span className='text-blue-500 mr-2 transition-transform duration-300 hover:rotate-45 hover:scale-110'>
              <svg width='36' height='36' viewBox='0 0 36 36' fill='none' xmlns='http://www.w3.org/2000/svg'>
                <rect x='7' y='16' width='22' height='4' rx='2' fill='#1677ff' />
                <rect x='16' y='7' width='4' height='22' rx='2' fill='#1677ff' />
                <rect x='2' y='2' width='32' height='32' rx='8' stroke='#1677ff' strokeWidth='3' />
              </svg>
            </span>
            <span className='text-2xl font-bold select-none'>
              <span className='text-gray-900'>Edu</span>
              <span style={{ color: '#1677ff' }}>Care</span>
            </span>
          </div>
        </div>
        <Menu
          mode='inline'
          selectedKeys={[location.pathname]}
          className='border-0'
          items={menuItems}
          onClick={({ key }) => handleMenuClick(key)}
          style={{
            height: 'calc(100% - 64px)',
            borderRight: 0,
            fontSize: '15px'
          }}
        />
      </Sider>

      {/* Custom CSS for enhanced styling */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .ant-menu-item {
          transition: all 0.3s ease-in-out !important;
          border-radius: 8px !important;
          margin: 4px 8px !important;
        }

        .ant-menu-item:hover {
          background-color: rgba(22, 119, 255, 0.1) !important;
          transform: translateX(4px) !important;
          box-shadow: 0 2px 8px rgba(22, 119, 255, 0.15) !important;
        }

        .ant-menu-item-selected {
          background-color: rgba(22, 119, 255, 0.15) !important;
          border-radius: 8px !important;
          color: #1677ff !important;
          font-weight: 600 !important;
        }

        .ant-menu-item-selected .ant-menu-title-content {
          color: #1677ff !important;
        }

        .ant-menu-item:hover .ant-menu-title-content {
          color: #1677ff !important;
        }

        .ant-menu-item:hover span {
          color: #1677ff !important;
        }

        .ant-menu-item-selected span {
          color: #1677ff !important;
        }

        .ant-menu-item:hover span,
        .ant-menu-item-selected span {
          filter: drop-shadow(0 0 4px rgba(22, 119, 255, 0.4));
          transition: all 0.3s ease-in-out;
        }

        .ant-menu-title-content {
          transition: color 0.3s ease-in-out !important;
        }
      `
        }}
      />
    </>
  )
}

export default Sidebar
