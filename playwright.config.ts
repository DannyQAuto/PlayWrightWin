import { defineConfig, devices } from '@playwright/test';

/**
* See https://playwright.dev/docs/test-configuration.
*/
export default defineConfig({
  testDir: './test',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: 0, // ← CONTROLADO DESDE EL SPEC - valor bajo por defecto
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['allure-playwright', {
      detail: true,
      outputFolder: 'allure-results',
      suiteTitle: false
    }]
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    // baseURL: 'https://www.saucedemo.com', ← COMENTADO ya que usas URL directa

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',

    /* Screenshot on failure */
    screenshot: 'on',

    /* Video recording */
    video: 'on',
  },

  /* Configure projects for major browsers - SOLO CHROMIUM */
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        /* Configuración específica para videos */
        video: {
          mode: 'on',
          size: { width: 1280, height: 720 }
        },
        /* AGREGAR ESTAS LÍNEAS: */
    launchOptions: {
  slowMo: 1000,
  headless: process.env.HEADLESS !== 'false' // true por defecto, false si HEADLESS=false
}
      },
    }
  ],

  /* Optional: Timeout configuration */
  timeout: 300000, // 300 segundos (5 minutos)

  /* Output directory for test artifacts */
  outputDir: 'test-results/',
});