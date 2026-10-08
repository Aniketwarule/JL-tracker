import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const envFile = fs.readFileSync('.env.local', 'utf-8')
const getEnv = (key) => {
  const match = envFile.match(new RegExp(`${key}=(.*)`))
  return match ? match[1].trim() : null
}

const supabaseUrl = getEnv('NEXT_PUBLIC_SUPABASE_URL')
const supabaseKey = getEnv('SUPABASE_SERVICE_ROLE_KEY')

const supabase = createClient(supabaseUrl, supabaseKey)

async function run() {
  const { data, error } = await supabase.rpc('execute_sql', {
    sql: 'ALTER TABLE jl_entries ADD COLUMN IF NOT EXISTS batch_year TEXT;'
  })
  
  // Alternatively, just do an upsert or something if execute_sql isn't defined.
  // Wait, PostgREST doesn't allow raw SQL execution by default unless we created an execute_sql function.
  // Let's just create an SQL file and tell the user to run it in their Supabase SQL editor if this fails.
  console.log('Error executing via RPC:', error)
}
run()
