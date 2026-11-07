import { useState } from "react"
import { Link, useSearchParams } from "react-router"
import { Button, Card, Flex, Spinner, Text } from "@radix-ui/themes"

import { useGetStripeOnboardingStatus, useRefreshStripeOnboarding } from "@/api/generated"

const OnboardingErrorPage = () => {
  const [params] = useSearchParams()
  const orgId = params.get("org_id") || ""
  const [error, setError] = useState<string | null>(null)

  const { data: status, isLoading } = useGetStripeOnboardingStatus(orgId)
  const refreshOnboarding = useRefreshStripeOnboarding()

  const onResume = async () => {
    setError(null)
    try {
      const { onboarding_url } = await refreshOnboarding.mutateAsync({ orgId })
      window.location.assign(onboarding_url)
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "message" in err
          ? (err as { message: string }).message
          : "Something went wrong"
      setError(msg)
    }
  }

  return (
    <Flex align="center" justify="center" className="min-h-screen bg-[var(--gray-2)] px-4">
      <Card size="4" className="w-full max-w-md">
        <Flex direction="column" gap="4">
          <h1 className="text-[var(--font-size-7)] font-bold leading-tight">
            Onboarding incomplete
          </h1>
          <Text size="2" color="gray">
            Stripe onboarding wasn't finished. You can resume where you left off.
          </Text>

          {isLoading && (
            <Flex align="center" gap="2">
              <Spinner size="2" />
              <Text size="2">Checking status...</Text>
            </Flex>
          )}

          {status && (
            <Text size="1" color="gray">
              Charges: {status.charges_enabled ? "enabled" : "disabled"} · Payouts:{" "}
              {status.payouts_enabled ? "enabled" : "disabled"} ·{" "}
              {status.requirements_currently_due.length} requirement(s) currently due
            </Text>
          )}

          {error && (
            <Text size="2" color="red" role="alert">
              {error}
            </Text>
          )}

          <Flex gap="3">
            <Button size="2" onClick={onResume} disabled={refreshOnboarding.isPending || !orgId}>
              {refreshOnboarding.isPending ? "Generating link..." : "Resume onboarding"}
            </Button>
            <Button size="2" variant="soft" asChild>
              <Link to="/dashboard">Back to dashboard</Link>
            </Button>
          </Flex>
        </Flex>
      </Card>
    </Flex>
  )
}

export default OnboardingErrorPage
