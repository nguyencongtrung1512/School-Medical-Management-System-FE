import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

interface BlogPost {
  id: number
  title: string
  excerpt: string
  content: string
  image: string
  date: string
  category: string
  comments: number
}

const blogPosts: BlogPost[] = [
  {
    id: 1,
    title: 'Cách chăm sóc sức khỏe cho trẻ trong mùa dịch',
    excerpt: 'Những biện pháp phòng tránh và chăm sóc sức khỏe cho trẻ trong mùa dịch bệnh...',
    content: 'Nội dung chi tiết bài viết...',
    image: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80',
    date: '20/03/2024',
    category: 'Sức khỏe',
    comments: 5
  },
  {
    id: 2,
    title: 'Dinh dưỡng hợp lý cho trẻ mầm non',
    excerpt: 'Chế độ dinh dưỡng khoa học giúp trẻ phát triển toàn diện...',
    content: 'Nội dung chi tiết bài viết...',
    image: 'https://images.unsplash.com/photo-1490818387583-1baba5e638af?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80',
    date: '19/03/2024',
    category: 'Dinh dưỡng',
    comments: 3
  },
  {
    id: 3,
    title: 'Phát triển tâm lý cho trẻ mầm non',
    excerpt: 'Những phương pháp giúp trẻ phát triển tâm lý lành mạnh...',
    content: 'Nội dung chi tiết bài viết...',
    image: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80',
    date: '18/03/2024',
    category: 'Tâm lý',
    comments: 7
  },
  {
    id: 4,
    title: 'Lịch tiêm chủng cho trẻ mầm non',
    excerpt: 'Thông tin về các mũi tiêm cần thiết cho trẻ trong độ tuổi mầm non...',
    content: 'Nội dung chi tiết bài viết...',
    image: 'https://images.unsplash.com/photo-1490818387583-1baba5e638af?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80',
    date: '17/03/2024',
    category: 'Tiêm chủng',
    comments: 4
  },
  {
    id: 5,
    title: 'Tư vấn dinh dưỡng cho trẻ biếng ăn',
    excerpt: 'Giải pháp cho trẻ biếng ăn và cách xây dựng thói quen ăn uống lành mạnh...',
    content: 'Nội dung chi tiết bài viết...',
    image: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80',
    date: '16/03/2024',
    category: 'Tư vấn',
    comments: 6
  },
  {
    id: 6,
    title: 'Phòng tránh bệnh mùa đông cho trẻ',
    excerpt: 'Các biện pháp phòng tránh bệnh mùa đông hiệu quả cho trẻ mầm non...',
    content: 'Nội dung chi tiết bài viết...',
    image: 'https://images.unsplash.com/photo-1490818387583-1baba5e638af?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80',
    date: '15/03/2024',
    category: 'Sức khỏe',
    comments: 8
  }
]

