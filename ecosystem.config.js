module.exports = {
  apps: [
    {
      name: "api",
      script: "./src/server.js",
      instances: "max",
      exec_mode: "cluster",
      watch: false,
      increment_var: "PORT",
      autorestart: true,
      max_memory_restart: "500M",
      env: {
        NODE_ENV: "development",
        PORT: 3333,
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 3001,
      },
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      log_file: "logs/app.log",
      error_file: "logs/err.log",
      out_file: "logs/out.log",

      merge_logs: true,
      time: true,
    },
  ],
};
