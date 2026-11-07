export interface AuthUser {
  id: string
  email: string
  name: string
}

export interface RegisterRequest {
  email: string
  name: string
  password: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface ApiError {
  message: string
}
