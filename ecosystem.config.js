module.exports = {
    apps: [
      {
        name: 'nodejs-m3u-parser',
        script: 'src/server.js',
        instances: 1,
        exec_mode: 'fork',
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