import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['__tests__/**/*.{test,spec}.{js,ts,jsx,tsx}'],
    setupFiles: ['__tests__/setup.ts']
  }
})