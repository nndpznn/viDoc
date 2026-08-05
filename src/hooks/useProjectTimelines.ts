'use client'

import { useCallback, useMemo, useSyncExternalStore } from 'react'
import Timeline, { TimelineItem, TimelineItemType } from '@/app/models/timeline'
import ShotLine from '@/app/models/shot'
import {
  createDefaultTimelinesState,
  loadProjectTimelines,
  saveProjectTimelines,
  clampPercent,
  type ProjectTimelinesState,
} from '@/utils/projectLocalStore'

const listeners = new Map<string, Set<() => void>>()
/** Cache serialized snapshots so useSyncExternalStore sees stable references when data is unchanged. */
const snapshotCache = new Map<string, string>()

function subscribe(projectId: string, onStoreChange: () => void) {
  if (!listeners.has(projectId)) listeners.set(projectId, new Set())
  listeners.get(projectId)!.add(onStoreChange)
  return () => {
    listeners.get(projectId)?.delete(onStoreChange)
  }
}

function emit(projectId: string) {
  listeners.get(projectId)?.forEach(listener => listener())
}

function serializeState(state: ProjectTimelinesState): string {
  return JSON.stringify({
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
  })
}

function readSnapshot(projectId: string): string {
  if (typeof window === 'undefined') {
    return serializeState(createDefaultTimelinesState())
  }
  const serialized = serializeState(loadProjectTimelines(projectId))
  const cached = snapshotCache.get(projectId)
  if (cached === serialized) return cached
  snapshotCache.set(projectId, serialized)
  return serialized
}

function writeState(projectId: string, state: ProjectTimelinesState) {
  saveProjectTimelines(projectId, state)
  snapshotCache.delete(projectId)
  emit(projectId)
}

function parseState(serialized: string): ProjectTimelinesState {
  try {
    const raw = JSON.parse(serialized) as {
      activeTimelineId: string
      timelines: Array<{
        id: string
        name: string
        items: Array<{
          id: string
          type: TimelineItemType
          x: number
          y: number
          title: string
          body: string
          shots: Array<{ id: string; text: string }>
        }>
      }>
    }
    if (!raw.timelines?.length) return createDefaultTimelinesState()
    return {
      activeTimelineId: raw.activeTimelineId,
      timelines: raw.timelines.map(
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
      ),
    }
  } catch {
    return createDefaultTimelinesState()
  }
}

function updateActive(
  state: ProjectTimelinesState,
  updater: (timeline: Timeline) => Timeline
): ProjectTimelinesState {
  return {
    ...state,
    timelines: state.timelines.map(t => (t.id === state.activeTimelineId ? updater(t) : t)),
  }
}

function currentState(projectId: string): ProjectTimelinesState {
  return loadProjectTimelines(projectId)
}

