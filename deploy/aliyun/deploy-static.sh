#!/usr/bin/env bash
set -euo pipefail

REF="${1:?Usage: deploy-static.sh <git-ref> [port]}"
PORT="${2:-8080}"
APP_ROOT="/opt/xunmove-web"
RELEASE_DIR="${APP_ROOT}/releases/${REF}"
ARCHIVE_URL="https://codeload.github.com/polarislove36/coros-running-coach/tar.gz/${REF}"
TMP_DIR="$(mktemp -d)"

cleanup() {
  rm -rf "${TMP_DIR}"
}
trap cleanup EXIT

for command in curl tar npm python3 systemctl; do
  if ! command -v "${command}" >/dev/null 2>&1; then
    echo "Missing required command: ${command}" >&2
    exit 1
  fi
done

curl -fsSL "${ARCHIVE_URL}" -o "${TMP_DIR}/source.tar.gz"
tar -xzf "${TMP_DIR}/source.tar.gz" -C "${TMP_DIR}"
SOURCE_DIR="$(find "${TMP_DIR}" -mindepth 1 -maxdepth 1 -type d | head -n 1)"

cd "${SOURCE_DIR}/web"
npm ci
npm run build

install -d "${RELEASE_DIR}"
cp -a dist/. "${RELEASE_DIR}/"
install -m 0755 "${SOURCE_DIR}/deploy/aliyun/serve_spa.py" "${RELEASE_DIR}/serve_spa.py"

install -d "${APP_ROOT}"
ln -sfn "${RELEASE_DIR}" "${APP_ROOT}/current"

PYTHON_BIN="$(command -v python3)"
cat > /etc/systemd/system/xunmove-web.service <<EOF
[Unit]
Description=XUNMOVE frontend test site
After=network.target

[Service]
Type=simple
WorkingDirectory=${APP_ROOT}/current
ExecStart=${PYTHON_BIN} ${APP_ROOT}/current/serve_spa.py --directory ${APP_ROOT}/current --port ${PORT}
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable --now xunmove-web.service
systemctl restart xunmove-web.service

for _ in 1 2 3 4 5; do
  if curl -fsS "http://127.0.0.1:${PORT}/" >/dev/null; then
    break
  fi
  sleep 1
done

curl -fsS "http://127.0.0.1:${PORT}/" >/dev/null
systemctl --no-pager --full status xunmove-web.service
echo "XUNMOVE is serving git ref ${REF} on port ${PORT}."
