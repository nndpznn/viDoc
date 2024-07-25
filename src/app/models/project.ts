class Project {
  id: number
  title: string
  // thumbnail: image
  description: string

  constructor(title: string, description: string, id: number) {
    this.id = id
    this.title = title
    this.description = description
  }
}

export default Project
