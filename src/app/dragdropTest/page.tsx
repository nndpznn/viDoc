'use client'

// Disclaimer: The drag-drop prototype in place as of 9/29 is entirely based off a result from ChatGPT. I, of course, plan to build off of it.

import { useRouter } from 'next/navigation'
import theme from '../theme/allTheme'
import { Container, ThemeProvider, Typography, Button } from '@mui/material'
import React, { useState } from 'react'

export default function DragDropTest() {
  const router = useRouter()

  const [dragItem, setDragItem] = useState<string | null>(null)
  const [dropZone1, setDropZone1] = useState<string | null>(null)
  const [dropZone2, setDropZone2] = useState<string | null>(null)

  const handleDragStart = (event: React.DragEvent<HTMLDivElement>, item: string) => {
    setDragItem(item)
    event.dataTransfer.effectAllowed = 'move'
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>, dropZone: string) => {
    event.preventDefault()
    if (dropZone === 'zone1') {
      setDropZone1(dragItem)
    } else {
      setDropZone2(dragItem)
    }
    setDragItem(null)
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }

  return (
    <Container>
      <ThemeProvider theme={theme}>
        <Button
          variant="contained"
          size="medium"
          color="primary"
          sx={{ mt: 2 }}
          onClick={() => router.push('/dashboard')}
        >
          Back
        </Button>

        <Typography variant="h2" sx={{ textAlign: 'center' }}>
          Drag and Drop Test Page
        </Typography>

        <div style={{ display: 'flex', justifyContent: 'space-around' }}>
          <div
            draggable
            onDragStart={event => handleDragStart(event, 'Item 1')}
            style={{
              width: '100px',
              height: '100px',
              backgroundColor: '#102BEF',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            Drag Me
          </div>

          {/* Drop Zone 1 */}
          <div
            onDrop={event => handleDrop(event, 'zone1')}
            onDragOver={handleDragOver}
            style={{
              width: '150px',
              height: '150px',
              border: '2px dashed gray',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {dropZone1 ? dropZone1 : 'Drop Here Zone 1'}
          </div>

          {/* Drop Zone 2 */}
          <div
            onDrop={event => handleDrop(event, 'zone2')}
            onDragOver={handleDragOver}
            style={{
              width: '150px',
              height: '150px',
              border: '2px dashed gray',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {dropZone2 ? dropZone2 : 'Drop Here Zone 2'}
          </div>
        </div>
      </ThemeProvider>
    </Container>
  )
}
