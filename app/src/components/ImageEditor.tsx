'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import styles from './ImageEditor.module.css'

type Tool = 'pen' | 'text' | 'arrow' | 'eraser'

interface TextAnnotation {
  id: string
  x: number
  y: number
  text: string
  color: string
}

interface Props {
  image: string
  onSave: (editedImage: string, annotations: string) => void
  onCancel: () => void
}

export default function ImageEditor({ image, onSave, onCancel }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null)
  const [tool, setTool] = useState<Tool>('pen')
  const [color, setColor] = useState('#ef4444')
  const [lineWidth, setLineWidth] = useState(4)
  const [isDrawing, setIsDrawing] = useState(false)
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 })
  const [textAnnotations, setTextAnnotations] = useState<TextAnnotation[]>([])
  const [editingText, setEditingText] = useState<{ x: number; y: number } | null>(null)
  const [textInput, setTextInput] = useState('')
  const imageRef = useRef<HTMLImageElement | null>(null)
  const drawingHistoryRef = useRef<ImageData[]>([])

  const colors = [
    '#ef4444', // red
    '#f97316', // orange
    '#eab308', // yellow
    '#22c55e', // green
    '#3b82f6', // blue
    '#8b5cf6', // purple
    '#000000', // black
    '#ffffff', // white
  ]

  useEffect(() => {
    const img = new Image()
    img.onload = () => {
      imageRef.current = img
      initCanvas()
    }
    img.src = image
  }, [image])

  const initCanvas = () => {
    const canvas = canvasRef.current
    const overlay = overlayCanvasRef.current
    const img = imageRef.current
    if (!canvas || !overlay || !img) return

    const maxWidth = Math.min(800, window.innerWidth - 40)
    const scale = Math.min(maxWidth / img.width, 1)

    canvas.width = img.width * scale
    canvas.height = img.height * scale
    overlay.width = canvas.width
    overlay.height = canvas.height

    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      saveState()
    }
  }

  const saveState = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    drawingHistoryRef.current.push(imageData)
    if (drawingHistoryRef.current.length > 20) {
      drawingHistoryRef.current.shift()
    }
  }

  const undo = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx || drawingHistoryRef.current.length <= 1) return

    drawingHistoryRef.current.pop()
    const prevState = drawingHistoryRef.current[drawingHistoryRef.current.length - 1]
    if (prevState) {
      ctx.putImageData(prevState, 0, 0)
    }
  }

  const getPos = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    if ('touches' in e) {
      const touch = e.touches[0] || e.changedTouches[0]
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY
      }
    }

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    }
  }

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if ('touches' in e) e.preventDefault()

    if (tool === 'text') {
      const pos = getPos(e)
      setEditingText(pos)
      setTextInput('')
      return
    }

    setIsDrawing(true)
    setLastPos(getPos(e))
  }

  const draw = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if ('touches' in e) e.preventDefault()
    if (!isDrawing || tool === 'text') return

    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const pos = getPos(e)

    ctx.beginPath()
    ctx.moveTo(lastPos.x, lastPos.y)
    ctx.lineTo(pos.x, pos.y)
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out'
      ctx.lineWidth = lineWidth * 4
    } else {
      ctx.globalCompositeOperation = 'source-over'
      ctx.strokeStyle = color
      ctx.lineWidth = lineWidth
    }

    ctx.stroke()
    setLastPos(pos)
  }, [isDrawing, lastPos, color, lineWidth, tool])

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false)
      saveState()
    }
  }

  const addTextAnnotation = () => {
    if (!editingText || !textInput.trim()) {
      setEditingText(null)
      return
    }

    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    ctx.font = 'bold 18px sans-serif'
    ctx.fillStyle = color
    ctx.strokeStyle = color === '#ffffff' ? '#000000' : '#ffffff'
    ctx.lineWidth = 3
    ctx.strokeText(textInput, editingText.x, editingText.y)
    ctx.fillText(textInput, editingText.x, editingText.y)

    setTextAnnotations(prev => [...prev, {
      id: Date.now().toString(),
      x: editingText.x,
      y: editingText.y,
      text: textInput,
      color
    }])

    setEditingText(null)
    setTextInput('')
    saveState()
  }

  const drawArrow = (startX: number, startY: number, endX: number, endY: number) => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!ctx) return

    const headLength = 15
    const angle = Math.atan2(endY - startY, endX - startX)

    ctx.beginPath()
    ctx.moveTo(startX, startY)
    ctx.lineTo(endX, endY)
    ctx.strokeStyle = color
    ctx.lineWidth = lineWidth
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(endX, endY)
    ctx.lineTo(
      endX - headLength * Math.cos(angle - Math.PI / 6),
      endY - headLength * Math.sin(angle - Math.PI / 6)
    )
    ctx.moveTo(endX, endY)
    ctx.lineTo(
      endX - headLength * Math.cos(angle + Math.PI / 6),
      endY - headLength * Math.sin(angle + Math.PI / 6)
    )
    ctx.stroke()
  }

  const handleSave = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const dataUrl = canvas.toDataURL('image/png')
    const annotationText = textAnnotations.map(a => a.text).join(', ')
    onSave(dataUrl, annotationText)
  }

  const clearDrawings = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    const img = imageRef.current
    if (!canvas || !ctx || !img) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    setTextAnnotations([])
    drawingHistoryRef.current = []
    saveState()
  }

  return (
    <div className={styles.editor}>
      <div className={styles.header}>
        <h3>Redigera bilden</h3>
        <p>Rita, skriv och markera vad du vill ändra</p>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.tools}>
          <button
            className={`${styles.toolButton} ${tool === 'pen' ? styles.active : ''}`}
            onClick={() => setTool('pen')}
            title="Penna"
          >
            ✏️
          </button>
          <button
            className={`${styles.toolButton} ${tool === 'text' ? styles.active : ''}`}
            onClick={() => setTool('text')}
            title="Text"
          >
            T
          </button>
          <button
            className={`${styles.toolButton} ${tool === 'eraser' ? styles.active : ''}`}
            onClick={() => setTool('eraser')}
            title="Suddgummi"
          >
            🧹
          </button>
        </div>

        <div className={styles.colors}>
          {colors.map(c => (
            <button
              key={c}
              className={`${styles.colorButton} ${color === c ? styles.activeColor : ''}`}
              style={{ background: c, border: c === '#ffffff' ? '1px solid #ccc' : 'none' }}
              onClick={() => setColor(c)}
            />
          ))}
        </div>

        <div className={styles.lineWidths}>
          {[2, 4, 8].map(w => (
            <button
              key={w}
              className={`${styles.widthButton} ${lineWidth === w ? styles.active : ''}`}
              onClick={() => setLineWidth(w)}
            >
              <span style={{ width: w * 2, height: w * 2, background: '#1e293b', borderRadius: '50%' }} />
            </button>
          ))}
        </div>

        <div className={styles.actions}>
          <button onClick={undo} className={styles.actionButton} title="Ångra">
            ↩
          </button>
          <button onClick={clearDrawings} className={styles.actionButton} title="Rensa">
            🗑️
          </button>
        </div>
      </div>

      <div className={styles.canvasContainer}>
        <canvas
          ref={canvasRef}
          className={styles.canvas}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
        <canvas
          ref={overlayCanvasRef}
          className={styles.overlayCanvas}
          style={{ pointerEvents: 'none' }}
        />

        {editingText && (
          <div
            className={styles.textInput}
            style={{
              left: editingText.x,
              top: editingText.y
            }}
          >
            <input
              type="text"
              value={textInput}
              onChange={e => setTextInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') addTextAnnotation()
                if (e.key === 'Escape') setEditingText(null)
              }}
              onBlur={addTextAnnotation}
              placeholder="Skriv text..."
              autoFocus
            />
          </div>
        )}
      </div>

      <div className={styles.footer}>
        <button onClick={onCancel} className="secondary">
          Avbryt
        </button>
        <button onClick={handleSave}>
          Skapa nytt förslag
        </button>
      </div>
    </div>
  )
}
