'use client'

import Project from '@/app/models/project'
import theme from '@/app/theme/allTheme'
import TimelineCard from '@/app/uicomponents/timelineCard'
import TimelineToolbar from '@/app/uicomponents/timelineToolbar'
import TimelineItemList from '@/app/uicomponents/timelineItemList'
import { supabase } from '@/clients/supabaseClient'
import { useProjectTimelines } from '@/hooks/useProjectTimelines'
import { loadProjectMeta, saveProjectMeta } from '@/utils/projectLocalStore'
import {
  Button,
  Container,
  Stack,
  ThemeProvider,
  Typography,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  TextField,
} from '@mui/material'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

function ProjectTimelineSection({ projectId }: { projectId: string }) {
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
  const importedRef = useRef(false)

  const {
    ready: timelinesReady,
    timelines: timelineBoards,
    activeTimeline,
    activeTimelineId,
    setActiveTimelineId,
    createTimeline,
    renameTimeline,
    duplicateTimeline,
    clearTimeline,
    deleteTimeline,
    addItem,
    updateItem,
    moveItem,
    deleteItem,
  } = useProjectTimelines(projectId)

  useEffect(() => {
    if (!timelinesReady || importedRef.current) return
    if (!activeTimeline || activeTimeline.items.length > 0) {
      importedRef.current = true
      return
    }

    importedRef.current = true

    const importInklings = async () => {
      const { data: rows, error } = await supabase
        .from('inklings')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true })

      if (error || !rows?.length) return

      rows.forEach((row: { title: string; body: string }, index: number) => {
        const col = (index % 5) + 1
        const rowIdx = Math.floor(index / 5)
        addItem({
          type: 'inkling',
          title: row.title,
          body: row.body,
          x: 15 + col * 12,
          y: 30 + rowIdx * 18,
        })
      })
    }

    void importInklings()
  }, [projectId, timelinesReady, activeTimeline, addItem])

  if (!activeTimeline) return null

  return (
    <>
      <TimelineToolbar
        timelines={timelineBoards}
        activeTimelineId={activeTimelineId}
        onSelect={setActiveTimelineId}
        onCreate={createTimeline}
        onRename={renameTimeline}
        onDuplicate={duplicateTimeline}
        onClear={clearTimeline}
        onDelete={deleteTimeline}
      />

      <TimelineCard
        timeline={activeTimeline}
        selectedItemId={selectedItemId}
        onSelectItem={setSelectedItemId}
        onAddItem={addItem}
        onMoveItem={moveItem}
        onDeleteItem={itemId => {
          deleteItem(itemId)
          if (selectedItemId === itemId) setSelectedItemId(null)
        }}
      />

      <Typography variant="h3" sx={{ mt: 3, mb: 2 }}>
        Timeline items
      </Typography>
      <TimelineItemList
        items={activeTimeline.items}
        onSelect={setSelectedItemId}
        onUpdate={updateItem}
        onDelete={itemId => {
          deleteItem(itemId)
          if (selectedItemId === itemId) setSelectedItemId(null)
        }}
      />
    </>
  )
}

