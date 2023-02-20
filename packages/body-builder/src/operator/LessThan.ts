import { TermOperator } from '../types'

/**
 * 多值查询
 * @param value
 * @returns
 */
export const LessThan = (value: number): TermOperator => {
  return (key) => ({
    range: {
      [key]: {
        lt: value,
      },
    },
  })
}
