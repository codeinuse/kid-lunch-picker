import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 90_000,
  use: {
    baseURL: "http://localhost:3000",
    viewport: { width: 390, height: 844 },
  },
  webServer: undefined, // app is already running on :3000
});
