export enum BaseMetrics {
  API = 'api',
  USAGE = 'usage',
  BILLING = 'billing',
  NK_ANALYTICS = 'nk_analytics',
}

export enum MetricsLevel2 {
  API = 'api',
  AUTH = 'auth',
  CLASSIFIERS = 'classifiers',
  BILLING = 'billing',
  EMAIL = 'email',
  FREQUENCIES = 'frequencies',
  HUBS = 'hubs',
  EMBEDDINGS = 'embeddings',
  GENERATION = 'generation',
  SUMMARIZE = 'summarize',
  CLASSIFICATION = 'classification',
  VECTORS = 'vectors'
}

export enum MetricsLevel3 {
  ACCOUNTS = 'accounts',
  AUTH = 'auth',
  DECREMENT = 'decrement',
  EVENT = 'event',
  FREQUENCIES = 'frequencies',
  HUBS = 'hubs',
  INCREMENT = 'increment',
  PLANS = 'plans',
  QUERIES = 'queries',
  REQUESTS = 'requests',
  SENDS = 'sends',
  SOURCES = 'sources',
  TRIGGERS = 'triggers',
  UNITS = 'units',
  PROMPT_TOKENS = 'prompt_tokens',
  COMPLETION_TOKENS = 'completion_tokens',
}

export default BaseMetrics
