import { TermOperator } from '../types'

/**
 * 多值查询
 * @param value
 * @returns
 */
export const MoreThan = (value: number): TermOperator => {
  return (key) => ({
    range: {
      [key]: {
        gt: value,
      },
    },
  })
}
