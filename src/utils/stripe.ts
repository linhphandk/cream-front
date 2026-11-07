import type { Organization } from "@/api/generated"

export const stripeComplete = (o: Organization) =>
  !!(o.stripeChargesEnabled && o.stripePayoutsEnabled && o.stripeDetailsSubmitted)