export default function ProjectDetail() {
  const router = useRouter()
  const params = useParams()
  const id = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : undefined

  const [openDelete, setOpenDelete] = useState(false)
  const [openEdit, setOpenEdit] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editDeadline, setEditDeadline] = useState('')
  const [formError, setFormError] = useState('')

  const [data, setData] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)

  const handleDelete = async () => {
    const { error } = await supabase.from('projects').delete().eq('id', id)
    if (error) console.log(error)
    router.push('/dashboard')
  }

  const openEditDialog = () => {
    if (!data) return
    setEditTitle(data.title)
    setEditDescription(data.description)
    setEditDeadline(data.deadline ?? '')
    setFormError('')
    setOpenEdit(true)
  }

  const handleSaveProject = async () => {
    if (!id || !editTitle.trim() || !editDescription.trim()) {
      setFormError('Please fill out title and description.')
      return
    }

    const deadline = editDeadline || null

    const { data: updated, error } = await supabase
      .from('projects')
      .update({ title: editTitle.trim(), description: editDescription.trim() })
      .eq('id', id)
      .select()
      .single()

    saveProjectMeta(String(id), { deadline })

    if (error) {
      console.error(error)
      setData(prev => (prev ? new Project(editTitle.trim(), editDescription.trim(), prev.id, deadline) : prev))
      setOpenEdit(false)
      return
    }

    if (updated) {
      setData(new Project(updated.title, updated.description, updated.id, deadline))
    }
    setOpenEdit(false)
  }

  useEffect(() => {
    if (!id) return

    const fetchData = async () => {
      const { data: row, error } = await supabase.from('projects').select('*').eq('id', id).single()
      const meta = loadProjectMeta(String(id))

      if (error) {
        console.error('There was an error fetching the project.', error)
        setData(null)
      } else if (row) {
        setData(new Project(row.title, row.description, row.id, row.deadline ?? meta.deadline ?? null))
      }
      setLoading(false)
    }

    void fetchData()
  }, [id])

  if (loading || !data) {
    return (
      <Container>
        <ThemeProvider theme={theme}>
          <Stack alignItems="center" justifyContent="space-between" direction="row">
            <Button variant="contained" sx={{ mt: 2, mb: 2 }} onClick={() => router.push('/dashboard')}>
              Back
            </Button>
          </Stack>
          <Typography
            variant="h2"
            sx={{
              fontStyle: 'italic',
              textAlign: 'center',
              mt: 15,
              ml: 6,
              mr: 6,
              backgroundColor: '#575962',
              padding: 5,
              borderRadius: 15,
            }}
          >
            {loading ? 'Loading your viDoc...' : 'Data not found.'}
          </Typography>
        </ThemeProvider>
      </Container>
    )
  }

  return (
    <Container>
      <ThemeProvider theme={theme}>
        <Stack alignItems="center" justifyContent="space-between" direction="row">
          <Button variant="contained" sx={{ mt: 2, mb: 2 }} onClick={() => router.push('/dashboard')}>
            Back
          </Button>
          <Button variant="contained" size="medium" color="primary" sx={{ mt: 2 }} onClick={() => setOpenDelete(true)}>
            Delete
          </Button>
          <Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
            <DialogTitle>Delete viDoc?</DialogTitle>
            <DialogContent>This project won&apos;t ever see the light of day... are you sure?</DialogContent>
            <DialogActions>
              <Button variant="contained" onClick={() => setOpenDelete(false)}>
                Cancel
              </Button>
              <Button variant="contained" onClick={handleDelete} autoFocus>
                Yes, delete
              </Button>
            </DialogActions>
          </Dialog>
        </Stack>

        <Typography variant="h1" sx={{ fontStyle: 'italic', textAlign: 'center' }}>
          &quot;{data.title}&quot;
        </Typography>

        <Typography variant="h5" sx={{ fontStyle: 'italic', textAlign: 'center', ml: 3, mr: 3 }}>
          {data.description}
        </Typography>

        {data.deadline && (
          <Typography variant="subtitle1" sx={{ textAlign: 'center', mt: 1, opacity: 0.9 }}>
            Deadline: {data.deadline}
          </Typography>
        )}

        <Stack alignItems="center" justifyContent="center" direction="row" gap={2} sx={{ mt: 2 }}>
          <Button variant="contained" size="medium" color="primary" onClick={openEditDialog}>
            Edit project info
          </Button>
        </Stack>

        <Dialog open={openEdit} onClose={() => setOpenEdit(false)} fullWidth maxWidth="sm">
          <DialogTitle>Edit project</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              margin="dense"
              label="Title"
              value={editTitle}
              onChange={e => setEditTitle(e.target.value)}
            />
            <TextField
              fullWidth
              margin="dense"
              label="Description"
              multiline
              rows={3}
              value={editDescription}
              onChange={e => setEditDescription(e.target.value)}
            />
            <TextField
              fullWidth
              margin="dense"
              label="Deadline"
              type="date"
              value={editDeadline}
              onChange={e => setEditDeadline(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            {formError && (
              <Typography color="error" sx={{ mt: 1 }}>
                {formError}
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button variant="contained" onClick={() => setOpenEdit(false)}>
              Cancel
            </Button>
            <Button variant="contained" onClick={handleSaveProject}>
              Save
            </Button>
          </DialogActions>
        </Dialog>

        <Typography variant="h3" sx={{ mt: 3, mb: 1 }}>
          Timeline
        </Typography>

        {id && <ProjectTimelineSection key={id} projectId={id} />}
      </ThemeProvider>
    </Container>
  )
}
