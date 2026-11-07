import { beforeEach, describe, expect, it, vi } from "vitest"

import { clearAccessToken, getAccessToken, isTokenExpired, setAccessToken } from "@/utils/token"

describe("token storage", () => {
  beforeEach(() => {
    localStorage.clear()
    vi.resetModules()
  })

  it("round-trips a token", () => {
    setAccessToken("tok", 60)
    expect(getAccessToken()).toBe("tok")
    expect(isTokenExpired()).toBe(false)
  })

  it("expires 30s early", () => {
    setAccessToken("tok", 20)
    expect(isTokenExpired()).toBe(true)
  })

  it("clears token", () => {
    setAccessToken("tok", 60)
    clearAccessToken()
    expect(getAccessToken()).toBeNull()
  })
})
