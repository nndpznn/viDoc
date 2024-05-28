import { splitFullName } from './strings'

describe('splitFullName', () => {
  it('should correctly split a name with one space', () => {
    let result = {}
    result = splitFullName('Jane Doe')
    expect(result).toEqual({ firstName: 'Jane', lastName: 'Doe' })

    result = splitFullName('Rocky K')
    expect(result).toEqual({ firstName: 'Rocky', lastName: 'K' })

    result = splitFullName('Hassan HH')
    expect(result).toEqual({ firstName: 'Hassan', lastName: 'HH' })
  })

  it('should handle names with multiple spaces', () => {
    const result = splitFullName('John Ronald Reuel Tolkien')
    expect(result).toEqual({ firstName: 'John', lastName: 'Ronald Reuel Tolkien' })
  })

  it('should handle names with no last name', () => {
    const result = splitFullName('Prince')
    expect(result).toEqual({ firstName: 'Prince', lastName: '' })
  })

  it('should handle empty strings', () => {
    const result = splitFullName('')
    expect(result).toEqual({ firstName: '', lastName: '' })
  })

  it('should handle names with leading and trailing spaces', () => {
    const result = splitFullName('  Jane Doe  ')
    expect(result).toEqual({ firstName: 'Jane', lastName: 'Doe' })
  })

  it('should handle names with multiple consecutive spaces between first and last name', () => {
    const result = splitFullName('Jane   Doe')
    expect(result).toEqual({ firstName: 'Jane', lastName: 'Doe' })
  })

  it('should correctly split a name with special characters', () => {
    const result = splitFullName('Jean-Luc Picard')
    expect(result).toEqual({ firstName: 'Jean-Luc', lastName: 'Picard' })
  })

  it('should correctly handle only last name', () => {
    const result = splitFullName(' Doe')
    expect(result).toEqual({ firstName: 'Doe', lastName: '' })
  })
})
