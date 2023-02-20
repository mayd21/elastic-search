import { TermOperator, Items, BoolClauses } from '../types'
import { BodyBuilder } from '../BodyBuilder'

interface Nested {
  nested: {
    path: string
    query: Nested | BoolClauses
    ignore_unmapped?: boolean
  }
}

/**
 * 构建 nested 嵌套查询结构
 * @param key
 * @param items
 * @returns
 */
const buildNested = (key: string, items: Items, ignoreUnmapped?: boolean) => {
  if (!key) return
  // 分解多级嵌套的 key
  // nested 存在多级嵌套时需要逐级嵌套
  // https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-nested-query.html#multi-level-nested-query-ex
  const keys = key.split('.')
  let prefix = keys.shift()
  if (!prefix) return
  const result: Nested = {
    nested: {
      path: prefix,
      ignore_unmapped: ignoreUnmapped,
      query: {
        bool: {},
      },
    },
  }
  let curr = result.nested.query
  while (keys.length) {
    prefix = `${prefix}.${keys.shift()}`
    ;(curr as Nested).nested = {
      path: prefix,
      ignore_unmapped: ignoreUnmapped,
      query: {
        bool: {},
      },
    }
    curr = (curr as Nested).nested.query
  }

  // 值为函数则构建子查询
  if (items && typeof items === 'function') {
    const clauseQb = items(new BodyBuilder(prefix))
    ;(curr as BoolClauses).bool = clauseQb.getQuery().bool
    return result
  }

  // 值为键值对则使用键值对构建子查询
  ;(curr as BoolClauses).bool = new BodyBuilder(prefix).and(items).getQuery().bool
  return result
}

/**
 * nested 嵌套查询
 * @param value
 * @returns
 */
export const Nested = (value: Items, ignoreUnmapped?: boolean): TermOperator => {
  return (key) => {
    return buildNested(key, value, ignoreUnmapped)
  }
}
