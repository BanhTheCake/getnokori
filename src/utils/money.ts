/**
 * MoneyMoneyMoney
 * https://i.kym-cdn.com/entries/icons/mobile/000/026/111/4917038d8bbd7fe362bed691690c7da4.jpg
 *
 */

/**
 * Define our U.S. money format constantly
 */
const _twoDecimalUSFormat = new Intl.NumberFormat('en-US', {
  style: 'decimal',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

/**
 * Define our U.S. money format constantly with currency symbol
 */
const _twoDecimalUSFormatWithSymbol = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  currencyDisplay: 'narrowSymbol',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

/**
 * Returns a number formatted to two decimal USD format
 *
 * E.g. 139.2 => 139.20
 */
export const toTwoDecimalUSDFormat = (number) => {
  return +_twoDecimalUSFormat.format(number).replace(/[^\d.-]/gim, '')
}

export const toTwoDecimalUSDFormatWithSymbol = (number) => {
  return _twoDecimalUSFormatWithSymbol.format(number)
}

/**
 * Returns a number formatted to two decimal USD format
 *
 * E.g. 139.2 => 13920
 */
const toTwoDecimalUSDStripeFormat = (number) => {
  return +_twoDecimalUSFormat.format(number).replace(/[^\d-]/gim, '')
}

export default {
  toTwoDecimalUSDFormat,
  toTwoDecimalUSDFormatWithSymbol,
  toTwoDecimalUSDStripeFormat,
}
