import { SortOrder } from './types'

/**
 * 判断值是否是一个普通对象
 * @param value
 * @returns
 */
export const isPlainObject = (value: any) => {
  return Object.prototype.toString.call(value) === '[object Object]' && value !== null
}

/**
 * 处理排序配置
 * @param current 当前排序配置
 * @param field 排序字段
 * @param order 排序配置
 * @param keyPrefix 字段前缀，将会自动追加在字段前
 */
export const mergeSort = (
  current: Record<string, SortOrder>[],
  field: string,
  order: SortOrder,
  keyPrefix?: string
) => {
  field = keyPrefix ? `${keyPrefix}.${field}` : field
  const idx = current.findIndex((s) => !!s[field])
  // 已存在当前字段则覆盖排序顺序
  if (idx > -1) {
    current[idx][field] = order
  }
  // 没有当前字段则新加排序字段
  else {
    current.push({ [field]: order })
  }
}
