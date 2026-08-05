'use client'

import { useRef, useState } from 'react'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import CloseIcon from '@mui/icons-material/Close'
import Timeline, { TimelineItem, TimelineItemType } from '@/app/models/timeline'
import { TIMELINE_CENTER_Y, TIMELINE_SNAP_THRESHOLD, applyTimelineSnap } from '@/utils/projectLocalStore'

const INKLING_COLOR = '#1a9b8e'
const SHOT_COLOR = '#d97706'

type Props = {
  timeline: Timeline
  selectedItemId: string | null
  onSelectItem: (id: string | null) => void
  onAddItem: (input: {
    type: TimelineItemType
    x: number
    y: number
    title: string
    body?: string
    shots?: string[]
  }) => void
  onMoveItem: (id: string, x: number, y: number) => void
  onDeleteItem: (id: string) => void
}

export default function TimelineCanvas({
  timeline,
  selectedItemId,
  onSelectItem,
  onAddItem,
  onMoveItem,
  onDeleteItem,
}: Props) {
  const boardRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{ id: string; moved: boolean } | null>(null)

  const [addAnchorEl, setAddAnchorEl] = useState<null | HTMLElement>(null)
  const [createType, setCreateType] = useState<TimelineItemType | null>(null)
  const [draftTitle, setDraftTitle] = useState('')
  const [draftBody, setDraftBody] = useState('')
  const [draftShots, setDraftShots] = useState('')
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [snapHint, setSnapHint] = useState(false)

  const percentFromEvent = (clientX: number, clientY: number) => {
    const rect = boardRef.current?.getBoundingClientRect()
    if (!rect) return { x: 50, y: TIMELINE_CENTER_Y }
    return {
      x: ((clientX - rect.left) / rect.width) * 100,
      y: ((clientY - rect.top) / rect.height) * 100,
    }
  }

  /** Default placement: center of the rail, nudged right if items already sit there. */
  const defaultCreatePos = () => {
    const occupied = timeline.items.filter(i => Math.abs(i.y - TIMELINE_CENTER_Y) < 1).map(i => i.x)
    let x = 50
    while (occupied.some(ox => Math.abs(ox - x) < 4)) {
      x = Math.min(90, x + 6)
    }
    return applyTimelineSnap(x, TIMELINE_CENTER_Y)
  }

  const handleBoardClick = (e: React.MouseEvent) => {
    if (dragRef.current?.moved) return
    if ((e.target as HTMLElement).closest('[data-ping]')) return
    if ((e.target as HTMLElement).closest('[data-add-controls]')) return
    setAddAnchorEl(null)
    onSelectItem(null)
  }

  const openCreate = (type: TimelineItemType) => {
    setAddAnchorEl(null)
    setCreateType(type)
    setDraftTitle('')
    setDraftBody('')
    setDraftShots('')
  }

  const submitCreate = () => {
    if (!createType || !draftTitle.trim()) return
    const placed = defaultCreatePos()
    onAddItem({
      type: createType,
      x: placed.x,
      y: placed.y,
      title: draftTitle.trim(),
      body: draftBody,
      shots: draftShots
        .split('\n')
        .map(s => s.trim())
        .filter(Boolean),
    })
    setCreateType(null)
  }

  const onPingPointerDown = (e: React.PointerEvent, item: TimelineItem) => {
    e.stopPropagation()
    e.preventDefault()
    const target = e.currentTarget as HTMLElement
    target.setPointerCapture(e.pointerId)
    dragRef.current = { id: item.id, moved: false }
    setAddAnchorEl(null)
    onSelectItem(item.id)
    setSnapHint(Math.abs(item.y - TIMELINE_CENTER_Y) <= 0.01)

    const onMove = (ev: PointerEvent) => {
      if (!dragRef.current || dragRef.current.id !== item.id) return
      dragRef.current.moved = true
      const raw = percentFromEvent(ev.clientX, ev.clientY)
      const next = applyTimelineSnap(raw.x, raw.y)
      setSnapHint(next.snapped)
      onMoveItem(item.id, next.x, next.y)
    }

    const onUp = () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      setSnapHint(false)
      requestAnimationFrame(() => {
        dragRef.current = null
      })
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  const labelFor = (title: string, max = 22) => {
    const trimmed = title.trim() || 'Untitled'
    return trimmed.length > max ? `${trimmed.slice(0, max - 1)}…` : trimmed
  }

  return (
    <>
      <Box
        ref={boardRef}
        onClick={handleBoardClick}
        sx={{
          position: 'relative',
          width: '100%',
          height: { xs: 360, md: 440 },
          bgcolor: '#9597a1',
          borderRadius: 3,
          overflow: 'hidden',
          cursor: 'default',
          userSelect: 'none',
          boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.12)',
        }}
      >
        <Box data-add-controls sx={{ position: 'absolute', top: 12, left: 12, zIndex: 8 }}>
          <IconButton
            aria-label="Add timeline item"
            aria-haspopup="menu"
            aria-expanded={Boolean(addAnchorEl)}
            onClick={e => {
              e.stopPropagation()
              setAddAnchorEl(e.currentTarget)
            }}
            sx={{
              bgcolor: 'primary.main',
              color: '#fff',
              width: 44,
              height: 44,
              boxShadow: 3,
              '&:hover': { bgcolor: 'primary.dark' },
            }}
          >
            <AddIcon />
          </IconButton>
          <Menu
            anchorEl={addAnchorEl}
            open={Boolean(addAnchorEl)}
            onClose={() => setAddAnchorEl(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            transformOrigin={{ vertical: 'top', horizontal: 'left' }}
          >
            <MenuItem onClick={() => openCreate('inkling')}>Add Inkling</MenuItem>
            <MenuItem onClick={() => openCreate('shot')}>Add Shot</MenuItem>
          </Menu>
        </Box>

        {/* Axis rail — brightens while a ping is magnetically snapped */}
        <Box
          sx={{
            position: 'absolute',
            left: '10%',
            right: '10%',
            top: `${TIMELINE_CENTER_Y}%`,
            height: snapHint ? 14 : 10,
            bgcolor: snapHint ? '#102BEF' : '#575962',
            borderRadius: 2,
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
            boxShadow: snapHint ? '0 0 0 4px rgba(16,43,239,0.25)' : 'none',
            transition: 'height 120ms ease, background-color 120ms ease, box-shadow 120ms ease',
          }}
        />
        {snapHint && (
          <Box
            sx={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: `${TIMELINE_CENTER_Y - TIMELINE_SNAP_THRESHOLD}%`,
              height: `${TIMELINE_SNAP_THRESHOLD * 2}%`,
              bgcolor: 'rgba(16,43,239,0.08)',
              pointerEvents: 'none',
            }}
          />
        )}

        {timeline.items.map(item => {
          const color = item.type === 'inkling' ? INKLING_COLOR : SHOT_COLOR
          const expanded = selectedItemId === item.id
          const hovered = hoveredId === item.id
          return (
            <Box
              key={item.id}
              data-ping
              onPointerDown={e => onPingPointerDown(e, item)}
              onMouseEnter={() => setHoveredId(item.id)}
              onMouseLeave={() => setHoveredId(null)}
              sx={{
                position: 'absolute',
                left: `${item.x}%`,
                top: `${item.y}%`,
                transform: `translate(-50%, -50%) scale(${expanded ? 1.06 : hovered ? 1.03 : 1})`,
                zIndex: expanded ? 5 : hovered ? 3 : 2,
                cursor: 'grab',
                touchAction: 'none',
                transition: 'transform 140ms ease',
              }}
            >
              <Box
                sx={{
                  minWidth: 96,
                  maxWidth: expanded ? 200 : 148,
                  px: 1.25,
                  py: 0.75,
                  borderRadius: 2,
                  bgcolor: color,
                  border: expanded ? '2px solid #fff' : '1px solid rgba(255,255,255,0.55)',
                  boxShadow: expanded ? '0 10px 24px rgba(0,0,0,0.35)' : '0 3px 10px rgba(0,0,0,0.22)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0.25,
                  transition: 'max-width 140ms ease, box-shadow 140ms ease',
                }}
              >
                <Typography
                  sx={{
                    fontSize: 9,
                    fontWeight: 800,
                    letterSpacing: 0.6,
                    textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.85)',
                    lineHeight: 1,
                    pointerEvents: 'none',
                  }}
                >
                  {item.type}
                </Typography>
                <Typography
                  title={item.title}
                  sx={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: '#fff',
                    lineHeight: 1.2,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    pointerEvents: 'none',
                  }}
                >
                  {labelFor(item.title, expanded ? 28 : 18)}
                </Typography>
              </Box>

              {expanded && (
                <Box
                  onPointerDown={e => e.stopPropagation()}
                  onClick={e => e.stopPropagation()}
                  sx={{
                    position: 'absolute',
                    top: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    mt: 1,
                    width: 260,
                    bgcolor: '#3f4148',
                    color: '#fff',
                    borderRadius: 2,
                    p: 1.5,
                    boxShadow: 6,
                    cursor: 'default',
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, pr: 1 }}>
                      {item.title}
                    </Typography>
                    <IconButton size="small" onClick={() => onSelectItem(null)} sx={{ color: '#fff' }}>
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                  <Typography variant="caption" sx={{ color: color, fontWeight: 700, textTransform: 'uppercase' }}>
                    {item.type}
                  </Typography>
                  {item.type === 'inkling' ? (
                    <Typography variant="body2" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>
                      {item.body || 'No body yet.'}
                    </Typography>
                  ) : (
                    <Box component="ol" sx={{ mt: 1, pl: 2, m: 0 }}>
                      {item.shots.length === 0 && (
                        <Typography variant="body2" component="li">
                          No shots yet.
                        </Typography>
                      )}
                      {item.shots.map(s => (
                        <Typography key={s.id} variant="body2" component="li">
                          {s.text}
                        </Typography>
                      ))}
                    </Box>
                  )}
                  <Button
                    size="small"
                    color="secondary"
                    variant="contained"
                    sx={{ mt: 1 }}
                    onClick={() => onDeleteItem(item.id)}
                  >
                    Delete
                  </Button>
                </Box>
              )}
            </Box>
          )
        })}
      </Box>

      <Dialog open={Boolean(createType)} onClose={() => setCreateType(null)} fullWidth maxWidth="sm">
        <DialogTitle>New {createType === 'shot' ? 'Shot' : 'Inkling'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            margin="dense"
            label="Title"
            value={draftTitle}
            onChange={e => setDraftTitle(e.target.value)}
          />
          {createType === 'inkling' ? (
            <TextField
              fullWidth
              margin="dense"
              label="Body"
              multiline
              rows={4}
              value={draftBody}
              onChange={e => setDraftBody(e.target.value)}
            />
          ) : (
            <TextField
              fullWidth
              margin="dense"
              label="Shots (one per line, in order)"
              multiline
              rows={5}
              value={draftShots}
              onChange={e => setDraftShots(e.target.value)}
              helperText="Each line becomes an ordered shot idea."
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={() => setCreateType(null)}>
            Cancel
          </Button>
          <Button variant="contained" disabled={!draftTitle.trim()} onClick={submitCreate}>
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export { INKLING_COLOR, SHOT_COLOR }
