import { Navigate } from "react-router"
import { Flex, Spinner } from "@radix-ui/themes"
import { useAuth } from "@/context"

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <Flex align="center" justify="center" className="min-h-screen">
        <Spinner size="3" />
      </Flex>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

export default ProtectedRoute
