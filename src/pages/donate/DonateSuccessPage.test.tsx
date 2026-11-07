import { render, screen } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router"
import { beforeEach, describe, expect, it, vi } from "vitest"

const useGetDonationStatus = vi.fn()

vi.mock("@/api/generated", () => ({
  useGetDonationStatus: (...args: unknown[]) => useGetDonationStatus(...args),
}))

import DonateSuccessPage from "@/pages/donate/DonateSuccessPage"

const renderPage = (url = "/donate/acme/success?donation_id=d-1") =>
  render(
    <MemoryRouter initialEntries={[url]}>
      <Routes>
        <Route path="/donate/:subdomain/success" element={<DonateSuccessPage />} />
      </Routes>
    </MemoryRouter>,
  )

describe("DonateSuccessPage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("shows the confirmed donation", () => {
    useGetDonationStatus.mockReturnValue({
      data: {
        donation_id: "d-1",
        status: "succeeded",
        amount_cents: 2500,
        platform_fee_cents: 125,
        currency: "usd",
      },
      isLoading: false,
    })

    renderPage()

    expect(screen.getByText(/Donation confirmed/)).toBeInTheDocument()
    expect(screen.getByText("$25.00 USD")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Donate again" })).toHaveAttribute(
      "href",
      "/donate/acme",
    )
  })

  it("keeps waiting while pending", () => {
    useGetDonationStatus.mockReturnValue({
      data: {
        donation_id: "d-1",
        status: "pending",
        amount_cents: 2500,
        platform_fee_cents: 125,
        currency: "usd",
      },
      isLoading: false,
    })

    renderPage()

    expect(screen.getByText(/Payment pending/)).toBeInTheDocument()
    expect(screen.queryByRole("link", { name: "Donate again" })).not.toBeInTheDocument()
  })
})
