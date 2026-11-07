import { getAccessToken, clearAccessToken } from "@/utils/token"
import { ensureValidToken } from "./auth-interceptor"

const BASE_URL = import.meta.env.VITE_API_URL || ""

export const customFetch = async <T>(url: string, options?: RequestInit): Promise<T> => {
  const fullUrl = url.startsWith("http") ? url : `${BASE_URL}${url}`

  const headers: Record<string, string> = {}
  if (options?.headers) {
    const existing = options.headers
    if (existing instanceof Headers) {
      existing.forEach((value, key) => {
        headers[key] = value
      })
    } else if (Array.isArray(existing)) {
      for (const [key, value] of existing) {
        headers[key] = value
      }
    } else {
      Object.assign(headers, existing)
    }
  }

  let accessToken = getAccessToken()
  if (accessToken) {
    const valid = await ensureValidToken()
    if (!valid) {
      clearAccessToken()
      accessToken = null
    } else {
      accessToken = getAccessToken()
    }
  }

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`
  }

  const response = await fetch(fullUrl, {
    ...options,
    headers,
    credentials: "include",
  })

  if (response.status === 401 && accessToken) {
    const refreshed = await ensureValidToken()
    if (refreshed) {
      const newToken = getAccessToken()!
      headers["Authorization"] = `Bearer ${newToken}`
      const retryResponse = await fetch(fullUrl, { ...options, headers, credentials: "include" })
      const retryBody = [204, 205, 304].includes(retryResponse.status)
        ? null
        : await retryResponse.text()
      if (!retryResponse.ok) {
        const error = retryBody ? JSON.parse(retryBody) : { error: retryResponse.statusText }
        throw error
      }
      return retryBody ? JSON.parse(retryBody) : ({} as T)
    }
    clearAccessToken()
  }

  if (!response.ok) {
    const body = await response.text()
    const error = body ? JSON.parse(body) : { error: response.statusText }
    throw error
  }

  const body = [204, 205, 304].includes(response.status) ? null : await response.text()
  return body ? JSON.parse(body) : ({} as T)
}
