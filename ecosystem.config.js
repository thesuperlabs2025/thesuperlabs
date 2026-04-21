module.exports = {
  apps: [
    {
      name: 'api',
      script: './server.js',
      cwd: '/home/ec2-user/garments-erp/backend',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      }
    },
    {
      name: 'web',
      script: 'serve',
      env: {
        PM2_SERVE_PATH: './build',
        PM2_SERVE_PORT: 3000,
        PM2_SERVE_SPA: 'true',
        PM2_SERVE_HOMEPAGE: '/index.html'
      },
      cwd: '/home/ec2-user/garments-erp/frontend'
    }
  ]
};