class Project {
  id: number
  title: string
  description: string
  deadline?: string | null

  constructor(title: string, description: string, id: number, deadline?: string | null) {
    this.id = id
    this.title = title
    this.description = description
    this.deadline = deadline ?? null
  }
}

export default Project
