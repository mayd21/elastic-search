import { Client as ESClient, ClientOptions } from '@elastic/elasticsearch'
import { QueryBuilder } from './QueryBuilder'

/**
 * Client 类
 * 封装 @elastic/elasticsearch 提供的 Client
 * 提供 createQueryBuilder 构建查询
 */
export class Client {
  // es 原始 client
  private _esClient: ESClient

  /**
   * 构造函数
   * @param options 客户端初始化参数
   */
  constructor(options: ClientOptions) {
    this._esClient = new ESClient(options)
  }

  // ES 索引
  private _index: string

  /**
   * 索引
   */
  get index() {
    return this._index
  }

  /**
   * ES 原生 client
   */
  get esClient() {
    return this._esClient
  }

  /**
   * 配置索引，后续在不指定索引的情况下默认使用该索引
   * @param index
   * @returns
   */
  public useIndex(index: string) {
    this._index = index
    return this
  }

  /**
   * 创建 query builder
   * @param keyPrefix 统一的 key 前缀，会为所有的 key 自动添加 keyPrefix. 前缀
   * @returns
   */
  public createQueryBuilder(keyPrefix?: string) {
    return new QueryBuilder(this, keyPrefix)
  }

  /**
   * 检查索引是否存在
   * @param index
   * @returns
   */
  public async checkIndexExists(index?: string) {
    const res = await this.esClient.indices.exists({ index: index || this._index })
    return res
  }
}
