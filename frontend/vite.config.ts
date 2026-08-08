import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'v8',
      include: ['src/stores/**', 'src/lib/**'],
      exclude: [
        'src/lib/reportExporter.ts',
        'src/lib/fileParser.ts',
        'src/lib/applyHighlights.ts',
        'src/lib/highlightEngine.ts',
      ],
    }
  }
})