#!/bin/bash
cd /home/z/my-project
while true; do
  bun run dev >> /home/z/my-project/dev.log 2>&1
  EXIT_CODE=$?
  echo "[$(date)] Dev server exited ($EXIT_CODE). Restarting in 3s..." >> /home/z/my-project/watchdog.log
  sleep 3
done
