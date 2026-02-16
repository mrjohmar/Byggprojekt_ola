import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

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

const DATA_DIR = path.join(process.cwd(), 'data')
const FEEDBACK_FILE = path.join(DATA_DIR, 'feedback.json')

async function readFeedback(): Promise<FeedbackItem[]> {
  try {
    const data = await fs.readFile(FEEDBACK_FILE, 'utf-8')
    return JSON.parse(data)
  } catch (e) {
    return []
  }
}

async function writeFeedback(items: FeedbackItem[]) {
  await fs.writeFile(FEEDBACK_FILE, JSON.stringify(items, null, 2))
}

// GET /api/feedback/[id] - Get single feedback item
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const items = await readFeedback()
    const item = items.find(i => i.id === id)

    if (!item) {
      return NextResponse.json({ error: 'Ärende hittades inte' }, { status: 404 })
    }

    return NextResponse.json(item)
  } catch (error) {
    console.error('Error fetching feedback:', error)
    return NextResponse.json({ error: 'Kunde inte hämta ärende' }, { status: 500 })
  }
}

// PATCH /api/feedback/[id] - Update feedback status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status } = body as { status: FeedbackItem['status'] }

    const items = await readFeedback()
    const index = items.findIndex(i => i.id === id)

    if (index === -1) {
      return NextResponse.json({ error: 'Ärende hittades inte' }, { status: 404 })
    }

    if (status) {
      items[index].status = status
    }

    await writeFeedback(items)

    return NextResponse.json(items[index])
  } catch (error) {
    console.error('Error updating feedback:', error)
    return NextResponse.json({ error: 'Kunde inte uppdatera ärende' }, { status: 500 })
  }
}

// DELETE /api/feedback/[id] - Delete feedback
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const items = await readFeedback()
    const filtered = items.filter(i => i.id !== id)

    if (filtered.length === items.length) {
      return NextResponse.json({ error: 'Ärende hittades inte' }, { status: 404 })
    }

    await writeFeedback(filtered)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting feedback:', error)
    return NextResponse.json({ error: 'Kunde inte ta bort ärende' }, { status: 500 })
  }
}
