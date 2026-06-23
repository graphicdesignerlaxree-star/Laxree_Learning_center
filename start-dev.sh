#!/bin/bash
cd /home/z/my-project
export DATABASE_URL='postgresql://neondb_owner:npg_vRfGm1u6XDtq@ep-fragrant-brook-adhkdpuc-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&connect_timeout=30&pool_timeout=30'
export DIRECT_URL='postgresql://neondb_owner:npg_vRfGm1u6XDtq@ep-fragrant-brook-adhkdpuc.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&connect_timeout=30'
exec /home/z/my-project/node_modules/.bin/next dev -p 3000
