'use client'

import { useCallback } from 'react'
import styles from './ImageUpload.module.css'

interface Props {
  onUpload: (imageData: string) => void
}

export default function ImageUpload({ onUpload }: Props) {
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      processFile(file)
    }
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      processFile(file)
    }
  }

  const processFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      onUpload(result)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div>
      <h2>Steg 1: Ladda upp bild på platsen</h2>
      <p className={styles.hint}>Ta ett foto där du vill bygga, eller ladda upp en befintlig bild.</p>

      <div
        className={styles.dropzone}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        <div className={styles.icon}>📷</div>
        <p>Dra och släpp bild här</p>
        <p className={styles.or}>eller</p>
        <label className={styles.fileButton}>
          Välj fil
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            hidden
          />
        </label>
      </div>
    </div>
  )
}
