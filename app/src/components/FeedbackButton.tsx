'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import styles from './FeedbackButton.module.css'

interface Screenshot {
  id: string
  fileName: string
  dataUrl: string
}

interface FeedbackData {
  id: string
  caseNumber: string
  type: 'BUG' | 'FEATURE' | 'IMPROVEMENT'
  title: string
  description: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
  screenshots: string[]
  createdAt: string
  pageUrl: string
}

export default function FeedbackButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [type, setType] = useState<'BUG' | 'FEATURE' | 'IMPROVEMENT'>('BUG')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM')
  const [screenshots, setScreenshots] = useState<Screenshot[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState<{ caseNumber: string; id: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)

  const generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

  const handleClose = () => {
    setIsOpen(false)
    setTitle('')
    setDescription('')
    setType('BUG')
    setPriority('MEDIUM')
    setScreenshots([])
    setSubmitted(null)
  }

  const addFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter(f =>
      ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(f.type)
    )
    const remaining = 3 - screenshots.length
    const toProcess = fileArray.slice(0, remaining)

    if (toProcess.length === 0) return

    const newScreenshots = await Promise.all(
      toProcess.map(file => new Promise<Screenshot>((resolve) => {
        const reader = new FileReader()
        reader.onload = () => {
          resolve({
            id: generateId(),
            fileName: file.name,
            dataUrl: reader.result as string
          })
        }
        reader.readAsDataURL(file)
      }))
    )

    setScreenshots(prev => [...prev, ...newScreenshots])
  }, [screenshots.length])

  const removeScreenshot = (id: string) => {
    setScreenshots(prev => prev.filter(s => s.id !== id))
  }

  // Handle paste from clipboard
  useEffect(() => {
    if (!isOpen) return

    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items
      if (!items) return

      const imageFiles: File[] = []
      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile()
          if (file) imageFiles.push(file)
        }
      }

      if (imageFiles.length > 0) {
        e.preventDefault()
        addFiles(imageFiles)
      }
    }

    document.addEventListener('paste', handlePaste)
    return () => document.removeEventListener('paste', handlePaste)
  }, [isOpen, addFiles])

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          title,
          description,
          priority: type === 'BUG' ? priority : 'MEDIUM',
          screenshots: screenshots.map(s => s.dataUrl),
          pageUrl: window.location.href
        })
      })

      if (res.ok) {
        const data = await res.json()
        setSubmitted({ caseNumber: data.caseNumber, id: data.id })
      }
    } catch (error) {
      console.error('Failed to submit feedback:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const typeConfig = {
    BUG: { label: 'Bugg', color: styles.typeBug },
    FEATURE: { label: 'Funktion', color: styles.typeFeature },
    IMPROVEMENT: { label: 'Förbättring', color: styles.typeImprovement }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={styles.floatingButton}
        title="Rapportera bugg eller ge feedback"
      >
        🐛
      </button>

      {isOpen && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <div className={styles.header}>
              <h2>{submitted ? 'Tack!' : 'Rapportera bugg eller feedback'}</h2>
              <button onClick={handleClose} className={styles.closeButton}>✕</button>
            </div>

            {submitted ? (
              <div className={styles.success}>
                <div className={styles.successIcon}>✓</div>
                <p>Tack för din feedback!</p>
                <p className={styles.caseLabel}>Ditt ärendenummer:</p>
                <p className={styles.caseNumber}>{submitted.caseNumber}</p>
                <div className={styles.successActions}>
                  <a href={`/feedback/${submitted.id}`} className={styles.viewLink}>
                    Visa ärende
                  </a>
                  <button onClick={handleClose} className={styles.closeLink}>
                    Stäng
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className={styles.form}>
                {/* Type */}
                <div className={styles.field}>
                  <label>Typ</label>
                  <div className={styles.typeButtons}>
                    {(['BUG', 'FEATURE', 'IMPROVEMENT'] as const).map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setType(t)}
                        className={`${styles.typeButton} ${type === t ? typeConfig[t].color : ''}`}
                      >
                        {typeConfig[t].label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Title */}
                <div className={styles.field}>
                  <label>Rubrik</label>
                  <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    required
                    placeholder="Kort beskrivning av problemet"
                  />
                </div>

                {/* Description */}
                <div className={styles.field}>
                  <label>Beskrivning</label>
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    rows={4}
                    placeholder="Beskriv vad som hände och hur man kan återskapa problemet"
                  />
                </div>

                {/* Priority (only for bugs) */}
                {type === 'BUG' && (
                  <div className={styles.field}>
                    <label>Prioritet</label>
                    <div className={styles.priorityButtons}>
                      {(['LOW', 'MEDIUM', 'HIGH'] as const).map(p => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setPriority(p)}
                          className={`${styles.priorityButton} ${priority === p ? styles.priorityActive : ''}`}
                        >
                          {p === 'LOW' ? 'Låg' : p === 'MEDIUM' ? 'Medium' : 'Hög'}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Screenshots */}
                <div className={styles.field}>
                  <label>Skärmdumpar (max 3)</label>
                  {screenshots.length < 3 && (
                    <div
                      className={`${styles.dropzone} ${dragOver ? styles.dropzoneActive : ''}`}
                      onDrop={handleDrop}
                      onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                      onDragLeave={() => setDragOver(false)}
                    >
                      <p>Dra och släpp bilder här, eller</p>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className={styles.selectButton}
                      >
                        Välj filer
                      </button>
                      <p className={styles.pasteHint}>Ctrl+V för att klistra in</p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".jpg,.jpeg,.png,.gif,.webp"
                        multiple
                        hidden
                        onChange={e => {
                          if (e.target.files) {
                            addFiles(e.target.files)
                            e.target.value = ''
                          }
                        }}
                      />
                    </div>
                  )}

                  {screenshots.length > 0 && (
                    <div className={styles.thumbnails}>
                      {screenshots.map(s => (
                        <div key={s.id} className={styles.thumbnail}>
                          <img src={s.dataUrl} alt={s.fileName} />
                          <button
                            type="button"
                            onClick={() => removeScreenshot(s.id)}
                            className={styles.removeButton}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting || !title}
                  className={styles.submitButton}
                >
                  {isSubmitting ? 'Skickar...' : 'Skicka feedback'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
