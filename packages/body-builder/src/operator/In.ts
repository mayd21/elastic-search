import { TermOperator } from '../types'

/**
 * 多值查询
 * @param value
 * @returns
 */
export const In = <T>(value: T[]): TermOperator => {
  return (key) => ({
    terms: {
      [key]: value,
    },
  })
}
