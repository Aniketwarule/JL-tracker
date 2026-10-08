import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ArrowLeft, Plus } from 'lucide-react'
import PostCard from '@/components/forums/PostCard'
import EmptyState from '@/components/ui/EmptyState'
import { MessageSquare } from 'lucide-react'
import { connection } from 'next/server'
import styles from './page.module.css'

export async function generateMetadata({ params }) {
  const { slug } = await params
  const name = slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  return { title: `${name} — Forums — TCS JL Tracker` }
}

export default async function CategoryPage({ params, searchParams }) {
  await connection()
  const { slug } = await params
  const resolvedSearch = await searchParams
  const sort = resolvedSearch?.sort || 'new'
  let category = null
  let posts = []

  try {
    const supabase = await createClient()

    const { data: cat } = await supabase
      .from('forum_categories')
      .select('*')
      .eq('slug', slug)
      .single()

    category = cat

    if (cat) {
      let query = supabase
        .from('forum_posts')
        .select('*, profiles(username, full_name, avatar_url)')
        .eq('category_id', cat.id)
        .eq('is_deleted', false)

      if (sort === 'top') {
        query = query.order('upvotes', { ascending: false })
      } else if (sort === 'hot') {
        query = query.order('comment_count', { ascending: false })
      } else {
        query = query.order('created_at', { ascending: false })
      }

      const { data } = await query.limit(50)
      posts = data || []
    }
  } catch (e) {
    console.error('Failed to fetch posts:', e)
  }

  const categoryName = category?.name || slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

  return (
    <div className="container animate-fade-in">
      <div className={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
          <Link href="/forums" className="btn btn-ghost" style={{ padding: '6px' }}>
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 style={{ fontSize: '1.5rem' }}>{categoryName}</h1>
            {category?.description && (
              <p className="text-muted text-sm">{category.description}</p>
            )}
          </div>
        </div>
        <Link href="/forums/new" className="btn btn-primary">
          <Plus size={18} /> New Post
        </Link>
      </div>

      {/* Sort Tabs */}
      <div className={styles.sortTabs}>
        {['new', 'hot', 'top'].map(s => (
          <Link
            key={s}
            href={`/forums/${slug}?sort=${s}`}
            className={`${styles.sortTab} ${sort === s ? styles.sortTabActive : ''}`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </Link>
        ))}
      </div>

      {/* Posts */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
        {posts.length > 0 ? (
          posts.map(post => (
            <PostCard key={post.id} post={post} categorySlug={slug} />
          ))
        ) : (
          <EmptyState
            icon={MessageSquare}
            title="No posts yet"
            description="Be the first to start a discussion in this category."
            actionText="Create Post"
            actionHref="/forums/new"
          />
        )}
      </div>
    </div>
  )
}
