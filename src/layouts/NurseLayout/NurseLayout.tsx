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
    <Layout className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50'>
      <Sidebar />
      <Layout className='ml-[240px]'>
        <Header className='sticky top-0 z-50 bg-white/95 backdrop-blur-md px-8 py-4 shadow-xl border-b border-blue-100/50 flex items-center justify-between'>
          {/* Header Title/Brand */}
          <div className='flex items-center space-x-3'>
            <div>
              <h1 className='text-lg font-bold text-gray-800'>Nurse Dashboard</h1>
              <p className='text-xs text-gray-500'>Healthcare Management System</p>
            </div>
          </div>

          {/* User Profile Dropdown */}
          <div className='relative' ref={dropdownRef}>
            <div className='relative' ref={dropdownRef}>
              <button
                className='group flex items-center space-x-3 focus:outline-none rounded-2xl p-2 transition-all duration-300
      bg-gradient-to-r from-blue-100 to-indigo-100 text-[#06b6d4] font-semibold shadow-lg border border-blue-200/50
      hover:bg-gradient-to-r hover:from-blue-500 hover:to-indigo-600 hover:shadow-xl hover:scale-105'
                onClick={() => setOpen(!open)}
              >
                {/* Text label */}
                <div className='flex flex-col items-start'>
                  <span className='text-sm font-bold transition-colors duration-300 group-hover:text-white'>
                    Nurse Portal
                  </span>
                </div>
              </button>
            </div>

            {/* Dropdown Menu */}
            {open && (
              <div className='absolute right-0 mt-3 w-64 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl py-2 z-50 border border-blue-200/50 animate-in slide-in-from-top-2 duration-200'>
                <div className='py-2'>
                  <button
                    className='w-full flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 text-sm font-medium group'
                    onClick={handleProfileClick}
                  >
                    <div className='w-8 h-8 rounded-lg bg-blue-100 group-hover:bg-blue-200 flex items-center justify-center mr-3 transition-colors duration-200'>
                      <UserOutlined className='text-blue-600' />
                    </div>
                    <div className='flex flex-col items-start'>
                      <span className='font-semibold'>Hồ sơ</span>
                      <span className='text-xs text-gray-500'>Xem và chỉnh sửa thông tin</span>
                    </div>
                  </button>

                  <button
                    className='w-full flex items-center px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all duration-200 text-sm font-medium group'
                    onClick={handleLogout}
                  >
                    <div className='w-8 h-8 rounded-lg bg-red-100 group-hover:bg-red-200 flex items-center justify-center mr-3 transition-colors duration-200'>
                      <LogoutOutlined className='text-red-600' />
                    </div>
                    <div className='flex flex-col items-start'>
                      <span className='font-semibold'>Đăng xuất</span>
                      <span className='text-xs text-gray-500'>Thoát khỏi hệ thống</span>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </Header>

        <Content className='m-6 p-8 bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 relative overflow-hidden'>
          {/* Decorative Background Elements */}
          <div className='absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-200/30 to-indigo-200/30 rounded-full blur-3xl -translate-y-16 translate-x-16'></div>
          <div className='absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-200/30 to-pink-200/30 rounded-full blur-2xl translate-y-12 -translate-x-12'></div>

          {/* Content */}
          <div className='relative z-10'>
            <Outlet />
          </div>
        </Content>
      </Layout>

      <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
    </Layout>
  )
}

export default NurseLayout
