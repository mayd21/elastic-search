# Risk Elastic Search

基于 [Elasticsearch Node.js client](https://github.com/elastic/elasticsearch-js) 封装的 ES 查询工具包

## Install

```bash
npm install es-client
```

## Usage

```ts
import { Client, In, Between, Like, Nested } from '@finance/risk-es'

// es nodes
const nodes = ['']
// es index
const index = ''

const es = new Client({nodes})

es.useIndex(index)
const result = await es.createQueryBuilder
  // 必须满足 and 内的每一个条件
  .and({
    a: 1,
    b: 2,
    c: Nested({ c1: '3', c2: '4' }),
    d: Like('*d1*'),
    e: Between(1, 2),
    e2: Between(1, 2, false),
  })
  // 需至少满足 andOr 内多个条件内的一个
  .andOr({ f: In([1, 2, 3]), f2: 'f2_value' })
  // use clause query
  // 必须不能为 andNot 的任一种条件
  .andNot((q) => q.and({ g: 'g_value', h: Nested((q) => q.and({ i: 'i_value' })) }))
  .size(10)
  .from(10)
  .sort('s1', 'desc')
  .sort(['s2', 's3'])
  .sort({ a: 'asc', b: 'desc' })
  .search()
```

## API

### ES Client

#### const es = new Client(options)

client 实例化
> options 实例化参数与 [Elasticsearch Node.js client](https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/basic-config.html) 的实例化参数相同

#### es.useIndex(index: string)

设置查询使用的索引，后续查询在不指定索引的情况下默认使用该索引
> return void

#### es.checkIndexExists(index?: string): boolean

查询索引是否存在
> index 缺省的情况下查询 useIndex 配置的索引  

#### es.createQueryBuilder(): QueryBuilder

创建 QueryBuilder 对象

---

### QueryBuilder

> 类型声明  
>  
> ```type Items = Record<string, Value> | ((q: BodyBuilder) => BodyBuilder)```  

#### qb.and(items: Items): this

添加必要条件，支持传入键值对或者子查询函数

#### qb.or(items: Items): this

添加可选条件，需至少满足 `items` 内的一个条件，支持传入键值对或者子查询函数

#### qb.andOr(items: Items): this

`or` 的别名

#### qb.not(items: Items): this

添加否定条件，不能包含 `items` 内的任意一个条件，支持传入键值对或者子查询函数

#### qb.andNot(items: Items): this

`not` 的别名

#### qb.sort(field: SortField, order: SortOrder = 'asc'): this

排序方式
>```type SortOrder = 'asc' | 'desc'```  
>
>```type SortField = string | Record<string, SortOrder>```

#### qb.size(size: number): this

分页大小

#### qb.from(from: number): this

分页起始偏移量

#### qb.clone(): QueryBuilder

复制一份 QueryBuilder  

#### qb.search\<T\>(params: SearchParams): Promise<{count: number, list: T[]}>

查询
> 可传入 index， 缺失使用 useIndex(index) 指定的索引

#### qb.searchAsStream\<T\>(params: SearchParams): Promise<{count: number, list: T[]}>

以流的方式查询，默认进行 JSON 反序列化，并对处理 JSON 内长整型，将其转为为 string 返回
> 可传入 index， 缺失使用 useIndex(index) 指定的索引

#### qb.count\<T\>(params: CountParams): Promise\<number\>

统计数量
> 可传入 index， 缺失使用 useIndex(index) 指定的索引

#### qb.delete\<T\>(index?: string): Promise\<{total: number; deleted: number; failures: unknown[]}>

按查询条件删除
> 可传入 index， 缺失使用 useIndex(index) 指定的索引

---

### Operator

#### \<T>In(value: T[])

`In` 操作，指定字段在 `value` 集合内
> `In([1, 2, 3])`

#### Like(value: string)

模糊匹配，`value` 为使用 `*` 通配符的字符串
> `Like('*hello*')`

#### Between(from: number, to: number, inclusive = true)

范围匹配
> from: 起始值
>  
> to: 终止值
>  
> inclusive: 是否是闭区间，default = true

#### LessThan(value: number)

小于操作

#### LessThanOrEqual(value: number)

小于等于操作

#### MoreThan(value: number)

大于操作

#### MoreThanOrEqual(value: number)

大于等于操作

#### Exists()

对应的字段是否存在

#### Nested(value: Items, ignoreUnmapped?: boolean)

ES 的嵌套内对象查询，支持传入键值对或子查询函数

#### Match(value: Items)

match 分词分析查询

#### Regexp(value: Items)

正则匹配查询
