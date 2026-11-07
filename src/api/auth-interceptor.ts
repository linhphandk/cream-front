import { setAccessToken, clearAccessToken, isTokenExpired } from "@/utils/token"

const BASE_URL = import.meta.env.VITE_API_URL || ""

let isRefreshing = false
let refreshPromise: Promise<boolean> | null = null

export async function refreshAccessToken(): Promise<boolean> {
  try {
    const response = await fetch(`${BASE_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    })

    if (!response.ok) {
      clearAccessToken()
      return false
    }

    const data = await response.json()
    setAccessToken(data.access_token, data.expires_in)
    return true
  } catch {
    clearAccessToken()
    return false
  }
}

export async function ensureValidToken(): Promise<boolean> {
  if (!isTokenExpired()) return true

  if (isRefreshing && refreshPromise) {
    return refreshPromise
  }

  isRefreshing = true
  refreshPromise = refreshAccessToken().finally(() => {
    isRefreshing = false
    refreshPromise = null
  })

  return refreshPromise
}
