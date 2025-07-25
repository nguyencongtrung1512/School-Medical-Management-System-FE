import axios from 'axios'

let isTokenExpired = false

export const axiosInstance = axios.create({
  baseURL: 'http://localhost:8883/api',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 300000,
  timeoutErrorMessage: `Connection is timeout exceeded`
})

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

axiosInstance.interceptors.response.use(
  (response) => {
    if (response.status === 200 || response.status === 201) {
      return response.data
    }
    return response
  },
  (error) => {
    if (error.response) {
      const { data } = error.response
      if (data.message === null && data.errors && data.errors.length > 0) {
        data.errors.forEach((error: { field: string; message: string }) => {
          console.log(`${error.field}: ${error.message}`)
        })
      } else {
        switch (error.response.status) {
          case 403: {
            if (!isTokenExpired) {
              isTokenExpired = true
              console.log(data.message)
              //   const user = getUserFromLocalStorage()
              //   setTimeout(() => {
              //     if (user) {
              //       if (user.role === roles.ADMIN) {
              //         window.location.href = paths.ADMIN_LOGIN
              //       } else {
              //         window.location.href = paths.LOGIN
              //       }
              //     } else {
              //       return
              //     }

              //     localStorage.clear()
              //     isTokenExpired = false
              //   }, 1300)
            }
            break
          }

          case 404:
            console.log(data.message)
            // window.location.href = paths.NOTFOUND
            break

          case 500:
            console.log(data.message)
            // window.location.href = paths.INTERNAL_SERVER_ERROR
            break

          default:
            console.log(data.message)
            break
        }
      }

      return Promise.reject(error.response.data)
    } else {
      console.log('Network error')
      return Promise.reject(error)
    }
  }
)

export default axiosInstance
