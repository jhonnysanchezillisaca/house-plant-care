#!/bin/bash

set -e

BUMP_TYPE="${1:-patch}"

if [[ ! "$BUMP_TYPE" =~ ^(major|minor|patch)$ ]]; then
  echo "Usage: $0 [major|minor|patch]"
  echo "  major  - e.g. 1.0.4 -> 2.0.0"
  echo "  minor  - e.g. 1.0.4 -> 1.1.0"
  echo "  patch  - e.g. 1.0.4 -> 1.0.5 (default)"
  exit 1
fi

LATEST_TAG=$(git tag --sort=-v:refname | head -1)

if [ -z "$LATEST_TAG" ]; then
  echo "No existing tags found. Starting at v0.0.0"
  LATEST_TAG="v0.0.0"
fi

VERSION="${LATEST_TAG#v}"
IFS='.' read -r MAJOR MINOR PATCH <<< "$VERSION"

case "$BUMP_TYPE" in
  major) MAJOR=$((MAJOR + 1)); MINOR=0; PATCH=0 ;;
  minor) MINOR=$((MINOR + 1)); PATCH=0 ;;
  patch) PATCH=$((PATCH + 1)) ;;
esac

NEW_VERSION="$MAJOR.$MINOR.$PATCH"
NEW_TAG="v$NEW_VERSION"

echo "Current tag: $LATEST_TAG"
echo "New tag:     $NEW_TAG"
echo ""

if git tag -l "$NEW_TAG" | grep -q .; then
  echo "Error: Tag $NEW_TAG already exists!"
  exit 1
fi

# Update package.json version
PACKAGE_JSON="package.json"
if [ -f "$PACKAGE_JSON" ]; then
  sed -i '' "s/\"version\": \"[0-9]*\\.[0-9]*\\.[0-9]*\"/\"version\": \"$NEW_VERSION\"/" "$PACKAGE_JSON"
  echo "Updated package.json version to $NEW_VERSION"
fi

git tag "$NEW_TAG"
echo ""
echo "Created tag: $NEW_TAG"
echo ""
echo "To push the tag:"
echo "  git push origin $NEW_TAG"
echo ""
echo "To also commit the package.json change and push:"
echo "  git add package.json && git commit -m 'chore: bump version to $NEW_VERSION' && git push && git push origin $NEW_TAG"