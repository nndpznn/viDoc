import React from 'react'
import { Card, CardContent, CardMedia, Typography } from '@mui/material'
import Project from '../models/project'

const defaultCard = new Project('Hello ViDoc!', 'Default project description.', 123412341234)

export default function VideoCard({ project }: { project: Project }) {
  return (
    <>
      <Card sx={{ ml: 2, mr: 2, mb: 2, bgcolor: '#575962', width: 350, minHeight: 330, ':hover': { boxShadow: 10 } }}>
        <CardMedia
          sx={{ height: 200, width: 350, padding: '1em 1em 0 1em', objectFit: 'contain' }}
          image={'/images/notfound.png'}
          title="not found image"
        />
        <CardContent>
          <Typography variant="h5" color="white" sx={{ fontWeight: 'bold' }}>
            {project.title ? project.title : defaultCard.title}
          </Typography>
          <Typography variant="body1" color="white" sx={{ WebkitLineClamp: 2 }} noWrap={false}>
            {project.description ? project.description : defaultCard.description}
          </Typography>
        </CardContent>
      </Card>
    </>
  )
}
