#!/bin/bash
cd /home/z/my-project
export DATABASE_URL="postgresql://neondb_owner:npg_vRfGm1u6XDtq@ep-fragrant-brook-adhkdpuc-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require"
export NODE_OPTIONS="--max-old-space-size=4096"

while true; do
  echo "$(date +%H:%M:%S): Starting smart proxy..." >> /home/z/my-project/watcher.log
  node /home/z/my-project/smart-proxy.js >> /home/z/my-project/watcher.log 2>&1
  EXIT=$?
  echo "$(date +%H:%M:%S): Smart proxy exited ($EXIT), restarting in 3s..." >> /home/z/my-project/watcher.log
  sleep 3
done
