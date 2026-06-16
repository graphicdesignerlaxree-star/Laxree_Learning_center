#!/bin/bash
if ! ss -tlnp | grep -q ":3000 "; then
  cd /home/z/my-project
  export DATABASE_URL="postgresql://neondb_owner:npg_vRfGm1u6XDtq@ep-fragrant-brook-adhkdpuc-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require"
  export NODE_OPTIONS="--max-old-space-size=4096"
  echo "$(date): Starting server..." >> /home/z/my-project/ensure.log
  node /home/z/my-project/smart-proxy.js >> /home/z/my-project/ensure.log 2>&1 &
  sleep 5
fi
