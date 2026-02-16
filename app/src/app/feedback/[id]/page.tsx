'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import styles from '../feedback.module.css'

interface FeedbackItem {
  id: string
  caseNumber: string
  type: 'BUG' | 'FEATURE' | 'IMPROVEMENT'
  title: string
  description: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
  screenshots: string[]
  pageUrl: string
  createdAt: string
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  OPEN: { label: 'Öppen', color: '#3b82f6' },
  IN_PROGRESS: { label: 'Pågående', color: '#f59e0b' },
  RESOLVED: { label: 'Löst', color: '#22c55e' },
  CLOSED: { label: 'Stängd', color: '#6b7280' }
}

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  BUG: { label: 'Bugg', color: '#ef4444' },
  FEATURE: { label: 'Funktion', color: '#3b82f6' },
  IMPROVEMENT: { label: 'Förbättring', color: '#22c55e' }
}

const PRIORITY_LABELS: Record<string, string> = {
  LOW: 'Låg',
  MEDIUM: 'Medium',
  HIGH: 'Hög'
}

export default function FeedbackDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [item, setItem] = useState<FeedbackItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  useEffect(() => {
    fetchItem()
  }, [params.id])

  const fetchItem = async () => {
    try {
      const res = await fetch(`/api/feedback/${params.id}`)
      if (res.ok) {
        const data = await res.json()
        setItem(data)
      }
    } catch (error) {
      console.error('Error fetching feedback:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (status: string) => {
    try {
      const res = await fetch(`/api/feedback/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      if (res.ok) {
        fetchItem()
      }
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Är du säker på att du vill ta bort detta ärende?')) return

    try {
      const res = await fetch(`/api/feedback/${params.id}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        router.push('/feedback')
      }
    } catch (error) {
      console.error('Error deleting feedback:', error)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('sv-SE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Laddar...</div>
      </div>
    )
  }

  if (!item) {
    return (
      <div className={styles.container}>
        <div className={styles.empty}>
          <p>Ärende hittades inte</p>
          <Link href="/feedback" className={styles.backLink}>
            ← Tillbaka till listan
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <Link href="/feedback" className={styles.backLink}>
        ← Tillbaka till listan
      </Link>

      <div className={styles.detailHeader}>
        <div className={styles.detailMeta}>
          <span className={styles.caseNumber}>{item.caseNumber}</span>
          <span
            className={styles.typeBadge}
            style={{ background: TYPE_LABELS[item.type]?.color }}
          >
            {TYPE_LABELS[item.type]?.label}
          </span>
          <span
            className={styles.statusBadge}
            style={{ background: STATUS_LABELS[item.status]?.color }}
          >
            {STATUS_LABELS[item.status]?.label}
          </span>
        </div>

        <h1 className={styles.detailTitle}>{item.title}</h1>

        {item.description && (
          <p className={styles.detailDescription}>{item.description}</p>
        )}
      </div>

      <div className={styles.detailInfo}>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>Skapad</span>
          <span className={styles.infoValue}>{formatDate(item.createdAt)}</span>
        </div>
        {item.type === 'BUG' && (
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Prioritet</span>
            <span className={styles.infoValue}>{PRIORITY_LABELS[item.priority]}</span>
          </div>
        )}
        {item.pageUrl && (
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Sida</span>
            <span className={styles.infoValue}>{item.pageUrl}</span>
          </div>
        )}
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>Status</span>
          <select
            value={item.status}
            onChange={e => updateStatus(e.target.value)}
            className={styles.statusSelect}
          >
            <option value="OPEN">Öppen</option>
            <option value="IN_PROGRESS">Pågående</option>
            <option value="RESOLVED">Löst</option>
            <option value="CLOSED">Stängd</option>
          </select>
        </div>
      </div>

      {item.screenshots.length > 0 && (
        <div className={styles.screenshotsSection}>
          <h3>Bilder ({item.screenshots.length})</h3>
          <div className={styles.screenshotGrid}>
            {item.screenshots.map((src, index) => (
              <div
                key={index}
                className={styles.screenshotItem}
                onClick={() => setSelectedImage(src)}
              >
                <img src={src} alt={`Screenshot ${index + 1}`} />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={styles.actions}>
        <button onClick={handleDelete} className={styles.deleteButton}>
          Ta bort ärende
        </button>
      </div>

      {selectedImage && (
        <div
          className={styles.overlay}
          onClick={() => setSelectedImage(null)}
          style={{ cursor: 'zoom-out' }}
        >
          <img
            src={selectedImage}
            alt="Fullsize"
            style={{
              maxWidth: '90%',
              maxHeight: '90%',
              objectFit: 'contain',
              borderRadius: '8px'
            }}
          />
        </div>
      )}
    </div>
  )
}