const Blog: React.FC = () => {
  const navigate = useNavigate()
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')


  const categories = [
    { name: 'Sức khỏe', count: 3 },
    { name: 'Dinh dưỡng', count: 4 },
    { name: 'Tâm lý', count: 9 },
    { name: 'Tiêm chủng', count: 4 },
    { name: 'Tư vấn', count: 9 }
  ]

  const recentPosts = blogPosts.slice(4, 6)

  const postsPerPage = 3

  // Filter posts based on search term
  const filteredPosts = searchTerm
    ? blogPosts.filter(
      (post) =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
    )
    : blogPosts

  const totalPages = Math.ceil(filteredPosts.length / postsPerPage)

  const handlePageChange = (page: number): void => {
    setCurrentPage(page)
    window.scrollTo(0, 0)
  }

  const displayedPosts = filteredPosts.slice((currentPage - 1) * postsPerPage, currentPage * postsPerPage)

  const handlePostClick = (postId: number): void => {
    navigate(`/blog/${postId}`)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1) // Reset to first page when searching
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col items-center px-6 md:px-28 py-12'>
      <div className='w-full max-w-[1200px]'>
        {/* Header with Blog title and arrow */}
        <div className='text-center mb-12'>
          <h1 className='text-5xl font-bold text-gray-900 mb-4'>Blog</h1>
          <div className='flex justify-center'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width='24'
              height='24'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
              className='text-black mt-4'
            >
              <path d='M11.8571 13.62L21.6486 3.00991C21.8737 2.76496 22 2.43345 22 2.08789C22 1.74233 21.8737 1.41082 21.6486 1.16587L20.9282 0.390626C20.7023 0.146262 20.3962 0.00900148 20.0769 0.00900145C19.7577 0.00900142 19.4515 0.146262 19.2256 0.390626L11.0023 9.29718L2.77438 0.380589C2.54822 0.136837 2.24215 -1.72729e-06 1.92309 -1.75518e-06C1.60404 -1.78307e-06 1.29796 0.136837 1.0718 0.380589L0.351396 1.16085C0.126343 1.4058 1.75547e-06 1.73731 1.72526e-06 2.08287C1.69505e-06 2.42843 0.126343 2.75994 0.351396 3.00489L10.1499 13.62C10.3771 13.8635 10.6838 14 11.0035 14C11.3231 14 11.6298 13.8635 11.8571 13.62Z'></path>
            </svg>
          </div>
        </div>

        <div className='flex flex-col lg:flex-row gap-12'>
          {/* Blog Posts */}
          <div className='w-full lg:w-2/3 space-y-12'>
            {displayedPosts.length > 0 ? (
              displayedPosts.map((post) => (
                <div
                  key={post.id}
                  className='bg-white rounded-2xl shadow-sm overflow-hidden cursor-pointer'
                  onClick={() => handlePostClick(post.id)}
                >
                  <div className='flex flex-col md:flex-row h-auto min-h-[300px]'>
                    <div className='w-full md:w-1/2 h-64 md:h-auto relative overflow-hidden'>
                      <img
                        src={post.image}
                        alt={post.title}
                        className='w-full h-full object-cover absolute inset-0 transition-transform duration-500 hover:scale-110'
                      />
                    </div>
                    <div className='w-full md:w-1/2 p-6 overflow-hidden'>
                      <div className='bg-green-500 hover:bg-[#001a33] text-white inline-block px-4 py-1.5 rounded-md mb-4 text-sm font-medium transition-colors duration-200 cursor-pointer'>
                        {post.category}
                      </div>
                      <h2 className='text-lg md:text-2xl font-bold mb-3 text-gray-900 line-clamp-2'>{post.title}</h2>
                      <p className='text-gray-600 mb-3 text-sm line-clamp-3'>{post.excerpt}</p>
                      <div className='text-gray-500 text-xs'>
                        {post.date} • {post.comments} Bình luận
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className='bg-white rounded-2xl shadow-sm p-8 text-center'>
                <h3 className='text-xl font-bold text-gray-700'>Không tìm thấy kết quả phù hợp</h3>
                <p className='text-gray-600 mt-2'>Vui lòng thử tìm kiếm với từ khóa khác</p>
              </div>
            )}

            {/* Pagination */}
            {filteredPosts.length > 0 && (
              <div className='flex gap-2 mt-12 justify-center'>
                {currentPage > 1 && (
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    className='w-10 h-10 flex items-center justify-center rounded-full border border-gray-300 text-gray-600'
                  >
                    ←
                  </button>
                )}

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`w-10 h-10 flex items-center justify-center rounded-full ${currentPage === page ? 'bg-gray-900 text-white' : 'border border-gray-300 text-gray-600'
                      }`}
                  >
                    {page}
                  </button>
                ))}

                {currentPage < totalPages && (
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    className='w-10 h-10 flex items-center justify-center rounded-full border border-gray-300 text-gray-600'
                  >
                    →
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className='w-full lg:w-1/3 space-y-8'>
            {/* Search */}
            <div className='bg-white p-6 rounded-2xl shadow-sm'>
              <h3 className='text-xl font-bold mb-4 text-gray-900'>Search</h3>
              <form onSubmit={handleSearch} className='relative'>
                <input
                  type='text'
                  placeholder='Tìm kiếm...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='w-full border border-gray-300 rounded-full py-2 px-4 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
                <button type='submit' className='absolute right-3 top-2.5 text-gray-400 hover:text-gray-600'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='h-5 w-5'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                    />
                  </svg>
                </button>
              </form>
            </div>

            {/* Categories */}
            <div className='bg-white p-6 rounded-2xl shadow-sm'>
              <h3 className='text-xl font-bold mb-4 text-gray-900'>Categories</h3>
              <ul className='space-y-3'>
                {categories.map((category, index) => (
                  <li key={index} className='flex items-center'>
                    <span className='w-2 h-2 bg-blue-500 rounded-full mr-3'></span>
                    <span className='text-gray-700 hover:text-blue-500 cursor-pointer'>
                      {category.name} ({category.count})
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recent Posts */}
            <div className='bg-white p-6 rounded-2xl shadow-sm'>
              <h3 className='text-xl font-bold mb-4 text-gray-900'>Recent posts</h3>
              <div className='space-y-4'>
                {recentPosts.map((post) => (
                  <div key={post.id} className='flex gap-3 cursor-pointer' onClick={() => handlePostClick(post.id)}>
                    <div className='w-20 h-20 min-w-[80px] rounded overflow-hidden relative'>
                      <img
                        src={post.image}
                        alt={post.title}
                        className='w-full h-full object-cover absolute inset-0 transition-transform duration-500 hover:scale-110'
                      />
                    </div>
                    <div className='flex flex-col justify-center'>
                      <div className='text-xs text-gray-500 mb-1'>{post.date.split(',')[0]}</div>
                      <h4 className='font-medium text-gray-800 leading-tight hover:text-blue-500 line-clamp-2'>
                        {post.title}
                      </h4>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Blog
