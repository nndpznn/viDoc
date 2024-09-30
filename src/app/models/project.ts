import Inkling from './inkling'

class Project {
  id: number
  title: string
  description: string
  // inklings: Inkling[]

  constructor(title: string, description: string, id: number) {
    this.id = id
    this.title = title
    this.description = description
    // this.inklings = []
  }
}

export default Project
