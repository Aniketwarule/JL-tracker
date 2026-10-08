import { NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const ADMIN_TOKEN = 'admin@tcs2026'

function getAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
}

export async function GET(request) {
  try {
    const token = request.headers.get('X-Admin-Token')
    if (token !== ADMIN_TOKEN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = getAdminClient()

    const [reportsRes, postsRes, entriesRes] = await Promise.all([
      supabase.from('reports').select('*, profiles:reporter_id(username)').order('created_at', { ascending: false }).limit(50),
      supabase.from('forum_posts').select('*, profiles:author_id(username, full_name)').order('created_at', { ascending: false }).limit(100),
      supabase.from('jl_entries').select('*, profiles:user_id(username, full_name)').order('created_at', { ascending: false }).limit(100)
    ])

    let reports = reportsRes.data || []
    
    // Enrich reports with content context
    if (reports.length > 0) {
      const postIds = reports.filter(r => r.reportable_type === 'post').map(r => r.reportable_id)
      const commentIds = reports.filter(r => r.reportable_type === 'comment').map(r => r.reportable_id)
      
      let postsMap = {}
      let commentsMap = {}
      
      if (postIds.length > 0) {
        const { data: reportedPosts } = await supabase.from('forum_posts').select('id, title, body').in('id', postIds)
        reportedPosts?.forEach(p => postsMap[p.id] = p)
      }
      
      if (commentIds.length > 0) {
        const { data: reportedComments } = await supabase.from('forum_comments').select('id, body, post_id').in('id', commentIds)
        reportedComments?.forEach(c => commentsMap[c.id] = c)
      }
      
      reports = reports.map(r => {
        if (r.reportable_type === 'post') {
          return { ...r, content_title: postsMap[r.reportable_id]?.title, content_body: postsMap[r.reportable_id]?.body }
        } else if (r.reportable_type === 'comment') {
          return { ...r, content_body: commentsMap[r.reportable_id]?.body, content_post_id: commentsMap[r.reportable_id]?.post_id }
        }
        return r
      })
    }

    return NextResponse.json({
      reports: reports,
      posts: postsRes.data || [],
      entries: entriesRes.data || []
    })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    // Validate admin token
    const token = request.headers.get('X-Admin-Token')
    if (token !== ADMIN_TOKEN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { action, type, id } = await request.json()

    if (!action || !type || !id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = getAdminClient()

    let result

    switch (action) {
      case 'delete':
        if (type === 'post') {
          result = await supabase.from('forum_posts').update({ is_deleted: true }).eq('id', id)
        } else if (type === 'comment') {
          result = await supabase.from('forum_comments').update({ is_deleted: true }).eq('id', id)
        } else if (type === 'entry') {
          result = await supabase.from('jl_entries').update({ is_deleted: true }).eq('id', id)
        } else {
          return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
        }
        break

      case 'resolve_report':
        result = await supabase.from('reports').update({ status: 'resolved' }).eq('id', id)
        break

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    if (result?.error) {
      return NextResponse.json({ error: result.error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
