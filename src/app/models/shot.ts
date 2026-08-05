/** A single line in an ordered shot sequence. */
class ShotLine {
  id: string
  text: string

  constructor(text: string, id: string = crypto.randomUUID()) {
    this.id = id
    this.text = text
  }
}

export default ShotLine
