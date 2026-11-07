import { defineConfig } from "orval"

// shortcut: api/openapi.json is hand-maintained — cream-back serves no OpenAPI endpoint yet; regenerate with `orval` once it does
export default defineConfig({
  cream: {
    input: "api/openapi.json",
    output: {
      target: "src/api/generated.ts",
      client: "react-query",
      httpClient: "fetch",
      override: {
        fetch: {
          includeHttpResponseReturnType: false,
        },
        mutator: {
          path: "./src/api/custom-fetch.ts",
          name: "customFetch",
        },
      },
      prettier: true,
    },
  },
})
