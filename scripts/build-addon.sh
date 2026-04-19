#!/bin/bash
set -e

# Build and push the House Plant Care HA add-on container image
#
# Usage: ./scripts/build-addon.sh [OPTIONS]
#
# Options:
#   --tag TAG        Image tag (default: latest)
#   --registry URL   Full image registry path (default: gitea.home.arpa/jhonny/house-plant-care)
#   --token TOKEN    Gitea access token for registry login and API
#   --no-push        Build only, don't push to registry
#   --cleanup        Delete old package versions after push (keeps only latest)
#   -h, --help       Show this help message
#
# Examples:
#   ./scripts/build-addon.sh                        # Build and push latest
#   ./scripts/build-addon.sh --no-push              # Build only, no push
#   ./scripts/build-addon.sh --token abc123          # Use token for auth
#   ./scripts/build-addon.sh --cleanup --token abc   # Build, push, cleanup old versions
#   ./scripts/build-addon.sh --tag v1.2.0           # Build and push a specific tag

TAG="latest"
REGISTRY="gitea.home.arpa/jhonny/house-plant-care"
TOKEN=""
NO_PUSH=false
CLEANUP=false

while [[ "$#" -gt 0 ]]; do
  case $1 in
    --tag) TAG="$2"; shift 2 ;;
    --registry) REGISTRY="$2"; shift 2 ;;
    --token) TOKEN="$2"; shift 2 ;;
    --no-push) NO_PUSH=true; shift ;;
    --cleanup) CLEANUP=true; shift ;;
    -h|--help)
      echo "Usage: $0 [--tag TAG] [--registry URL] [--token TOKEN] [--no-push] [--cleanup]"
      echo ""
      echo "Build and push the House Plant Care HA add-on container image."
      echo ""
      echo "Options:"
      echo "  --tag TAG        Image tag (default: latest)"
      echo "  --registry URL   Full image registry path (default: gitea.home.arpa/jhonny/house-plant-care)"
      echo "  --token TOKEN    Gitea access token for registry login and API"
      echo "  --no-push        Build only, don't push to registry"
      echo "  --cleanup        Delete old package versions after push (keeps only latest)"
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
    echo "$TOKEN" | docker login "$REGISTRY_HOST" -u jhonny --password-stdin
  else
    docker login "$REGISTRY_HOST"
  fi

  echo "Pushing image..."
  docker push "$IMAGE"
  echo "Push complete: $IMAGE"

  if [ "$CLEANUP" = true ]; then
    echo ""
    echo "Cleaning up old package versions..."
    if [ -z "$TOKEN" ]; then
      read -sp "Enter Gitea token for API access: " TOKEN
      echo ""
    fi

    VERSIONS=$(curl -sk -H "Authorization: token $TOKEN" \
      "https://gitea.home.arpa/api/v1/packages/jhonny/container/house-plant-care/versions" \
      | jq -r '.[] | "\(.id) \(.created_at)"' | sort -t' ' -k2 -r)

    COUNT=$(echo "$VERSIONS" | wc -l | tr -d ' ')
    echo "Found $COUNT package version(s)"

    if [ "$COUNT" -gt 1 ]; then
      echo "$VERSIONS" | tail -n +2 | while read VID DATE; do
        echo "Deleting old version: $VID"
        curl -sk -X DELETE \
          -H "Authorization: token $TOKEN" \
          "https://gitea.home.arpa/api/v1/packages/jhonny/container/house-plant-care/version/$VID"
      done
      echo "Cleanup complete."
    else
      echo "Only one version found, nothing to clean up."
    fi
  fi
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