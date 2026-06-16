#!/bin/bash
cd /home/z/my-project
export DATABASE_URL="postgresql://neondb_owner:npg_vRfGm1u6XDtq@ep-fragrant-brook-adhkdpuc-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require"
export NODE_OPTIONS="--max-old-space-size=4096"

while true; do
  echo "$(date +%H:%M:%S): Starting dev server..." >> /home/z/my-project/server.log
  npx next dev -p 3000 2>> /home/z/my-project/server.log
  EXIT=$?
  echo "$(date +%H:%M:%S): Server exited ($EXIT), restarting in 2s..." >> /home/z/my-project/server.log
  sleep 2
done
