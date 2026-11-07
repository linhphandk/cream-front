const ACCESS_TOKEN_KEY = "cream_access_token"
const TOKEN_EXPIRY_KEY = "cream_token_expiry"

let accessToken: string | null = null
let tokenExpiry: number | null = null

export function getAccessToken(): string | null {
  if (accessToken) return accessToken
  const stored = localStorage.getItem(ACCESS_TOKEN_KEY)
  if (stored) {
    accessToken = stored
    tokenExpiry = Number(localStorage.getItem(TOKEN_EXPIRY_KEY)) || null
    return stored
  }
  return null
}

export function setAccessToken(token: string, expiresIn: number): void {
  accessToken = token
  tokenExpiry = Date.now() + expiresIn * 1000
  localStorage.setItem(ACCESS_TOKEN_KEY, token)
  localStorage.setItem(TOKEN_EXPIRY_KEY, String(tokenExpiry))
}

export function clearAccessToken(): void {
  accessToken = null
  tokenExpiry = null
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(TOKEN_EXPIRY_KEY)
}

export function isTokenExpired(): boolean {
  if (!tokenExpiry) return true
  return Date.now() >= tokenExpiry - 30_000
}
