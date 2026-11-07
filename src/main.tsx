import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router"
import { Theme } from "@radix-ui/themes"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

import { AuthProvider } from "@/context"
import "@radix-ui/themes/styles.css"
import "./index.css"
import App from "@/App"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
})

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Theme accentColor="iris" radius="medium" scaling="100%" appearance="dark">
          <AuthProvider>
            <App />
          </AuthProvider>
        </Theme>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
)
