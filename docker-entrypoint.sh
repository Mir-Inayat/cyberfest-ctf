#!/bin/bash
set -euo pipefail

WORKERS=${WORKERS:-1}
WORKER_CLASS=${WORKER_CLASS:-gevent}
ACCESS_LOG=${ACCESS_LOG:--}
ERROR_LOG=${ERROR_LOG:--}
WORKER_TEMP_DIR=${WORKER_TEMP_DIR:-/dev/shm}
SECRET_KEY=${SECRET_KEY:-}
SKIP_DB_PING=${SKIP_DB_PING:-false}
PORT=${PORT:-8000}

echo "[ INFO ] Starting CTFd with configuration:"
echo "[ INFO ] - PORT: $PORT"
echo "[ INFO ] - WORKERS: $WORKERS"
echo "[ INFO ] - WORKER_CLASS: $WORKER_CLASS"
echo "[ INFO ] - DATABASE_URL: ${DATABASE_URL:-not set}"
echo "[ INFO ] - REDIS_URL: ${REDIS_URL:-not set}"
echo "[ INFO ] - REVERSE_PROXY: ${REVERSE_PROXY:-not set}"
echo "[ INFO ] - TRUSTED_HOSTS: ${TRUSTED_HOSTS:-not set}"

# Check that a .ctfd_secret_key file or SECRET_KEY envvar is set
if [ ! -f .ctfd_secret_key ] && [ -z "$SECRET_KEY" ]; then
    if [ $WORKERS -gt 1 ]; then
        echo "[ ERROR ] You are configured to use more than 1 worker."
        echo "[ ERROR ] To do this, you must define the SECRET_KEY environment variable or create a .ctfd_secret_key file."
        echo "[ ERROR ] Exiting..."
        exit 1
    fi
fi

# Skip db ping if SKIP_DB_PING is set to a value other than false or empty string
if [[ "$SKIP_DB_PING" == "false" ]]; then
  # Ensures that the database is available
  python ping.py
fi

# Initialize database
flask db upgrade

# Fix Redirect Loop (Disable Email Verification)
export PYTHONPATH=$PYTHONPATH:/opt/CTFd
python scripts/fix_loop.py


# Start CTFd
echo "Starting CTFd on 0.0.0.0:$PORT"
echo "[ INFO ] Starting gunicorn with preload for faster startup"
exec gunicorn 'CTFd:create_app()' \
    --bind "0.0.0.0:$PORT" \
    --workers $WORKERS \
    --worker-tmp-dir "$WORKER_TEMP_DIR" \
    --worker-class "$WORKER_CLASS" \
    --access-logfile "$ACCESS_LOG" \
    --error-logfile "$ERROR_LOG" \
    --timeout 120 \
    --log-level info

