import { BodyBuilder } from './BodyBuilder'

export type TermLevel =
  | 'term'
  | 'terms'
  | 'wildcard'
  | 'range'
  | 'nested'
  | 'exists'
  | 'regexp'
  | 'match'

export type BoolClauseType = 'must' | 'should' | 'must_not'

export type BoolClauseBody = Partial<
  Record<BoolClauseType, (Partial<Record<TermLevel, unknown>> | BoolClauses)[]>
> & {
  minimum_should_match?: number
}

export interface BoolClauses {
  bool: BoolClauseBody
}

export type Primitive = string | number | boolean | undefined | null

export type TermOperator = (key: string) => Partial<Record<TermLevel, unknown>> | undefined

export type Value = TermOperator | Primitive

export type Items = Record<string, Value> | ((q: BodyBuilder) => BodyBuilder)

export type SortOrder = 'asc' | 'desc'

export type SortField = string | Record<string, SortOrder>

interface CommonQueryParams {
  size?: number
  from?: number
  sort?: Record<string, SortOrder>[]
  search_after?: any[]
  track_total_hits?: boolean
}

export interface SearchBody extends CommonQueryParams {
  query?: {
    bool: {
      filter: BoolClauses
    }
  }
}

export interface SearchBodyInit extends CommonQueryParams {
  boolClauses: BoolClauseBody
}
