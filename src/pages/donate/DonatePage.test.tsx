import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter, Route, Routes } from "react-router"
import { beforeEach, describe, expect, it, vi } from "vitest"

const mutateAsync = vi.fn()
const useGetPublicOrg = vi.fn()
const useCreateDonation = vi.fn()

vi.mock("@/api/generated", () => ({
  useGetPublicOrg: (...args: unknown[]) => useGetPublicOrg(...args),
  useCreateDonation: () => useCreateDonation(),
}))

import DonatePage from "@/pages/donate/DonatePage"

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={["/donate/acme"]}>
      <Routes>
        <Route path="/donate/:subdomain" element={<DonatePage />} />
      </Routes>
    </MemoryRouter>,
  )

describe("DonatePage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useGetPublicOrg.mockReturnValue({
      data: { id: "org-1", name: "Acme", subdomain: "acme", stripeOnboardingComplete: true },
      isLoading: false,
      isError: false,
    })
    useCreateDonation.mockReturnValue({ mutateAsync, isPending: false })
  })

  it("creates a donation in cents and redirects to checkout", async () => {
    mutateAsync.mockResolvedValue({
      checkout_url: "https://checkout.stripe.com/x",
      donation_id: "d-1",
    })
    const assign = vi.fn()
    Object.defineProperty(window, "location", { writable: true, value: { assign } })

    renderPage()
    await userEvent.type(screen.getByPlaceholderText("25.00"), "25.50")
    await userEvent.click(screen.getByRole("button", { name: "Donate" }))

    expect(mutateAsync).toHaveBeenCalledWith({
      subdomain: "acme",
      data: { amount_cents: 2550, currency: "usd", donor_name: null, donor_email: null },
    })
    expect(assign).toHaveBeenCalledWith("https://checkout.stripe.com/x")
  })

  it("blocks the form when the org cannot accept donations", () => {
    useGetPublicOrg.mockReturnValue({
      data: { id: "org-1", name: "Acme", subdomain: "acme", stripeOnboardingComplete: false },
      isLoading: false,
      isError: false,
    })

    renderPage()

    expect(screen.getByText("Acme isn't accepting donations yet.")).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Donate" })).not.toBeInTheDocument()
  })
})
