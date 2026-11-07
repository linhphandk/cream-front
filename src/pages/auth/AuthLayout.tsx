import { Card, Flex, Text } from "@radix-ui/themes"
import type { ReactNode } from "react"

interface AuthLayoutProps {
  title: string
  subtitle?: string
  children: ReactNode
}

const AuthLayout = ({ title, subtitle, children }: AuthLayoutProps) => {
  return (
    <Flex align="center" justify="center" className="min-h-screen bg-[var(--gray-2)] px-4">
      <Card size="4" className="w-full max-w-md">
        <Flex direction="column" gap="5">
          <Flex direction="column" gap="1">
            <h1 className="text-[var(--font-size-7)] font-bold leading-tight">{title}</h1>
            {subtitle && (
              <Text size="2" color="gray">
                {subtitle}
              </Text>
            )}
          </Flex>
          {children}
        </Flex>
      </Card>
    </Flex>
  )
}

export default AuthLayout
