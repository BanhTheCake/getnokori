import exec from 'node:child_process'
import process from 'node:process'

(async () => {

  const getIds = async () => {
    const result = await exec.execSync('docker ps -a -q')

    return result.toString().match(/.+/g)
  }

  const pids = await getIds()
  for(const pid of pids){
    process.stdout.write(`Terminating container ${pid}...\r\n`)
    await exec.execSync(`docker container stop ${pid}`)
  }

})()
