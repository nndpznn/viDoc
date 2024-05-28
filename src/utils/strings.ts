/**
 * Returns the first and last name from a full name
 * @param fullName - Input full name
 * @returns - Object with first and last name
 */
export const splitFullName = (fullName: string): { firstName: string; lastName: string } => {
  const [firstName, ...rest] = fullName.trim().split(/\s+/)
  const lastName = rest.join(' ')
  return { firstName, lastName }
}
