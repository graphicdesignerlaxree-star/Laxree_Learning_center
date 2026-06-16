#!/bin/bash
trap 'echo "Got signal: $?" >> /home/z/my-project/server-signals.log' SIGHUP SIGINT SIGTERM SIGKILL
cd /home/z/my-project
export DATABASE_URL="postgresql://neondb_owner:npg_vRfGm1u6XDtq@ep-fragrant-brook-adhkdpuc-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require"
export NODE_OPTIONS="--max-old-space-size=4096"
while true; do
  echo "$(date): Starting server..." >> /home/z/my-project/server-signals.log
  node .next/standalone/server.js 2>&1
  echo "$(date): Server exited with code $?" >> /home/z/my-project/server-signals.log
  sleep 1
done
