import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Rocket, Briefcase, MapPin, GraduationCap, BookOpen, HelpCircle, MessageSquare, Plus } from 'lucide-react'
import { connection } from 'next/server'
import styles from './page.module.css'

const ICON_MAP = {
  Rocket, Briefcase, MapPin, GraduationCap, BookOpen, HelpCircle
}

const FALLBACK_CATEGORIES = [
  { id: '1', name: 'JL Updates', slug: 'jl-updates', description: 'Share and discuss Joining Letter news and updates', icon: 'Rocket', color: '#7c3aed', post_count: 0 },
  { id: '2', name: 'IPA Discussion', slug: 'ipa-discussion', description: 'IPA status, tips, and experiences', icon: 'Briefcase', color: '#8b5cf6', post_count: 0 },
  { id: '3', name: 'Location Talk', slug: 'location-talk', description: 'City-specific discussions for all locations', icon: 'MapPin', color: '#a78bfa', post_count: 0 },
  { id: '4', name: 'Interview Experience', slug: 'interview-experience', description: 'Share your interview journey and preparation tips', icon: 'GraduationCap', color: '#6d28d9', post_count: 0 },
  { id: '5', name: 'Xplore & Learning', slug: 'xplore-learning', description: 'Xplore points, courses, certifications and tips', icon: 'BookOpen', color: '#5b21b6', post_count: 0 },
  { id: '6', name: 'General Q&A', slug: 'general-qa', description: 'Ask anything TCS-related', icon: 'HelpCircle', color: '#4c1d95', post_count: 0 },
]

export const metadata = {
  title: 'Forums — TCS JL Tracker',
  description: 'Discuss with fellow TCS 2026 candidates about joining letters, interviews, and more.'
}

export default async function ForumsPage() {
  await connection()
  let categories = FALLBACK_CATEGORIES

  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('forum_categories')
      .select('*, forum_posts(count)')
      .order('sort_order')

    if (data?.length) {
      categories = data.map(cat => ({
        ...cat,
        post_count: cat.forum_posts?.[0]?.count || 0
      }))
    }
  } catch (e) {
    console.error('Failed to fetch categories:', e)
  }

  return (
    <div className="container animate-fade-in">
      <div className={styles.header}>
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: 'var(--spacing-2)' }}>Forums</h1>
          <p className="text-muted">Discuss with fellow TCS 2026 candidates across locations and topics.</p>
        </div>
        <Link href="/forums/new" className="btn btn-primary">
          <Plus size={18} /> New Post
        </Link>
      </div>

      <div className={styles.grid}>
        {categories.map(cat => {
          const IconComponent = ICON_MAP[cat.icon] || MessageSquare
          return (
            <Link href={`/forums/${cat.slug}`} key={cat.id} className={`card ${styles.categoryCard}`}>
              <div className={styles.categoryIcon} style={{ backgroundColor: cat.color + '15', color: cat.color }}>
                <IconComponent size={24} />
              </div>
              <div>
                <h3 className={styles.categoryName}>{cat.name}</h3>
                <p className={styles.categoryDesc}>{cat.description}</p>
                <span className="text-xs text-muted">{cat.post_count} posts</span>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
