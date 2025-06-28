import React, { createContext, useContext, useState, useEffect } from 'react'
import { decodeToken } from '../api/auth.api'

interface User {
  id: string
  email: string
  role: string
  roleName: string
  studentIds?: string[]
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (userData: User, token: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Hàm validate token
  const validateToken = (token: string): boolean => {
    try {
      const decoded = decodeToken(token)
      if (!decoded) return false

      // Kiểm tra token có hết hạn không
      const currentTime = Date.now() / 1000
      if (decoded.exp && decoded.exp < currentTime) {
        return false
      }

      return true
    } catch (error) {
      return false
    }
  }

  useEffect(() => {
    // Kiểm tra token trong localStorage khi component mount
    const token = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')

    if (token && storedUser && validateToken(token)) {
      const userData = JSON.parse(storedUser)
      setUser(userData)
      setIsAuthenticated(true)
    } else {
      // Token không hợp lệ hoặc hết hạn, xóa khỏi localStorage
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
    setIsLoading(false)
  }, [])

  const login = (userData: User, token: string) => {
    setUser(userData)
    setIsAuthenticated(true)
    localStorage.setItem('user', JSON.stringify(userData))
    localStorage.setItem('token', token)
  }

  const logout = () => {
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  return <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout }}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
