import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { connection } from 'next/server'
import { formatDate, anonymizeUser } from '@/lib/utils'
import { 
  BarChart3, 
  MessageSquare, 
  TrendingUp, 
  FileText, 
  ArrowRight, 
  Users, 
  MapPin, 
  CheckCircle 
} from 'lucide-react'
import styles from './page.module.css'

export default async function HomePage() {
  await connection()
  // Try to fetch basic stats, fallback to 0s
  let stats = {
    totalEntries: 0,
    jlsReceived: 0,
    citiesTracked: 0,
    communityMembers: 0
  }
  
  let recentJLs = []
  
  try {
    const supabase = await createClient()
    
    // Example queries (assuming typical table structures - adjust later if needed)
    // 1. Total entries
    const { count: totalEntriesCount } = await supabase
      .from('jl_entries')
      .select('*', { count: 'exact', head: true })
      
    // 2. JLs received
    const { count: jlsReceivedCount } = await supabase
      .from('jl_entries')
      .select('*', { count: 'exact', head: true })
      .not('jl_date', 'is', null)
      
    // 3. Cities tracked (unique locations)
    const { data: locations } = await supabase
      .from('jl_entries')
      .select('work_location')
      
    const uniqueCities = new Set(locations?.map(l => l.work_location).filter(Boolean))
    
    // 4. Community members
    const { count: membersCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      
    // 5. Recent JLs
    const { data: recent } = await supabase
      .from('jl_entries')
      .select('id, user_id, work_location, jl_date, stream, profiles(username)')
      .order('jl_date', { ascending: false })
      .limit(5)
      
    stats = {
      totalEntries: totalEntriesCount || 0,
      jlsReceived: jlsReceivedCount || 0,
      citiesTracked: uniqueCities.size || 0,
      communityMembers: membersCount || 0
    }
    
    recentJLs = recent || []
  } catch (error) {
    // Silently fail and use fallbacks if Supabase is not configured or error occurs
    console.error('Supabase fetch error on landing page:', error)
  }

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className="container">
          <h1 className={styles.heroTitle}>
            Track TCS Joining Letters, <span>Together.</span>
          </h1>
          <p className={styles.heroSubtitle}>
            A community-driven platform for the TCS 2026 batch to track joining letters, 
            share timelines, and stay updated on the latest trends across locations.
          </p>
          <div className={styles.heroActions}>
            <Link href="/dashboard" className="btn btn-primary">
              View Dashboard <ArrowRight size={18} />
            </Link>
            <Link href="/forums" className="btn btn-secondary">
              Join the Discussion <MessageSquare size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className={styles.statsSection}>
        <div className="container">
          <div className={styles.statsGrid}>
            <div className={`card ${styles.statCard}`}>
              <div className={styles.statValue}>{stats.totalEntries}</div>
              <div className={styles.statLabel}>Total Entries</div>
            </div>
            <div className={`card ${styles.statCard}`}>
              <div className={styles.statValue}>{stats.jlsReceived}</div>
              <div className={styles.statLabel}>JLs Received</div>
            </div>
            <div className={`card ${styles.statCard}`}>
              <div className={styles.statValue}>{stats.citiesTracked}</div>
              <div className={styles.statLabel}>Cities Tracked</div>
            </div>
            <div className={`card ${styles.statCard}`}>
              <div className={styles.statValue}>{stats.communityMembers}</div>
              <div className={styles.statLabel}>Community Members</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.featuresSection}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Everything you need to stay informed</h2>
            <p className={styles.sectionSubtitle}>
              Stop guessing and start tracking. Get real-time updates and insights from 
              candidates just like you.
            </p>
          </div>
          
          <div className={styles.featuresGrid}>
            <div className={`card ${styles.featureCard}`}>
              <div className={styles.featureIcon}>
                <BarChart3 size={24} />
              </div>
              <h3 className={styles.featureTitle}>Real-time JL Tracking</h3>
              <p className={styles.featureDesc}>
                Track who received JLs, when they received them, and for which specific 
                TCS office locations across the country.
              </p>
            </div>
            
            <div className={`card ${styles.featureCard}`}>
              <div className={styles.featureIcon}>
                <MessageSquare size={24} />
              </div>
              <h3 className={styles.featureTitle}>Community Forums</h3>
              <p className={styles.featureDesc}>
                Discuss with fellow TCS 2026 candidates. Share updates specific to 
                your location and get answers to your queries.
              </p>
            </div>
            
            <div className={`card ${styles.featureCard}`}>
              <div className={styles.featureIcon}>
                <TrendingUp size={24} />
              </div>
              <h3 className={styles.featureTitle}>Trends & Insights</h3>
              <p className={styles.featureDesc}>
                View comprehensive charts and data to spot patterns in JL distribution 
                and predict when your location might get theirs.
              </p>
            </div>
            
            <div className={`card ${styles.featureCard}`}>
              <div className={styles.featureIcon}>
                <FileText size={24} />
              </div>
              <h3 className={styles.featureTitle}>Share Your Timeline</h3>
              <p className={styles.featureDesc}>
                Contribute to the community by submitting your Offer Letter, interview, 
                IPA, and JL details securely.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent JL Entries */}
      <section className={styles.recentSection}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Recent Joining Letters</h2>
            <p className={styles.sectionSubtitle}>
              The latest JL updates from the community.
            </p>
          </div>
          
          {recentJLs.length > 0 ? (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Location</th>
                    <th>JL Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentJLs.map((jl) => (
                    <tr key={jl.id}>
                      <td className="font-semibold">
                        {anonymizeUser(jl.user_id, jl.profiles?.username)}
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <MapPin size={14} className="text-muted" />
                          {jl.work_location || 'Unknown'}
                        </div>
                      </td>
                      <td>{formatDate(jl.jl_date)}</td>
                      <td>
                        <span className="badge badge-success flex items-center gap-2 w-fit">
                          <CheckCircle size={12} /> Received
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className={styles.emptyState}>
              <FileText size={48} className="text-muted mx-auto mb-4 opacity-50" style={{ margin: '0 auto var(--spacing-4)' }} />
              <h3 className="font-semibold mb-2">No entries yet</h3>
              <p className="text-muted">Be the first to share your JL timeline with the community.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container">
        <div className={styles.ctaSection}>
          <h2 className={styles.ctaTitle}>Ready to contribute?</h2>
          <p className={styles.ctaDesc}>
            Join hundreds of other candidates in building the most accurate TCS 2026 JL tracker.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/submit" className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', fontSize: '1rem' }}>
              Submit Your Timeline <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
