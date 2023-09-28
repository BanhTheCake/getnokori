import exec from 'node:child_process'
import process from 'node:process'

(async () => {

  const dbs = [
    'docker/mysql.yml',
    'docker/postgres.yml',
    'docker/mariadb.yml',
  ]

  for(const db of dbs){
    process.stdout.write(`Starting ${db}...\r\n`)
    await exec.execSync(`docker compose -f ${db} up -d 2>&1 > /dev/null &`)
  }

})()
