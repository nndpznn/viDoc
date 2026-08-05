class Inkling {
  id: string
  title: string
  body: string
  project_id?: string | number
  user_id?: string

  constructor(title: string, body: string, id: string = '') {
    this.id = id
    this.title = title
    this.body = body
  }
}

export default Inkling
