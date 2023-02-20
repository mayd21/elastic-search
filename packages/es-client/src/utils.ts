/**
 * 驼峰转下划线
 * @param str
 * @returns Snake Case String
 */
export const camelToSnakeCase = (str: string) => {
  return str.replace(/[A-Z]/g, (letter, index) => {
    return index == 0 ? letter.toLowerCase() : '_' + letter.toLowerCase()
  })
}

/**
 * 将对象的 key 由驼峰转为下划线
 * @param obj
 * @returns 新对象
 */
export const objectKeyToSnakeCase = (obj: Record<string, any>) => {
  const result: Record<string, any> = {}
  Object.keys(obj).forEach((key) => {
    result[camelToSnakeCase(key)] = obj[key]
  })
  return result
}
