#!/bin/bash
cd /home/z/my-project
export DATABASE_URL="postgresql://neondb_owner:npg_vRfGm1u6XDtq@ep-fragrant-brook-adhkdpuc-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require"
export NODE_OPTIONS="--max-old-space-size=4096"

echo "$(date +%H:%M:%S): Starting server system..." >> /home/z/my-project/server.log

# Start proxy wrapper (this stays alive)
node /home/z/my-project/server-wrapper.js &
PROXY_PID=$!
echo "$(date +%H:%M:%S): Proxy started (PID=$PROXY_PID)" >> /home/z/my-project/server.log

# Function to start/restart Next.js
start_nextjs() {
  cd /home/z/my-project
  PORT=3001 node .next/standalone/server.js >> /home/z/my-project/server.log 2>&1 &
  echo $!
}

# Start Next.js initially
NEXTJS_PID=$(start_nextjs)
echo "$(date +%H:%M:%S): Next.js started (PID=$NEXTJS_PID)" >> /home/z/my-project/server.log

# Wait for Next.js to be ready
sleep 5

# Monitor and restart loop
while kill -0 $PROXY_PID 2>/dev/null; do
  if ! kill -0 $NEXTJS_PID 2>/dev/null; then
    echo "$(date +%H:%M:%S): Next.js died, restarting..." >> /home/z/my-project/server.log
    sleep 2
    NEXTJS_PID=$(start_nextjs)
    echo "$(date +%H:%M:%S): Next.js restarted (PID=$NEXTJS_PID)" >> /home/z/my-project/server.log
    sleep 5
  fi
  sleep 3
done

echo "$(date +%H:%M:%S): Proxy died, exiting..." >> /home/z/my-project/server.log
