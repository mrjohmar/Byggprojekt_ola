'use client'

import { useState } from 'react'
import ImageUpload from '@/components/ImageUpload'
import DrawingCanvas from '@/components/DrawingCanvas'
import ProjectForm from '@/components/ProjectForm'
import ResultView from '@/components/ResultView'

type Step = 1 | 2 | 3 | 4

export interface ProjectData {
  image: string | null
  drawing: { x: number; y: number; width: number; height: number } | null
  description: string
  projectType: string
  dimensions: { width: number; depth: number; height: number }
}

export default function Home() {
  const [step, setStep] = useState<Step>(1)
  const [projectData, setProjectData] = useState<ProjectData>({
    image: null,
    drawing: null,
    description: '',
    projectType: 'utekök',
    dimensions: { width: 3, depth: 1, height: 0.9 }
  })
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const stepLabels = ['Ladda bild', 'Rita område', 'Beskriv', 'Resultat']

  const handleImageUpload = (imageData: string) => {
    setProjectData(prev => ({ ...prev, image: imageData }))
    setStep(2)
  }

  const handleDrawingComplete = (drawing: ProjectData['drawing']) => {
    setProjectData(prev => ({ ...prev, drawing }))
    setStep(3)
  }

  const handleFormSubmit = async (formData: Partial<ProjectData>) => {
    const updatedData = { ...projectData, ...formData }
    setProjectData(updatedData)
    setLoading(true)

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      })
      const data = await res.json()
      setResult(data)
      setStep(4)
    } catch (error) {
      console.error('Fel vid generering:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRegenerate = async (editedImage: string, annotations: string) => {
    setLoading(true)

    try {
      const res = await fetch('/api/regenerate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...projectData,
          editedImage,
          annotations,
          previousImage: result?.generatedImage
        })
      })
      const data = await res.json()
      setResult(data)
    } catch (error) {
      console.error('Fel vid re-generering:', error)
    } finally {
      setLoading(false)
    }
  }

  const goBack = () => {
    if (step > 1) setStep((step - 1) as Step)
  }

  const reset = () => {
    setStep(1)
    setProjectData({
      image: null,
      drawing: null,
      description: '',
      projectType: 'utekök',
      dimensions: { width: 3, depth: 1, height: 0.9 }
    })
    setResult(null)
  }

  return (
    <div className="container">
      <h1>Byggplanerare</h1>

      <div className="steps">
        {stepLabels.map((label, i) => (
          <div
            key={i}
            className={`step ${step === i + 1 ? 'active' : ''} ${step > i + 1 ? 'done' : ''}`}
          >
            {i + 1}. {label}
          </div>
        ))}
      </div>

      <div className="card">
        {step === 1 && (
          <ImageUpload onUpload={handleImageUpload} />
        )}

        {step === 2 && projectData.image && (
          <DrawingCanvas
            image={projectData.image}
            onComplete={handleDrawingComplete}
            onBack={goBack}
          />
        )}

        {step === 3 && !loading && (
          <ProjectForm
            initialData={projectData}
            onSubmit={handleFormSubmit}
            onBack={goBack}
            loading={loading}
          />
        )}

        {loading && (
          <div className="loading">
            <div className="spinner"></div>
            <h2>Genererar ditt {projectData.projectType}...</h2>
            <p>AI:n skapar visualisering och beräknar material</p>
          </div>
        )}

        {step === 4 && result && !loading && (
          <ResultView
            result={result}
            projectData={projectData}
            onReset={reset}
            onBack={goBack}
            onRegenerate={handleRegenerate}
          />
        )}
      </div>
    </div>
  )
}
