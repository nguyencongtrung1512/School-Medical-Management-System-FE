import React, { useEffect, useRef, useState } from 'react'
import { Layout } from 'antd'
import { Outlet, useNavigate } from 'react-router-dom'
import Sidebar from './SideBar'
import { useAuth } from '../../contexts/auth.context'
import path from '../../constants/path'
import { LogoutOutlined, UserOutlined } from '@ant-design/icons'
import ProfileModal from '../../components/Profile/ProfileModal'

const { Header, Content } = Layout

const AdminLayout: React.FC = () => {
  const [open, setOpen] = useState(false)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const { logout } = useAuth()
  const navigate = useNavigate()
  const dropdownRef = useRef<HTMLDivElement>(null)

  const handleLogout = () => {
    logout()
    setOpen(false)
    navigate(path.login)
  }

  const handleProfileClick = () => {
    setIsProfileModalOpen(true)
    setOpen(false)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])
  return (
    <Layout className='min-h-screen bg-gray-50'>
      <Sidebar />
      <Layout className='ml-[220px]'>
        <Header className='bg-white px-8 py-4 shadow-sm flex items-center justify-between'>
          <div className='text-2xl font-bold text-gray-800'>Admin Dashboard</div>
          <div className='relative' ref={dropdownRef}>
            <button
              className='flex text-xl items-center space-x-2 focus:outline-none rounded-full hover:bg-blue-100 p-1 transition-colors'
              onClick={() => setOpen(!open)}
            >
              <UserOutlined />
              <span className='text-gray-700 font-medium'>{'Admin'}</span>
            </button>

            {open && (
              <div className='absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50 border border-gray-200'>
                <button
                  className='w-full flex items-center px-3 py-2 text-gray-700 hover:bg-blue-50 transition-colors text-sm'
                  onClick={handleProfileClick}
                >
                  <UserOutlined className='mr-2' />
                  <span>Hồ sơ</span>
                </button>
                <button
                  className='w-full flex items-center px-3 py-2 text-red-500 hover:bg-blue-50 transition-colors text-sm'
                  onClick={handleLogout}
                >
                  <LogoutOutlined className='mr-2' />
                  <span>Đăng xuất</span>
                </button>
              </div>
            )}
          </div>
        </Header>
        <Content className='m-6 p-6 bg-white rounded-lg shadow-sm'>
          <Outlet />
        </Content>
      </Layout>
      <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
    </Layout>
  )
}

export default AdminLayout
