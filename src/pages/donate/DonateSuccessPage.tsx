import { Link, useParams, useSearchParams } from "react-router"
import { Button, Card, Flex, Spinner, Text } from "@radix-ui/themes"

import { useGetDonationStatus } from "@/api/generated"
import type { DonationStatusResponse } from "@/api/generated"
import type { ApiError } from "@/types/auth"

const DonateSuccessPage = () => {
  const { subdomain = "" } = useParams()
  const [params] = useSearchParams()
  const donationId = params.get("donation_id") || ""

  const { data: status, isLoading } = useGetDonationStatus<DonationStatusResponse, ApiError>(
    subdomain,
    donationId,
    {
      // Webhook flips status asynchronously — poll while still pending.
      query: {
        enabled: !!donationId,
        refetchInterval: (query) =>
          query.state.data?.status && query.state.data.status !== "pending" ? false : 3000,
      },
    },
  )

  return (
    <Flex align="center" justify="center" className="min-h-screen bg-[var(--gray-2)] px-4">
      <Card size="4" className="w-full max-w-md">
        <Flex direction="column" gap="4">
          <h1 className="text-[var(--font-size-7)] font-bold leading-tight">Thank you!</h1>

          {isLoading && (
            <Flex align="center" gap="2">
              <Spinner size="2" />
              <Text size="2">Confirming your donation...</Text>
            </Flex>
          )}

          {status && (
            <Flex direction="column" gap="3">
              {status.status === "succeeded" ? (
                <Text size="2" color="grass">
                  Donation confirmed. Thank you for supporting {subdomain}!
                </Text>
              ) : (
                <Text size="2" color="gray">
                  Payment {status.status}. This page refreshes automatically.
                </Text>
              )}
              <Text size="1" color="gray">
                ${(status.amount_cents / 100).toFixed(2)} {status.currency.toUpperCase()}
              </Text>
            </Flex>
          )}

          {status?.status === "succeeded" && (
            <Button size="2" asChild>
              <Link to={`/donate/${subdomain}`}>Donate again</Link>
            </Button>
          )}

          {!donationId && !isLoading && (
            <Text size="2" color="red">
              Missing donation_id — start again from the donation page.
            </Text>
          )}
        </Flex>
      </Card>
    </Flex>
  )
}

export default DonateSuccessPage
