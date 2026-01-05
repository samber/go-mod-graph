import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        allowedHosts: true
    },
    optimizeDeps: {
        include: ['@dagrejs/dagre', '@dagrejs/graphlib'],
        esbuildOptions: {
            target: 'esnext'
        }
    },
    resolve: {
        dedupe: ['@dagrejs/graphlib']
    }
})
