import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import posthog from 'posthog-js'
import { PostHogProvider } from '@posthog/react'

posthog.init('phc_DjpQVAEQozx9XNMVVvTj4TVXqkNeeKnmDXNzuaMZNPXP', {
  api_host: 'https://hogpost.samber.dev',
  defaults: '2026-01-30',
  disable_session_recording: true,
  // autocapture: false,
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PostHogProvider client={posthog}>
      <App />
    </PostHogProvider>
  </StrictMode>,
)
