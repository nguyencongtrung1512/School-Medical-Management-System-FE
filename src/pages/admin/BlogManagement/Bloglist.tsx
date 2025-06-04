import React, { useEffect, useState } from 'react'
import { Table, TableProps } from 'antd'
import { blogApi, Blog } from '../../../api/blog.api'
import { useNavigate } from 'react-router-dom'

interface CategoryBlogListProps {
  categoryId: string
}

function BlogList({ categoryId }: CategoryBlogListProps) {
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true)
        const response = await blogApi.searchBlogApi({
          pageNum: 1,
          pageSize: 10,
          categoryId: categoryId
        })
        if (response.data) {
          setBlogs(response.data.content)
        }
      } catch (error) {
        console.error('Error fetching blogs:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBlogs()
  }, [categoryId])

  const columns: TableProps<Blog>['columns'] = [
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title'
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description'
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => <a onClick={() => navigate(`/blog/${record.id}`)}>Xem chi tiết</a>
    }
  ]

  return (
    <div>
      <h2>Danh sách Blog của Category</h2>
      <Table columns={columns} dataSource={blogs} loading={loading} rowKey='id' />
    </div>
  )
}

export default BlogList
