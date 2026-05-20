---
name: release
description: Bump the project version, create a git tag, and optionally push the release
license: MIT
compatibility: opencode
metadata:
  audience: maintainers
  workflow: release
---

## What I do

I handle version bumps and release tagging for the house-plant-care project. I use the `scripts/bump-tag.sh` script to:

- Determine the latest git tag and calculate the next version
- Update `package.json` version to match
- Create a git tag locally

## When to use me

Use this skill when you want to create a new release/version bump. The user might say things like:
- "Create a new release"
- "Bump the version"
- "Tag a new release"
- "Release a new patch/minor/major version"

## How to use me

Ask the user what type of version bump they want:

- **patch** - Bug fixes, e.g. `1.0.4` -> `1.0.5` (default)
- **minor** - New features, e.g. `1.0.4` -> `1.1.0`
- **major** - Breaking changes, e.g. `1.0.4` -> `2.0.0`

Then run the appropriate command:

```bash
# Patch release (default)
bash scripts/bump-tag.sh
# or equivalently:
bash scripts/bump-tag.sh patch

# Minor release
bash scripts/bump-tag.sh minor

# Major release
bash scripts/bump-tag.sh major
```

Or via npm:

```bash
npm run release           # patch
npm run release:patch     # patch
npm run release:minor     # minor
npm run release:major     # major
```

After the tag is created, confirm with the user whether they want to push the tag and commit the package.json change:

```bash
# Push the tag only
git push origin <new-tag>

# Or push everything (commit + tag)
git add package.json && git commit -m "chore: bump version to <new-version>" && git push && git push origin <new-tag>
```

## Notes

- The script reads the latest git tag to determine the current version. If no tags exist, it starts at `v0.0.0`.
- The script updates `package.json` version to match the new tag.
- Tags are created locally first. The user must explicitly confirm before pushing to remote.
- The git working directory should be clean before running the script to avoid confusion.
- Always verify the current tags before bumping: `git tag --sort=-v:refname | head -5`