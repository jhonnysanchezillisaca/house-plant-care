#!/bin/bash
set -e

# Build and push the House Plant Care HA add-on container image
#
# Usage: ./scripts/build-addon.sh [OPTIONS]
#
# Options:
#   --tag TAG        Image tag (default: latest)
#   --registry URL   Full image registry path (default: ghcr.io/jhonnysanchezillisaca/house-plant-care)
#   --token TOKEN    GitHub token for registry login
#   --no-push        Build only, don't push to registry
#   -h, --help       Show this help message
#
# Examples:
#   ./scripts/build-addon.sh                                # Build and push latest
#   ./scripts/build-addon.sh --no-push                      # Build only, no push
#   ./scripts/build-addon.sh --token ghp_xxx                 # Use token for auth
#   ./scripts/build-addon.sh --tag v1.2.0                    # Build and push a specific tag

TAG="latest"
REGISTRY="ghcr.io/jhonnysanchezillisaca/house-plant-care"
TOKEN=""
NO_PUSH=false

while [[ "$#" -gt 0 ]]; do
  case $1 in
    --tag) TAG="$2"; shift 2 ;;
    --registry) REGISTRY="$2"; shift 2 ;;
    --token) TOKEN="$2"; shift 2 ;;
    --no-push) NO_PUSH=true; shift ;;
    -h|--help)
      echo "Usage: $0 [--tag TAG] [--registry URL] [--token TOKEN] [--no-push]"
      echo ""
      echo "Build and push the House Plant Care HA add-on container image."
      echo ""
      echo "Options:"
      echo "  --tag TAG        Image tag (default: latest)"
      echo "  --registry URL   Full image registry path (default: ghcr.io/jhonnysanchezillisaca/house-plant-care)"
      echo "  --token TOKEN    GitHub token for registry login"
      echo "  --no-push        Build only, don't push to registry"
      exit 0
      ;;
    *) echo "Unknown option: $1"; exit 1 ;;
  esac
done

IMAGE="$REGISTRY:$TAG"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "=== House Plant Care HA Add-on Build ==="
echo "Image: $IMAGE"
echo ""

if ! command -v docker &> /dev/null; then
  echo "Error: Docker is not installed or not in PATH"
  exit 1
fi

echo "Building image..."
docker build \
  -t "$IMAGE" \
  -f "$PROJECT_ROOT/ha-addon/Dockerfile" \
  "$PROJECT_ROOT"

echo "Build complete: $IMAGE"

if [ "$NO_PUSH" = false ]; then
  echo ""
  echo "Logging in to registry..."
  REGISTRY_HOST=$(echo "$REGISTRY" | cut -d'/' -f1)

  if [ -n "$TOKEN" ]; then
    echo "$TOKEN" | docker login "$REGISTRY_HOST" -u jhonnysanchezillisaca --password-stdin
  else
    docker login "$REGISTRY_HOST"
  fi

  echo "Pushing image..."
  docker push "$IMAGE"
  echo "Push complete: $IMAGE"
fi

echo ""
echo "=== Next steps ==="
if [ "$NO_PUSH" = true ]; then
  echo "Image built locally: $IMAGE"
  echo ""
  echo "Push to registry with:"
  echo "  docker push $IMAGE"
  echo ""
  echo "Or run again without --no-push to build and push in one step."
else
  echo "Image pushed to registry: $IMAGE"
  echo ""
  echo "In Home Assistant:"
  echo "  1. Settings > Add-ons > Add-on Store"
  echo "  2. Find 'House Plant Care' > Update (or Install if first time)"
fi