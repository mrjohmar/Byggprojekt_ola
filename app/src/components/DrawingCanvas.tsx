'use client'

import { useRef, useState, useEffect } from 'react'
import styles from './DrawingCanvas.module.css'

interface DrawingRect {
  x: number
  y: number
  width: number
  height: number
}

interface Props {
  image: string
  onComplete: (drawing: DrawingRect) => void
  onBack: () => void
}

export default function DrawingCanvas({ image, onComplete, onBack }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [startPos, setStartPos] = useState({ x: 0, y: 0 })
  const [currentRect, setCurrentRect] = useState<DrawingRect | null>(null)
  const [imageLoaded, setImageLoaded] = useState(false)
  const imageRef = useRef<HTMLImageElement | null>(null)

  useEffect(() => {
    const img = new Image()
    img.onload = () => {
      imageRef.current = img
      setImageLoaded(true)
      drawCanvas()
    }
    img.src = image
  }, [image])

  useEffect(() => {
    if (imageLoaded) {
      drawCanvas()
    }
  }, [currentRect, imageLoaded])

  const drawCanvas = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    const img = imageRef.current
    if (!canvas || !ctx || !img) return

    // Anpassa canvas till bildens storlek (max 800px bred)
    const maxWidth = 800
    const scale = Math.min(maxWidth / img.width, 1)
    canvas.width = img.width * scale
    canvas.height = img.height * scale

    // Rita bilden
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

    // Rita rektangeln om den finns
    if (currentRect) {
      ctx.strokeStyle = '#22c55e'
      ctx.lineWidth = 3
      ctx.setLineDash([10, 5])
      ctx.strokeRect(currentRect.x, currentRect.y, currentRect.width, currentRect.height)

      // Fyll med transparent grön
      ctx.fillStyle = 'rgba(34, 197, 94, 0.2)'
      ctx.fillRect(currentRect.x, currentRect.y, currentRect.width, currentRect.height)

      // Lägg till text
      ctx.setLineDash([])
      ctx.fillStyle = '#22c55e'
      ctx.font = 'bold 16px sans-serif'
      ctx.fillText('Bygger här', currentRect.x + 10, currentRect.y + 25)
    }
  }

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    }
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePos(e)
    setStartPos(pos)
    setIsDrawing(true)
    setCurrentRect(null)
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    const pos = getMousePos(e)
    setCurrentRect({
      x: Math.min(startPos.x, pos.x),
      y: Math.min(startPos.y, pos.y),
      width: Math.abs(pos.x - startPos.x),
      height: Math.abs(pos.y - startPos.y)
    })
  }

  const handleMouseUp = () => {
    setIsDrawing(false)
  }

  const handleClear = () => {
    setCurrentRect(null)
  }

  const handleConfirm = () => {
    if (currentRect && currentRect.width > 20 && currentRect.height > 20) {
      onComplete(currentRect)
    }
  }

  return (
    <div>
      <h2>Steg 2: Rita var du vill bygga</h2>
      <p className={styles.hint}>Dra en rektangel över området där projektet ska placeras.</p>

      <div className={styles.canvasWrapper}>
        <canvas
          ref={canvasRef}
          className={styles.canvas}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
      </div>

      <div className={styles.toolbar}>
        <button className="secondary" onClick={onBack}>
          Tillbaka
        </button>
        <button className="secondary" onClick={handleClear}>
          Rensa
        </button>
        <button onClick={handleConfirm} disabled={!currentRect}>
          Fortsätt
        </button>
      </div>
    </div>
  )
}
