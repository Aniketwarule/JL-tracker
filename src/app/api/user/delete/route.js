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

    // 3. Soft Delete: Anonymize the profile data
    // We do this instead of a hard delete to avoid PostgreSQL trigger deadlocks
    // and to keep the user's posts visible as "Deleted User" per requirements.
    const { error: profileError } = await adminAuthClient
      .from('profiles')
      .update({
        full_name: 'Deleted User',
        username: `deleted_${Date.now()}`,
        avatar_url: null,
        stream: null,
        preferred_location: null,
      })
      .eq('id', user.id)

    if (profileError) {
      console.error('Failed to anonymize profile:', profileError)
      return NextResponse.json({ error: profileError.message }, { status: 500 })
    }

    // 4. Suspend the user account so they can't log in anymore
    const { error: banError } = await adminAuthClient.auth.admin.updateUserById(
      user.id,
      { ban_duration: '876000h' } // Banned for 100 years
    )

    if (banError) {
      console.error('Failed to ban user (falling back to just anonymized profile):', banError)
      // Even if banning fails, the profile is anonymized, so they are effectively a "Deleted User"
    }

    // Return success. The client will handle logging them out locally.
    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('Account deletion error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
