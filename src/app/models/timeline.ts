import ShotLine from './shot'

export type TimelineItemType = 'inkling' | 'shot'

/** Color-coded marker placed freely on a timeline canvas. */
export class TimelineItem {
  id: string
  type: TimelineItemType
  /** Horizontal position as percent of canvas width (0–100). */
  x: number
  /** Vertical position as percent of canvas height (0–100). */
  y: number
  title: string
  /** Inkling body text; unused for shots. */
  body: string
  /** Ordered shot lines; unused for inklings. */
  shots: ShotLine[]

  constructor(partial: {
    id?: string
    type: TimelineItemType
    x: number
    y: number
    title: string
    body?: string
    shots?: ShotLine[]
  }) {
    this.id = partial.id ?? crypto.randomUUID()
    this.type = partial.type
    this.x = partial.x
    this.y = partial.y
    this.title = partial.title
    this.body = partial.body ?? ''
    this.shots = partial.shots ?? []
  }
}

/** Named board of freeform timeline items within a project. */
class Timeline {
  id: string
  name: string
  items: TimelineItem[]

  constructor(name: string = 'Main', id: string = crypto.randomUUID(), items: TimelineItem[] = []) {
    this.id = id
    this.name = name
    this.items = items
  }
}

export default Timeline
