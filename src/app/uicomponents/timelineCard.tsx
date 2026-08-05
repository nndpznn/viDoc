import Timeline, { TimelineItemType } from '../models/timeline'
import TimelineCanvas from './timelineCanvas'

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

export default function TimelineCard(props: Props) {
  return <TimelineCanvas {...props} />
}
