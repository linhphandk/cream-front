import { useState } from "react"
import { useParams } from "react-router"
import { Button, Card, Flex, Spinner, Text, TextField } from "@radix-ui/themes"
import { useForm } from "react-hook-form"

import {
  useCreateDonation,
  useGetDonationStatus,
  useGetPublicOrg,
} from "@/api/generated"
import type {
  CreateDonationResponse,
  DonationStatusResponse,
  PublicOrgResponse,
} from "@/api/generated"
import type { ApiError } from "@/types/auth"

interface DonateForm {
  amount: string
  donor_name: string
  donor_email: string
}

const DonatePage = () => {
  const { subdomain = "" } = useParams()
  const [serverError, setServerError] = useState<string | null>(null)
  const [donation, setDonation] = useState<CreateDonationResponse | null>(null)

  const {
    data: org,
    isLoading: orgLoading,
    isError: orgError,
  } = useGetPublicOrg<PublicOrgResponse, ApiError>(subdomain)

  const createDonation = useCreateDonation()
  const {
    data: status,
    error: statusError,
    refetch,
  } = useGetDonationStatus<DonationStatusResponse, ApiError>(subdomain, donation?.donation_id ?? "", {
    query: { enabled: !!donation },
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DonateForm>()

  const onSubmit = async (data: DonateForm) => {
    setServerError(null)
    try {
      const res = await createDonation.mutateAsync({
        subdomain,
        data: {
          amount_cents: Math.round(Number(data.amount) * 100),
          currency: "usd",
          donor_name: data.donor_name || null,
          donor_email: data.donor_email || null,
        },
      })
      setDonation(res)
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "message" in err
          ? (err as { message: string }).message
          : "Something went wrong"
      setServerError(msg)
    }
  }

  const canDonate = org?.stripeOnboardingComplete === true

  return (
    <Flex align="center" justify="center" className="min-h-screen bg-[var(--gray-2)] px-4">
      <Card size="4" className="w-full max-w-md">
        <Flex direction="column" gap="5">
          <Flex direction="column" gap="1">
            <h1 className="text-[var(--font-size-7)] font-bold leading-tight">Donate</h1>
            {orgLoading && (
              <Flex align="center" gap="2">
                <Spinner size="1" />
                <Text size="2">Loading...</Text>
              </Flex>
            )}
            {org && (
              <Text size="2" color="gray">
                Support {org.name}
              </Text>
            )}
          </Flex>

          {orgError && <Text size="2" color="red">Organization not found</Text>}

          {serverError && (
            <Text size="2" color="red" role="alert">
              {serverError}
            </Text>
          )}

          {org && !canDonate && (
            <Text size="2" color="amber">
              {org.name} isn't accepting donations yet.
            </Text>
          )}

          {donation ? (
            <Flex direction="column" gap="3">
              <Text size="2">
                Donation created — ID <strong>{donation.donation_id}</strong>
              </Text>
              {/* shortcut: no Stripe.js payment confirmation yet — needs @stripe/stripe-js + backend donation status endpoint (currently TODO) */}
              <Text size="1" color="gray">
                Payment intent: {donation.payment_intent_id}
              </Text>
              <Flex direction="column" gap="1" align="start">
                <Button size="2" variant="soft" onClick={() => refetch()}>
                  Check status
                </Button>
                {status && (
                  <Text size="1" color="gray">
                    Status: {status.status} · ${(status.amount_cents / 100).toFixed(2)}{" "}
                    {status.currency.toUpperCase()}
                  </Text>
                )}
                {statusError && (
                  <Text size="1" color="red">
                    Status unavailable
                  </Text>
                )}
              </Flex>
            </Flex>
          ) : (
            org &&
            canDonate && (
              <form onSubmit={handleSubmit(onSubmit)}>
                <Flex direction="column" gap="4">
                  <Flex direction="column" gap="1">
                    <Text as="label" size="2" weight="medium">
                      Amount (USD)
                    </Text>
                    <TextField.Root
                      type="number"
                      step="0.01"
                      min="1"
                      placeholder="25.00"
                      {...register("amount", {
                        required: "Amount is required",
                        min: { value: 1, message: "Minimum is $1" },
                      })}
                    />
                    {errors.amount && (
                      <Text size="1" color="red">
                        {errors.amount.message}
                      </Text>
                    )}
                  </Flex>

                  <Flex direction="column" gap="1">
                    <Text as="label" size="2" weight="medium">
                      Your name (optional)
                    </Text>
                    <TextField.Root placeholder="Jane Doe" {...register("donor_name")} />
                  </Flex>

                  <Flex direction="column" gap="1">
                    <Text as="label" size="2" weight="medium">
                      Your email (optional)
                    </Text>
                    <TextField.Root
                      type="email"
                      placeholder="jane@example.com"
                      {...register("donor_email")}
                    />
                  </Flex>

                  <Button type="submit" size="3" disabled={createDonation.isPending}>
                    {createDonation.isPending ? "Creating..." : "Donate"}
                  </Button>
                </Flex>
              </form>
            )
          )}
        </Flex>
      </Card>
    </Flex>
  )
}

export default DonatePage
