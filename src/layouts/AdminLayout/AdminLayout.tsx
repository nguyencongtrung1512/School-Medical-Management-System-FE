import React from 'react'
import { Layout } from 'antd'
import { Outlet } from 'react-router-dom'
import Sidebar from './SideBar'

const { Header, Content } = Layout

const AdminLayout: React.FC = () => {
  return (
    <Layout className='min-h-screen bg-gray-100'>
      <Sidebar />
      <Layout className='ml-[270px] transition-all duration-300'>
        <Header className='bg-white px-10 py-7 shadow-md flex items-center justify-between sticky top-0 z-20'>
          <div className='text-2xl font-bold text-gray-800'>Admin Dashboard</div>
          <div className='flex items-center space-x-4'>
            <div className='flex items-center space-x-2 hover:bg-gray-50 p-2 rounded-lg transition-colors duration-200 cursor-pointer'>
              <div className='w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold shadow-sm'>
                A
              </div>
              <span className='text-gray-700 font-medium'>Admin</span>
            </div>
          </div>
        </Header>
        <Content className='m-6 p-6 bg-white rounded-lg shadow-sm min-h-[calc(100vh-120px)]'>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

export default AdminLayout
