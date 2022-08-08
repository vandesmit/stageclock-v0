module.exports = {
  apps: [
    {
      name: 'StageClock',
      exec_mode: 'cluster',
      instances: 'max',
      script: './.output/server/index.mjs',
      env: {
        PORT: '3002'
      }
    }
  ]
}
