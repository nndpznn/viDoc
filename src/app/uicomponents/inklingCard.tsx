import { Card, CardContent, Typography } from '@mui/material'
import Inkling from '../models/inkling'

export default function InklingCard({ inkling }: { inkling: Inkling }) {
  return (
    <>
      <Card sx={{ width: 350, minHeight: 200, bgcolor: '#575962', ':hover': { boxShadow: 10 }, cursor: 'pointer' }}>
        <CardContent>
          <Typography variant="h5" color="white" sx={{ fontWeight: 'bold', mb: 1 }}>
            {inkling.title}
          </Typography>
          <Typography
            variant="body1"
            color="white"
            sx={{ WebkitlineClamp: 4, textOverflow: 'ellipsis' }}
            noWrap={false}
          >
            {inkling.body}
          </Typography>
        </CardContent>
      </Card>
    </>
  )
}
