FROM python:3.11-slim-bookworm AS build

WORKDIR /opt/CTFd

# hadolint ignore=DL3008
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        build-essential \
        libffi-dev \
        libssl-dev \
        git \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* \
    && python -m venv /opt/venv

ENV PATH="/opt/venv/bin:$PATH"

# Copy only requirements first for better caching
COPY requirements.txt /opt/CTFd/
RUN pip install --no-cache-dir -r requirements.txt

# Copy plugin requirements and install
COPY CTFd/plugins /opt/CTFd/CTFd/plugins
RUN for d in CTFd/plugins/*; do \
        if [ -f "$d/requirements.txt" ]; then \
            pip install --no-cache-dir -r "$d/requirements.txt";\
        fi; \
    done;


FROM python:3.11-slim-bookworm AS release
WORKDIR /opt/CTFd

# hadolint ignore=DL3008
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        libffi8 \
        libssl3 \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copy the entire application including themes, static files, database, and uploads
COPY --chown=1001:1001 . /opt/CTFd

# Ensure all frontend assets are present and accessible
RUN ls -la /opt/CTFd/CTFd/themes/ && \
    ls -la /opt/CTFd/CTFd/themes/core/static/ || true

RUN useradd \
    --no-log-init \
    --shell /bin/bash \
    -u 1001 \
    ctfd \
    && mkdir -p /var/log/CTFd /var/uploads \
    && chown -R 1001:1001 /var/log/CTFd /var/uploads /opt/CTFd \
    && chmod +x /opt/CTFd/docker-entrypoint.sh

COPY --chown=1001:1001 --from=build /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Set environment variables for Railway deployment
ENV SKIP_DB_PING=false
ENV DATABASE_URL="sqlite:////opt/CTFd/CTFd/ctfd.db"
ENV REDIS_URL=""
ENV REVERSE_PROXY=true
ENV WORKERS=1
ENV WORKER_CLASS=gevent

USER 1001
ENTRYPOINT ["/opt/CTFd/docker-entrypoint.sh"]
