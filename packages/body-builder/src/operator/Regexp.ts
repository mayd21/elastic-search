import { TermOperator } from '../types'

/**
 * 正则匹配查询
 * @param value
 * @returns
 */
export const Regexp = (value: string): TermOperator => {
  return (key) => ({
    regexp: {
      [key]: value,
    },
  })
}
