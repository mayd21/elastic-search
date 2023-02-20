import { TermOperator } from '../types'

/**
 * 多值查询
 * @param value
 * @returns
 */
export const LessThanOrEqual = (value: number): TermOperator => {
  return (key) => ({
    range: {
      [key]: {
        lte: value,
      },
    },
  })
}
