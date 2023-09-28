import 'dotenv/config'

export default {
  appApiUrl: process.env.APP_API_URL ?? '' as string,
  appUrl: process.env.APP_URL ?? '' as string,
  
  dbHost: process.env.DB_HOST ?? '' as string,
  dbPort: process.env.DB_PORT ?? 3306 as number,
  dbUser: process.env.DB_USER ?? '' as string,
  dbPass: process.env.DB_PASS ?? '' as string,
  dbSchema: process.env.DB_SCHEMA ?? '' as string,
  
  accessTokenSecret: process.env.ACCESS_TOKEN_SECRET ?? '' as string,
  StripeSecretKey: process.env.STRIPE_SECRET_KEY ?? '' as string,
  
  AwsAccessKeyId: process.env.AWS_ACCESS_KEY_ID ?? '' as string,
  AwsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? '' as string,
}
