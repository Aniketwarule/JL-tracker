import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function HeroSubmitButton() {
  return (
    <Link href="/submit" className="btn btn-primary" style={{ backgroundColor: 'var(--color-primary-600)' }}>
      Submit JL Details <ArrowRight size={18} />
    </Link>
  )
}
