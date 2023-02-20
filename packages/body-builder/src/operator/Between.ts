import { TermOperator } from '../types'

/**
 * 多值查询
 * @param value
 * @returns
 */
export const Between = (from: number, to: number, inclusive = true): TermOperator => {
  return (key) => {
    if (inclusive) {
      return {
        range: {
          [key]: {
            gte: from,
            lte: to,
          },
        },
      }
    }
    return {
      range: {
        [key]: {
          gt: from,
          lt: to,
        },
      },
    }
  }
}
