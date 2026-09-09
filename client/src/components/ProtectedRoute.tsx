import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useAuth } from "../context/authContext"
import Loading from "./Loading"


const ProtectedRoute = () => {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading) return <Loading />
  if (!user) return <Navigate to='/login' state={{ from: location }} replace />
  return (
    <Outlet />
  )
}

export default ProtectedRoute