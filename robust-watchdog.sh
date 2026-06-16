#!/bin/bash
cd /home/z/my-project
while true; do
  node .next/standalone/server.js >> /home/z/my-project/dev.log 2>&1
  echo "Restart at $(date)" >> /home/z/my-project/watchdog.log
  sleep 2
done
