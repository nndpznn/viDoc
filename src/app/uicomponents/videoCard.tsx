import React from 'react'
import { Card, CardContent, CardMedia, Typography } from '@mui/material'
import Project from '../models/project'

const defaultCard = new Project('Hello ViDoc!', 'Default description.')

export default function VideoCard() {
  return (
    <>
      <Card sx={{ bgcolor: '#575962', maxWidth: 345 }}>
        <CardMedia sx={{ height: 100 }} image="./public/images/Not-Found.png" title="not found image" />
        <CardContent>
          <Typography variant="h5" color="white" sx={{ fontWeight: 'bold' }}>
            {defaultCard.title}
          </Typography>
          <Typography variant="h6" color="white" sx={{}}>
            {defaultCard.description}
          </Typography>
        </CardContent>
      </Card>
    </>
  )
}
