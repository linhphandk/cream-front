import { useEffect, useState } from "react"
import { Button, Card, Flex, Select, Spinner, Text, TextField } from "@radix-ui/themes"
import { useForm } from "react-hook-form"
import { useQueryClient } from "@tanstack/react-query"

import {
  getMyOrgQueryKey,
  useCreateOrganization,
  useCreateStripeOnboarding,
  useGetStripeOnboardingStatus,
  useMyOrg,
} from "@/api/generated"
import { useAuth } from "@/context"
import { stripeComplete } from "@/utils/stripe"

interface OnboardingForm {
  name: string
  subdomain: string
  entityType: "company" | "individual"
  country: string
}

const OnboardingPage = () => {
  const { user } = useAuth()
  const { data: existingOrg, isLoading } = useMyOrg()
  const [serverError, setServerError] = useState<string | null>(null)
  const queryClient = useQueryClient()

  // The DB flag only updates when the status endpoint hits Stripe — recheck before claiming
  // onboarding is incomplete.
  const statusCheck = useGetStripeOnboardingStatus(existingOrg?.id ?? "", {
    query: { enabled: !!existingOrg && !stripeComplete(existingOrg) },
  })

  useEffect(() => {
    if (statusCheck.data) {
      queryClient.invalidateQueries({ queryKey: getMyOrgQueryKey() })
    }
  }, [statusCheck.data, queryClient])

  const isRechecking = statusCheck.isFetching

  const createOrg = useCreateOrganization()
  const createStripeOnboarding = useCreateStripeOnboarding()
  const isSubmitting = createOrg.isPending || createStripeOnboarding.isPending

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<OnboardingForm>({
    defaultValues: { entityType: "individual", country: "US" },
  })
  const entityType = watch("entityType")

  const startStripeOnboarding = async (data: OnboardingForm) => {
    setServerError(null)
    try {
      const org =
        existingOrg ??
        (await createOrg.mutateAsync({ data: { name: data.name, subdomain: data.subdomain } }))

      const { onboarding_url } = await createStripeOnboarding.mutateAsync({
        data: {
          org_id: org.id,
          entity_type: data.entityType,
          country: data.country,
        },
      })
      window.location.assign(onboarding_url)
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "message" in err
          ? (err as { message: string }).message
          : "Something went wrong"
      setServerError(msg)
    }
  }

  return (
    <Flex align="center" justify="center" className="min-h-screen bg-[var(--gray-2)] px-4">
      <Card size="4" className="w-full max-w-md">
        <Flex direction="column" gap="5">
          <Flex direction="column" gap="1">
            <h1 className="text-[var(--font-size-7)] font-bold leading-tight">
              Set up your organization
            </h1>
            <Text size="2" color="gray">
              {user ? `${user.name}, ` : ""}create your org and connect Stripe to receive
              donations.
            </Text>
          </Flex>

          {serverError && (
            <Text size="2" color="red" role="alert">
              {serverError}
            </Text>
          )}

          {isLoading || isRechecking ? (
            <Flex align="center" gap="2">
              <Spinner size="2" />
              <Text size="2">Loading...</Text>
            </Flex>
          ) : existingOrg ? (
            <Flex direction="column" gap="3">
              {stripeComplete(existingOrg) ? (
                <>
                  <Text size="2">
                    Organization <strong>{existingOrg.name}</strong> ({existingOrg.subdomain}) is
                    set up and accepting donations — nothing left to do.
                  </Text>
                  <Flex gap="3">
                    <Button size="3" asChild>
                      <a href="/dashboard">Go to dashboard</a>
                    </Button>
                    <Button size="3" variant="soft" asChild>
                      <a href={`/donate/${existingOrg.subdomain}`}>Donation page</a>
                    </Button>
                  </Flex>
                </>
              ) : (
                <>
                  <Text size="2">
                    Organization <strong>{existingOrg.name}</strong> ({existingOrg.subdomain})
                    already exists — continue to Stripe onboarding below.
                  </Text>
                  <Button
                    size="3"
                    onClick={handleSubmit(startStripeOnboarding)}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Starting..." : "Continue Stripe onboarding"}
                  </Button>
                </>
              )}
            </Flex>
          ) : (
            <form onSubmit={handleSubmit(startStripeOnboarding)}>
              <Flex direction="column" gap="4">
                <Flex direction="column" gap="1">
                  <Text as="label" size="2" weight="medium">
                    Organization name
                  </Text>
                  <TextField.Root
                    placeholder="Save the Whales"
                    {...register("name", { required: "Organization name is required" })}
                  />
                  {errors.name && (
                    <Text size="1" color="red">
                      {errors.name.message}
                    </Text>
                  )}
                </Flex>

                <Flex direction="column" gap="1">
                  <Text as="label" size="2" weight="medium">
                    Subdomain
                  </Text>
                  <TextField.Root
                    placeholder="whales"
                    {...register("subdomain", {
                      required: "Subdomain is required",
                      pattern: {
                        value: /^[a-z0-9-]+$/,
                        message: "Lowercase letters, numbers and hyphens only",
                      },
                    })}
                  />
                  {errors.subdomain && (
                    <Text size="1" color="red">
                      {errors.subdomain.message}
                    </Text>
                  )}
                </Flex>

                <Flex direction="column" gap="1">
                  <Text as="label" size="2" weight="medium">
                    Account type
                  </Text>
                  <Select.Root
                    value={entityType}
                    onValueChange={(v) =>
                      setValue("entityType", v as "company" | "individual")
                    }
                  >
                    <Select.Trigger />
                    <Select.Content>
                      <Select.Item value="individual">Individual</Select.Item>
                      <Select.Item value="company">Company</Select.Item>
                    </Select.Content>
                  </Select.Root>
                </Flex>

                <Flex direction="column" gap="1">
                  <Text as="label" size="2" weight="medium">
                    Country
                  </Text>
                  <TextField.Root
                    placeholder="US"
                    {...register("country", {
                      required: "Country is required",
                      pattern: { value: /^[A-Z]{2}$/, message: "Two-letter code, e.g. US" },
                    })}
                  />
                  {errors.country && (
                    <Text size="1" color="red">
                      {errors.country.message}
                    </Text>
                  )}
                </Flex>

                <Button type="submit" size="3" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create org and connect Stripe"}
                </Button>
              </Flex>
            </form>
          )}
        </Flex>
      </Card>
    </Flex>
  )
}

export default OnboardingPage
