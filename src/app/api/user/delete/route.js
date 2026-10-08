import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export async function POST(request) {
  try {
    const supabase = await createServerClient()
    
    // 1. Verify the user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Initialize the Admin client to delete the user
    const adminAuthClient = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    // 3. Delete the user
    // IMPORTANT: Make sure the set_null_on_delete.sql migration has been run
    // in the Supabase SQL editor, otherwise this will CASCADE delete all their posts!
    const { error: deleteError } = await adminAuthClient.auth.admin.deleteUser(user.id)

    if (deleteError) {
      console.error('Failed to delete user:', deleteError)
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    // Since we deleted the user from auth.users, their active session is now dead.
    // The client will handle logging them out locally.
    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('Account deletion error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
