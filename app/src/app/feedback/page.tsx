'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import styles from './feedback.module.css'

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

export default function FeedbackListPage() {
  const [items, setItems] = useState<FeedbackItem[]>([])
  const [filter, setFilter] = useState('ALL')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFeedback()
  }, [filter])

  const fetchFeedback = async () => {
    try {
      const res = await fetch(`/api/feedback?status=${filter}`)
      if (res.ok) {
        const data = await res.json()
        setItems(data)
      }
    } catch (error) {
      console.error('Error fetching feedback:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/feedback/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      if (res.ok) {
        fetchFeedback()
      }
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('sv-SE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const openCount = items.filter(i => i.status === 'OPEN').length
  const inProgressCount = items.filter(i => i.status === 'IN_PROGRESS').length

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>Feedback & Buggar</h1>
          <p className={styles.subtitle}>
            {openCount} öppna, {inProgressCount} pågående
          </p>
        </div>
        <Link href="/" className={styles.backLink}>
          ← Tillbaka till appen
        </Link>
      </div>

      <div className={styles.filters}>
        {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`${styles.filterButton} ${filter === status ? styles.filterActive : ''}`}
          >
            {status === 'ALL' ? 'Alla' : STATUS_LABELS[status]?.label || status}
          </button>
        ))}
      </div>

      {loading ? (
        <div className={styles.loading}>Laddar...</div>
      ) : items.length === 0 ? (
        <div className={styles.empty}>
          <p>Inga ärenden hittades</p>
        </div>
      ) : (
        <div className={styles.list}>
          {items.map(item => (
            <div key={item.id} className={styles.card}>
              <div className={styles.cardHeader}>
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

              <Link href={`/feedback/${item.id}`} className={styles.cardTitle}>
                {item.title}
              </Link>

              {item.description && (
                <p className={styles.cardDescription}>
                  {item.description.substring(0, 150)}
                  {item.description.length > 150 ? '...' : ''}
                </p>
              )}

              <div className={styles.cardFooter}>
                <span className={styles.date}>{formatDate(item.createdAt)}</span>
                {item.screenshots.length > 0 && (
                  <span className={styles.screenshots}>
                    📷 {item.screenshots.length} bild{item.screenshots.length > 1 ? 'er' : ''}
                  </span>
                )}

                <select
                  value={item.status}
                  onChange={e => updateStatus(item.id, e.target.value)}
                  className={styles.statusSelect}
                >
                  <option value="OPEN">Öppen</option>
                  <option value="IN_PROGRESS">Pågående</option>
                  <option value="RESOLVED">Löst</option>
                  <option value="CLOSED">Stängd</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
