module.exports = {
  apps: [
    {
      name: "samtek-vms-new",
      cwd: __dirname,
      script: "node_modules/next/dist/bin/next",
      args: "start",
      instances: "1",
      exec_mode: "fork",

      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      error_file: `${__dirname}/logs/vms_error.log`,
      out_file: `${__dirname}/logs/vms_output.log`,
      merge_logs: true,

      watch: false,
      max_memory_restart: "1G",
      autorestart: true,
      restart_delay: 4000,

      env: {
        NODE_ENV: "production",
        PORT: 80,
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 80,
      },
    },
  ],
};
