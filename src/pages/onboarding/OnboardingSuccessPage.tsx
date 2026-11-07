import { Link, useSearchParams } from "react-router"
import { Button, Card, Flex, Spinner, Text } from "@radix-ui/themes"
import { useQueryClient } from "@tanstack/react-query"

import { useGetStripeOnboardingStatus } from "@/api/generated"
import { getGetStripeOnboardingStatusQueryKey } from "@/api/generated"

const OnboardingSuccessPage = () => {
  const [params] = useSearchParams()
  const orgId = params.get("org_id") || ""
  const queryClient = useQueryClient()

  const { data: status, isLoading } = useGetStripeOnboardingStatus(orgId, {
    query: { refetchInterval: (query) => (query.state.data?.onboarding_complete ? false : 3000) },
  })

  return (
    <Flex align="center" justify="center" className="min-h-screen bg-[var(--gray-2)] px-4">
      <Card size="4" className="w-full max-w-md">
        <Flex direction="column" gap="4">
          <h1 className="text-[var(--font-size-7)] font-bold leading-tight">Stripe onboarding</h1>

          {isLoading && (
            <Flex align="center" gap="2">
              <Spinner size="2" />
              <Text size="2">Checking status...</Text>
            </Flex>
          )}

          {status && (
            <Flex direction="column" gap="3">
              {status.onboarding_complete ? (
                <Text size="2" color="grass">
                  Onboarding complete — your org can now accept donations.
                </Text>
              ) : (
                <Text size="2" color="gray">
                  Still processing. This page refreshes automatically every few seconds.
                </Text>
              )}
              <Text size="1" color="gray">
                Charges: {status.charges_enabled ? "enabled" : "disabled"} · Payouts:{" "}
                {status.payouts_enabled ? "enabled" : "disabled"}
              </Text>
              <Flex gap="3">
                <Button
                  size="2"
                  variant="soft"
                  onClick={() =>
                    queryClient.invalidateQueries({
                      queryKey: getGetStripeOnboardingStatusQueryKey(orgId),
                    })
                  }
                >
                  Refresh status
                </Button>
                <Button size="2" asChild>
                  <Link to="/dashboard">Go to dashboard</Link>
                </Button>
              </Flex>
            </Flex>
          )}

          {!orgId && !isLoading && (
            <Text size="2" color="red">
              Missing org_id — restart onboarding from the dashboard.
            </Text>
          )}
        </Flex>
      </Card>
    </Flex>
  )
}

export default OnboardingSuccessPage
