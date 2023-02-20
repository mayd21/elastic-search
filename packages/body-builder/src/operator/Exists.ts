import { TermOperator } from '../types'

/**
 * 字段是否存在
 * @returns
 */
export const Exists = (): TermOperator => {
  return (key) => ({
    exists: {
      field: key,
    },
  })
}
