#!/bin/bash
set -e

echo "=== Running unit + integration tests ==="
npm run test:run

echo "=== Running lint ==="
npm run lint

echo "=== Running build ==="
npm run build

echo "=== Running e2e tests ==="
npm run test:e2e

echo "=== All checks passed ==="
