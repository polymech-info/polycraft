import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './tests',
  timeout: 25 * 1000, // 30 seconds
  webServer: {
    command: 'pnpm dev',
    port: 4321,
    reuseExistingServer:true
  },
  use: {
    headless: true,
    screenshot: 'on',
    video: 'off',
    
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    }
  ],
});