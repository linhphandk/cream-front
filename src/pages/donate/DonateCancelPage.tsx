import { Link, useParams } from "react-router"
import { Button, Card, Flex, Text } from "@radix-ui/themes"

const DonateCancelPage = () => {
  const { subdomain = "" } = useParams()

  return (
    <Flex align="center" justify="center" className="min-h-screen bg-[var(--gray-2)] px-4">
      <Card size="4" className="w-full max-w-md">
        <Flex direction="column" gap="4">
          <h1 className="text-[var(--font-size-7)] font-bold leading-tight">Donation cancelled</h1>
          <Text size="2" color="gray">
            No payment was taken.
          </Text>
          <Button size="2" asChild>
            <Link to={`/donate/${subdomain}`}>Back to donation page</Link>
          </Button>
        </Flex>
      </Card>
    </Flex>
  )
}

export default DonateCancelPage
