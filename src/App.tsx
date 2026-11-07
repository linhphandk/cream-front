import { Routes, Route, Navigate } from "react-router"

import SignupPage from "@/pages/auth/SignupPage"
import LoginPage from "@/pages/auth/LoginPage"
import OnboardingPage from "@/pages/onboarding/OnboardingPage"
import OnboardingSuccessPage from "@/pages/onboarding/OnboardingSuccessPage"
import OnboardingErrorPage from "@/pages/onboarding/OnboardingErrorPage"
import DashboardPage from "@/pages/dashboard/DashboardPage"
import DonatePage from "@/pages/donate/DonatePage"
import DonateSuccessPage from "@/pages/donate/DonateSuccessPage"
import DonateCancelPage from "@/pages/donate/DonateCancelPage"
import ProtectedRoute from "@/components/ProtectedRoute"

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route
        path="/onboarding"
        element={
          <ProtectedRoute>
            <OnboardingPage />
          </ProtectedRoute>
        }
      />
      <Route path="/onboarding/success" element={<OnboardingSuccessPage />} />
      <Route path="/onboarding/error" element={<OnboardingErrorPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route path="/donate/:subdomain" element={<DonatePage />} />
      <Route path="/donate/:subdomain/success" element={<DonateSuccessPage />} />
      <Route path="/donate/:subdomain/cancel" element={<DonateCancelPage />} />
    </Routes>
  )
}

export default App
