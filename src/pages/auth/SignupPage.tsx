import { useState } from "react"
import { Link } from "react-router"
import { Button, TextField, Text, Flex, Separator } from "@radix-ui/themes"
import { useForm } from "react-hook-form"

import AuthLayout from "@/pages/auth/AuthLayout"
import { useAuth } from "@/context"
import type { RegisterRequest } from "@/types/auth"

const SignupPage = () => {
  const { signup } = useAuth()
  const [serverError, setServerError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterRequest>()

  const onSubmit = async (data: RegisterRequest) => {
    setServerError(null)
    setIsLoading(true)

    try {
      await signup(data.email, data.name, data.password)
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
    <AuthLayout title="Create your account" subtitle="Sign up for Cream.">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Flex direction="column" gap="4">
          {serverError && (
            <Text size="2" color="red" role="alert">
              {serverError}
            </Text>
          )}

          <Flex direction="column" gap="1">
            <Text as="label" size="2" weight="medium">
              Name
            </Text>
            <TextField.Root
              type="text"
              placeholder="Jane Doe"
              {...register("name", { required: "Name is required" })}
            />
            {errors.name && (
              <Text size="1" color="red">
                {errors.name.message}
              </Text>
            )}
          </Flex>

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
              placeholder="At least 8 characters"
              {...register("password", {
                required: "Password is required",
                minLength: { value: 8, message: "Password must be at least 8 characters" },
              })}
            />
            {errors.password && (
              <Text size="1" color="red">
                {errors.password.message}
              </Text>
            )}
          </Flex>

          <Button type="submit" size="3" disabled={isLoading}>
            {isLoading ? "Signing up..." : "Sign up"}
          </Button>
        </Flex>
      </form>

      <Separator size="4" />

      <Text as="p" size="2" align="center" color="gray">
        Already have an account?{" "}
        <Link to="/login" className="text-[var(--iris-11)] hover:underline">
          Log in
        </Link>
      </Text>
    </AuthLayout>
  )
}

export default SignupPage
