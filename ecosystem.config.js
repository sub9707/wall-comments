module.exports = {
  apps: [
    {
      name: "wall-comments",
      script: "npm",
      args: "start",
      cwd: __dirname,
      env: {
        NODE_ENV: "production",
        PORT: 8443,
      },
      autorestart: true,
      max_restarts: 20,
      restart_delay: 2000,
      // A memory leak anywhere over an 8-12h run shouldn't take the whole
      // kiosk down — restart cleanly well before it could matter.
      max_memory_restart: "512M",
    },
  ],
};
