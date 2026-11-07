import { useState } from "react"
import { Link } from "react-router"
import { Button, TextField, Text, Flex, Separator } from "@radix-ui/themes"
import { useForm } from "react-hook-form"

import AuthLayout from "@/pages/auth/AuthLayout"
import { useAuth } from "@/context"
import type { LoginRequest } from "@/types/auth"

const LoginPage = () => {
  const { login } = useAuth()
  const [serverError, setServerError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginRequest>()

  const onSubmit = async (data: LoginRequest) => {
    setServerError(null)
    setIsLoading(true)

    try {
      await login(data.email, data.password)
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "message" in err
          ? (err as { message: string }).message
          : "Something went wrong"
      setServerError(msg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout title="Welcome back" subtitle="Log in to your Cream account.">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Flex direction="column" gap="4">
          {serverError && (
            <Text size="2" color="red" role="alert">
              {serverError}
            </Text>
          )}

          <Flex direction="column" gap="1">
            <Text as="label" size="2" weight="medium">
              Email
            </Text>
            <TextField.Root
              type="email"
              placeholder="jane@example.com"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Enter a valid email",
                },
              })}
            />
            {errors.email && (
              <Text size="1" color="red">
                {errors.email.message}
              </Text>
            )}
          </Flex>

          <Flex direction="column" gap="1">
            <Text as="label" size="2" weight="medium">
              Password
            </Text>
            <TextField.Root
              type="password"
              placeholder="Your password"
              {...register("password", {
                required: "Password is required",
              })}
            />
            {errors.password && (
              <Text size="1" color="red">
                {errors.password.message}
              </Text>
            )}
          </Flex>

          <Button type="submit" size="3" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Log in"}
          </Button>
        </Flex>
      </form>

      <Separator size="4" />

      <Text as="p" size="2" align="center" color="gray">
        Don't have an account?{" "}
        <Link to="/signup" className="text-[var(--iris-11)] hover:underline">
          Sign up
        </Link>
      </Text>
    </AuthLayout>
  )
}

export default LoginPage