/** Remount with `key={projectId}` when the project changes. */
export function useProjectTimelines(projectId: string) {
  const serialized = useSyncExternalStore(
    useCallback((onStoreChange: () => void) => subscribe(projectId, onStoreChange), [projectId]),
    useCallback(() => readSnapshot(projectId), [projectId]),
    () => serializeState(createDefaultTimelinesState())
  )

  const state = useMemo(() => parseState(serialized), [serialized])
  const activeTimeline = state.timelines.find(t => t.id === state.activeTimelineId) ?? state.timelines[0]

  const setActiveTimelineId = useCallback(
    (id: string) => {
      writeState(projectId, { ...currentState(projectId), activeTimelineId: id })
    },
    [projectId]
  )

  const createTimeline = useCallback(
    (name: string) => {
      const timeline = new Timeline(name.trim() || 'Untitled')
      const prev = currentState(projectId)
      writeState(projectId, {
        timelines: [...prev.timelines, timeline],
        activeTimelineId: timeline.id,
      })
      return timeline
    },
    [projectId]
  )

  const renameTimeline = useCallback(
    (id: string, name: string) => {
      const prev = currentState(projectId)
      writeState(projectId, {
        ...prev,
        timelines: prev.timelines.map(t =>
          t.id === id ? new Timeline(name.trim() || t.name, t.id, t.items) : t
        ),
      })
    },
    [projectId]
  )

  const duplicateTimeline = useCallback(
    (id: string) => {
      const prev = currentState(projectId)
      const source = prev.timelines.find(t => t.id === id)
      if (!source) return
      const copy = new Timeline(
        `${source.name} copy`,
        crypto.randomUUID(),
        source.items.map(
          item =>
            new TimelineItem({
              type: item.type,
              x: item.x,
              y: item.y,
              title: item.title,
              body: item.body,
              shots: item.shots.map(s => new ShotLine(s.text)),
            })
        )
      )
      writeState(projectId, {
        timelines: [...prev.timelines, copy],
        activeTimelineId: copy.id,
      })
    },
    [projectId]
  )

  const clearTimeline = useCallback(
    (id: string) => {
      const prev = currentState(projectId)
      writeState(projectId, {
        ...prev,
        timelines: prev.timelines.map(t => (t.id === id ? new Timeline(t.name, t.id, []) : t)),
      })
    },
    [projectId]
  )

  const deleteTimeline = useCallback(
    (id: string) => {
      const prev = currentState(projectId)
      if (prev.timelines.length <= 1) return
      const timelines = prev.timelines.filter(t => t.id !== id)
      const activeTimelineId = prev.activeTimelineId === id ? timelines[0].id : prev.activeTimelineId
      writeState(projectId, { timelines, activeTimelineId })
    },
    [projectId]
  )

  const addItem = useCallback(
    (input: {
      type: TimelineItemType
      x: number
      y: number
      title: string
      body?: string
      shots?: string[]
    }) => {
      const item = new TimelineItem({
        type: input.type,
        x: clampPercent(input.x),
        y: clampPercent(input.y),
        title: input.title,
        body: input.body ?? '',
        shots: (input.shots ?? []).filter(Boolean).map(text => new ShotLine(text)),
      })
      writeState(
        projectId,
        updateActive(currentState(projectId), t => new Timeline(t.name, t.id, [...t.items, item]))
      )
      return item
    },
    [projectId]
  )

  const updateItem = useCallback(
    (itemId: string, patch: Partial<Pick<TimelineItem, 'title' | 'body' | 'x' | 'y' | 'shots'>>) => {
      writeState(
        projectId,
        updateActive(currentState(projectId), t => {
          const items = t.items.map(item => {
            if (item.id !== itemId) return item
            return new TimelineItem({
              id: item.id,
              type: item.type,
              x: patch.x !== undefined ? clampPercent(patch.x) : item.x,
              y: patch.y !== undefined ? clampPercent(patch.y) : item.y,
              title: patch.title ?? item.title,
              body: patch.body ?? item.body,
              shots: patch.shots ?? item.shots,
            })
          })
          return new Timeline(t.name, t.id, items)
        })
      )
    },
    [projectId]
  )

  const moveItem = useCallback(
    (itemId: string, x: number, y: number) => {
      writeState(
        projectId,
        updateActive(currentState(projectId), t => {
          const items = t.items.map(item =>
            item.id === itemId
              ? new TimelineItem({
                  id: item.id,
                  type: item.type,
                  x: clampPercent(x),
                  y: clampPercent(y),
                  title: item.title,
                  body: item.body,
                  shots: item.shots,
                })
              : item
          )
          return new Timeline(t.name, t.id, items)
        })
      )
    },
    [projectId]
  )

  const deleteItem = useCallback(
    (itemId: string) => {
      writeState(
        projectId,
        updateActive(
          currentState(projectId),
          t => new Timeline(t.name, t.id, t.items.filter(i => i.id !== itemId))
        )
      )
    },
    [projectId]
  )

  return {
    ready: typeof window !== 'undefined',
    timelines: state.timelines,
    activeTimeline,
    activeTimelineId: state.activeTimelineId,
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
  }
}
