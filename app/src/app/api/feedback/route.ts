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

async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true })
  } catch (e) {
    // Directory exists
  }
}

async function readFeedback(): Promise<FeedbackItem[]> {
  try {
    const data = await fs.readFile(FEEDBACK_FILE, 'utf-8')
    return JSON.parse(data)
  } catch (e) {
    return []
  }
}

async function writeFeedback(items: FeedbackItem[]) {
  await ensureDataDir()
  await fs.writeFile(FEEDBACK_FILE, JSON.stringify(items, null, 2))
}

// GET /api/feedback - List all feedback
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    let items = await readFeedback()

    if (status && status !== 'ALL') {
      items = items.filter(item => item.status === status)
    }

    // Sort by newest first
    items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return NextResponse.json(items)
  } catch (error) {
    console.error('Error fetching feedback:', error)
    return NextResponse.json({ error: 'Kunde inte hämta feedback' }, { status: 500 })
  }
}

// POST /api/feedback - Create new feedback
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, title, description, priority, screenshots, pageUrl } = body as {
      type: 'BUG' | 'FEATURE' | 'IMPROVEMENT'
      title: string
      description: string
      priority: 'LOW' | 'MEDIUM' | 'HIGH'
      screenshots: string[]
      pageUrl: string
    }

    if (!title) {
      return NextResponse.json({ error: 'Titel krävs' }, { status: 400 })
    }

    const items = await readFeedback()

    // Generate case number
    const typePrefix = type === 'BUG' ? 'BUG' : type === 'FEATURE' ? 'FEA' : 'IMP'
    const lastOfType = items
      .filter(i => i.caseNumber.startsWith(typePrefix))
      .sort((a, b) => {
        const aNum = parseInt(a.caseNumber.split('-')[1] || '0')
        const bNum = parseInt(b.caseNumber.split('-')[1] || '0')
        return bNum - aNum
      })[0]

    let nextNumber = 1
    if (lastOfType) {
      const match = lastOfType.caseNumber.match(/-(\d+)$/)
      if (match) {
        nextNumber = parseInt(match[1], 10) + 1
      }
    }

    const caseNumber = `${typePrefix}-${String(nextNumber).padStart(3, '0')}`
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

    const newItem: FeedbackItem = {
      id,
      caseNumber,
      type,
      title,
      description: description || '',
      priority: priority || 'MEDIUM',
      status: 'OPEN',
      screenshots: screenshots || [],
      pageUrl: pageUrl || '',
      createdAt: new Date().toISOString()
    }

    items.push(newItem)
    await writeFeedback(items)

    return NextResponse.json({ id, caseNumber }, { status: 201 })
  } catch (error) {
    console.error('Error creating feedback:', error)
    return NextResponse.json({ error: 'Kunde inte skapa feedback' }, { status: 500 })
  }
}
