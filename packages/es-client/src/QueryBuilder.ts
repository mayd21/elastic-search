import { estypes, errors, TransportResult } from '@elastic/elasticsearch'
import { BodyBuilder, SearchBodyInit } from 'es-body-builder'
import JsonBigInt from 'json-bigint'
import { CountParams, SearchParams } from './types'
import { Client } from './Client'
import { objectKeyToSnakeCase } from './utils'

/**
 * QueryBuilder 类
 * 继承自 BodyBuilder
 * 增加 ES 相关查询接口
 */
export class QueryBuilder extends BodyBuilder {
  /**
   * 构造函数
   * @param client Client 实例
   * @param keyPrefix key 前缀，统一为所有 key 增加的前缀
   * @param searchBody 查询语句初始化数据，用于 clone
   */
  constructor(private client: Client, keyPrefix?: string, searchBody?: SearchBodyInit) {
    super(keyPrefix, searchBody)
  }

  /**
   * 处理长整型溢出的问题
   * @param response
   * @returns
   */
  private transfer<T>(response: TransportResult<estypes.SearchResponse<T>>) {
    const { body, meta, statusCode, ...rest } = response
    return new Promise<estypes.SearchResponse<T>>(async (resolve, reject) => {
      try {
        let payload = ''
        for await (const chunk of body as any) {
          payload += chunk
        }
        const bigintJson = JsonBigInt({ storeAsString: true })
        const parsedBody = bigintJson.parse(payload)
        // 错误处理
        const options = meta.request.options
        const ignoreStatusCode =
          Array.isArray(options.ignore) && options.ignore.indexOf(statusCode!) > -1
        if (!ignoreStatusCode && statusCode! >= 400) {
          const error = new errors.ResponseError({ body: parsedBody, meta, statusCode, ...rest })
          reject(error)
        } else {
          resolve(parsedBody)
        }
      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * 格式化 es 返回的数据结构
   * @param response
   * @param count 是否需要 count, 默认不返回
   * @returns
   */
  private formatSearchResponse<T>(response: estypes.SearchResponse<T>): {
    list: T[]
    sort?: any[]
  }
  private formatSearchResponse<T>(
    response: estypes.SearchResponse<T>,
    count: true
  ): { list: T[]; total: number; sort?: any[] }
  private formatSearchResponse<T>(
    response: estypes.SearchResponse<T>,
    count?: true
  ): { list: T[]; total?: number; sort?: any[] } {
    const { hits, total } = response.hits
    const list: T[] = []
    const sort: any[] = []
    hits.forEach((h) => {
      list.push(h._source!)
      // 仅查询带有排序条件的才会有该值
      if (h.sort) {
        sort.push(h.sort)
      }
    })
    if (count === true) {
      let finalTotal = 0
      if (typeof total === 'number') {
        finalTotal = total
      } else if (total) {
        finalTotal = total.value
      }
      return { total: finalTotal, list, sort }
    }
    return { list, sort }
  }

  /**
   * 获取查询的参数
   * @param index 索引
   * @param count 是否查询总数
   * @returns
   */
  private getSearchParams(params: SearchParams = {}) {
    const { index } = params
    const _index = index || this.client.index
    const body = this.build()
    const param = objectKeyToSnakeCase(params)
    return {
      ...param,
      ...body,
      index: _index,
    }
  }

  /**
   * 使用 query builder 查询, 不返回 count
   * @param params 查询参数
   * @returns
   */
  public async search<T>(params?: SearchParams) {
    const _params = this.getSearchParams(params)
    const result = await this.client.esClient.search<T>(_params)
    return this.formatSearchResponse(result)
  }

  /**
   * 使用 query builder 查询, 并返回 count
   * @param params 查询参数
   * @returns
   */
  public async searchAndCount<T>(params?: SearchParams) {
    const _params = this.getSearchParams({ ...params, trackTotalHits: true })
    const result = await this.client.esClient.search<T>(_params)
    return this.formatSearchResponse(result, true)
  }

  /**
   * 以 stream 的形式查询，不返回 count
   * @param params 查询参数
   * @returns
   */
  public async searchAsStream<T>(params?: SearchParams) {
    const _params = this.getSearchParams(params)
    const streamResult = await this.client.esClient.search<T>(_params, {
      asStream: true,
      meta: true,
    })

    const result = await this.transfer<T>(streamResult)
    return this.formatSearchResponse(result)
  }

  /**
   * 以 stream 的形式查询，并返回 count
   * @param params 查询参数
   * @returns
   */
  public async searchAsStreamAndCount<T>(params?: SearchParams) {
    const _params = this.getSearchParams({ ...params, trackTotalHits: true })
    const streamResult = await this.client.esClient.search<T>(_params, {
      asStream: true,
      meta: true,
    })

    const result = await this.transfer<T>(streamResult)
    return this.formatSearchResponse(result, true)
  }

  /**
   * 数量统计
   * @param params 查询参数
   * @returns
   */
  public async count(params: CountParams = {}): Promise<number> {
    const _params = this.getSearchParams(params)
    const result = await this.client.esClient.count(_params)
    return result.count
  }

  /**
   * 通过查询删除
   * @param index
   * @returns
   */
  public async delete(index?: string) {
    const _index = index || this.client.index
    const body = this.build()
    const response = await this.client.esClient.deleteByQuery({
      index: _index,
      ...body,
    } as any)
    const { total, deleted, failures } = response
    return { total, deleted, failures }
  }

  /**
   * 复制一份 query builder
   * @returns
   */
  public clone() {
    return new QueryBuilder(this.client, this.keyPrefix, this.searchBody)
  }
}
