import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  timeout: 45000,
  workers: 1,
  use: {
    baseURL: "http://127.0.0.1:5317",
    channel: "chrome",
    trace: "retain-on-failure",
  },
  reporter: "list",
  webServer: {
    command: "npm run dev -- --port 5317 --strictPort",
    url: "http://127.0.0.1:5317",
    reuseExistingServer: true,
  },
  projects: [
    { name: "desktop", use: { viewport: { width: 1440, height: 1000 } } },
    { name: "tablet", use: { viewport: { width: 768, height: 1024 } } },
    { name: "mobile", use: { viewport: { width: 375, height: 812 } } },
    { name: "narrow", use: { viewport: { width: 320, height: 740 } } },
  ],
});
