import { createClient } from '@supabase/supabase-js'

// Verdiene leses fra miljøvariabler (.env lokalt, Environment Variables i Vercel).
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.warn(
    'Mangler VITE_SUPABASE_URL eller VITE_SUPABASE_ANON_KEY. ' +
      'Sjekk .env-fila lokalt og miljøvariablene i Vercel.',
  )
}

// Én delt klient som resten av appen importerer:
//   import { supabase } from '../lib/supabaseClient.js'
export const supabase = createClient(supabaseUrl, supabaseKey)
