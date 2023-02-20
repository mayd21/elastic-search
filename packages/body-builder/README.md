# Elastic Search DSL body builder

Elastic Search DSL body 构建工具

## Install

```bash
npm install es-body-builder
```

## Usage

```ts
import { BodyBuilder, In, Between, Like, Nested } from '@finance/es-body-builder'

const bb = new BodyBuilder()
  // 必须满足 and 内的每一个条件
  bb.and({
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
  .build()
```

## API

### BodyBuilder

> 类型声明  
>  
> ```type Items = Record<string, Value> | ((bb: BodyBuilder) => BodyBuilder)```  

#### bb.and(items: Items): this

添加必要条件，支持传入键值对或者子查询函数

#### bb.or(items: Items): this

添加可选条件，需至少满足 `items` 内的一个条件，支持传入键值对或者子查询函数

#### bb.andOr(items: Items): this

`or` 的别名

#### bb.not(items: Items): this

添加否定条件，不能包含 `items` 内的任意一个条件，支持传入键值对或者子查询函数

#### bb.andNot(items: Items): this

`not` 的别名

#### bb.sort(field: SortField, order: SortOrder = 'asc'): this

排序方式
>```type SortOrder = 'asc' | 'desc'```  
>
>```type SortField = string | Record<string, SortOrder>```

#### bb.size(size: number): this

分页大小

#### bb.from(from: number): this

分页起始偏移量

#### bb.clone(): BodyBuilder

复制一份 BodyBuilder

#### bb.build(): SearchBody

返回构建的 DSL body json 对象

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
