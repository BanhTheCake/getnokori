import FrequenciesService from '@/services/frequencies/index'
import type { NextFunction, Request, Response } from 'express'
import { BaseMetrics, MetricsLevel2, MetricsLevel3 } from '@/enums/frequencies/FrequencyMetrics.enums'

interface freqArgs { 
  metric: BaseMetrics
  metricLevel2?: MetricsLevel2
  metricLevel3?: MetricsLevel3
}

export default () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const platformAccountId = req.user.platformAccountId
    if(!platformAccountId){
      logger.error('No platformAccountId found in request.user', { path: req.baseUrl })
      return next()
    }

    // if(req.baseUrl?.startsWith('/v1/accounts')){
    //   const metric = flattenMetrics({ metric: BaseMetrics.API, metricLevel2: MetricsLevel2.AUTH, metricLevel3: MetricsLevel3.ACCOUNTS })
    //   FrequenciesService.increment(accountId, metric, 1 )
    // }

    if(req.baseUrl?.startsWith('/v1/auth')){
      const metric = flattenMetrics({ metric: BaseMetrics.USAGE, metricLevel2: MetricsLevel2.AUTH, metricLevel3: MetricsLevel3.REQUESTS })
      FrequenciesService.increment(platformAccountId, metric, 1 )
    }

    // if(req.baseUrl?.startsWith('/v1/billing/plans')){
    //   const metric = flattenMetrics({ metric: BaseMetrics.API, metricLevel2: MetricsLevel2.BILLING, metricLevel3: MetricsLevel3.PLANS })
    //   FrequenciesService.increment(platformAccountId, metric, 1 )
    // }

    // if(req.baseUrl?.startsWith('/v1/frequencies')){
    //   const metric = flattenMetrics({ metric: BaseMetrics.API, metricLevel2: MetricsLevel2.FREQUENCIES, metricLevel3: MetricsLevel3.FREQUENCIES })
    //   FrequenciesService.increment(platformAccountId, metric, 1 )
    // }

    if(req.baseUrl?.startsWith('/v1/mail')){
      FrequenciesService.increment(platformAccountId,
        flattenMetrics({ metric: BaseMetrics.USAGE, metricLevel2: MetricsLevel2.EMAIL, metricLevel3: MetricsLevel3.REQUESTS }),
        1,
      )
    }

    if(req.baseUrl?.startsWith('/v1/hubs')){
      FrequenciesService.increment(platformAccountId,
        flattenMetrics({ metric: BaseMetrics.USAGE, metricLevel2: MetricsLevel2.HUBS, metricLevel3: MetricsLevel3.REQUESTS }),
        1,
      )
    }

    if(req.baseUrl?.startsWith('/v1/queries')){
      FrequenciesService.increment(platformAccountId,
        flattenMetrics({ metric: BaseMetrics.USAGE, metricLevel2: MetricsLevel2.HUBS, metricLevel3: MetricsLevel3.REQUESTS }),
        1,
      )
    }

    if(req.baseUrl?.startsWith('/v1/sources')){
      FrequenciesService.increment(platformAccountId,
        flattenMetrics({ metric: BaseMetrics.USAGE, metricLevel2: MetricsLevel2.HUBS, metricLevel3: MetricsLevel3.REQUESTS }),
        1,
      )
    }

    if(req.baseUrl?.startsWith('/v1/triggers')){
      FrequenciesService.increment(platformAccountId,
        flattenMetrics({ metric: BaseMetrics.USAGE, metricLevel2: MetricsLevel2.HUBS, metricLevel3: MetricsLevel3.REQUESTS }),
        1,
      )
    }

    if(req.baseUrl?.startsWith('/v1/ai')){
      FrequenciesService.increment(platformAccountId,
        flattenMetrics({ metric: BaseMetrics.USAGE, metricLevel2: MetricsLevel2.API, metricLevel3: MetricsLevel3.REQUESTS }),
        1,
      )
    }

    if(req.baseUrl?.startsWith('/v1/classifiers')){
      FrequenciesService.increment(platformAccountId,
        flattenMetrics({ metric: BaseMetrics.USAGE, metricLevel2: MetricsLevel2.CLASSIFIERS, metricLevel3: MetricsLevel3.REQUESTS }),
        1,
      )
    }

    if(req.baseUrl?.startsWith('/v1/embeddings')){
      FrequenciesService.increment(platformAccountId,
        flattenMetrics({ metric: BaseMetrics.USAGE, metricLevel2: MetricsLevel2.EMBEDDINGS, metricLevel3: MetricsLevel3.REQUESTS }),
        1,
      )
    }

    if(req.baseUrl?.startsWith('/v1/vectors')){
      FrequenciesService.increment(platformAccountId,
        flattenMetrics({ metric: BaseMetrics.USAGE, metricLevel2: MetricsLevel2.VECTORS, metricLevel3: MetricsLevel3.REQUESTS }),
        1,
      )
    }

    return next()
  }
}

function flattenMetrics(metrics: freqArgs){
  return Object.values(metrics).filter(metric => metric).join('.')
}
