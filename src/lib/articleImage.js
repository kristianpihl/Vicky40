import { supabase } from './supabaseClient.js'

// Public URL for a file in the 'article-images' bucket.
export function articleImageUrl(path) {
  if (!path) return null
  return supabase.storage.from('article-images').getPublicUrl(path).data.publicUrl
}
