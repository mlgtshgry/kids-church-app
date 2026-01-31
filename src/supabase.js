
import { createClient } from '@supabase/supabase-js'

// These will be provided by the user later
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = (supabaseUrl && supabaseKey && supabaseUrl !== 'YOUR_SUPABASE_URL_HERE')
    ? createClient(supabaseUrl, supabaseKey)
    : null
