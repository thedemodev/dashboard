NODE_ENV=testing \
SILENT_START=true \
PAGE_SIZE=3 \
DASHBOARD_SERVER="http://localhost:9002" \
PORT=9002 \
STORAGE_ENGINE="@userappstore/storage-redis" \
REDIS_URL=redis://localhost:6379 \
npm test