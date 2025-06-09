import { ToastContainer } from 'react-toastify'
import useRouteElements from './useRouteElement'
import { AuthProvider } from './contexts/auth.context'

function App() {
  const routeElement = useRouteElements()

  return (
    <>
      <AuthProvider>
        {routeElement}
        <ToastContainer />
      </AuthProvider>
    </>
  )
}

export default App
