import { createContext, useCallback, useContext, useState } from "react"
import { useNavigate } from "react-router"
import { useLogin, useRegister, useLogout } from "@/api/generated"
import { setAccessToken, clearAccessToken, getAccessToken } from "@/utils/token"
import type { AuthUser } from "@/types/auth"

interface AuthContextValue {
  user: AuthUser | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, name: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function getInitialUser(): AuthUser | null {
  if (!getAccessToken()) return null
  try {
    return JSON.parse(localStorage.getItem("cream_user") || "null")
  } catch {
    return null
  }
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate()
  const [user, setUser] = useState<AuthUser | null>(getInitialUser)

  const loginMutation = useLogin()
  const registerMutation = useRegister()
  const logoutMutation = useLogout()

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await loginMutation.mutateAsync({ data: { email, password } })
      setAccessToken(res.access_token, res.expires_in)
      localStorage.setItem("cream_user", JSON.stringify(res.user))
      setUser(res.user)
      navigate("/dashboard")
    },
    [loginMutation, navigate],
  )

  const signup = useCallback(
    async (email: string, name: string, password: string) => {
      const res = await registerMutation.mutateAsync({
        data: { email, name, password },
      })
      setAccessToken(res.access_token, res.expires_in)
      localStorage.setItem("cream_user", JSON.stringify(res.user))
      setUser(res.user)
      navigate("/onboarding")
    },
    [registerMutation, navigate],
  )

  const logout = useCallback(async () => {
    try {
      await logoutMutation.mutateAsync()
    } catch {
      // Server logout may fail if refresh cookie is missing — still clear local state
    }
    clearAccessToken()
    localStorage.removeItem("cream_user")
    setUser(null)
    navigate("/login")
  }, [logoutMutation, navigate])

  return (
    <AuthContext.Provider value={{ user, isLoading: false, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
