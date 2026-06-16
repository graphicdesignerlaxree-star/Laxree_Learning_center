#!/bin/bash
cd /home/z/my-project
export DATABASE_URL="postgresql://neondb_owner:npg_vRfGm1u6XDtq@ep-fragrant-brook-adhkdpuc-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require"
export NODE_OPTIONS="--max-old-space-size=4096"

HEALTH_URL="http://localhost:3000/"

while true; do
  echo "$(date +%H:%M:%S) Starting server..." >> /home/z/my-project/server.log
  
  # Start server in background
  node .next/standalone/server.js >> /home/z/my-project/server.log 2>&1 &
  SERVER_PID=$!
  
  # Wait for server to be ready
  for i in $(seq 1 30); do
    if curl -s -o /dev/null -w "" http://localhost:3000/ -m 2 2>/dev/null; then
      echo "$(date +%H:%M:%S) Server ready (PID=$SERVER_PID)" >> /home/z/my-project/server.log
      break
    fi
    sleep 1
  done
  
  # Monitor server health
  while kill -0 $SERVER_PID 2>/dev/null; do
    sleep 5
  done
  
  echo "$(date +%H:%M:%S) Server died (PID=$SERVER_PID), restarting..." >> /home/z/my-project/server.log
  sleep 1
done
