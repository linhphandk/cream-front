import { test, expect } from "@playwright/test"

test.describe("Pages render", () => {
  test("login page renders", async ({ page }) => {
    await page.goto("/login")
    await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible()
    await expect(page.getByPlaceholder("jane@example.com")).toBeVisible()
    await expect(page.getByRole("button", { name: "Log in" })).toBeVisible()
  })

  test("signup page renders", async ({ page }) => {
    await page.goto("/signup")
    await expect(page.getByRole("heading", { name: "Create your account" })).toBeVisible()
    await expect(page.getByRole("button", { name: "Sign up" })).toBeVisible()
  })

  test("login and signup link to each other", async ({ page }) => {
    await page.goto("/login")
    await page.getByRole("link", { name: "Sign up" }).click()
    await expect(page).toHaveURL(/signup/)
    await page.getByRole("link", { name: "Log in" }).click()
    await expect(page).toHaveURL(/login/)
  })

  test("donate page renders", async ({ page }) => {
    await page.goto("/donate/savethewhales")
    await expect(page.getByRole("heading", { name: "Donate" })).toBeVisible()
    await expect(page.getByText("Organization not found")).toBeVisible()
  })

  test("unauthenticated user redirected from /onboarding", async ({ page }) => {
    await page.goto("/onboarding")
    await expect(page).toHaveURL(/login/)
  })

  test("unauthenticated user redirected from /dashboard", async ({ page }) => {
    await page.goto("/dashboard")
    await expect(page).toHaveURL(/login/)
  })
})
