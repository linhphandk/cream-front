import { useEffect, useState } from "react"
import { Link } from "react-router"
import { Button, Card, Flex, Spinner, Text } from "@radix-ui/themes"
import { useQueryClient } from "@tanstack/react-query"

import { getMyOrgQueryKey, useGetStripeOnboardingStatus, useMyOrg } from "@/api/generated"

import { useAuth } from "@/context"
import { stripeComplete } from "@/utils/stripe"

const StatusCell = ({ label, ok }: { label: string; ok: boolean | null }) => (
  <Flex direction="column" align="center" gap="1" className="rounded-2 bg-[var(--gray-3)] p-3">
    <Text size="1" color="gray">
      {label}
    </Text>
    <Text size="2" weight="bold" color={ok ? "grass" : "red"}>
      {ok === null ? "unknown" : ok ? "enabled" : "not enabled"}
    </Text>
  </Flex>
)

const DashboardPage = () => {
  const { user, logout } = useAuth()
  const { data: org, isLoading, isError } = useMyOrg()
  const [recheck, setRecheck] = useState(false)
  const queryClient = useQueryClient()

  // The DB flag only updates when the status endpoint hits Stripe — manual recheck, since this
  // is a daily page and a recheck is a live Stripe API call.
  const statusCheck = useGetStripeOnboardingStatus(org?.id ?? "", {
    query: { enabled: recheck && !!org && !stripeComplete(org) },
  })

  useEffect(() => {
    if (statusCheck.data) {
      queryClient.invalidateQueries({ queryKey: getMyOrgQueryKey() })
    }
  }, [statusCheck.data, queryClient])

  return (
    <Flex align="center" justify="center" className="min-h-screen bg-[var(--gray-2)] px-4">
      <Card size="4" className="w-full max-w-md">
        <Flex direction="column" gap="4">
          <h1 className="text-[var(--font-size-7)] font-bold leading-tight">Dashboard</h1>

          <Flex direction="column" gap="1">
            <Text size="2" weight="medium">
              {user?.name}
            </Text>
            <Text size="2" color="gray">
              {user?.email}
            </Text>
          </Flex>

          {isLoading && (
            <Flex align="center" gap="2">
              <Spinner size="2" />
              <Text size="2">Loading organization...</Text>
            </Flex>
          )}

          {org && (
            <Flex direction="column" gap="1">
              <Text size="2">
                Organization: <strong>{org.name}</strong>
              </Text>
              <Text size="2" color="gray">
                Subdomain: {org.subdomain} · Fee: {org.feeBps / 100}%
              </Text>
              <Text size="1" color={stripeComplete(org) ? "grass" : "amber"}>
                {stripeComplete(org)
                  ? "Stripe: accepting donations"
                  : "Stripe: onboarding incomplete"}
              </Text>
              {!stripeComplete(org) && (
                <div className="grid grid-cols-3 gap-3">
                  <StatusCell label="Charges" ok={org.stripeChargesEnabled} />
                  <StatusCell label="Payouts" ok={org.stripePayoutsEnabled} />
                  <StatusCell label="Details submitted" ok={org.stripeDetailsSubmitted} />
                </div>
              )}
              {!stripeComplete(org) && (
                <Flex align="center" gap="2">
                  <Button
                    size="1"
                    variant="soft"
                    onClick={() => setRecheck(true)}
                    disabled={statusCheck.isFetching}
                  >
                    {statusCheck.isFetching ? "Checking..." : "Recheck Stripe status"}
                  </Button>
                  {statusCheck.isError && (
                    <Text size="1" color="red">
                      Unavailable
                    </Text>
                  )}
                </Flex>
              )}
              <Button size="2" variant="soft" asChild>
                <Link to={`/donate/${org.subdomain}`}>View donation page</Link>
              </Button>
            </Flex>
          )}

          {isError && (
            <Text size="2" color="gray">
              No organization yet —{" "}
              <Link to="/onboarding" className="text-[var(--iris-11)] hover:underline">
                finish onboarding
              </Link>
              .
            </Text>
          )}

          <Button size="2" variant="soft" onClick={logout}>
            Log out
          </Button>
        </Flex>
      </Card>
    </Flex>
  )
}

export default DashboardPage
