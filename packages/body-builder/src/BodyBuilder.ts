import {
  BoolClauseType,
  Items,
  Value,
  BoolClauses,
  SortOrder,
  SortField,
  SearchBody,
  BoolClauseBody,
  SearchBodyInit,
} from './types'
import { isPlainObject, mergeSort } from './utils'

/**
 * BodyBuilder 类
 * ES DSL 查询 body 构造类
 */
export class BodyBuilder {
  /**
   * 构造函数
   * @param keyPrefix 字段 key 前缀，会给所有字段加上前缀 keyPrefix.[filed]
   * @param searchBody 查询语句初始化数据
   */
  constructor(
    protected keyPrefix?: string,
    protected searchBody: SearchBodyInit = {
      boolClauses: {
        must: [],
        should: [],
        must_not: [],
      },
    }
  ) {}

  /**
   * 构建 filter 查询
   * 将各个逻辑查询的语句装入 boolClauses 中，用于最终的 build
   * @param type
   * @param items
   * @returns
   */
  private makeFilter(type: BoolClauseType, items: Items) {
    const boolClauses = this.searchBody.boolClauses as Required<BoolClauseBody>
    if (!boolClauses[type]) {
      boolClauses[type] = []
    }

    // items 为函数，即子查询函数
    if (items && typeof items === 'function') {
      const clauseQb = items(new BodyBuilder(this.keyPrefix))
      boolClauses[type].push(clauseQb.getQuery())
      return
    }
    // items 为键值对
    Object.keys(items).forEach((key) => {
      const newKey = this.keyPrefix ? `${this.keyPrefix}.${key}` : key
      const item: Value = items[key]
      if (typeof item === 'undefined') {
        return
      }
      // 值为 Like 之类的匹配类型函数
      if (item && typeof item === 'function') {
        const result = item(newKey)
        if (result) {
          boolClauses[type].push(result)
        }
      }
      // 值为普通标准类型
      else {
        boolClauses[type].push({ term: { [newKey]: item } })
      }
    })
  }

  /**
   * 添加 must 子句
   * @param items
   * @returns
   */
  public and(items: Items) {
    this.makeFilter('must', items)
    return this
  }

  /**
   * 添加 should 子句
   * @param items
   * @returns
   */
  public or(items: Items) {
    this.makeFilter('should', items)
    return this
  }

  /**
   * or 的别名
   */
  public andOr(items: Items) {
    return this.or(items)
  }

  /**
   * 添加 must_not 子句
   * @param items
   * @returns
   */
  public not(items: Items) {
    this.makeFilter('must_not', items)
    return this
  }

  /**
   * not 别名
   */
  public andNot(items: Items) {
    return this.not(items)
  }

  /**
   * 设置排序规则
   * @param field 排序字段
   * @param order 排序顺序 默认 asc
   * @returns
   */
  public sort(field: SortField, order: SortOrder = 'asc') {
    this.searchBody.sort = this.searchBody.sort || []
    const sorts = this.searchBody.sort

    // 字符串则为单个 field
    if (typeof field === 'string') {
      mergeSort(sorts, field, order, this.keyPrefix)
    }
    // 键值对，存储 field: order
    else if (isPlainObject(field)) {
      Object.entries(field).forEach(([key, value]) => {
        mergeSort(sorts, key, value, this.keyPrefix)
      })
    }

    return this
  }

  /**
   * 设置分页大小
   * @param size
   * @returns
   */
  public size(size: number) {
    this.searchBody.size = size
    return this
  }

  /**
   * 设置分页起始位置
   * @param from
   * @returns
   */
  public from(from: number) {
    this.searchBody.from = from
    return this
  }

  /**
   * 设置 search_after 的排序值
   * https://www.elastic.co/guide/en/elasticsearch/reference/7.17/paginate-search-results.html#search-after
   * @param sort
   * @returns
   */
  public searchAfter(sort: any[]) {
    this.searchBody.search_after = sort
    return this
  }

  /**
   * 处理所有 bool 子句
   * @returns 完整的 bool 子句
   */
  public getQuery(): BoolClauses {
    const { boolClauses } = this.searchBody
    const { must, should, must_not } = boolClauses
    let result: BoolClauseBody = {}
    // 去除空数组
    if (must && must.length) {
      result.must = must
    }

    if (should && should.length) {
      result.should = should
      // 至少满足 should 内的一个
      // 当存在 must 时，该值默认为 0，会使 should 内条件失效
      // 此处固定设置为 1，保证 should 一定会生效
      // https://www.elastic.co/guide/en/elasticsearch/reference/7.17/query-dsl-bool-query.html#bool-min-should-match
      result.minimum_should_match = 1
    }

    if (must_not && must_not.length) {
      result.must_not = must_not
    }

    return {
      bool: result,
    }
  }

  /**
   * 构建完整的 body
   * @returns
   */
  public build(): SearchBody {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { boolClauses, ...rest } = this.searchBody
    const _body: SearchBody = { ...rest }
    _body.query = {
      bool: {
        filter: this.getQuery(),
      },
    }
    // 返回一份 body 的副本
    return JSON.parse(JSON.stringify(_body))
  }

  /**
   * 克隆一份 BodyBuilder 对象
   * @returns
   */
  public clone() {
    return new BodyBuilder(this.keyPrefix, this.searchBody)
  }
}
