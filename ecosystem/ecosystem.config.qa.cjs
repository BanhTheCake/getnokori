const fs = require('node:fs');

(async () => {

  const ports = [
    4677,
    4678,
  ]

  const configs = []

  for(const port of ports){
    configs.push({
      name: `api.qa.nokori.com-${port}`,
      script: 'npm',
      cwd: '/home/ubuntu/app/api.qa.nokori/',
      args: 'start',
      env_qa: {
        NODE_ENV: 'qa',
        TZ: 'UTC',
        PORT: port,
        LOG_LEVEL: 'info',
      },
      instances: 1,
      exec_mode: 'fork',
    })
  }

  fs.writeFileSync('ecosystem.config.qa.json', JSON.stringify(configs, null, 2))
})()
