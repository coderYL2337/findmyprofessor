import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'reviews.json')
    const fileContents = fs.readFileSync(filePath, 'utf8')
    const reviews = JSON.parse(fileContents)

    console.log('API: Loaded reviews:', reviews); // Add this line for debugging

    return NextResponse.json(reviews)
  } catch (error) {
    console.error('API: Error loading reviews:', error);
    return NextResponse.json({ error: 'Failed to load reviews' }, { status: 500 })
  }
}