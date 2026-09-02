import { createClient } from '@supabase/supabase-js'

// The values are read from environment variables (.env locally, Environment
// Variables in Vercel).
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.warn(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. ' +
      'RSVP, photo upload and the gallery will not work until these are set – ' +
      'in .env locally, and in Vercel under Settings → Environment Variables.',
  )
}

// Fallback values so the rest of the site still works even if the keys are
// missing. Then only the forms fail (with a clear message), not the whole site.
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseKey || 'placeholder-key',
)
