import { NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { headers } from 'next/headers'

const MAX_SUBMISSIONS_PER_DAY = 3

function getAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
}

export async function POST(request) {
  try {
    const body = await request.json()

    // Honeypot check — bots will fill this hidden field
    if (body.website_url) {
      // Silently accept but don't insert (don't tip off the bot)
      return NextResponse.json({ success: true })
    }

    // Get client IP for rate limiting
    const headersList = await headers()
    const ip = headersList.get('x-forwarded-for')?.split(',')[0]?.trim() 
      || headersList.get('x-real-ip') 
      || 'unknown'

    const supabase = getAdminClient()

    // Rate limiting: check submissions from this IP in the last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

    const { count, error: countError } = await supabase
      .from('submission_rate_limits')
      .select('*', { count: 'exact', head: true })
      .eq('ip_address', ip)
      .gte('created_at', oneDayAgo)

    if (countError) {
      console.error('Rate limit check error:', countError)
      // Allow submission if rate limit table doesn't exist yet
    } else if (count >= MAX_SUBMISSIONS_PER_DAY) {
      return NextResponse.json(
        { error: 'You have reached the daily submission limit (3 per day). Please try again tomorrow.' },
        { status: 429 }
      )
    }

    // Build payload
    const payload = {
      user_id: body.user_id || null,
      guest_name: body.guest_name || null,
      interview_date: body.interview_date || null,
      ol_date: body.ol_date || null,
      jl_date: body.jl_date || null,
      onboarding_date: body.onboarding_date || null,
      batch_year: body.batch_year || null,
      interview_domain: body.interview_domain || null,
      stream: body.stream || null,
      xplore_points: parseInt(body.xplore_points) || 0,
      ipa_status: body.ipa_status || 'Not Given',
      ipa_score: body.ipa_status === 'Given' && body.ipa_score ? parseFloat(body.ipa_score) : null,
      campus_type: body.campus_type || null,
      pref_loc_1: body.pref_loc_1 || null,
      pref_loc_2: body.pref_loc_2 || null,
      pref_loc_3: body.pref_loc_3 || null,
      ilp_location: body.ilp_location || null,
      work_location: body.work_location || null,
      additional_notes: body.additional_notes || null
    }

    // Insert the JL entry
    const { error: insertError } = await supabase.from('jl_entries').insert(payload)

    if (insertError) {
      console.error('Insert error:', insertError)
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    // Record this submission for rate limiting
    await supabase.from('submission_rate_limits').insert({ ip_address: ip })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Submit JL API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
