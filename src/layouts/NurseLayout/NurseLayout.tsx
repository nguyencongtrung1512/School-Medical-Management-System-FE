import React, { useState, useRef, useEffect } from 'react'
import { Layout } from 'antd'
import Sidebar from './Sidebar'
import { Outlet } from 'react-router-dom'
import ProfileModal from '../../components/Profile/ProfileModal'
import { LogoutOutlined, UserOutlined } from '@ant-design/icons'
import { useAuth } from '../../contexts/auth.context'
import path from '../../constants/path'
import { useNavigate } from 'react-router-dom'

const { Header, Content } = Layout

const NurseLayout: React.FC = () => {
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
          <div className='text-2xl font-bold text-white drop-shadow'>Nurse</div>
          <div className='relative' ref={dropdownRef}>
            <button
              className='flex text-xl items-center space-x-2 focus:outline-none rounded-full hover:bg-blue-500 p-1 transition-colors bg-blue-100 text-blue-900 font-semibold shadow-md'
              onClick={() => setOpen(!open)}
            >
              <div className='w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold'>
                N
              </div>
              <span className='text-white font-medium'>Nurse</span>
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

export default NurseLayout
