'use client'

import { useState } from 'react'
import styles from './ProjectForm.module.css'
import { ProjectData } from '@/app/page'

interface Props {
  initialData: ProjectData
  onSubmit: (data: Partial<ProjectData>) => void
  onBack: () => void
  loading: boolean
}

const projectTypes = [
  { value: 'utekök', label: 'Utekök' },
  { value: 'altan', label: 'Altan / Trädäck' },
  { value: 'förråd', label: 'Förråd' },
  { value: 'pergola', label: 'Pergola' },
  { value: 'staket', label: 'Staket' },
  { value: 'carport', label: 'Carport' },
  { value: 'blomlåda', label: 'Blomlåda / Odlingslåda' },
  { value: 'lekstuga', label: 'Lekstuga' },
  { value: 'växthus', label: 'Växthus' },
  { value: 'övrigt', label: 'Övrigt (beskriv nedan)' },
]

export default function ProjectForm({ initialData, onSubmit, onBack, loading }: Props) {
  const [description, setDescription] = useState(initialData.description)
  const [projectType, setProjectType] = useState(initialData.projectType)
  const [dimensions, setDimensions] = useState(initialData.dimensions)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({ description, projectType, dimensions })
  }

  return (
    <div>
      <h2>Steg 3: Beskriv ditt projekt</h2>

      <form onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label>Projekttyp</label>
          <div className={styles.chips}>
            {projectTypes.map(type => (
              <button
                key={type.value}
                type="button"
                className={`${styles.chip} ${projectType === type.value ? styles.active : ''}`}
                onClick={() => setProjectType(type.value)}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.field}>
          <label>Beskriv vad du vill ha</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="T.ex: Utekök med inbyggd gasgrill, diskho, och arbetsbänk i rostfritt"
            rows={3}
          />
        </div>

        <div className={styles.field}>
          <label>Mått (meter)</label>
          <div className={styles.dimensions}>
            <div>
              <span>Bredd</span>
              <input
                type="number"
                step="0.1"
                min="0.5"
                max="20"
                value={dimensions.width}
                onChange={(e) => setDimensions(d => ({ ...d, width: parseFloat(e.target.value) || 0 }))}
              />
            </div>
            <div>
              <span>Djup</span>
              <input
                type="number"
                step="0.1"
                min="0.5"
                max="20"
                value={dimensions.depth}
                onChange={(e) => setDimensions(d => ({ ...d, depth: parseFloat(e.target.value) || 0 }))}
              />
            </div>
            <div>
              <span>Höjd</span>
              <input
                type="number"
                step="0.1"
                min="0.5"
                max="5"
                value={dimensions.height}
                onChange={(e) => setDimensions(d => ({ ...d, height: parseFloat(e.target.value) || 0 }))}
              />
            </div>
          </div>
        </div>

        <div className={styles.toolbar}>
          <button type="button" className="secondary" onClick={onBack}>
            Tillbaka
          </button>
          <button type="submit" disabled={loading}>
            {loading ? 'Genererar...' : 'Generera förslag'}
          </button>
        </div>
      </form>
    </div>
  )
}
