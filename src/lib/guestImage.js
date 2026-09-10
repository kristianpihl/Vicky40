import { supabase } from './supabaseClient.js'

// Public URL for a file in the 'guest-images' bucket.
export function guestImageUrl(path) {
  if (!path) return null
  return supabase.storage.from('guest-images').getPublicUrl(path).data.publicUrl
}
