import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ArrowLeft } from 'lucide-react'
import { buildCommentTree, timeAgo } from '@/lib/utils'
import CommentThread from '@/components/forums/CommentThread'
import VoteButton from '@/components/forums/VoteButton'
import PostActions from './PostActions'
import { connection } from 'next/server'
import styles from './page.module.css'

export async function generateMetadata({ params }) {
  const { postId } = await params
  try {
    const supabase = await createClient()
    const { data } = await supabase.from('forum_posts').select('title').eq('id', postId).single()
    return { title: `${data?.title || 'Post'} — TCS JL Tracker` }
  } catch {
    return { title: 'Post — TCS JL Tracker' }
  }
}

export default async function PostPage({ params }) {
  await connection()
  const { slug, postId } = await params
  let post = null
  let commentTree = []

  try {
    const supabase = await createClient()

    const { data: postData } = await supabase
      .from('forum_posts')
      .select('*, profiles(username, full_name, avatar_url), forum_categories(name, slug)')
      .eq('id', postId)
      .single()

    post = postData

    const { data: comments } = await supabase
      .from('forum_comments')
      .select('*, profiles(username, full_name, avatar_url)')
      .eq('post_id', postId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: true })

    commentTree = buildCommentTree(comments || [])
  } catch (e) {
    console.error('Failed to fetch post:', e)
  }

  if (!post) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: 'var(--spacing-12)' }}>
        <h2>Post not found</h2>
        <Link href="/forums" className="btn btn-primary" style={{ marginTop: 'var(--spacing-4)' }}>
          Back to Forums
        </Link>
      </div>
    )
  }

  const author = post.is_anonymous
    ? 'Anonymous'
    : (post.profiles?.full_name || post.profiles?.username || 'Deleted User')

  return (
    <div className="container animate-fade-in" style={{ maxWidth: '48rem' }}>
      <Link href={`/forums/${slug}`} className="btn btn-ghost" style={{ marginBottom: 'var(--spacing-4)' }}>
        <ArrowLeft size={18} /> Back to {post.forum_categories?.name || 'Forum'}
      </Link>

      {/* Post */}
      <div className="card" style={{ marginBottom: 'var(--spacing-4)' }}>
        <div style={{ display: 'flex', gap: 'var(--spacing-3)' }}>
          <VoteButton votableType="post" votableId={post.id} initialVotes={post.upvotes || 0} />

          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 'var(--spacing-2)' }}>
              {post.title}
            </h1>

            <div style={{
              display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)',
              fontSize: '0.8125rem', color: 'var(--color-text-tertiary)',
              marginBottom: 'var(--spacing-4)'
            }}>
              <span style={{ fontWeight: 500 }}>{author}</span>
              <span>·</span>
              <span>{timeAgo(post.created_at)}</span>
              {post.location_tag && (
                <>
                  <span>·</span>
                  <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>
                    {post.location_tag}
                  </span>
                </>
              )}
            </div>

            <div style={{
              fontSize: '0.9375rem',
              lineHeight: 1.7,
              color: 'var(--color-text-primary)',
              whiteSpace: 'pre-wrap'
            }}>
              {post.body}
            </div>

            <PostActions postId={post.id} />
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <div className="card">
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 'var(--spacing-3)', paddingBottom: 'var(--spacing-3)', borderBottom: '1px solid var(--color-border)' }}>
          Comments ({post.comment_count || 0})
        </h3>

        <PostActions postId={post.id} showCommentForm />

        <CommentThread comments={commentTree} postId={post.id} />
      </div>
    </div>
  )
}
