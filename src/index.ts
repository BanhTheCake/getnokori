import ServerEnvironments from '@/enums/ServerEnvs.enum'
process.env.TZ = process.env.TZ || 'UTC'
process.env.NODE_ENV = process.env.NODE_ENV || ServerEnvironments.DEV

import 'dotenv/config'

const PORT = process.env.PORT || 4777

import app from '@/app'

app.listen(PORT, () => {
  logger.info(
    `Server is listening on ${PORT} in ${process.env.NODE_ENV} mode`,
  )
})
