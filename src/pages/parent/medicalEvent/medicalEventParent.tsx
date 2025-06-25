import {
  BellOutlined,
  CalendarOutlined,
  CheckCircleFilled,
  CheckSquareOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  HeartOutlined
} from '@ant-design/icons'

function MedicalEventParent() {
  const children = [
    {
      name: 'Emma Johnson',
      age: '8 years old',
      lastCheckup: '2 weeks ago',
      avatar: 'https://i.pravatar.cc/150?img=1',
      selected: false
    },
    {
      name: 'Lucas Johnson',
      age: '5 years old',
      lastCheckup: '2 weeks ago',
      avatar: 'https://i.pravatar.cc/150?img=2',
      selected: true
    },
    {
      name: 'Sophia Johnson',
      age: '3 years old',
      lastCheckup: '2 weeks ago',
      avatar: 'https://i.pravatar.cc/150?img=3',
      selected: false
    }
  ]

  const selectedChild = children.find((c) => c.selected)

  return (
    <div className='bg-gray-50 min-h-screen'>
      <div className='container mx-auto p-4 lg:p-8'>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* Left Sidebar */}
          <div className='lg:col-span-1 bg-white p-6 rounded-lg shadow-sm'>
            <h2 className='text-xl font-bold text-gray-800'>Your Children</h2>
            <p className='text-gray-500 mb-6'>Select a child to view their medical events</p>
            <div className='space-y-4'>
              {children.map((child, index) => (
                <div
                  key={index}
                  className={`flex items-center p-4 rounded-lg cursor-pointer transition-all ${child.selected ? 'border-2 border-blue-500 bg-blue-50' : 'border border-gray-200 bg-white'
                    }`}
                >
                  <div className='relative'>
                    <img src={child.avatar} alt={child.name} className='w-16 h-16 rounded-full object-cover' />
                    <CheckCircleFilled className='absolute bottom-0 right-0 text-green-500 bg-white rounded-full text-xl' />
                  </div>
                  <div className='ml-4'>
                    <p className='font-semibold text-gray-900'>{child.name}</p>
                    <p className='text-sm text-gray-600'>{child.age}</p>
                    <p className='text-xs text-gray-400 mt-1'>Last checkup: {child.lastCheckup}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Content */}
          <div className='lg:col-span-2'>
            {selectedChild && (
              <>
                <div className='flex items-center mb-6'>
                  <img
                    src={selectedChild.avatar}
                    alt={selectedChild.name}
                    className='w-20 h-20 rounded-full object-cover'
                  />
                  <div className='ml-4'>
                    <h1 className='text-3xl font-bold text-gray-900'>{selectedChild.name}</h1>
                    <p className='text-gray-500'>
                      {selectedChild.age} <span className='mx-2'>•</span>{' '}
                      <a href='#' className='text-blue-600 hover:underline'>
                        Medical History
                      </a>
                    </p>
                  </div>
                </div>

                <div className='bg-yellow-100 border-l-4 border-yellow-400 text-yellow-700 p-4 rounded-md mb-8 flex items-center'>
                  <ExclamationCircleOutlined className='text-xl mr-3' />
                  <p>1 medical event requires your attention</p>
                </div>

                {/* Pending Acknowledgment */}
                <div className='mb-8'>
                  <h3 className='text-xl font-semibold text-gray-800 mb-4 flex items-center'>
                    <BellOutlined className='mr-2 text-yellow-500' /> Pending Acknowledgment
                  </h3>
                  <div className='bg-white p-6 rounded-lg shadow-sm border border-blue-300'>
                    <div className='flex justify-between items-start'>
                      <div className='flex items-start'>
                        <div className='bg-purple-100 p-3 rounded-full mr-4'>
                          <svg
                            xmlns='http://www.w3.org/2000/svg'
                            className='h-6 w-6 text-purple-600'
                            fill='none'
                            viewBox='0 0 24 24'
                            stroke='currentColor'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125s-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125s.504 1.125 1.125 1.125z'
                            />
                          </svg>
                        </div>
                        <div>
                          <div className='flex items-center mb-1'>
                            <h4 className='font-bold text-lg text-gray-900'>Antibiotic Treatment</h4>
                            <span className='ml-3 bg-yellow-200 text-yellow-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded'>
                              medium priority
                            </span>
                            <span className='bg-blue-200 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded'>
                              New
                            </span>
                          </div>
                          <p className='text-gray-600'>
                            Started amoxicillin for ear infection. 10-day course prescribed.
                          </p>
                          <div className='flex items-center text-gray-500 text-sm mt-3'>
                            <CalendarOutlined className='mr-2' />
                            <span>Jun 10, 2024</span>
                            <ClockCircleOutlined className='ml-4 mr-2' />
                            <span>7:00 AM</span>
                          </div>
                        </div>
                      </div>
                      <div className='flex flex-col space-y-2'>
                        <button className='px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition'>
                          View Details
                        </button>
                        <button className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition'>
                          Acknowledge
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent History */}
                <div>
                  <h3 className='text-xl font-semibold text-gray-800 mb-4 flex items-center'>
                    <CheckSquareOutlined className='mr-2 text-green-500' /> Recent History
                  </h3>
                  <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-200'>
                    <div className='flex justify-between items-start'>
                      <div className='flex items-start'>
                        <div className='bg-blue-100 p-3 rounded-full mr-4'>
                          <HeartOutlined className='text-blue-600' />
                        </div>
                        <div>
                          <div className='flex items-center mb-1'>
                            <h4 className='font-bold text-lg text-gray-900'>Routine Checkup</h4>
                            <span className='ml-3 bg-green-200 text-green-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded'>
                              low priority
                            </span>
                          </div>
                          <p className='text-gray-600'>
                            Regular pediatric checkup. All vitals normal, growth on track.
                          </p>
                          <div className='flex items-center text-gray-500 text-sm mt-3'>
                            <CalendarOutlined className='mr-2' />
                            <span>Jun 19, 2024</span>
                            <ClockCircleOutlined className='ml-4 mr-2' />
                            <span>7:00 AM</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <button className='px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition'>
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MedicalEventParent