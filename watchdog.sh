#!/bin/bash
while true; do
  cd /home/z/my-project
  node /home/z/my-project/node_modules/.bin/next dev -p 3000 -H 0.0.0.0 >> /home/z/my-project/dev.log 2>&1
  EXIT_CODE=$?
  echo "Server died with exit code $EXIT_CODE at $(date). Restarting in 2s..." >> /home/z/my-project/watchdog.log
  sleep 2
done
