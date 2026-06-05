module.exports = {
  apps: [
    {
      name: 'geo-backend',
      cwd: './backend',
      script: 'node',
      args: 'dist/index.js',
      instances: 1,
      autorestart: true,
      watch: false,
      env_production: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'geo-frontend',
      cwd: './frontend',
      script: 'node_modules/.bin/next',
      args: 'start -p 3000',
      instances: 1,
      autorestart: true,
      watch: false,
      env_production: {
        NODE_ENV: 'production',
      },
    },
  ],
}
