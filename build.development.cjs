const fs = require('fs')
const dotenv = require('dotenv')
dotenv.config()

const files = {
  development: '.env.development',
  qa: '.env.qa',
  production: '.env.production',
}

const init = async() => {
  const globalConfig = await fs.readFileSync('.env.global')
  const envSpecificConfig = await fs.readFileSync('.env.development')

  await fs.writeFileSync('.env', '#### Global Environment Config ###\r\n')
  await fs.appendFileSync('.env', `${globalConfig.toString()}\r\n`)
  await fs.appendFileSync('.env', '\r\n #### Environment Specific Config ###\r\n')
  await fs.appendFileSync('.env', envSpecificConfig)
}

init()
