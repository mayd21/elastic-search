import { TermOperator } from '../types'

/**
 * match 查询
 * @param value
 * @returns
 */
export const Match = (value: string): TermOperator => {
  return (key) => ({
    match: {
      [key]: value,
    },
  })
}
