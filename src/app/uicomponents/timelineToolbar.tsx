'use client'

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import Timeline from '@/app/models/timeline'

type Props = {
  timelines: Timeline[]
  activeTimelineId: string
  onSelect: (id: string) => void
  onCreate: (name: string) => void
  onRename: (id: string, name: string) => void
  onDuplicate: (id: string) => void
  onClear: (id: string) => void
  onDelete: (id: string) => void
}

export default function TimelineToolbar({
  timelines,
  activeTimelineId,
  onSelect,
  onCreate,
  onRename,
  onDuplicate,
  onClear,
  onDelete,
}: Props) {
  const [createOpen, setCreateOpen] = useState(false)
  const [renameOpen, setRenameOpen] = useState(false)
  const [confirmClear, setConfirmClear] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [name, setName] = useState('')

  const active = timelines.find(t => t.id === activeTimelineId)
  const canDelete = timelines.length > 1

  return (
    <>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ sm: 'center' }} sx={{ mb: 2 }}>
        <TextField
          select
          size="small"
          label="Timeline"
          value={activeTimelineId}
          onChange={e => onSelect(e.target.value)}
          sx={{ minWidth: 200, bgcolor: '#575962', borderRadius: 1 }}
          InputProps={{ style: { color: '#fff' } }}
          InputLabelProps={{ style: { color: '#ddd' } }}
        >
          {timelines.map(t => (
            <MenuItem key={t.id} value={t.id}>
              {t.name}
            </MenuItem>
          ))}
        </TextField>

        <Button
          variant="contained"
          size="small"
          onClick={() => {
            setName('')
            setCreateOpen(true)
          }}
        >
          New timeline
        </Button>
        <Button
          variant="contained"
          size="small"
          color="secondary"
          onClick={() => {
            setName(active?.name ?? '')
            setRenameOpen(true)
          }}
        >
          Rename
        </Button>
        <Button variant="contained" size="small" color="secondary" onClick={() => onDuplicate(activeTimelineId)}>
          Duplicate
        </Button>
        <Button variant="contained" size="small" color="secondary" onClick={() => setConfirmClear(true)}>
          Clear
        </Button>
        <Button
          variant="contained"
          size="small"
          color="secondary"
          disabled={!canDelete}
          onClick={() => setConfirmDelete(true)}
        >
          Delete
        </Button>
      </Stack>

      <Typography variant="body2" sx={{ mb: 1, opacity: 0.85 }}>
        Use + to add an Inkling or Shot. Drag freely, or near the center line to snap on.
      </Typography>

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)}>
        <DialogTitle>New timeline</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            margin="dense"
            label="Name"
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={() => setCreateOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              onCreate(name || 'Untitled')
              setCreateOpen(false)
            }}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={renameOpen} onClose={() => setRenameOpen(false)}>
        <DialogTitle>Rename timeline</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            margin="dense"
            label="Name"
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={() => setRenameOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              onRename(activeTimelineId, name)
              setRenameOpen(false)
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={confirmClear} onClose={() => setConfirmClear(false)}>
        <DialogTitle>Clear timeline?</DialogTitle>
        <DialogContent>Removes all items from &quot;{active?.name}&quot;. This cannot be undone.</DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={() => setConfirmClear(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              onClear(activeTimelineId)
              setConfirmClear(false)
            }}
          >
            Clear
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)}>
        <DialogTitle>Delete timeline?</DialogTitle>
        <DialogContent>
          Delete &quot;{active?.name}&quot;? You must keep at least one timeline.
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={() => setConfirmDelete(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            disabled={!canDelete}
            onClick={() => {
              onDelete(activeTimelineId)
              setConfirmDelete(false)
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
