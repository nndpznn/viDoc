import Timeline, { TimelineItem } from '@/app/models/timeline'
import ShotLine from '@/app/models/shot'

const TIMELINES_KEY = (projectId: string) => `vidoc:timelines:${projectId}`
const META_KEY = (projectId: string) => `vidoc:project-meta:${projectId}`

export type ProjectLocalMeta = {
  deadline?: string | null
}

export type ProjectTimelinesState = {
  timelines: Timeline[]
  activeTimelineId: string
}

type StoredShot = { id: string; text: string }
type StoredItem = {
  id: string
  type: 'inkling' | 'shot'
  x: number
  y: number
  title: string
  body: string
  shots: StoredShot[]
}
type StoredTimeline = { id: string; name: string; items: StoredItem[] }
type StoredState = { timelines: StoredTimeline[]; activeTimelineId: string }

function toStored(state: ProjectTimelinesState): StoredState {
  return {
    activeTimelineId: state.activeTimelineId,
    timelines: state.timelines.map(t => ({
      id: t.id,
      name: t.name,
      items: t.items.map(item => ({
        id: item.id,
        type: item.type,
        x: item.x,
        y: item.y,
        title: item.title,
        body: item.body,
        shots: item.shots.map(s => ({ id: s.id, text: s.text })),
      })),
    })),
  }
}

function fromStored(raw: StoredState): ProjectTimelinesState {
  const timelines = raw.timelines.map(
    t =>
      new Timeline(
        t.name,
        t.id,
        t.items.map(
          item =>
            new TimelineItem({
              id: item.id,
              type: item.type,
              x: item.x,
              y: item.y,
              title: item.title,
              body: item.body,
              shots: (item.shots ?? []).map(s => new ShotLine(s.text, s.id)),
            })
        )
      )
  )
  return { timelines, activeTimelineId: raw.activeTimelineId }
}

export function createDefaultTimelinesState(): ProjectTimelinesState {
  const main = new Timeline('Main', 'default-main')
  return { timelines: [main], activeTimelineId: main.id }
}

export function loadProjectTimelines(projectId: string): ProjectTimelinesState {
  if (typeof window === 'undefined') return createDefaultTimelinesState()
  try {
    const raw = localStorage.getItem(TIMELINES_KEY(projectId))
    if (!raw) return createDefaultTimelinesState()
    const parsed = JSON.parse(raw) as StoredState
    if (!parsed.timelines?.length) return createDefaultTimelinesState()
    return fromStored(parsed)
  } catch {
    return createDefaultTimelinesState()
  }
}

export function saveProjectTimelines(projectId: string, state: ProjectTimelinesState): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(TIMELINES_KEY(projectId), JSON.stringify(toStored(state)))
}

export function loadProjectMeta(projectId: string): ProjectLocalMeta {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(META_KEY(projectId))
    if (!raw) return {}
    return JSON.parse(raw) as ProjectLocalMeta
  } catch {
    return {}
  }
}

export function saveProjectMeta(projectId: string, meta: ProjectLocalMeta): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(META_KEY(projectId), JSON.stringify(meta))
}

export function clampPercent(value: number): number {
  return Math.min(100, Math.max(0, value))
}

/** Horizontal axis sits at mid-height of the canvas. */
export const TIMELINE_CENTER_Y = 50

/** Snap when within this many percent of canvas height from the center line. */
export const TIMELINE_SNAP_THRESHOLD = 6

/** Keep freeform X; snap Y to the center rail when close enough. */
export function applyTimelineSnap(x: number, y: number): { x: number; y: number; snapped: boolean } {
  const clampedX = clampPercent(x)
  const clampedY = clampPercent(y)
  const snapped = Math.abs(clampedY - TIMELINE_CENTER_Y) <= TIMELINE_SNAP_THRESHOLD
  return {
    x: clampedX,
    y: snapped ? TIMELINE_CENTER_Y : clampedY,
    snapped,
  }
}

