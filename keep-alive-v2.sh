#!/bin/bash
cd /home/z/my-project
while true; do
  node node_modules/.bin/next start -p 3000 >> /home/z/my-project/dev.log 2>&1
  EXIT_CODE=$?
  echo "Server died with exit code $EXIT_CODE at $(date). Restarting in 2s..." >> /home/z/my-project/watchdog.log
  sleep 2
done
