import { BaseMetrics, MetricsLevel2, MetricsLevel3 } from '@/enums/frequencies/FrequencyMetrics.enums'
import { deductMoney } from '@/services/billing/transactions.service'
import { toTwoDecimalUSDFormat } from '@/utils/money'

const generationSubscriptions = [
  `${BaseMetrics.BILLING}.${MetricsLevel2.CLASSIFICATION}.${MetricsLevel3.UNITS}`,
  `${BaseMetrics.BILLING}.${MetricsLevel2.GENERATION}.${MetricsLevel3.UNITS}`,
  `${BaseMetrics.BILLING}.${MetricsLevel2.SUMMARIZE}.${MetricsLevel3.UNITS}`,
]

const hubsSubscriptions = [
  `${BaseMetrics.BILLING}.${MetricsLevel2.HUBS}.${MetricsLevel3.REQUESTS}`,
]

// Handles creating a billing transaction for a given event
export const notify = async (accountId: string, event: string, value: number) => {  
  if(generationSubscriptions.includes(event)){
    const price = 0.19 / 1000
    const cost = toTwoDecimalUSDFormat(value * price)
    await deductMoney({
      accountId, 
      productId: 'generation',
      amount: cost,
      description: `Text Generation: ${value} Units`,
    })
  }

  if(hubsSubscriptions.includes(event)){
    const price = 0.99 / 100000
    const cost = toTwoDecimalUSDFormat(value * price)
    await deductMoney({
      accountId, 
      productId: 'hubs',
      amount: cost,
      description: `Hubs: ${value} Requests`,
    })
  }

  return true
}

export const getBalance = async (accountId: string) => {
  const currentPeriod = new Date().toISOString().split('T')[0]
}

export default {
  notify,
}
