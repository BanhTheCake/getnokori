const fs = require('fs')
const dotenv = require('dotenv')
dotenv.config()

const init = async() => {
  const globalConfig = await fs.readFileSync('.env.global')
  const envSpecificConfig = await fs.readFileSync('.env.qa')

  await fs.writeFileSync('.env', '#### QA - Global Environment Config ###\r\n')
  await fs.appendFileSync('.env', `${globalConfig.toString()}\r\n`)
  await fs.appendFileSync('.env', '\r\n #### Environment Specific Config ###\r\n')
  await fs.appendFileSync('.env', envSpecificConfig)
}

init()
