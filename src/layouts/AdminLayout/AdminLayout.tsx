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
        <Header className='sticky top-0 z-50 bg-gradient-to-r from-blue-600 to-blue-400 px-8 py-4 shadow-lg flex items-center justify-between'>
          <div className='text-2xl font-bold text-white drop-shadow'>Admin</div>
          <div className='relative' ref={dropdownRef}>
            <button
              className='flex text-xl items-center space-x-2 focus:outline-none rounded-full hover:bg-blue-500 p-1 transition-colors bg-blue-100 text-blue-900 font-semibold shadow-md'
              onClick={() => setOpen(!open)}
            >
              <UserOutlined />
              <span className='text-white font-medium'>Admin</span>
            </button>
            {open && (
              <div className='absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50 border border-blue-200'>
                <button
                  className='w-full flex items-center px-3 py-2 text-blue-700 hover:bg-blue-100 transition-colors text-sm font-semibold'
                  onClick={handleProfileClick}
                >
                  <UserOutlined className='mr-2' />
                  <span>Hồ sơ</span>
                </button>
                <button
                  className='w-full flex items-center px-3 py-2 text-red-500 hover:bg-blue-100 transition-colors text-sm font-semibold'
                  onClick={handleLogout}
                >
                  <LogoutOutlined className='mr-2' />
                  <span>Đăng xuất</span>
                </button>
              </div>
            )}
          </div>
        </Header>
        <Content className='m-6 p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl shadow-lg'>
          <Outlet />
        </Content>
      </Layout>
      <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
    </Layout>
  )
}

export default AdminLayout
