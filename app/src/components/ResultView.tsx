'use client'

import { useState } from 'react'
import styles from './ResultView.module.css'
import ImageEditor from './ImageEditor'
import { ProjectData } from '@/app/page'

interface Material {
  name: string
  quantity: number
  unit: string
  price?: number
}

interface BuildStep {
  step: number
  title: string
  description: string
}

interface Result {
  generatedImage?: string
  materials: Material[]
  buildSteps: BuildStep[]
  estimatedCost: number
  buildingPermit: string
  imageProvider?: 'stability' | 'puter' | 'none'
}

interface Props {
  result: Result
  projectData: ProjectData
  onReset: () => void
  onBack: () => void
  onRegenerate?: (editedImage: string, annotations: string) => void
}

export default function ResultView({ result, projectData, onReset, onBack, onRegenerate }: Props) {
  const [imageLoading, setImageLoading] = useState(true)
  const [imageError, setImageError] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const handleSaveEdit = (editedImage: string, annotations: string) => {
    setIsEditing(false)
    if (onRegenerate) {
      onRegenerate(editedImage, annotations)
    }
  }

  const projectLabels: Record<string, string> = {
    'utekök': 'Utekök',
    'altan': 'Altan',
    'förråd': 'Förråd',
    'pergola': 'Pergola',
    'staket': 'Staket',
    'carport': 'Carport',
    'blomlåda': 'Blomlåda',
    'lekstuga': 'Lekstuga',
    'växthus': 'Växthus',
    'övrigt': 'Projekt',
  }

  if (isEditing && result.generatedImage) {
    return (
      <div>
        <ImageEditor
          image={result.generatedImage}
          onSave={handleSaveEdit}
          onCancel={() => setIsEditing(false)}
        />
      </div>
    )
  }

  return (
    <div>
      <h2>Ditt {projectLabels[projectData.projectType] || projectData.projectType}</h2>

      <div className={styles.imageWrapper}>
        {result.generatedImage && !imageError ? (
          <>
            {imageLoading && (
              <div className={styles.imageLoading}>
                <div className={styles.spinner}></div>
                <p>Laddar bild...</p>
              </div>
            )}
            <img
              src={result.generatedImage}
              alt="Genererat förslag"
              onLoad={() => setImageLoading(false)}
              onError={() => {
                setImageLoading(false)
                setImageError(true)
              }}
              style={{ display: imageLoading ? 'none' : 'block' }}
            />
            {!imageLoading && (
              <>
                <span className={styles.provider}>
                  Bild: {result.imageProvider === 'puter' ? 'Puter AI' : 'Stability AI'}
                </span>
                {onRegenerate && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className={styles.editButton}
                  >
                    Redigera
                  </button>
                )}
              </>
            )}
          </>
        ) : (
          <div className={styles.placeholder}>
            <p>{imageError ? 'Kunde inte ladda bild' : 'Ingen bild genererad'}</p>
            <p className={styles.hint}>Materiallista och byggbeskrivning visas nedan</p>
          </div>
        )}
      </div>

      <div className={styles.info}>
        <span>Mått: {projectData.dimensions.width}×{projectData.dimensions.depth}×{projectData.dimensions.height} m</span>
        <span className={styles.permit}>{result.buildingPermit}</span>
      </div>

      <div className={styles.grid}>
        <div className={styles.section}>
          <h3>Byggbeskrivning</h3>
          <ol className={styles.steps}>
            {result.buildSteps.map((step) => (
              <li key={step.step}>
                <strong>{step.title}</strong>
                <p>{step.description}</p>
              </li>
            ))}
          </ol>
        </div>

        <div className={styles.section}>
          <h3>Materiallista</h3>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Material</th>
                <th>Antal</th>
                <th>Ca pris</th>
              </tr>
            </thead>
            <tbody>
              {result.materials.map((m, i) => (
                <tr key={i}>
                  <td>{m.name}</td>
                  <td>{m.quantity} {m.unit}</td>
                  <td>{m.price ? `${m.price} kr` : '-'}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={2}><strong>Totalt material</strong></td>
                <td><strong>~{result.estimatedCost} kr</strong></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div className={styles.actions}>
        <button className="secondary" onClick={onReset}>
          Börja om
        </button>
        <button className="secondary" onClick={onBack}>
          Ändra beskrivning
        </button>
        <button onClick={() => window.print()}>
          Skriv ut / Spara PDF
        </button>
      </div>
    </div>
  )
}
