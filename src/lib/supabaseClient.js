import { createClient } from '@supabase/supabase-js'

// Verdiene leses fra miljøvariabler (.env lokalt, Environment Variables i Vercel).
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.warn(
    'Mangler VITE_SUPABASE_URL eller VITE_SUPABASE_ANON_KEY. ' +
      'RSVP, bildeopplasting og galleri virker ikke før disse er satt – ' +
      'i .env lokalt, og i Vercel under Settings → Environment Variables.',
  )
}

// Reserveverdier gjør at resten av nettsiden fungerer selv om nøklene mangler.
// Da feiler bare skjemaene (med en tydelig melding), i stedet for hele siden.
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseKey || 'placeholder-key',
)
