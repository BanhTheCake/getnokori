const MySQLSelectAll = {
  meta: {
    engine: 'mysql',
    hubId: 'lola.hub.lJngLYlhiy0KURyFAih',
  },
  config: {
    hubId: 'lola.hub.lJngLYlhiy0KURyFAih',
    source: {
      engine: 'mysql',
      sourceId: 'lola.hsrc.zknnTOCdG3VIihiu5D2',
    },
    command: 'SELECT',
    query: {
      queryId: 'lola.q.zvlb2ubu4pSxI35sHUU',
      query: 'SELECT * FROM accounts',
    },
  },
}

const MySQLSelectAllWContext = {
  meta: {
    engine: 'mysql',
    hubId: 'lola.hub.lJngLYlhiy0KURyFAih',
  },
  config: {
    hubId: 'lola.hub.lJngLYlhiy0KURyFAih',
    source: {
      engine: 'mysql',
      sourceId: 'lola.hsrc.zknnTOCdG3VIihiu5D2',
    },
    context: [{
      key: 'platformAccountId',
      value: 'lola.acct.Ng2kvR5c1WKBHLJfbvekW1',
    }],
    command: 'SELECT',
    query: {
      queryId: 'lola.q.ycn4vIwRho4DTTwDIdG',
      query: 'SELECT * FROM accounts WHERE platformAccountId = \'{{platformAccountId}}\'',
    },
  },
}

const MySQLSelectAllWGreaterThanConstraints = {
  meta: {
    engine: 'mysql',
    hubId: 'lola.hub.lJngLYlhiy0KURyFAih',
  },
  config: {
    hubId: 'lola.hub.lJngLYlhiy0KURyFAih',
    source: {
      engine: 'mysql',
      sourceId: 'lola.hsrc.zknnTOCdG3VIihiu5D2',
    },
    context: [{
      key: 'number',
      value: 5,
    }],
    constraints: [
      {
        key: 'number',
        operator: 'greater_than',
        value: 6,
      },
    ],
    command: 'SELECT',
    query: {
      queryId: 'lola.q.ycn4vIwRho4DTTwDIdG',
      query: 'SELECT {{number}}',
    },
  },
}

export default {
  MySQLSelectAll,
  MySQLSelectAllWContext,
  MySQLSelectAllWGreaterThanConstraints,
}
