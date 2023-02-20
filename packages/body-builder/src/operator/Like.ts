import { TermOperator } from '../types'

/**
 * 模糊查询
 * @param value
 * @returns
 */
export const Like = (value: string): TermOperator => {
  return (key) => ({
    wildcard: {
      [key]: value,
    },
  })
}
