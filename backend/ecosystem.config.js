module.exports = {
  apps: [
    {
      name: 'prodgeo-backend',
      script: 'node_modules/.bin/tsx',
      args: 'index.ts',
      instances: 1,
      autorestart: true,
      watch: false,
      env_production: {
        NODE_ENV: 'production',
      },
    },
  ],
}
