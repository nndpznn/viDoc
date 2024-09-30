import { Card, CardContent, Typography } from '@mui/material'
import Timeline from '../models/timeline'

export default function TimelineCard({ timeline }: { timeline: Timeline }) {
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: 300,
            backgroundColor: '#9597a1',
            borderRadius: 15,
            margin: 'auto',
          }}
        >
          {' '}
        </div>
        <div
          style={{
            position: 'absolute',
            width: '80%',
            height: 10,
            backgroundColor: '#575962',
            borderRadius: 15,
            margin: 'auto',
            maxWidth: 1200 * 0.8,
          }}
        >
          {' '}
        </div>
      </div>
      {/* <Card
        sx={{ width: 1000, height: 300, bgcolor: '#9597a1', alignItems: 'center', boxShadow: '0', mt: 2, mb: 2 }}
      ></Card> */}
    </>
  )
}
