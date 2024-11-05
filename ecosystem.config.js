module.exports = {
    apps: [
      {
        name: 'nodejs-m3u-parser',
        script: 'src/server.js',
        instances: 'max',
        exec_mode: 'cluster',
        env: {
          NODE_ENV: 'development',
          PORT: 8000
        },
        env_production: {
          NODE_ENV: 'production',
          PORT: 8000
        }
      }
    ]
  };