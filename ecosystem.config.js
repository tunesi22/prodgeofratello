module.exports = {
  apps: [
    {
      name: 'prodgeo-backend',
      cwd: './backend',
      script: 'dist/backend/index.js',
      instances: 1,
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      env_production: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'prodgeo-frontend',
      cwd: './frontend',
      script: 'node_modules/.bin/next',
      args: 'start -p 3002',
      instances: 1,
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      env_production: {
        NODE_ENV: 'production',
      },
    },
  ],
}
