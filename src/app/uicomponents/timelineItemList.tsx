'use client'

import {
  Box,
  Button,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import AddIcon from '@mui/icons-material/Add'
import { TimelineItem } from '@/app/models/timeline'
import ShotLine from '@/app/models/shot'
import { INKLING_COLOR, SHOT_COLOR } from '@/app/uicomponents/timelineCanvas'

type Props = {
  items: TimelineItem[]
  onSelect: (id: string) => void
  onUpdate: (id: string, patch: Partial<Pick<TimelineItem, 'title' | 'body' | 'shots'>>) => void
  onDelete: (id: string) => void
}

export default function TimelineItemList({ items, onSelect, onUpdate, onDelete }: Props) {
  if (items.length === 0) {
    return (
      <Typography sx={{ opacity: 0.8, mb: 4 }}>
        No items on this timeline yet. Click the board above to add an Inkling or Shot.
      </Typography>
    )
  }

  return (
    <Stack spacing={2} sx={{ mb: 6 }}>
      {items.map(item => {
        const color = item.type === 'inkling' ? INKLING_COLOR : SHOT_COLOR
        return (
          <Box
            key={item.id}
            sx={{
              bgcolor: '#575962',
              borderRadius: 2,
              p: 2,
              borderLeft: `6px solid ${color}`,
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
              <Typography
                variant="caption"
                sx={{ color, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5 }}
              >
                {item.type}
              </Typography>
              <Stack direction="row" spacing={1}>
                <Button size="small" variant="contained" onClick={() => onSelect(item.id)}>
                  Focus on board
                </Button>
                <IconButton size="small" sx={{ color: '#fff' }} onClick={() => onDelete(item.id)} aria-label="Delete">
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </Stack>
            </Stack>

            <TextField
              fullWidth
              size="small"
              label="Title"
              value={item.title}
              onChange={e => onUpdate(item.id, { title: e.target.value })}
              sx={{ mb: 1.5 }}
              InputProps={{ style: { color: '#fff' } }}
              InputLabelProps={{ style: { color: '#ccc' } }}
            />

            {item.type === 'inkling' ? (
              <TextField
                fullWidth
                multiline
                minRows={3}
                label="Body"
                value={item.body}
                onChange={e => onUpdate(item.id, { body: e.target.value })}
                InputProps={{ style: { color: '#fff' } }}
                InputLabelProps={{ style: { color: '#ccc' } }}
              />
            ) : (
              <Stack spacing={1}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Shot sequence
                </Typography>
                {item.shots.map((shot, index) => (
                  <Stack key={shot.id} direction="row" spacing={1} alignItems="center">
                    <Typography sx={{ width: 24, opacity: 0.7 }}>{index + 1}.</Typography>
                    <TextField
                      fullWidth
                      size="small"
                      value={shot.text}
                      onChange={e => {
                        const next = item.shots.map(s =>
                          s.id === shot.id ? new ShotLine(e.target.value, s.id) : s
                        )
                        onUpdate(item.id, { shots: next })
                      }}
                      InputProps={{ style: { color: '#fff' } }}
                    />
                    <IconButton
                      size="small"
                      sx={{ color: '#fff' }}
                      disabled={index === 0}
                      onClick={() => {
                        if (index === 0) return
                        const next = [...item.shots]
                        ;[next[index - 1], next[index]] = [next[index], next[index - 1]]
                        onUpdate(item.id, { shots: next })
                      }}
                      aria-label="Move up"
                    >
                      <ArrowUpwardIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      sx={{ color: '#fff' }}
                      disabled={index === item.shots.length - 1}
                      onClick={() => {
                        if (index >= item.shots.length - 1) return
                        const next = [...item.shots]
                        ;[next[index], next[index + 1]] = [next[index + 1], next[index]]
                        onUpdate(item.id, { shots: next })
                      }}
                      aria-label="Move down"
                    >
                      <ArrowDownwardIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      sx={{ color: '#fff' }}
                      onClick={() => onUpdate(item.id, { shots: item.shots.filter(s => s.id !== shot.id) })}
                      aria-label="Remove shot line"
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                ))}
                <Button
                  startIcon={<AddIcon />}
                  variant="contained"
                  size="small"
                  sx={{ alignSelf: 'flex-start' }}
                  onClick={() => onUpdate(item.id, { shots: [...item.shots, new ShotLine('')] })}
                >
                  Add shot line
                </Button>
              </Stack>
            )}
          </Box>
        )
      })}
    </Stack>
  )
}
