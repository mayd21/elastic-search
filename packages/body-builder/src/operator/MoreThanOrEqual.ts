import { TermOperator } from '../types'

/**
 * 多值查询
 * @param value
 * @returns
 */
export const MoreThanOrEqual = (value: number): TermOperator => {
  return (key) => ({
    range: {
      [key]: {
        gte: value,
      },
    },
  })
}
