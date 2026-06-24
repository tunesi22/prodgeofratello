module.exports = {
  apps: [
    {
      name: 'prodgeo-backend',
      script: 'dist/backend/index.js',
      instances: 1,
      autorestart: true,
      watch: false,
      env_production: {
        NODE_ENV: 'production',
      },
    },
  ],
}
