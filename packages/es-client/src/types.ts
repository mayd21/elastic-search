export interface SearchParams {
  index?: string
  allowNoIndices?: boolean
  trackTotalHits?: boolean
  ignoreUnavailable?: boolean
}

export interface CountParams {
  index?: string
  allowNoIndices?: boolean
  ignoreUnavailable?: boolean
}
