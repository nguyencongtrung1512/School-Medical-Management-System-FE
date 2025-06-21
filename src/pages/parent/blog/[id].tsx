/* eslint-disable */
import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import dayjs from 'dayjs'
import DOMPurify from 'dompurify'
import { blogApi } from '../../../api/blog.api'
import { commentApi } from '../../../api/comment.api'
import type { Blog } from '../../../api/blog.api'
import type { Comment } from '../../../api/comment.api'

const BlogPost: React.FC = () => {
  const { id } = useParams<{ id: string }>()

  const [post, setPost] = useState<Blog | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [recommendedPosts, setRecommendedPosts] = useState<Blog[]>([])

  useEffect(() => {
    if (!id) return

    const fetchData = async () => {
      try {
        const blogRes: any = await blogApi.getBlogByIdApi(id)
        setPost(blogRes.data || blogRes)

        const commentRes: any = await commentApi.searchCommentsApi({ pageNum: 1, pageSize: 100, blogId: id })
        setComments(commentRes.pageData || commentRes.content || [])

        const recRes: any = await blogApi.searchBlogApi({ pageNum: 1, pageSize: 4 })
        const rec = (recRes.pageData || recRes.content || []).filter((b: Blog) => b._id !== id)
        setRecommendedPosts(rec.slice(0, 2))
      } catch (error) {
        console.error(error)
      }
    }

    fetchData()
  }, [id])

  if (!post) {
    return <div className='text-center py-10'>Đang tải...</div>
  }

  const tags: string[] = []

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col items-center px-6 md:px-28 py-12'>
      <div className='w-full max-w-[1000px] bg-white rounded-2xl shadow-sm p-8'>
        <div className='mb-8 text-center'>
          <div className='bg-green-500 hover:bg-[#001a33] text-white inline-block px-4 py-1.5 rounded-md mb-4 text-sm font-medium transition-colors duration-200 cursor-pointer'>
            {(post as any).categoryName || (post.category && (post.category as any).name)}
          </div>
          <h1 className='text-4xl md:text-5xl font-bold mb-6 text-gray-900'>{post.title}</h1>
          <div className='flex items-center justify-center gap-2 mb-4'>
            <img
              src={post.author?.avatar || 'https://i.pravatar.cc/150'}
              alt=''
              className='w-10 h-10 rounded-full object-cover'
            />
            <span className='font-medium'>{post.author?.fullName || post.username}</span>
            <span className='text-gray-500'>•</span>
            <span className='text-gray-500'>{dayjs(post.createdAt).format('DD/MM/YYYY')}</span>
            <span className='text-gray-500'>•</span>
            <span className='text-gray-500'>{comments.length} Bình luận</span>
          </div>
        </div>

        <div className='mb-10 rounded-2xl overflow-hidden relative'>
          <img src={post.image} alt={post.title} className='w-full h-[400px] object-cover' />
        </div>

        <div
          className='prose max-w-none mb-12'
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}
        ></div>

        <div className='flex flex-wrap gap-4 mb-12 justify-between items-center border-t border-b border-gray-200 py-6'>
          <div className='flex flex-wrap gap-2'>
            {tags.map((tag, index) => (
              <span
                key={index}
                className='px-4 py-2 bg-gray-100 rounded-full text-gray-700 text-sm hover:bg-gray-200 transition-colors duration-200 cursor-pointer'
              >
                {tag}
              </span>
            ))}
          </div>
          <div className='flex gap-2'>
            <button className='w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center text-white hover:bg-gray-600 transition-colors duration-200'>
              <svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='currentColor' viewBox='0 0 16 16'>
                <path d='M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4Zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2Zm13 2.383-4.708 2.825L15 11.105V5.383Zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741ZM1 11.105l4.708-2.897L1 5.383v5.722Z' />
              </svg>
            </button>
            <button className='w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-300 transition-colors duration-200'>
              <svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='currentColor' viewBox='0 0 16 16'>
                <path d='M4.715 6.542 3.343 7.914a3 3 0 1 0 4.243 4.243l1.828-1.829A3 3 0 0 0 8.586 5.5L8 6.086a1.002 1.002 0 0 0-.154.199 2 2 0 0 1 .861 3.337L6.88 11.45a2 2 0 1 1-2.83-2.83l.793-.792a4.018 4.018 0 0 1-.128-1.287z' />
                <path d='M6.586 4.672A3 3 0 0 0 7.414 9.5l.775-.776a2 2 0 0 1-.896-3.346L9.12 3.55a2 2 0 1 1 2.83 2.83l-.793.792c.112.42.155.855.128 1.287l1.372-1.372a3 3 0 1 0-4.243-4.243L6.586 4.672z' />
              </svg>
            </button>
          </div>
        </div>

        <div className='flex justify-between items-center mb-16'>
          <Link
            to='/blog/4'
            className='text-gray-600 hover:text-gray-900 flex items-center gap-2 transition-colors duration-200'
          >
            <span>←</span>
            <span>Bài trước</span>
          </Link>
          <Link
            to='/blog/6'
            className='text-gray-600 hover:text-gray-900 flex items-center gap-2 transition-colors duration-200'
          >
            <span>Bài tiếp theo</span>
            <span>→</span>
          </Link>
        </div>

        <div className='flex items-center gap-4 mb-16 bg-gray-50 p-6 rounded-2xl'>
          <img
            src={post.author?.avatar || 'https://i.pravatar.cc/150'}
            alt={post.author?.fullName}
            className='w-20 h-20 rounded-full object-cover'
          />
          <div>
            <h3 className='text-xl font-bold mb-1'>{post.author?.fullName || post.username}</h3>
            <p className='text-gray-600 mb-2'>ABOUT AUTHOR</p>
            <p className='text-gray-700'>
              Phasellus et ipsum justo. Aenean fringilla a fermentum mauris non venenatis. Praesent at nulla aliquam
              ligula.
            </p>
          </div>
        </div>

        <div className='mb-16'>
          <h3 className='text-2xl font-bold mb-8'>{comments.length} Bình luận</h3>

          {comments.map((comment) => (
            <div key={comment._id} className='flex gap-4 mb-8 bg-gray-50 p-4 rounded-2xl'>
              <img
                src={comment.user?.avatar || 'https://i.pravatar.cc/150'}
                alt={comment.user?.fullName}
                className='w-12 h-12 rounded-full object-cover'
              />
              <div className='flex-1'>
                <div className='flex justify-between items-center mb-2'>
                  <div>
                    <span className='font-bold mr-2'>{comment.user?.fullName}</span>
                    {comment.userId === post.userId && (
                      <span className='bg-gray-200 px-2 py-0.5 text-xs rounded-md'>Post Author</span>
                    )}
                  </div>
                  <span className='text-sm text-gray-500'>{dayjs(comment.createdAt).format('DD/MM/YYYY HH:mm')}</span>
                </div>
                <p className='text-gray-700 mb-2'>{comment.content}</p>
                <button className='text-gray-600 text-sm font-medium flex items-center gap-1 hover:text-gray-900 transition-colors duration-200'>
                  Reply
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    width='12'
                    height='12'
                    fill='currentColor'
                    viewBox='0 0 16 16'
                  >
                    <path
                      fillRule='evenodd'
                      d='M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z'
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className='mb-16 bg-gray-50 p-6 rounded-2xl'>
          <h3 className='text-2xl font-bold mb-6'>Để lại bình luận</h3>
          <form className='space-y-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <input
                type='text'
                placeholder='Tên của bạn *'
                className='w-full border border-gray-300 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500'
                required
              />
              <input
                type='email'
                placeholder='Email của bạn *'
                className='w-full border border-gray-300 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500'
                required
              />
            </div>
            <textarea
              placeholder='Bình luận của bạn *'
              rows={6}
              className='w-full border border-gray-300 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500'
              required
            ></textarea>
            <button
              type='submit'
              className='bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200'
            >
              Gửi bình luận
            </button>
          </form>
        </div>

        <div>
          <h3 className='text-2xl font-bold mb-8'>Bài viết liên quan</h3>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
            {recommendedPosts.map((post) => (
              <Link
                key={post._id}
                to={`/blog/${post._id}`}
                className='group bg-white rounded-2xl shadow-sm overflow-hidden'
              >
                <div className='mb-4 overflow-hidden relative h-48'>
                  <img
                    src={post.image}
                    alt={post.title}
                    className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-110'
                  />
                </div>
                <div className='p-4'>
                  <div className='bg-green-500 hover:bg-[#001a33] text-white inline-block px-3 py-1 rounded-md mb-2 text-xs font-medium transition-colors duration-200'>
                    {(post as any).categoryName || (post.category && (post.category as any).name)}
                  </div>
                  <h4 className='font-bold text-lg text-gray-800 group-hover:text-blue-500 transition-colors line-clamp-2'>
                    {post.title}
                  </h4>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BlogPost
