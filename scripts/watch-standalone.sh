#!/bin/sh
set -eu

npm run build

babel src --out-dir dist --extensions .ts,.tsx --watch &
babel_pid=$!

cleanup() {
  kill "$babel_pid" 2>/dev/null || true
  wait "$babel_pid" 2>/dev/null || true
}

trap cleanup EXIT INT TERM
node --watch --experimental-ffi --conditions=browser dist/standalone.js
